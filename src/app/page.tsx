import { SessionTypeList } from '@/components/SessionTypeList'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Family Planner</h1>
      <section>
        <h2 className="text-xl font-semibold mb-2">Session Types</h2>
        <SessionTypeList />
      </section>
    </main>
  )
}