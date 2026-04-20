import { Clock3, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

const formatCurrentTime = () =>
  new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())

function Header() {
  const [currentTime, setCurrentTime] = useState(formatCurrentTime)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(formatCurrentTime())
    }, 60_000)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <header className="border-b border-gray-200 bg-white px-5 py-4 xl:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              OWOD检测辅助分析原型
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock3 size={16} className="text-gray-400" />
            <span>{currentTime}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-gray-200" />
          <span className="text-gray-700">管理员</span>
        </div>
      </div>
    </header>
  )
}

export default Header
