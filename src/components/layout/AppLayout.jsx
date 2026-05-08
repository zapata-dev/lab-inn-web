import { Outlet } from 'react-router-dom'
import DemoPanel from '../demo/DemoPanel'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

function AppLayout() {
  return (
    <div className="min-h-screen bg-lab-bg text-lab-text lg:grid lg:grid-cols-[18rem_1fr]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex min-h-screen flex-col">
        <Topbar />
        <main className="flex-1 px-5 py-6 pb-24 md:px-8 lg:pb-8">
          <Outlet />
        </main>
      </div>

      <BottomNav />
      <DemoPanel />
    </div>
  )
}

export default AppLayout
