import { computeStats, variantKeyFor } from '../data/assets.js'
import { getStageBoxes, keepRow, variantLabel } from './boxes.js'

const download = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('原图加载失败'))
    img.src = src
  })

const toggleText = (t) => `背景头${t.backgroundHead ? '开' : '关'} / 碎片头${t.fragmentHead ? '开' : '关'}`

const drawPanel = (ctx, img, caseData, variantKey, opts, ox, oy) => {
  const { width, height } = caseData
  ctx.drawImage(img, ox, oy, width, height)
  const base = Math.max(width, height) / 250
  for (const { bbox: [x1, y1, x2, y2], kept } of getStageBoxes(caseData, variantKey, opts.showRemoved)) {
    ctx.save()
    ctx.strokeStyle = kept ? opts.colors.kept : opts.colors.removed
    ctx.globalAlpha = kept ? 0.95 : 0.6
    ctx.lineWidth = kept ? 1.1 * base : 0.7 * base
    if (!kept) ctx.setLineDash([3 * base, 2 * base])
    ctx.strokeRect(ox + x1, oy + y1, x2 - x1, y2 - y1)
    ctx.restore()
  }
}

// 导出对比图：原始候选框 | 当前最终结果（随开关），并标注数量
export const exportComparisonPng = async (caseData, opts) => {
  const url = await caseData.originalLoader()
  const img = await loadImage(url)
  const { width, height } = caseData
  const finalKey = variantKeyFor(opts.toggles)
  const panels = [
    { key: 'raw', title: `原始SAM候选框（${caseData.proposals.length}）` },
    { key: finalKey, title: `最终清洗结果：${variantLabel(finalKey)}（保留 ${caseData.keptSets[finalKey].size}）` },
  ]
  const pad = 16
  const titleH = 28
  const footerH = 34
  const canvas = document.createElement('canvas')
  canvas.width = pad + panels.length * (width + pad)
  canvas.height = pad + titleH + height + footerH
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.textBaseline = 'middle'

  panels.forEach((p, i) => {
    const ox = pad + i * (width + pad)
    ctx.fillStyle = '#111827'
    ctx.font = '600 14px "Microsoft YaHei", "Noto Sans SC", sans-serif'
    ctx.fillText(p.title, ox, pad + titleH / 2 - 2)
    drawPanel(ctx, img, caseData, p.key, opts, ox, pad + titleH)
  })

  const s = computeStats(caseData, finalKey)
  ctx.fillStyle = '#4b5563'
  ctx.font = '12px "Microsoft YaHei", "Noto Sans SC", sans-serif'
  ctx.fillText(
    `样例 ${caseData.id}（${caseData.task}）｜${toggleText(opts.toggles)}｜原始 ${s.raw}，保留 ${s.kept}，删除 ${s.removed}，保留率 ${(s.retention * 100).toFixed(1)}%，删除率 ${(s.removal * 100).toFixed(1)}%${opts.showRemoved ? '｜虚线为删除框' : ''}`,
    pad,
    pad + titleH + height + footerH / 2,
  )

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  download(blob, `${caseData.id}_${finalKey}_comparison.png`)
}

const keptRows = (caseData, variantKey) =>
  caseData.proposals
    .filter((p) => caseData.keptSets[variantKey].has(p.proposal_id))
    .map((p) => ({
      proposal_id: p.proposal_id,
      xmin: p.bbox[0],
      ymin: p.bbox[1],
      xmax: p.bbox[2],
      ymax: p.bbox[3],
      ...keepRow(caseData, p.proposal_id),
    }))

export const exportKeptJson = (caseData, toggles) => {
  const variantKey = variantKeyFor(toggles)
  const s = computeStats(caseData, variantKey)
  const payload = {
    image_id: caseData.id,
    task: caseData.task,
    width: caseData.width,
    height: caseData.height,
    coordinate_format: caseData.provenance?.coordinate_format ?? 'xyxy',
    toggles,
    variant: variantKey,
    stats: {
      raw_count: s.raw,
      kept_count: s.kept,
      removed_count: s.removed,
      retention_fraction: s.retention,
      removal_fraction: s.removal,
    },
    kept_boxes: keptRows(caseData, variantKey),
  }
  download(
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
    `${caseData.id}_${variantKey}_kept.json`,
  )
}

export const exportKeptCsv = (caseData, toggles) => {
  const variantKey = variantKeyFor(toggles)
  const rows = keptRows(caseData, variantKey)
  const header = ['proposal_id', 'xmin', 'ymin', 'xmax', 'ymax', 'background_only_keep', 'fragment_only_keep', 'dual_head_keep']
  const lines = [header.join(','), ...rows.map((r) => header.map((h) => r[h]).join(','))]
  download(
    new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }),
    `${caseData.id}_${variantKey}_kept.csv`,
  )
}
