import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { STAGES, stageByKey, stageVariant, variantLabel } from '../lib/boxes.js'
import { useConsoleStore } from '../store/useConsoleStore.js'
import BoxCanvas from './BoxCanvas.jsx'

const ZOOMS = [1, 1.5, 2, 3]

// 阶段放大查看：可在此点击选框；同一位置重复点击在重叠框之间轮换
function StageZoomModal({ caseData }) {
  const zoomStage = useConsoleStore((s) => s.zoomStage)
  const toggles = useConsoleStore((s) => s.toggles)
  const showRemoved = useConsoleStore((s) => s.showRemoved)
  const colors = useConsoleStore((s) => s.colors)
  const selectedBoxId = useConsoleStore((s) => s.selectedBoxId)
  const selectBox = useConsoleStore((s) => s.selectBox)
  const openZoom = useConsoleStore((s) => s.openZoom)
  const closeZoom = useConsoleStore((s) => s.closeZoom)
  const setShowRemoved = useConsoleStore((s) => s.setShowRemoved)
  const [zoom, setZoom] = useState(1)

  const idx = STAGES.findIndex((s) => s.key === zoomStage)
  const stage = stageByKey[zoomStage]
  const variantKey = stageVariant(zoomStage, toggles)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeZoom()
      if (e.key === 'ArrowLeft' && idx > 0) openZoom(STAGES[idx - 1].key)
      if (e.key === 'ArrowRight' && idx < STAGES.length - 1) openZoom(STAGES[idx + 1].key)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [idx, openZoom, closeZoom])

  if (!stage) return null
  const kept = variantKey ? caseData.keptSets[variantKey].size : null
  const raw = caseData.proposals.length
  // 以视口高度为基准的显示尺寸
  const baseHeight = `calc((100vh - 13rem) * ${zoom})`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={closeZoom}>
      <div
        className="flex max-h-full w-full max-w-6xl flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={idx <= 0}
              onClick={() => openZoom(STAGES[idx - 1].key)}
              className="rounded-md border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {idx + 1}/5 {stage.title}
                {zoomStage === 'final' ? `（${variantLabel(variantKey)}）` : ''}
              </h3>
              <p className="text-xs text-gray-500">
                样例 {caseData.id}
                {variantKey ? ` · 原始 ${raw} · 保留 ${kept} · 删除 ${raw - kept}` : ' · 原图'}
              </p>
            </div>
            <button
              type="button"
              disabled={idx >= STAGES.length - 1}
              onClick={() => openZoom(STAGES[idx + 1].key)}
              className="rounded-md border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="flex items-center gap-1.5 text-gray-600">
              <input
                type="checkbox"
                checked={showRemoved}
                onChange={(e) => setShowRemoved(e.target.checked)}
              />
              显示删除框
            </label>
            <div className="flex overflow-hidden rounded-md border border-gray-200">
              {ZOOMS.map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setZoom(z)}
                  className={`px-2.5 py-1 text-xs ${zoom === z ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {z}×
                </button>
              ))}
            </div>
            <button type="button" onClick={closeZoom} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-gray-100 p-3">
          <div
            className="mx-auto"
            style={{ height: baseHeight, aspectRatio: `${caseData.width} / ${caseData.height}`, maxWidth: zoom === 1 ? '100%' : 'none' }}
          >
            <BoxCanvas
              caseData={caseData}
              variantKey={variantKey}
              showRemoved={showRemoved}
              colors={colors}
              selectedBoxId={selectedBoxId}
              onSelectBox={selectBox}
              interactive={Boolean(variantKey)}
              strokeScale={0.6}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
          {variantKey
            ? '点击框选中（重叠处再次点击切换到下一个框），点击空白处取消选中；← → 切换阶段，Esc 关闭。选中信息见右侧面板。'
            : '原图阶段不含候选框；← → 切换阶段，Esc 关闭。'}
          {selectedBoxId != null ? <span className="ml-2 font-medium text-blue-600">已选中框 #{selectedBoxId}</span> : null}
        </div>
      </div>
    </div>
  )
}

export default StageZoomModal
