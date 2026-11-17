// 素材包数据层：以 OWOD_console_assets_20261117/manifest.json 为唯一入口。
// 所有数量、保留/删除决策都直接取自素材包记录，前端不做推断。

const ROOT = '../../OWOD_console_assets_20261117/'

const jsonFiles = import.meta.glob('../../OWOD_console_assets_20261117/**/*.json', {
  eager: true,
  import: 'default',
})

// 图片懒加载：返回动态 import 函数，按需加载
const imageLoaders = import.meta.glob(
  [
    '../../OWOD_console_assets_20261117/cleaning/*/original.jpg',
    '../../OWOD_console_assets_20261117/detector_comparison/*/*.png',
  ],
  { eager: false, query: '?url', import: 'default' },
)

const readJson = (relPath) => {
  const value = jsonFiles[ROOT + relPath]
  if (value === undefined) throw new Error(`素材包缺少文件: ${relPath}`)
  return value
}

// 返回懒加载的 URL getter：调用时才真正加载图片
const imageLazy = (relPath) => {
  const loader = imageLoaders[ROOT + relPath]
  if (loader === undefined) throw new Error(`素材包缺少图片: ${relPath}`)
  return loader // 返回 () => Promise<string>
}

const dirOf = (relPath) => relPath.slice(0, relPath.lastIndexOf('/') + 1)

export const manifest = readJson('manifest.json')

// ---------- 图像清理样例 ----------

export const VARIANTS = {
  raw: { key: 'raw', label: '原始候选框', short: '未过滤' },
  background_only: { key: 'background_only', label: '背景单头结果', short: '背景单头' },
  fragment_only: { key: 'fragment_only', label: '碎片单头结果', short: '碎片单头' },
  dual_head: { key: 'dual_head', label: '双头最终结果', short: '最终双头' },
}

export const variantKeyFor = ({ backgroundHead, fragmentHead }) => {
  if (backgroundHead && fragmentHead) return 'dual_head'
  if (backgroundHead) return 'background_only'
  if (fragmentHead) return 'fragment_only'
  return 'raw'
}

const buildCleaningCase = (entry) => {
  const data = readJson(entry.data)
  const dir = dirOf(entry.data)
  const keptSets = Object.fromEntries(
    Object.entries(data.variants).map(([key, v]) => [key, new Set(v.kept_proposal_ids)]),
  )

  const warnings = []
  if (data.proposals.length !== entry.raw_count) {
    warnings.push(`manifest 记录原始框 ${entry.raw_count} 个，data.json 实际 ${data.proposals.length} 个`)
  }
  if (keptSets.dual_head.size !== entry.final_keep_count) {
    warnings.push(`manifest 记录最终保留 ${entry.final_keep_count} 个，data.json 双头记录 ${keptSets.dual_head.size} 个`)
  }
  for (const [key, v] of Object.entries(data.variants)) {
    if (v.kept_count !== keptSets[key].size) {
      warnings.push(`${key} 的 kept_count(${v.kept_count}) 与 kept_proposal_ids 数量(${keptSets[key].size}) 不一致`)
    }
  }
  warnings.forEach((w) => console.warn(`[${entry.image_id}] ${w}`))

  return {
    id: entry.image_id,
    task: entry.task,
    width: data.width,
    height: data.height,
    originalLoader: imageLazy(dir + data.files.original),
    proposals: data.proposals,
    proposalById: new Map(data.proposals.map((p) => [p.proposal_id, p])),
    keptSets,
    provenance: data.provenance,
    manifestRawCount: entry.raw_count,
    manifestFinalKeepCount: entry.final_keep_count,
    dir,
    warnings,
  }
}

export const cleaningCases = manifest.cleaning_cases.map(buildCleaningCase)
export const cleaningCaseById = new Map(cleaningCases.map((c) => [c.id, c]))

// 根据当前样例与变体计算统计（按 kept_proposal_ids 计数，不用预设数字）
export const computeStats = (caseData, variantKey) => {
  const raw = caseData.proposals.length
  const kept = caseData.keptSets[variantKey].size
  const removed = raw - kept
  return {
    raw,
    kept,
    removed,
    retention: raw ? kept / raw : 0,
    removal: raw ? removed / raw : 0,
  }
}

// ---------- 检测对比（独立的已完成实验，不与清洗开关联动） ----------

const buildDetectorCase = (entry) => {
  const summary = readJson(entry.summary)
  let corrections = []
  try {
    corrections = JSON.parse(summary.known_gt_class_correction_details ?? '[]')
  } catch {
    corrections = []
  }
  return {
    key: `${entry.task}_${entry.image_id}`,
    id: entry.image_id,
    task: entry.task,
    summary,
    corrections,
    imageLoaders: {
      original: imageLazy(entry.original),
      baseline: imageLazy(entry.baseline),
      ours: imageLazy(entry.ours),
      gt: imageLazy(entry.gt_overlay),
    },
  }
}

export const detectorCases = manifest.detector_cases.map(buildDetectorCase)

export const detectorMetrics = readJson(manifest.metrics.detector_metrics_main_json)
export const proposalCounts = readJson(manifest.metrics.proposal_counts)
export const availability = manifest.availability
