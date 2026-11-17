import { Download, FileJson, FileSpreadsheet, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import { VARIANTS, cleaningCaseById, variantKeyFor } from '../data/assets.js'
import { exportComparisonPng, exportKeptCsv, exportKeptJson } from '../lib/export.js'
import { useConsoleStore } from '../store/useConsoleStore.js'

const colorFields = [
  { key: 'kept', label: '保留框' },
  { key: 'removed', label: '删除框' },
  { key: 'selected', label: '选中框' },
]

function Switch({ on, onClick }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`relative h-5 w-9 flex-none rounded-full transition ${on ? 'bg-gray-900' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${on ? 'left-4' : 'left-0.5'}`} />
    </button>
  )
}

function ControlPanel() {
  const caseId = useConsoleStore((s) => s.caseId)
  const toggles = useConsoleStore((s) => s.toggles)
  const showRemoved = useConsoleStore((s) => s.showRemoved)
  const colors = useConsoleStore((s) => s.colors)
  const toggleHead = useConsoleStore((s) => s.toggleHead)
  const setShowRemoved = useConsoleStore((s) => s.setShowRemoved)
  const setColor = useConsoleStore((s) => s.setColor)
  const resetConsole = useConsoleStore((s) => s.resetConsole)
  const [busy, setBusy] = useState(false)

  const caseData = cleaningCaseById.get(caseId)
  const variantKey = variantKeyFor(toggles)

  const handlePng = async () => {
    if (!caseData) return
    setBusy(true)
    try {
      await exportComparisonPng(caseData, { toggles, showRemoved, colors })
    } catch (err) {
      window.alert(`导出失败：${err.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel-shell rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">参数配置</h2>
        <span className="text-xs text-gray-500">最终结果：{VARIANTS[variantKey].label}</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-[1.1fr_1fr_1.3fr]">
        <div>
          <p className="mb-3 text-sm text-gray-500">功能开关</p>
          <div className="space-y-2">
            {[
              { key: 'backgroundHead', label: '启用背景头' },
              { key: 'fragmentHead', label: '启用碎片头' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
                <span className="text-sm text-gray-700">{label}</span>
                <Switch on={toggles[key]} onClick={() => toggleHead(key)} />
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs leading-5 text-gray-400">
            都关→原始候选框；仅背景头→背景单头记录；仅碎片头→碎片单头记录；都开→双头最终记录。
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm text-gray-500">框显示</p>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
            <span className="text-sm text-gray-700">显示删除框</span>
            <Switch on={showRemoved} onClick={() => setShowRemoved(!showRemoved)} />
          </div>
          <p className="mt-3 mb-2 text-sm text-gray-500">框体颜色</p>
          <div className="flex flex-wrap gap-2">
            {colorFields.map(({ key, label }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-700 hover:border-gray-300"
              >
                <input
                  type="color"
                  value={colors[key]}
                  onChange={(e) => setColor(key, e.target.value)}
                  className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm text-gray-500">导出（当前样例 {caseId}）</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePng}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-gray-300 disabled:opacity-50"
            >
              <Download size={14} />
              对比图 PNG
            </button>
            <button
              type="button"
              onClick={() => caseData && exportKeptJson(caseData, toggles)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-gray-300"
            >
              <FileJson size={14} />
              保留框 JSON
            </button>
            <button
              type="button"
              onClick={() => caseData && exportKeptCsv(caseData, toggles)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-gray-300"
            >
              <FileSpreadsheet size={14} />
              保留框 CSV
            </button>
          </div>
          <p className="mt-2 text-xs leading-5 text-gray-400">
            对比图为"原始候选框 | 当前最终结果"并排；数据导出当前开关组合下的保留框坐标及三种记录的保留情况。
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="text-xs text-gray-400">重置：恢复当前样例的默认设置（双头开启、显示删除框、默认颜色、清除选中）</span>
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
