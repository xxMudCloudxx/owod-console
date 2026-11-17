import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import PipelineViewer from './components/PipelineViewer.jsx'
import ControlPanel from './components/ControlPanel.jsx'
import DataPanel from './components/DataPanel.jsx'
import DetectorComparison from './components/DetectorComparison.jsx'
import { useConsoleStore } from './store/useConsoleStore.js'

function App() {
  const activeNav = useConsoleStore((s) => s.activeNav)

  let content
  if (activeNav === '检测对比') {
    content = (
      <section className="min-w-0 flex-1 p-5 lg:p-6 xl:px-7">
        <DetectorComparison />
      </section>
    )
  } else if (activeNav === '个人中心') {
    content = (
      <section className="flex-1 p-5 lg:p-6 xl:px-7">
        <div className="panel-shell rounded-lg p-6 text-sm text-gray-500">个人中心暂未开放。</div>
      </section>
    )
  } else {
    content = (
      <>
        <section className="flex min-w-0 flex-1 flex-col gap-5 p-5 lg:p-6 xl:px-7">
          <PipelineViewer />
          <ControlPanel />
        </section>
        <DataPanel />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-700">
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 flex-col lg:flex-row">
          <Sidebar />
          <main className="flex min-w-0 flex-1 flex-col xl:flex-row">{content}</main>
        </div>
      </div>
    </div>
  )
}

export default App
