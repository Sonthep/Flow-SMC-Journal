import Header from "@/components/Header"
import DashboardClient from "@/components/DashboardClient"

export default function Home() {
  return (
    <>
      <Header />
      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex-1 overflow-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Performance Analytics</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Track your progress and verify your edge.</p>
          </div>
        </div>

        <DashboardClient />

      </main>
    </>
  )
}
