import Header from "@/components/Header"
import MetricsGrid from "@/components/MetricsGrid"
import SniperEntryForm from "@/components/SniperEntryForm"
import TradesTable from "@/components/TradesTable"

export default function Home() {
  return (
    <>
      <Header />
      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex-1 overflow-auto">
        <MetricsGrid />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pb-10">
          {/* Left Column: Form */}
          <div className="lg:col-span-4 h-full">
            <SniperEntryForm />
          </div>
          
          {/* Right Column: Table */}
          <div className="lg:col-span-8 h-full">
            <TradesTable />
          </div>
        </div>
      </main>
    </>
  )
}
