import { ArrowRight, CloudUpload, Layers3, ScanSearch, Sparkles, Target } from 'lucide-react'
import { useConsoleStore } from '../store/useConsoleStore.js'

const stages = [
  { title: '原始图', hint: '输入图像', desc: '上传待检测图像', icon: CloudUpload, special: 'upload' },
  { title: 'SAM池子图', hint: '候选掩码', desc: '聚合分割先验区域', icon: Layers3 },
  { title: '背景头', hint: '背景抑制', desc: '过滤纯背景噪声', icon: ScanSearch },
  { title: '碎片头', hint: '碎片筛除', desc: '保留成片目标区域', icon: Target },
  { title: '最终效果', hint: '输出视图', desc: '保留可疑未知目标', icon: Sparkles },
]

function PipelineArrow() {
  return (
    <div className="hidden xl:flex xl:w-12 xl:flex-none xl:items-center xl:justify-center">
      <ArrowRight size={20} className="text-gray-400" strokeWidth={2.4} />
    </div>
  )
}

function StageCard({ stage, index, isActive, onSelect }) {
  const Icon = stage.icon

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex h-full w-full flex-col rounded-lg border p-4 text-left transition ${
        isActive
          ? 'border-gray-900 bg-gray-50 shadow-[0_0_0_1px_rgba(17,24,39,0.04)]'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400">{stage.hint}</p>
          <h3 className="mt-1 text-sm font-medium text-gray-900">{stage.title}</h3>
        </div>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
          }`}
        >
          <Icon size={18} />
        </div>
      </div>

      {stage.special === 'upload' ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6">
          <CloudUpload size={32} className="text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-600">点击或拖拽上传</p>
          <p className="mt-1 text-xs text-gray-400">支持 JPG / PNG / BMP</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col rounded-lg bg-gray-50 p-4">
          <div className="grid flex-1 grid-cols-4 gap-1.5">
            {[...Array(12)].map((_, cellIndex) => (
              <div
                key={cellIndex}
                className={`rounded ${
                  cellIndex % 3 === 0
                    ? 'bg-gray-300'
                    : cellIndex % 2 === 0
                      ? 'bg-gray-200'
                      : 'bg-gray-100'
                }`}
                style={{ minHeight: '16px' }}
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500">{stage.desc}</p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-gray-400">{index + 1}/5</span>
        <span className={isActive ? 'text-gray-900' : 'text-gray-400'}>
          {isActive ? '当前选中' : '点击查看'}
        </span>
      </div>
    </button>
  )
}

function PipelineViewer() {
  const activeStage = useConsoleStore((state) => state.activeStage)
  const setActiveStage = useConsoleStore((state) => state.setActiveStage)

  return (
    <section className="panel-shell flex min-h-[380px] flex-1 flex-col rounded-lg p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">处理流程</h2>
          <p className="mt-1 text-sm text-gray-500">点击任意阶段查看详情</p>
        </div>
        <span className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-600">
          当前: {activeStage}
        </span>
      </div>

      <div className="flex flex-1 items-center">
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:hidden">
          {stages.map((stage, index) => (
            <StageCard
              key={stage.title}
              stage={stage}
              index={index}
              isActive={stage.title === activeStage}
              onSelect={() => setActiveStage(stage.title)}
            />
          ))}
        </div>

        <div className="hidden w-full xl:flex xl:items-stretch xl:justify-between">
          {stages.map((stage, index) => (
            <div key={stage.title} className="contents">
              <div className="min-w-0 flex-1">
                <StageCard
                  stage={stage}
                  index={index}
                  isActive={stage.title === activeStage}
                  onSelect={() => setActiveStage(stage.title)}
                />
              </div>
              {index < stages.length - 1 ? <PipelineArrow /> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PipelineViewer
