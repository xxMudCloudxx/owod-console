import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import PipelineViewer from './components/PipelineViewer.jsx'
import ControlPanel from './components/ControlPanel.jsx'
import DataPanel from './components/DataPanel.jsx'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-700">
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 flex-col lg:flex-row">
          <Sidebar />
          <main className="flex min-w-0 flex-1 flex-col xl:flex-row">
            <section className="flex min-w-0 flex-1 flex-col gap-5 p-5 lg:p-6 xl:px-7">
              <PipelineViewer />
              <ControlPanel />
            </section>
            <DataPanel />
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
