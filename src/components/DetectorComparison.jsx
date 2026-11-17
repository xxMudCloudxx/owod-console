import { Columns3, Maximize2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { detectorCases, detectorMetrics, proposalCounts } from '../data/assets.js'
import { LazyImage } from './LazyImage.jsx'

// 已完成的检测实验结果展示。数据只来自 detector_comparison/ 与 metrics/，
// 不读取也不响应图像清理部分的开关。

const IMAGE_VIEWS = [
  { key: 'original', label: '原图' },
  { key: 'baseline', label: 'Baseline 检测' },
  { key: 'ours', label: '改进后检测' },
  { key: 'gt', label: 'GT 标注' },
]

const SUMMARY_ROWS = [
  { label: '已知类检测数', b: 'baseline_known_count', o: 'ours_known_count' },
  { label: 'unknown 检测数', b: 'baseline_unknown_count', o: 'ours_unknown_count' },
  { label: '低重叠/类背景 unknown 框', b: 'baseline_false_like_unknown_count', o: 'ours_false_like_unknown_count' },
  { label: '已知类 GT 覆盖 (IoU≥0.5)', b: 'baseline_gt_known_covered_iou50', o: 'ours_gt_known_covered_iou50' },
  { label: '已知类 GT 分类正确 (IoU≥0.5)', b: 'baseline_class_correct_known_gt_iou50', o: 'ours_class_correct_known_gt_iou50' },
  { label: '已知类 GT 被判为 unknown', b: 'baseline_unknown_on_known_gt_iou50', o: 'ours_unknown_on_known_gt_iou50' },
  { label: '已知类 GT 漏检', b: 'baseline_missed_known_gt_iou50', o: 'ours_missed_known_gt_iou50' },
]

const METRIC_COLS = [
  { key: 'mAP50', label: 'mAP50', digits: 2 },
  { key: 'Known_AP50', label: 'Known AP50', digits: 2 },
  { key: 'Known_Recall50', label: 'Known R50', digits: 2 },
  { key: 'Unknown_AP50', label: 'Unknown AP50', digits: 2 },
  { key: 'Unknown_Recall50', label: 'Unknown R50', digits: 2 },
  { key: 'WI_0.8', label: 'WI@0.8', digits: 4 },
  { key: 'AOSA', label: 'AOSA', digits: 0 },
]

const fmt = (v, digits) => (typeof v === 'number' ? v.toFixed(digits) : (v ?? '—'))

function ImagePane({ caseItem, view, onZoom, compact }) {
  const label = IMAGE_VIEWS.find((v) => v.key === view)?.label
  return (
    <figure className="flex min-w-0 flex-col">
      <figcaption className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-gray-700">{label}</span>
        {onZoom ? (
          <button type="button" onClick={() => onZoom(view)} className="text-gray-400 hover:text-gray-700" title="放大">
            <Maximize2 size={13} />
          </button>
        ) : null}
      </figcaption>
      <button
        type="button"
        onClick={() => onZoom?.(view)}
        className={`overflow-hidden rounded-md border border-gray-200 bg-gray-100 ${compact ? '' : 'cursor-zoom-in'}`}
      >
        <LazyImage loader={caseItem.imageLoaders[view]} alt={`${caseItem.id} ${label}`} className="block h-auto w-full" />
      </button>
    </figure>
  )
}

function ZoomViewer({ caseItem, initial, onClose }) {
  const [view, setView] = useState(initial)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="flex max-h-full w-full max-w-6xl flex-col rounded-lg bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
          <div className="flex overflow-hidden rounded-md border border-gray-200">
            {IMAGE_VIEWS.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => setView(v.key)}
                className={`px-3 py-1.5 text-xs ${view === v.key ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex overflow-hidden rounded-md border border-gray-200">
              {[1, 1.5, 2, 3].map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setScale(z)}
                  className={`px-2.5 py-1 text-xs ${scale === z ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {z}×
                </button>
              ))}
            </div>
            <button type="button" onClick={onClose} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-gray-100 p-3">
          <LazyImage
            loader={caseItem.imageLoaders[view]}
            alt={view}
            className="mx-auto block max-w-none"
            style={{ height: `calc((100vh - 11rem) * ${scale})` }}
          />
        </div>
        <p className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
          {caseItem.task} · {caseItem.id} · 切换上方标签可在同一位置对比不同结果；Esc 关闭
        </p>
      </div>
    </div>
  )
}

function DetectorComparison() {
  const [caseKey, setCaseKey] = useState(detectorCases[0]?.key)
  const [layout, setLayout] = useState('side') // side | single
  const [singleView, setSingleView] = useState('baseline')
  const [showGt, setShowGt] = useState(false)
  const [zoomView, setZoomView] = useState(null)

  const caseItem = detectorCases.find((c) => c.key === caseKey)
  if (!caseItem) return <p className="p-6 text-sm text-gray-500">素材包中没有检测对比案例</p>
  const s = caseItem.summary
  const sideViews = showGt ? ['original', 'baseline', 'ours', 'gt'] : ['original', 'baseline', 'ours']

  return (
    <div className="flex flex-col gap-5">
      <section className="panel-shell rounded-lg p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-gray-900">检测结果对比</h2>
            <p className="mt-1 text-sm text-gray-500">
              素材包中已跑好的检测实验（baseline vs 改进后），与图像清理页的开关无关
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-1.5 text-gray-600">
              <input type="checkbox" checked={showGt} onChange={(e) => setShowGt(e.target.checked)} />
              并排显示 GT
            </label>
            <div className="flex overflow-hidden rounded-md border border-gray-200">
              <button
                type="button"
                onClick={() => setLayout('side')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs ${layout === 'side' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Columns3 size={13} /> 并排
              </button>
              <button
                type="button"
                onClick={() => setLayout('single')}
                className={`px-3 py-1.5 text-xs ${layout === 'single' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                单图切换
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {detectorCases.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCaseKey(c.key)}
              className={`flex flex-none items-center gap-2 rounded-lg border p-1.5 pr-3 text-left transition ${
                c.key === caseKey ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <LazyImage loader={c.imageLoaders.original} alt={c.id} className="h-10 w-14 rounded object-cover" />
              <span>
                <span className="block text-xs font-medium text-gray-900">{c.id}</span>
                <span className="block text-[11px] text-gray-400">{c.task}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4">
          {layout === 'side' ? (
            <div className={`grid gap-3 ${showGt ? 'md:grid-cols-2 2xl:grid-cols-4' : 'md:grid-cols-3'}`}>
              {sideViews.map((v) => (
                <ImagePane key={v} caseItem={caseItem} view={v} onZoom={setZoomView} />
              ))}
            </div>
          ) : (
            <div>
              <div className="mb-3 flex overflow-hidden rounded-md border border-gray-200 sm:inline-flex">
                {IMAGE_VIEWS.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => setSingleView(v.key)}
                    className={`flex-1 px-3 py-1.5 text-xs ${singleView === v.key ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              <div className="mx-auto max-w-3xl">
                <ImagePane caseItem={caseItem} view={singleView} onZoom={setZoomView} />
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
        <section className="panel-shell rounded-lg p-5">
          <h3 className="mb-3 text-sm font-medium text-gray-900">
            案例统计 · {caseItem.task} {caseItem.id}
          </h3>
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500">
              <tr className="border-b border-gray-200">
                <th className="py-1.5 text-left font-normal">项目</th>
                <th className="py-1.5 text-right font-normal">Baseline</th>
                <th className="py-1.5 text-right font-normal">改进后</th>
              </tr>
            </thead>
            <tbody>
              {SUMMARY_ROWS.map((r) => (
                <tr key={r.label} className="border-b border-gray-100">
                  <td className="py-1.5 text-gray-600">{r.label}</td>
                  <td className="py-1.5 text-right text-gray-900">{s[r.b] ?? '—'}</td>
                  <td className="py-1.5 text-right font-medium text-gray-900">{s[r.o] ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-gray-400">
            该图 GT：已知类 {s.known_gt_count ?? '—'} 个，未知类 {s.unknown_gt_count ?? '—'} 个
          </p>
        </section>

        <section className="panel-shell rounded-lg p-5">
          <h3 className="mb-3 text-sm font-medium text-gray-900">案例说明（素材包记录）</h3>
          <dl className="space-y-2 text-sm leading-6">
            <div>
              <dt className="text-xs text-gray-400">Baseline 主要问题</dt>
              <dd className="text-gray-700">{s.baseline_main_problem ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">改进后变化</dt>
              <dd className="text-gray-700">{s.ours_improvement ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">备注</dt>
              <dd className="text-gray-700">{s.note ?? '—'}</dd>
            </div>
          </dl>
          {caseItem.corrections.length ? (
            <div className="mt-3">
              <p className="mb-1 text-xs text-gray-400">已知类 GT 修正（{caseItem.corrections.length}）</p>
              <ul className="space-y-0.5 text-xs text-gray-600">
                {caseItem.corrections.map((c) => (
                  <li key={c.gt_index}>
                    GT #{c.gt_index} {c.gt_class}：baseline {c.baseline_status === 'missed' ? '漏检' : c.baseline_status === 'predicted_unknown' ? '判为 unknown' : c.baseline_status}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </div>

      <section className="panel-shell rounded-lg p-5">
        <h3 className="text-sm font-medium text-gray-900">整体实验指标（T1 全量评测）</h3>
        <p className="mb-3 mt-1 text-xs text-gray-500">来自 metrics/detector_metrics_main.json；与上方单图案例及清洗页无联动</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-xs text-gray-500">
              <tr className="border-b border-gray-200">
                <th className="py-2 text-left font-normal">方法</th>
                {METRIC_COLS.map((c) => (
                  <th key={c.key} className="py-2 text-right font-normal">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detectorMetrics.map((row) => (
                <tr key={row.method} className="border-b border-gray-100" title={row.protocol_note}>
                  <td className="py-2 pr-3 text-gray-700">{row.method}</td>
                  {METRIC_COLS.map((c) => (
                    <td key={c.key} className="py-2 text-right font-mono text-xs text-gray-900">
                      {fmt(row[c.key], c.digits)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 className="mb-2 mt-5 text-sm font-medium text-gray-900">T1 训练集候选框数量（{proposalCounts.scope}）</h4>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {[
            ['原始候选框', proposalCounts.raw_count],
            ['背景单头保留', proposalCounts.background_only_keep_count],
            ['碎片单头保留', proposalCounts.fragment_only_keep_count],
            ['双头最终保留', proposalCounts.dual_head_keep_count],
          ].map(([label, v]) => (
            <div key={label} className="rounded-lg border border-gray-200 bg-white p-2.5">
              <p className="text-lg font-semibold text-gray-900">{v?.toLocaleString() ?? '—'}</p>
              <p className="text-xs text-gray-500">
                {label}
                {typeof v === 'number' && proposalCounts.raw_count ? `（${((v / proposalCounts.raw_count) * 100).toFixed(1)}%）` : ''}
              </p>
            </div>
          ))}
        </div>
      </section>

      {zoomView ? <ZoomViewer caseItem={caseItem} initial={zoomView} onClose={() => setZoomView(null)} /> : null}
    </div>
  )
}

export default DetectorComparison
