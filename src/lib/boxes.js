import { VARIANTS, variantKeyFor } from '../data/assets.js'

// 五个流程阶段。前四个阶段固定展示对应记录；最终阶段随开关切换。
export const STAGES = [
  { key: 'original', title: '原始图', hint: '输入图像' },
  { key: 'raw', title: '原始SAM候选框', hint: '候选框池', variant: 'raw' },
  { key: 'background', title: '背景头过滤结果', hint: '背景单头记录', variant: 'background_only', toggle: 'backgroundHead' },
  { key: 'fragment', title: '碎片头过滤结果', hint: '碎片单头记录', variant: 'fragment_only', toggle: 'fragmentHead' },
  { key: 'final', title: '最终清洗结果', hint: '随开关切换', variant: 'dynamic' },
]

export const stageByKey = Object.fromEntries(STAGES.map((s) => [s.key, s]))

export const stageVariant = (stageKey, toggles) => {
  const stage = stageByKey[stageKey]
  if (!stage?.variant) return null
  return stage.variant === 'dynamic' ? variantKeyFor(toggles) : stage.variant
}

export const variantLabel = (variantKey) => VARIANTS[variantKey]?.label ?? ''

const area = ([x1, y1, x2, y2]) => Math.max(0, x2 - x1) * Math.max(0, y2 - y1)

// 某阶段需要绘制的框：保留框 + （可选）删除框；面积大的先画，小框在上层更易点中
export const getStageBoxes = (caseData, variantKey, showRemoved) => {
  if (!variantKey) return []
  const kept = caseData.keptSets[variantKey]
  const list = []
  for (const p of caseData.proposals) {
    const isKept = kept.has(p.proposal_id)
    if (!isKept && !showRemoved) continue
    list.push({ id: p.proposal_id, bbox: p.bbox, kept: isKept, area: area(p.bbox) })
  }
  list.sort((a, b) => b.area - a.area)
  return list
}

// 点击命中：返回包含该点的框，按面积从小到大
export const boxesAtPoint = (boxes, x, y) =>
  boxes
    .filter(({ bbox: [x1, y1, x2, y2] }) => x >= x1 && x <= x2 && y >= y1 && y <= y2)
    .sort((a, b) => a.area - b.area)

export const keepRow = (caseData, id) => ({
  background_only_keep: caseData.keptSets.background_only.has(id),
  fragment_only_keep: caseData.keptSets.fragment_only.has(id),
  dual_head_keep: caseData.keptSets.dual_head.has(id),
})
