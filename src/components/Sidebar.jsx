import { History, ImageIcon, UserRound } from 'lucide-react'
import { useConsoleStore } from '../store/useConsoleStore.js'

const menuItems = [
  { label: '个人中心', icon: UserRound },
  { label: '图像清理', icon: ImageIcon },
  { label: '最近样例', icon: History },
]

function Sidebar() {
  const activeNav = useConsoleStore((state) => state.activeNav)
  const setActiveNav = useConsoleStore((state) => state.setActiveNav)

  return (
    <aside className="border-b border-gray-200 bg-white lg:min-h-full lg:w-56 lg:border-r lg:border-b-0">
      <div className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-col lg:py-4">
        {menuItems.map(({ label, icon: Icon }) => {
          const isActive = label === activeNav

          return (
            <button
              key={label}
              type="button"
              onClick={() => setActiveNav(label)}
              className={`flex min-w-max items-center gap-3 rounded-lg px-3 py-2.5 text-left transition lg:min-w-0 ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-gray-700' : 'text-gray-400'} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

export default Sidebar
