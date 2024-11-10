// src/app/settings/page.tsx
import { SessionTypeManager } from '@/components/settings/SessionTypeManager'

export default function Settings() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Settings</h1>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">Session Types</h2>
        <SessionTypeManager />
      </section>
    </div>
  )
}