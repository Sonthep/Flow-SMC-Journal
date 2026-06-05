"use client"

import React, { useState, useEffect, useRef } from "react"
import Header from "@/components/Header"
import { Play, SkipForward, Rewind, Pause, Maximize2, Settings2, Crosshair, BarChart2, Upload, FileText } from "lucide-react"
import { createChart, CandlestickSeries, IChartApi, ISeriesApi, CandlestickData, Time } from "lightweight-charts"

export default function BacktestingPage() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  
  const [fullData, setFullData] = useState<CandlestickData[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1000) // ms per candle
  const [fileName, setFileName] = useState<string | null>(null)

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#ffffff' },
        textColor: '#64748b',
      },
      grid: {
        vertLines: { color: '#f1f5f9' },
        horzLines: { color: '#f1f5f9' },
      },
      crosshair: {
        mode: 1, // Normal mode
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    })

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    })

    chartRef.current = chart
    seriesRef.current = candlestickSeries

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  // Handle Playback Loop
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying && fullData.length > 0 && currentIndex < fullData.length) {
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev + 1 >= fullData.length) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, playbackSpeed)
    }

    return () => clearInterval(interval)
  }, [isPlaying, currentIndex, fullData, playbackSpeed])

  // Update Chart when currentIndex changes
  useEffect(() => {
    if (seriesRef.current && fullData.length > 0) {
      // Show data up to current index
      const visibleData = fullData.slice(0, currentIndex + 1)
      seriesRef.current.setData(visibleData)
    }
  }, [currentIndex, fullData])

  // CSV Parsing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n')
      
      const parsedData: CandlestickData[] = []
      
      // Basic CSV parsing assuming format: Date,Open,High,Low,Close (or similar)
      // Works with common MT4/MT5 CSV exports
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        const cols = line.split(',')
        if (cols.length < 5) continue

        try {
          // Attempt to parse Date. If it's "YYYY.MM.DD HH:MM", convert to timestamp
          let timeVal: Time
          let dateStr = cols[0]
          // If there's a separate time column (MT4 style)
          if (cols[1].includes(':')) {
            dateStr = cols[0].replace(/\./g, '-') + 'T' + cols[1]
          }
          
          const timestamp = new Date(dateStr).getTime() / 1000
          if (isNaN(timestamp)) continue

          timeVal = timestamp as Time

          // Extract OHLC (assuming standard MT4 export order: Date, Time, Open, High, Low, Close)
          let oIdx = 1, hIdx = 2, lIdx = 3, cIdx = 4
          if (cols[1].includes(':')) { // MT4 format
            oIdx = 2; hIdx = 3; lIdx = 4; cIdx = 5
          }

          parsedData.push({
            time: timeVal,
            open: parseFloat(cols[oIdx]),
            high: parseFloat(cols[hIdx]),
            low: parseFloat(cols[lIdx]),
            close: parseFloat(cols[cIdx])
          })
        } catch (err) {
          console.error("Parse error on line", i, err)
        }
      }

      if (parsedData.length > 0) {
        // Sort by time just in case
        parsedData.sort((a, b) => (a.time as number) - (b.time as number))
        
        setFullData(parsedData)
        // Start by showing the first 100 candles
        const startIndex = Math.min(100, parsedData.length - 1)
        setCurrentIndex(startIndex)
        
        if (seriesRef.current) {
          seriesRef.current.setData(parsedData.slice(0, startIndex + 1))
          chartRef.current?.timeScale().fitContent()
        }
      } else {
        alert("Could not parse valid OHLC data from CSV. Please check the format.")
      }
    }

    reader.readAsText(file)
  }

  const togglePlay = () => setIsPlaying(!isPlaying)
  const stepForward = () => {
    setIsPlaying(false)
    if (currentIndex < fullData.length - 1) setCurrentIndex(prev => prev + 1)
  }

  return (
    <>
      <Header />
      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto flex-1 flex flex-col overflow-hidden h-[calc(100vh-80px)]">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">Custom CSV Backtester</h2>
            <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
              {fullData.length > 0 ? "Data Loaded" : "Waiting for Data"}
            </div>
          </div>
          
          {/* Simulator Controls & Upload */}
          <div className="flex items-center gap-4">
            
            {/* CSV Uploader */}
            <div className="relative">
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                <Upload className="size-4" />
                {fileName ? "Change CSV File" : "Upload History CSV"}
              </button>
            </div>

            {/* Playback Tools */}
            <div className={`flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm transition-opacity ${fullData.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
              <button 
                onClick={togglePlay}
                className={`p-2 transition-colors ${isPlaying ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-400 hover:text-sky-500'}`}
              >
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-current" />}
              </button>
              <button onClick={stepForward} className="p-2 text-slate-400 hover:text-slate-700 transition-colors">
                <SkipForward className="size-4" />
              </button>
              <div className="w-px h-4 bg-slate-200 mx-2"></div>
              
              {/* Speed selector */}
              <select 
                value={playbackSpeed} 
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="text-xs font-bold text-slate-600 bg-transparent border-none focus:ring-0 py-1 pl-2 pr-6 cursor-pointer"
              >
                <option value={1000}>1x Speed (1s)</option>
                <option value={500}>2x Speed (0.5s)</option>
                <option value={100}>5x Speed (0.1s)</option>
                <option value={10}>Max Speed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
          
          {/* Chart Area */}
          <div className="lg:col-span-3 bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col overflow-hidden relative">
            
            {/* Chart Toolbar */}
            <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">
                    {fileName ? fileName.replace('.csv', '').toUpperCase() : 'XAUUSD (Awaiting CSV)'}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-500 font-medium text-xs">LOCAL DATA</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-wider">
                {fullData.length > 0 ? (
                  <span>Bar: {currentIndex + 1} / {fullData.length}</span>
                ) : (
                  <span>No data loaded</span>
                )}
              </div>
            </div>

            {/* Lightweight Chart Container */}
            <div 
              ref={chartContainerRef} 
              className="flex-1 relative bg-white w-full h-full"
            />
            
            {/* Empty State Overlay */}
            {fullData.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                <FileText className="size-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No Chart Data</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-md text-center">
                  To begin backtesting, please upload a historical CSV file containing OHLC data (e.g. from MT4, MT5, or Dukascopy).
                </p>
                <div className="mt-6 relative">
                  <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-sky-500/20 transition-all">
                    Browse CSV File
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Execution Panel (Right Side - 1 Column) */}
          <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto">
            
            {/* Order Entry */}
            <div className={`bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 shrink-0 transition-opacity ${fullData.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">Order Entry</h3>
              
              <div className="flex items-center gap-2 mb-4 bg-slate-50 p-1 rounded-xl border border-slate-100">
                <button className="flex-1 py-2 rounded-lg text-xs font-bold transition-all bg-white text-slate-800 shadow-sm border border-slate-200">Market</button>
                <button className="flex-1 py-2 rounded-lg text-xs font-bold transition-all text-slate-500 hover:text-slate-800">Limit</button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-500">Risk %</span>
                    <span className="font-bold text-slate-800">1.0% ($1,000)</span>
                  </div>
                  <input type="range" className="w-full accent-sky-500" min="0.1" max="5" step="0.1" defaultValue="1" />
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">SL</span>
                    <input type="number" placeholder="Price" className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-sky-500 text-slate-800 font-mono" />
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">TP</span>
                    <input type="number" placeholder="Price" className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-sky-500 text-slate-800 font-mono" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button className="bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 font-bold py-3 rounded-xl transition-colors shadow-sm flex flex-col items-center justify-center gap-0.5">
                    <span className="text-sm">SELL</span>
                    <span className="text-[9px] opacity-80 uppercase tracking-wider">Market</span>
                  </button>
                  <button className="bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-600 font-bold py-3 rounded-xl transition-colors shadow-sm flex flex-col items-center justify-center gap-0.5">
                    <span className="text-sm">BUY</span>
                    <span className="text-[9px] opacity-80 uppercase tracking-wider">Market</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Open Positions */}
            <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex-1 flex flex-col min-h-[200px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Position</h3>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400">
                <Crosshair className="size-8 mb-2 opacity-20" />
                <p className="text-xs font-medium">No active positions</p>
                <p className="text-[10px]">Execute a trade to view it here.</p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
