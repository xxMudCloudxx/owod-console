import { VARIANTS, cleaningCaseById, computeStats, variantKeyFor } from '../data/assets.js'
import { keepRow } from '../lib/boxes.js'
import { useConsoleStore } from '../store/useConsoleStore.js'

const pct = (v) => `${(v * 100).toFixed(1)}%`

function StatusTag({ kept }) {
  return kept ? (
    <span className="rounded bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700">保留</span>
  ) : (
    <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-600">删除</span>
  )
}

function DataPanel() {
  const caseId = useConsoleStore((s) => s.caseId)
  const toggles = useConsoleStore((s) => s.toggles)
  const selectedBoxId = useConsoleStore((s) => s.selectedBoxId)
  const selectBox = useConsoleStore((s) => s.selectBox)
  const caseData = cleaningCaseById.get(caseId)
  if (!caseData) return null

  const variantKey = variantKeyFor(toggles)
  const stats = computeStats(caseData, variantKey)
  const selected = selectedBoxId != null ? caseData.proposalById.get(selectedBoxId) : null
  const decisions = selected ? keepRow(caseData, selected.proposal_id) : null

  const conclusion =
    variantKey === 'raw'
      ? `两个头均未启用，展示原始候选框 ${stats.raw} 个，未做过滤。`
      : `原始 ${stats.raw} 个框，当前（${VARIANTS[variantKey].short}）保留 ${stats.kept} 个，过滤 ${stats.removed} 个。`

  const summaryLines = [
    `样例：${caseData.id}（${caseData.task}，${caseData.width}×${caseData.height}）`,
    `背景头：${toggles.backgroundHead ? '启用' : '停用'}`,
    `碎片头：${toggles.fragmentHead ? '启用' : '停用'}`,
    `结果来源：${VARIANTS[variantKey].label}（${variantKey}）`,
    `背景头配置：${caseData.provenance?.background_config ?? '—'}`,
  ]

  const compareRows = Object.values(VARIANTS).map((v) => ({
    ...v,
    kept: caseData.keptSets[v.key].size,
    active: v.key === variantKey,
  }))

  return (
    <aside className="panel-shell-muted w-full p-5 xl:w-[22rem] 2xl:w-[23rem]">
      <div className="flex flex-col gap-5">
        <section>
          <h3 className="mb-3 text-sm font-medium text-gray-900">当前图片统计</h3>
          <div className="grid grid-cols-3 gap-2">
            <Stat value={stats.raw} label="原始框数" />
            <Stat value={stats.kept} label="保留框数" className="text-green-600" />
            <Stat value={stats.removed} label="删除框数" className="text-red-500" />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Stat value={pct(stats.retention)} label="保留率" className="text-green-600" />
            <Stat value={pct(stats.removal)} label="删除率" className="text-red-500" />
          </div>
          <table className="mt-3 w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-xs">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-2 py-1.5 text-left font-normal">记录</th>
                <th className="px-2 py-1.5 text-right font-normal">保留</th>
                <th className="px-2 py-1.5 text-right font-normal">保留率</th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((r) => (
                <tr key={r.key} className={r.active ? 'bg-gray-900 text-white' : 'text-gray-700'}>
                  <td className="px-2 py-1.5">{r.label}</td>
                  <td className="px-2 py-1.5 text-right">{r.kept}</td>
                  <td className="px-2 py-1.5 text-right">{pct(r.kept / stats.raw)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">选中框信息</h3>
            {selected ? (
              <button type="button" onClick={() => selectBox(null)} className="text-xs text-gray-400 hover:text-gray-700">
                取消选中
              </button>
            ) : null}
          </div>
          {selected ? (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-3 text-sm">
              <Row label="框编号" value={`#${selected.proposal_id}`} />
              <Row label="坐标 (x1,y1,x2,y2)" value={selected.bbox.join(', ')} mono />
              <Row
                label="宽 × 高"
                value={`${selected.bbox[2] - selected.bbox[0]} × ${selected.bbox[3] - selected.bbox[1]}`}
                mono
              />
              <div className="border-t border-gray-100 pt-2" />
              <Row label="背景单头" value={<StatusTag kept={decisions.background_only_keep} />} />
              <Row label="碎片单头" value={<StatusTag kept={decisions.fragment_only_keep} />} />
              <Row label="最终双头" value={<StatusTag kept={decisions.dual_head_keep} />} />
              <p className="pt-1 text-[11px] leading-4 text-gray-400">素材未提供两个头的连续预测分数，此处只显示记录中的保留/删除决策。</p>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-gray-200 bg-white p-3 text-xs leading-5 text-gray-500">
              点击上方任一阶段卡片放大，再点击图中的框即可查看其编号、坐标和三种记录中的保留情况。
            </p>
          )}
        </section>

        <section>
          <h3 className="mb-3 text-sm font-medium text-gray-900">运行摘要</h3>
          <pre className="whitespace-pre-wrap rounded-lg bg-gray-800 p-3 text-xs leading-5 text-gray-100">
            <code>{summaryLines.join('\n')}</code>
          </pre>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-medium text-gray-900">简短结论</h3>
          <p className="text-sm leading-6 text-gray-600">{conclusion}</p>
          {caseData.warnings.length ? (
            <p className="mt-2 text-xs text-amber-600">数据校验提示：{caseData.warnings.join('；')}</p>
          ) : null}
        </section>
      </div>
    </aside>
  )
}

function Stat({ value, label, className = 'text-gray-900' }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2.5">
      <p className={`text-xl font-semibold ${className}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-gray-500">{label}</span>
      <span className={`text-gray-900 ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  )
}

export default DataPanel
