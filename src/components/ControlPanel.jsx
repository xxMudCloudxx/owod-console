import { RefreshCcw } from 'lucide-react'
import { useConsoleStore } from '../store/useConsoleStore.js'

function ControlPanel() {
  const toggles = useConsoleStore((state) => state.toggles)
  const strategiesState = useConsoleStore((state) => state.strategies)
  const colors = useConsoleStore((state) => state.colors)
  const selectedColorKey = useConsoleStore((state) => state.selectedColorKey)
  const toggleHead = useConsoleStore((state) => state.toggleHead)
  const setStrategy = useConsoleStore((state) => state.setStrategy)
  const selectColor = useConsoleStore((state) => state.selectColor)
  const resetConsole = useConsoleStore((state) => state.resetConsole)

  return (
    <section className="panel-shell rounded-lg p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">参数配置</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[1.08fr_1fr_1fr_1.12fr]">
        <div>
          <p className="mb-3 text-sm text-gray-500">功能开关</p>
          <div className="space-y-2">
            {[
              { key: 'backgroundHead', label: '启用背景头' },
              { key: 'fragmentHead', label: '启用碎片头' },
            ].map(({ key, label }) => (
              <label key={key} className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 hover:bg-gray-50">
                <span className="text-sm text-gray-700">{label}</span>
                <button
                  type="button"
                  onClick={() => toggleHead(key)}
                  className={`relative h-5 w-9 rounded-full transition ${toggles[key] ? 'bg-gray-900' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${toggles[key] ? 'left-4' : 'left-0.5'}`} />
                </button>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm text-gray-500">背景头策略</p>
          <div className="flex gap-2">
            {['激进', '保守'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStrategy('backgroundHead', s)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                  strategiesState.backgroundHead === s
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm text-gray-500">碎片头策略</p>
          <div className="flex gap-2">
            {['激进', '保守'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStrategy('fragmentHead', s)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                  strategiesState.fragmentHead === s
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm text-gray-500">框体颜色</p>
          <div className="flex gap-3">
            {colors.map((color) => (
              <button
                key={color.key}
                type="button"
                onClick={() => selectColor(color.key)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                  selectedColorKey === color.key
                    ? 'border-gray-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="h-4 w-4 rounded" style={{ backgroundColor: color.hex }} />
                <span className="text-gray-700">{color.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={resetConsole}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
        >
          <RefreshCcw size={14} />
          重置
        </button>
      </div>
    </section>
  )
}

export default ControlPanel
