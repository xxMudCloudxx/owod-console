import { useConsoleStore } from '../store/useConsoleStore.js'

function DataPanel() {
  const metrics = useConsoleStore((state) => state.metrics)
  const toggles = useConsoleStore((state) => state.toggles)
  const strategies = useConsoleStore((state) => state.strategies)
  const selectedBox = useConsoleStore((state) => state.selectedBox)
  const activeStage = useConsoleStore((state) => state.activeStage)
  const runStatus = useConsoleStore((state) => state.runStatus)

  const summaryLines = [
    `背景头：${toggles.backgroundHead ? '启用' : '停用'}`,
    `碎片头：${toggles.fragmentHead ? '启用' : '停用'}`,
    `当前策略：${strategies.backgroundHead} + ${strategies.fragmentHead}`,
    `焦点阶段：${activeStage}`,
    `输出状态：${runStatus}`,
  ]

  return (
    <aside className="panel-shell-muted w-full p-5 xl:w-[22rem] 2xl:w-[23rem]">
      <div className="flex flex-col gap-5">
        <section>
          <h3 className="mb-3 text-sm font-medium text-gray-900">数据集指标总览</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <p className="text-2xl font-semibold text-green-600">{metrics.retention}%</p>
              <p className="text-xs text-gray-500">保留率</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <p className="text-2xl font-semibold text-red-500">{metrics.deletion}%</p>
              <p className="text-xs text-gray-500">删除率</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <p className="text-2xl font-semibold text-gray-900">{metrics.singleImage}</p>
              <p className="text-xs text-gray-500">单图指标</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-medium text-gray-900">选中框信息</h3>
          <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">类型</span>
              <span className="text-gray-900">{selectedBox.type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">分数</span>
              <span className="text-gray-900">{selectedBox.score.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">状态</span>
              <span className={selectedBox.status === '已删除' ? 'text-red-500' : 'text-green-600'}>
                {selectedBox.status}
              </span>
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-medium text-gray-900">运行摘要</h3>
          <pre className="rounded-lg bg-gray-800 p-3 text-xs leading-5 text-gray-100">
            <code>{summaryLines.join('\n')}</code>
          </pre>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-medium text-gray-900">分析结论</h3>
          <p className="text-sm leading-6 text-gray-600">
            算法成功清理了大量纯背景噪声，当前保留框主要集中在具有潜在未知语义的候选区域。
          </p>
        </section>
      </div>
    </aside>
  )
}

export default DataPanel
