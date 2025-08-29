import { Outlet } from 'react-router-dom'

export default function ClassRoomLayout() {
  return (
    <main className="w-full h-screen relative overflow-hidden">
      <Outlet />
    </main>
  )
}
