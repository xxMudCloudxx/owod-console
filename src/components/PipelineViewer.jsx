import { ArrowRight, Image as ImageIcon, Layers3, Maximize2, ScanSearch, Sparkles, Target } from 'lucide-react'
import { cleaningCaseById, cleaningCases } from '../data/assets.js'
import { STAGES, stageVariant, variantLabel } from '../lib/boxes.js'
import { useConsoleStore } from '../store/useConsoleStore.js'
import BoxCanvas from './BoxCanvas.jsx'
import StageZoomModal from './StageZoomModal.jsx'
import { LazyImage } from './LazyImage.jsx'

const stageIcons = {
  original: ImageIcon,
  raw: Layers3,
  background: ScanSearch,
  fragment: Target,
  final: Sparkles,
}

function PipelineArrow() {
  return (
    <div className="hidden xl:flex xl:w-8 xl:flex-none xl:items-center xl:justify-center">
      <ArrowRight size={18} className="text-gray-400" strokeWidth={2.4} />
    </div>
  )
}

function CaseSelector() {
  const caseId = useConsoleStore((s) => s.caseId)
  const setCase = useConsoleStore((s) => s.setCase)

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {cleaningCases.map((c) => {
        const active = c.id === caseId
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => setCase(c.id)}
            className={`flex flex-none items-center gap-2 rounded-lg border p-1.5 pr-3 text-left transition ${
              active ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <LazyImage loader={c.originalLoader} alt={c.id} className="h-10 w-14 rounded object-cover" />
            <span>
              <span className="block text-xs font-medium text-gray-900">{c.id}</span>
              <span className="block text-[11px] text-gray-400">
                {c.task} · {c.proposals.length} 框
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

function StageCard({ stage, index, caseData }) {
  const Icon = stageIcons[stage.key]
  const toggles = useConsoleStore((s) => s.toggles)
  const activeStage = useConsoleStore((s) => s.activeStage)
  const showRemoved = useConsoleStore((s) => s.showRemoved)
  const colors = useConsoleStore((s) => s.colors)
  const selectedBoxId = useConsoleStore((s) => s.selectedBoxId)
  const openZoom = useConsoleStore((s) => s.openZoom)

  const isActive = activeStage === stage.key
  const variantKey = stageVariant(stage.key, toggles)
  const kept = variantKey ? caseData.keptSets[variantKey].size : null
  const headOff = stage.toggle && !toggles[stage.toggle]

  let footer = `${caseData.width}×${caseData.height}`
  if (variantKey === 'raw') footer = `${kept} 个候选框`
  else if (variantKey) footer = `保留 ${kept} / 删除 ${caseData.proposals.length - kept}`

  return (
    <button
      type="button"
      onClick={() => openZoom(stage.key)}
      title="点击放大查看"
      className={`group flex h-full w-full flex-col rounded-lg border p-3 text-left transition ${
        isActive ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-gray-400">{stage.hint}</p>
          <h3 className="mt-0.5 truncate text-sm font-medium text-gray-900">{stage.title}</h3>
        </div>
        <div
          className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg ${
            isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
          }`}
        >
          <Icon size={16} />
        </div>
      </div>

      <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-gray-200 bg-gray-100">
        <BoxCanvas
          caseData={caseData}
          variantKey={variantKey}
          showRemoved={showRemoved}
          colors={colors}
          selectedBoxId={selectedBoxId}
        />
        <span className="pointer-events-none absolute right-1.5 top-1.5 rounded bg-black/55 p-1 text-white opacity-0 transition group-hover:opacity-100">
          <Maximize2 size={12} />
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
        <span className="text-gray-400">{index + 1}/5</span>
        <span className="truncate text-gray-600">{footer}</span>
      </div>
      {stage.key === 'final' ? (
        <p className="mt-1 truncate text-[11px] text-gray-500">当前：{variantLabel(variantKey)}</p>
      ) : headOff ? (
        <p className="mt-1 truncate text-[11px] text-amber-600">单头记录（该头当前未启用）</p>
      ) : (
        <p className="mt-1 text-[11px] text-transparent">.</p>
      )}
    </button>
  )
}

function PipelineViewer() {
  const caseId = useConsoleStore((s) => s.caseId)
  const zoomStage = useConsoleStore((s) => s.zoomStage)
  const colors = useConsoleStore((s) => s.colors)
  const caseData = cleaningCaseById.get(caseId)

  if (!caseData) {
    return <section className="panel-shell rounded-lg p-5 text-sm text-gray-500">素材包中没有清洗样例</section>
  }

  return (
    <section className="panel-shell flex flex-col rounded-lg p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-gray-900">处理流程</h2>
          <p className="mt-1 text-sm text-gray-500">选择样例后各阶段同步切换；点击阶段卡片放大查看并选框</p>
        </div>
        <span className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-600">
          样例 {caseData.id} · {caseData.task}
        </span>
      </div>

      <CaseSelector />

      <div className="mt-4 grid w-full grid-cols-2 gap-3 sm:grid-cols-3 xl:hidden">
        {STAGES.map((stage, index) => (
          <StageCard key={stage.key} stage={stage} index={index} caseData={caseData} />
        ))}
      </div>

      <div className="mt-4 hidden w-full xl:flex xl:items-stretch">
        {STAGES.map((stage, index) => (
          <div key={stage.key} className="contents">
            <div className="min-w-0 flex-1">
              <StageCard stage={stage} index={index} caseData={caseData} />
            </div>
            {index < STAGES.length - 1 ? <PipelineArrow /> : null}
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <LegendSwatch color={colors.kept} label="保留框（实线）" />
        <LegendSwatch color={colors.removed} label="删除框（虚线）" dashed />
        <LegendSwatch color={colors.selected} label="选中框" />
        <span>框由 data.json 坐标绘制（{caseData.provenance?.coordinate_format}）</span>
      </div>

      {zoomStage ? <StageZoomModal caseData={caseData} /> : null}
    </section>
  )
}

function LegendSwatch({ color, label, dashed }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-3 w-4 rounded-sm"
        style={{ border: `2px ${dashed ? 'dashed' : 'solid'} ${color}` }}
      />
      {label}
    </span>
  )
}

export default PipelineViewer
