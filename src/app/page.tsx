// src/app/page.tsx
import { ScheduleView } from '../components/schedule/ScheduleView'

export default function Home() {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Daily Schedule</h1>
      </header>
      
      <main className="mt-6">
        <ScheduleView />
      </main>
    </div>
  )
}