// src/app/settings/page.tsx
import { SessionTypeManager } from '@/components/settings/SessionTypeManager'

export default function Settings() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">Session Types</h2>
        <SessionTypeManager />
      </section>
    </div>
  )
}