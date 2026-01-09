import { AdCreator } from "@/components/ad-creator"

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-black relative overflow-hidden">
      <div className="relative z-10 min-h-screen">
        <AdCreator />
      </div>
    </main>
  )
}
