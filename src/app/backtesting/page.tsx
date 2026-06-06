"use client"

import dynamic from 'next/dynamic'

// Dynamically import the Backtesting App with SSR disabled
// This prevents "window is not defined" errors from klinecharts
const BacktestingApp = dynamic(() => import('./BacktestingApp'), { 
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500 animate-pulse">Loading Trading Engine...</p>
      </div>
    </div>
  )
})

export default function Page() {
  return <BacktestingApp />
}
