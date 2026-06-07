"use client"

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react"
import Header from "@/components/Header"
import {
  Play, SkipForward, Pause, Upload, FileText,
  Crosshair, Minus, Square, TrendingUp, Trash2,
  Undo2, ZoomIn, ZoomOut, Moon, Sun, ChevronLeft,
  ChevronRight, BarChart2, Type, Lock, Unlock
} from "lucide-react"
import { init, dispose, Chart, KLineData, registerOverlay, registerIndicator } from "klinecharts"

// Register custom Killzone Box overlay
registerOverlay({
  name: 'killzoneBox',
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ overlay, coordinates }) => {
    return [
      {
        type: 'polygon',
        attrs: {
          coordinates: [
            { x: coordinates[0].x, y: coordinates[0].y },
            { x: coordinates[1].x, y: coordinates[0].y },
            { x: coordinates[1].x, y: coordinates[1].y },
            { x: coordinates[0].x, y: coordinates[1].y }
          ]
        },
        styles: { style: 'fill', color: overlay.extendData?.color || 'rgba(59, 130, 246, 0.2)' }
      },
      {
        type: 'text',
        attrs: { x: coordinates[0].x + 4, y: coordinates[0].y + 14, text: overlay.extendData?.name || '' },
        styles: { color: overlay.extendData?.pivotColor || '#fff', size: 10, weight: 'bold' }
      }
    ]
  }
})

// Register custom Rectangle drawing tool
registerOverlay({
  name: 'rect',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ overlay, coordinates }) => {
    if (coordinates.length < 2) {
      return []
    }
    
    // Parse extendData
    let textStr = ''
    let mainColor = '#facc15' // Default yellow
    let bgColor = 'rgba(250, 204, 21, 0.1)'
    
    if (overlay.extendData) {
      if (typeof overlay.extendData === 'string') {
        textStr = overlay.extendData
      } else {
        textStr = overlay.extendData.text || ''
        if (overlay.extendData.color) {
          mainColor = overlay.extendData.color
          // Convert hex to rgba for background
          bgColor = mainColor + '20' // 20 hex = 12% opacity roughly, or we just rely on CSS
          // A simple hack for rgba if it's a standard tailwind hex:
          if (mainColor === '#facc15') bgColor = 'rgba(250, 204, 21, 0.15)'
          if (mainColor === '#ef4444') bgColor = 'rgba(239, 68, 68, 0.15)'
          if (mainColor === '#3b82f6') bgColor = 'rgba(59, 130, 246, 0.15)'
          if (mainColor === '#22c55e') bgColor = 'rgba(34, 197, 94, 0.15)'
          if (mainColor === '#a855f7') bgColor = 'rgba(168, 85, 247, 0.15)'
          if (mainColor === '#ffffff') bgColor = 'rgba(255, 255, 255, 0.15)'
        }
      }
    }

    const minX = Math.min(coordinates[0].x, coordinates[1].x)
    const maxX = Math.max(coordinates[0].x, coordinates[1].x)
    const minY = Math.min(coordinates[0].y, coordinates[1].y)
    const maxY = Math.max(coordinates[0].y, coordinates[1].y)

    const figures: any[] = [
      {
        type: 'polygon',
        attrs: {
          coordinates: [
            { x: minX, y: minY },
            { x: maxX, y: minY },
            { x: maxX, y: maxY },
            { x: minX, y: maxY }
          ]
        },
        styles: { style: 'stroke_fill', color: bgColor, borderColor: mainColor, borderSize: 2 }
      }
    ]

    // Render text centered if provided
    if (textStr) {
      figures.push({
        type: 'text',
        attrs: {
          x: minX + (maxX - minX) / 2,
          y: minY + (maxY - minY) / 2,
          text: textStr,
          align: 'center',
          baseline: 'middle'
        },
        styles: { color: mainColor, size: 14, weight: 'bold' }
      })
    }

    return figures
  }
})

// Register custom Text drawing tool
registerOverlay({
  name: 'customText',
  totalStep: 2,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ overlay, coordinates }) => {
    return [
      {
        type: 'text',
        attrs: {
          x: coordinates[0].x,
          y: coordinates[0].y,
          text: typeof overlay.extendData === 'string' ? overlay.extendData : (overlay.extendData?.text ?? 'Text...')
        },
        styles: { 
          color: typeof overlay.extendData === 'object' && overlay.extendData?.color ? overlay.extendData.color : '#ffffff', 
          size: 16, 
          weight: 'bold' 
        }
      }
    ]
  }
})

// Module-level cache to safely pass session data from calc to draw
let globalKzSessions: any[] = []

// Register custom ICT Killzones Indicator
registerIndicator({
  name: 'ICT_Killzones',
  shortName: 'KZ',
  calc: (dataList, indicator) => {
    const kzOffset = (indicator.calcParams && indicator.calcParams[0]) || 0
    const kzSessions = [
      { id: 'asia', name: 'Asia', start: 20*60, end: 24*60, color: 'rgba(59,130,246,0.1)', pivotColor: '#3b82f6' },
      { id: 'london', name: 'London', start: 2*60, end: 5*60, color: 'rgba(239,68,68,0.1)', pivotColor: '#ef4444' },
      { id: 'nyam', name: 'NY AM', start: 9*60+30, end: 11*60, color: 'rgba(34,197,94,0.1)', pivotColor: '#22c55e' },
      { id: 'nylu', name: 'NY Lunch', start: 12*60, end: 13*60, color: 'rgba(250,204,21,0.1)', pivotColor: '#facc15' },
      { id: 'nypm', name: 'NY PM', start: 13*60+30, end: 16*60, color: 'rgba(168,85,247,0.1)', pivotColor: '#a855f7' }
    ]

    const sessions: any[] = []
    let currentSession: any = null

    for (let i = 0; i < dataList.length; i++) {
      const bar = dataList[i]
      const date = new Date(bar.timestamp)
      
      let mins = date.getHours() * 60 + date.getMinutes()
      mins = (mins + kzOffset * 60) % (24 * 60)
      if (mins < 0) mins += 24 * 60

      const activeKz = kzSessions.find(s => mins >= s.start && mins < s.end)

      if (activeKz) {
        if (!currentSession || currentSession.id !== activeKz.id) {
          currentSession = {
            id: activeKz.id,
            name: activeKz.name,
            color: activeKz.color,
            pivotColor: activeKz.pivotColor,
            startIndex: i,
            endIndex: i,
            high: bar.high,
            low: bar.low
          }
          sessions.push(currentSession)
        } else {
          currentSession.endIndex = i
          currentSession.high = Math.max(currentSession.high, bar.high)
          currentSession.low = Math.min(currentSession.low, bar.low)
        }
      } else {
        currentSession = null
      }
    }
    
    globalKzSessions = sessions
    return dataList.map(() => ({} as any))
  },
  draw: ({ ctx, barSpace, visibleRange, xAxis, yAxis }) => {
    const sessions = globalKzSessions

    sessions.forEach((s: any) => {
      // Draw if session overlaps with visible range
      if (s.endIndex >= visibleRange.from && s.startIndex <= visibleRange.to) {
        // xAxis.convertToPixel returns the center of the candle.
        // We use barSpace.halfBar to find the left and right edges.
        const startX = xAxis.convertToPixel(s.startIndex) - barSpace.halfBar
        const endX = xAxis.convertToPixel(s.endIndex) + barSpace.halfBar
        const topY = yAxis.convertToPixel(s.high)
        const bottomY = yAxis.convertToPixel(s.low)

        // Draw Box
        ctx.fillStyle = s.color
        ctx.fillRect(startX, topY, endX - startX, bottomY - topY)
        
        // Draw Border (top and bottom)
        ctx.strokeStyle = s.color.replace('0.1', '0.3')
        ctx.lineWidth = 1
        ctx.strokeRect(startX, topY, endX - startX, bottomY - topY)

        // Draw Text
        ctx.fillStyle = s.pivotColor
        ctx.font = "bold 10px sans-serif"
        ctx.textAlign = "left"
        ctx.fillText(s.name, startX + 4, topY + 12)
      }
    })
    return false // Skip default drawing
  }
})

// Module-level cache for SMC data
let globalSMCData: any = { fvgs: [], obs: [] }

// Module-level: stores the last yAxis-computed prices from createPointFigures
// Used by onDrawEnd/onMoveEnd to get accurate visual prices (klinecharts may reset extendData)
let lastPositionPrices = { overlayId: '', entryPrice: 0, tpPrice: 0, slPrice: 0 }

const positionOverlay = (name: string) => ({
  name,
  totalStep: 4,   // Step 1=Entry, Step 2=TP, Step 3=SL, Step 4=finalize → 3 draggable dots
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, overlay, yAxis, bounding }: any) => {
    if (coordinates.length === 0) return []
    
    const entry = coordinates[0]
    const tp = coordinates[1] || { x: entry.x, y: entry.y }
    
    const sl = coordinates[2] || {
      x: tp.x,
      y: entry.y - (tp.y - entry.y)
    }

    const minX = Math.min(entry.x, tp.x, sl.x)
    const maxX = Math.max(entry.x, tp.x, sl.x)

    // Convert pixel Y → price using yAxis, subtracting the pane top offset
    // so the pixel is in pane-local coordinates (what convertFromPixel expects)
    const paneTop = bounding?.top ?? 0
    const toPrice = (y: number): number => yAxis?.convertFromPixel(y - paneTop) ?? 0

    const entryPrice = toPrice(entry.y)
    const tpPrice    = toPrice(tp.y)
    const slPrice    = toPrice(sl.y)

    // Store to module-level var so onDrawEnd / onMoveEnd can read correct prices
    // (klinecharts may reset overlay.extendData before firing those callbacks)
    if (overlay && yAxis) {
      lastPositionPrices = { overlayId: overlay.id ?? '', entryPrice, tpPrice, slPrice }
      overlay.extendData = { entryPrice, tpPrice, slPrice }  // backup in extendData too
    }

    const profitColor = 'rgba(34, 197, 94, 0.2)'
    const profitBorder = 'rgba(34, 197, 94, 0.8)'
    const lossColor = 'rgba(239, 68, 68, 0.2)'
    const lossBorder = 'rgba(239, 68, 68, 0.8)'

    const figures: any[] = []
    
    // Profit Box
    figures.push({
      type: 'polygon',
      attrs: {
        coordinates: [
          { x: minX, y: entry.y },
          { x: maxX, y: entry.y },
          { x: maxX, y: tp.y },
          { x: minX, y: tp.y }
        ]
      },
      styles: { style: 'stroke_fill', color: profitColor, borderColor: profitBorder, borderSize: 1 }
    })

    // Loss Box
    figures.push({
      type: 'polygon',
      attrs: {
        coordinates: [
          { x: minX, y: entry.y },
          { x: maxX, y: entry.y },
          { x: maxX, y: sl.y },
          { x: minX, y: sl.y }
        ]
      },
      styles: { style: 'stroke_fill', color: lossColor, borderColor: lossBorder, borderSize: 1 }
    })

    // RR Text
    if (coordinates.length >= 2) {
      const risk = Math.abs(entry.y - sl.y)
      const reward = Math.abs(tp.y - entry.y)
      const rr = risk > 0 ? (reward / risk).toFixed(2) : '∞'

      figures.push({
        type: 'text',
        attrs: {
          x: minX + (maxX - minX) / 2,
          y: entry.y,
          text: `Risk/Reward: ${rr}`,
          align: 'center',
          baseline: 'middle'
        },
        styles: { color: '#fff', size: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2 }
      })
    }

    return figures
  }
})

registerOverlay(positionOverlay('longPosition'))
registerOverlay(positionOverlay('shortPosition'))

registerOverlay({
  name: 'premiumDiscount',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, yAxis }: any) => {
    if (coordinates.length < 2) return []

    const p1 = coordinates[0]
    const p2 = coordinates[1]

    const minX = Math.min(p1.x, p2.x)
    const maxX = Math.max(p1.x, p2.x)

    const highY = Math.min(p1.y, p2.y)
    const lowY = Math.max(p1.y, p2.y)
    const midY = (highY + lowY) / 2

    const highPrice = yAxis?.convertFromPixel(highY) ?? 0
    const lowPrice = yAxis?.convertFromPixel(lowY) ?? 0
    const midPrice = yAxis?.convertFromPixel(midY) ?? 0

    const formatPrice = (p: number) => p.toFixed(3)

    const premiumColor = 'rgba(239, 68, 68, 0.15)'
    const discountColor = 'rgba(34, 197, 94, 0.15)'

    const figures: any[] = []

    figures.push({
      type: 'polygon',
      attrs: {
        coordinates: [
          { x: minX, y: highY }, { x: maxX, y: highY },
          { x: maxX, y: midY }, { x: minX, y: midY }
        ]
      },
      styles: { style: 'fill', color: premiumColor }
    })

    figures.push({
      type: 'polygon',
      attrs: {
        coordinates: [
          { x: minX, y: midY }, { x: maxX, y: midY },
          { x: maxX, y: lowY }, { x: minX, y: lowY }
        ]
      },
      styles: { style: 'fill', color: discountColor }
    })

    const createLineWithText = (y: number, price: number, ratio: string, color: string) => {
      figures.push({
        type: 'line',
        attrs: { coordinates: [{ x: minX, y: y }, { x: maxX, y: y }] },
        styles: { style: 'solid', color: color, size: 1 }
      })
      figures.push({
        type: 'text',
        attrs: { x: minX - 4, y: y, text: `${ratio} (${formatPrice(price)})`, align: 'right', baseline: 'middle' },
        styles: { color: color, size: 12, paddingRight: 4 }
      })
    }

    createLineWithText(highY, highPrice, '1', '#60a5fa')
    createLineWithText(midY, midPrice, '0.5', '#ffffff')
    createLineWithText(lowY, lowPrice, '0', '#34d399')

    return figures
  }
})

// Register custom Smart Money Concepts Indicator
registerIndicator({
  name: 'SMC_Concepts',
  shortName: 'SMC',
  calc: (dataList) => {
    const fvgs: any[] = []
    const obs: any[] = []

    // Market Structure
    const swings: any[] = []
    const breakouts: any[] = []
    const swingLength = 5
    let lastConfHigh: any = null
    let lastConfLow: any = null
    let currentTrend = 0

    for (let i = 2; i < dataList.length; i++) {
      const c1 = dataList[i - 2]
      const c2 = dataList[i - 1]
      const c3 = dataList[i]

      // Bullish FVG
      if (c1.high < c3.low && c2.close > c2.open) {
        fvgs.push({
          type: 'bull',
          startIndex: i - 2,
          endIndex: i,
          top: c3.low,
          bottom: c1.high,
          active: true,
          color: 'rgba(34,197,94,0.15)', // Light green
          borderColor: 'rgba(34,197,94,0.4)'
        })
        
        // Basic Bullish OB: Lowest down candle before this FVG (lookback 10)
        let obCandleIdx = -1
        let minLow = Infinity
        for (let j = i - 2; j >= Math.max(0, i - 10); j--) {
          if (dataList[j].close < dataList[j].open && dataList[j].low < minLow) {
            minLow = dataList[j].low
            obCandleIdx = j
          }
        }
        if (obCandleIdx !== -1) {
          const obCandle = dataList[obCandleIdx]
          obs.push({
            type: 'bull',
            startIndex: obCandleIdx,
            endIndex: i,
            top: obCandle.high,
            bottom: obCandle.low,
            active: true,
            color: 'rgba(34,197,94,0.1)',
            borderColor: 'rgba(34,197,94,0.6)'
          })
        }
      }

      // Bearish FVG
      if (c1.low > c3.high && c2.close < c2.open) {
        fvgs.push({
          type: 'bear',
          startIndex: i - 2,
          endIndex: i,
          top: c1.low,
          bottom: c3.high,
          active: true,
          color: 'rgba(239,68,68,0.15)', // Light red
          borderColor: 'rgba(239,68,68,0.4)'
        })
        
        // Basic Bearish OB: Highest up candle before this FVG
        let obCandleIdx = -1
        let maxHigh = -Infinity
        for (let j = i - 2; j >= Math.max(0, i - 10); j--) {
          if (dataList[j].close > dataList[j].open && dataList[j].high > maxHigh) {
            maxHigh = dataList[j].high
            obCandleIdx = j
          }
        }
        if (obCandleIdx !== -1) {
          const obCandle = dataList[obCandleIdx]
          obs.push({
            type: 'bear',
            startIndex: obCandleIdx,
            endIndex: i,
            top: obCandle.high,
            bottom: obCandle.low,
            active: true,
            color: 'rgba(239,68,68,0.1)',
            borderColor: 'rgba(239,68,68,0.6)'
          })
        }
      }

      // Mitigation check
      for (const fvg of fvgs) {
        if (fvg.active) {
          fvg.endIndex = i
          if ((fvg.type === 'bull' && c3.low <= fvg.bottom) || (fvg.type === 'bear' && c3.high >= fvg.top)) {
            fvg.active = false
          }
        }
      }
      for (const ob of obs) {
        if (ob.active) {
          ob.endIndex = i
          if ((ob.type === 'bull' && c3.low <= ob.bottom) || (ob.type === 'bear' && c3.high >= ob.top)) {
            ob.active = false
          }
        }
      }

      // Market Structure Logic (Swings & Breakouts)
      const checkIdx = i - swingLength
      if (checkIdx >= 0 && checkIdx + swingLength < dataList.length) {
        let isHigh = true
        let isLow = true
        for (let j = 1; j <= swingLength; j++) {
          if (dataList[checkIdx].high <= dataList[checkIdx - j]?.high || dataList[checkIdx].high <= dataList[checkIdx + j]?.high) isHigh = false
          if (dataList[checkIdx].low >= dataList[checkIdx - j]?.low || dataList[checkIdx].low >= dataList[checkIdx + j]?.low) isLow = false
        }
        
        if (isHigh) {
          let type = 'HH'
          if (lastConfHigh && dataList[checkIdx].high < lastConfHigh.price) type = 'LH'
          const swing = { index: checkIdx, price: dataList[checkIdx].high, type, isHigh: true, broken: false }
          swings.push(swing)
          lastConfHigh = swing
        }
        if (isLow) {
          let type = 'HL'
          if (lastConfLow && dataList[checkIdx].low < lastConfLow.price) type = 'LL'
          const swing = { index: checkIdx, price: dataList[checkIdx].low, type, isHigh: false, broken: false }
          swings.push(swing)
          lastConfLow = swing
        }
      }

      // Check breakouts at current candle against confirmed swings
      if (lastConfHigh && !lastConfHigh.broken && dataList[i].close > lastConfHigh.price) {
        lastConfHigh.broken = true
        let type = currentTrend === 1 ? 'BOS' : 'CHOCH'
        currentTrend = 1
        breakouts.push({
          startIndex: lastConfHigh.index,
          endIndex: i,
          price: lastConfHigh.price,
          type: type,
          isBullish: true
        })
      }

      if (lastConfLow && !lastConfLow.broken && dataList[i].close < lastConfLow.price) {
        lastConfLow.broken = true
        let type = currentTrend === -1 ? 'BOS' : 'CHOCH'
        currentTrend = -1
        breakouts.push({
          startIndex: lastConfLow.index,
          endIndex: i,
          price: lastConfLow.price,
          type: type,
          isBullish: false
        })
      }
    }
    
    globalSMCData = { fvgs, obs, swings, breakouts }
    return dataList.map(() => ({} as any))
  },
  draw: ({ ctx, barSpace, visibleRange, xAxis, yAxis }) => {
    const { fvgs, obs, swings, breakouts } = globalSMCData

    const drawZone = (zone: any, label: string) => {
      // Draw if the zone overlaps the visible range
      if (zone.endIndex >= visibleRange.from && zone.startIndex <= visibleRange.to) {
        const startX = xAxis.convertToPixel(zone.startIndex) - barSpace.halfBar
        const endX = xAxis.convertToPixel(zone.endIndex) + barSpace.halfBar
        const topY = yAxis.convertToPixel(zone.top)
        const bottomY = yAxis.convertToPixel(zone.bottom)

        ctx.fillStyle = zone.color
        ctx.fillRect(startX, topY, endX - startX, bottomY - topY)
        
        ctx.strokeStyle = zone.borderColor
        ctx.lineWidth = 1
        ctx.strokeRect(startX, topY, endX - startX, bottomY - topY)

        ctx.fillStyle = zone.borderColor
        ctx.font = "bold 10px sans-serif"
        ctx.textAlign = "left"
        
        // To avoid text drawing outside box visually if box is thin, we just place it inside
        ctx.fillText(label, startX + 4, topY + 12)
      }
    }

    // Draw Market Structure
    if (swings) {
      swings.forEach((s: any) => {
        if (s.index >= visibleRange.from && s.index <= visibleRange.to) {
          const x = xAxis.convertToPixel(s.index)
          const padding = 10
          const y = yAxis.convertToPixel(s.price) + (s.isHigh ? -padding : padding + 4)

          ctx.fillStyle = s.isHigh ? 'rgba(239,68,68,0.8)' : 'rgba(34,197,94,0.8)' // Red for Highs, Green for Lows
          ctx.font = "bold 10px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(s.type, x, y)
        }
      })
    }

    if (breakouts) {
      breakouts.forEach((b: any) => {
        if (b.endIndex >= visibleRange.from && b.startIndex <= visibleRange.to) {
          const startX = xAxis.convertToPixel(b.startIndex)
          const endX = xAxis.convertToPixel(b.endIndex)
          const y = yAxis.convertToPixel(b.price)

          ctx.strokeStyle = b.isBullish ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)'
          ctx.lineWidth = 1
          ctx.setLineDash([4, 4])
          ctx.beginPath()
          ctx.moveTo(startX, y)
          ctx.lineTo(endX, y)
          ctx.stroke()
          ctx.setLineDash([])

          ctx.fillStyle = b.isBullish ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)'
          ctx.font = "bold 10px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(b.type, startX + (endX - startX) / 2, y - 4)
        }
      })
    }

    obs.forEach((ob: any) => drawZone(ob, ob.type === 'bull' ? '+OB' : '-OB'))
    fvgs.forEach((fvg: any) => drawZone(fvg, fvg.type === 'bull' ? '+FVG' : '-FVG'))

    return false
  }
})

// ─── Types ───────────────────────────────────────────────────────────────────
// Overlay names verified against klinecharts v9.8.12 getSupportedOverlays()
type DrawTool = 'cursor' | 'segment' | 'straightLine' | 'rayLine' | 'horizontalStraightLine' | 'rect' | 'premiumDiscount' | 'customText' | 'longPosition' | 'shortPosition'

interface MAConfig { period: number; color: string; enabled: boolean }

export interface Trade {
  id: string;
  type: 'long' | 'short';
  entryPrice: number;
  slPrice: number;
  tpPrice: number;
  riskAmount: number;
  rr: number;
  overlayId: string;
  status: 'open' | 'win' | 'loss';
  openIndex: number;
  closeIndex?: number;
  pnl?: number;
}

// ─── Dark theme for klinecharts ───────────────────────────────────────────────
const darkStyles = {
  grid: { horizontal: { color: 'rgba(255,255,255,0.05)' }, vertical: { color: 'rgba(255,255,255,0.05)' } },
  candle: {
    bar: { upColor: '#26a69a', downColor: '#ef5350', noChangeColor: '#888' },
    tooltip: { labels: ['T', 'O', 'H', 'L', 'C', 'V'], values: null, defaultValue: '--', rect: { offsetLeft: 8, offsetTop: 8, offsetRight: 8, paddingLeft: 6, paddingRight: 6, paddingTop: 4, paddingBottom: 4, borderRadius: 4, borderSize: 1, borderColor: 'rgba(255,255,255,0.1)', color: '#1e2530' }, text: { size: 12, family: 'Inter, sans-serif', weight: 'normal', color: '#ccc', marginLeft: 8, marginTop: 4, marginBottom: 4, marginRight: 8 } }
  },
  xAxis: { axisLine: { color: 'rgba(255,255,255,0.1)' }, tickLine: { color: 'rgba(255,255,255,0.1)' }, tickText: { color: '#666' } },
  yAxis: { axisLine: { color: 'rgba(255,255,255,0.1)' }, tickLine: { color: 'rgba(255,255,255,0.1)' }, tickText: { color: '#666' } },
  separator: { color: 'rgba(255,255,255,0.05)' },
  crosshair: { horizontal: { line: { color: 'rgba(255,255,255,0.3)' }, text: { backgroundColor: '#2d3748', color: '#fff' } }, vertical: { line: { color: 'rgba(255,255,255,0.3)' }, text: { backgroundColor: '#2d3748', color: '#fff' } } },
  overlay: { point: { backgroundColor: '#3b82f6', borderColor: '#fff', activeBorderColor: '#fff', activeBackgroundColor: '#60a5fa', activeRadius: 6 }, line: { color: '#3b82f6' }, text: { color: '#ccc', size: 12, weight: 'bold', family: 'Inter, sans-serif', paddingLeft: 4, paddingRight: 4, paddingTop: 4, paddingBottom: 4, borderRadius: 4, borderColor: '#3b82f6', borderSize: 1, backgroundColor: 'rgba(30,37,48,0.8)' } }
}

const lightStyles = {}   // klinecharts default

// Helper to clone overlay state for Undo history
const cloneOverlayState = (overlay: any) => {
  if (!overlay) return null
  return {
    id: overlay.id,
    groupId: overlay.groupId,
    name: overlay.name,
    points: overlay.points ? JSON.parse(JSON.stringify(overlay.points)) : [],
    extendData: overlay.extendData ? JSON.parse(JSON.stringify(overlay.extendData)) : undefined,
    styles: overlay.styles ? JSON.parse(JSON.stringify(overlay.styles)) : undefined,
    lock: overlay.lock,
    visible: overlay.visible
  }
}

export default function BacktestingPage() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Chart | null>(null)
  const actionHistoryRef = useRef<any[]>([])  // stack of actions for true Undo

  // --- Refs to prevent stale closures in onDrawEnd callback ---
  const currentIndexRef = useRef(0)
  const accountBalanceRef = useRef(100000)
  const riskPercentRef = useRef(1.0)
  const activeTradesRef = useRef<Trade[]>([])

  const [fullData, setFullData] = useState<KLineData[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1000)
  const [fileName, setFileName] = useState<string | null>(null)

  // Tools state
  const [activeTool, setActiveTool] = useState<DrawTool>('cursor')
  const [selectedOverlay, setSelectedOverlay] = useState<any>(null)
  const [isDark, setIsDark] = useState(true) // Default to dark mode for better look
  
  // ICT Killzones
  const [showKillzones, setShowKillzones] = useState(false)
  const [kzOffset, setKzOffset] = useState(0)

  // SMC
  const [showSMC, setShowSMC] = useState(false)

  const [maConfigs, setMaConfigs] = useState<MAConfig[]>([
    { period: 9,  color: '#f59e0b', enabled: false },
    { period: 21, color: '#3b82f6', enabled: false },
    { period: 50, color: '#a855f7', enabled: false },
    { period: 200,color: '#ef4444', enabled: false },
  ])

  // Account & Trades
  const [accountBalance, setAccountBalance] = useState(100000)
  const [riskPercent, setRiskPercent] = useState(1.0)
  const [activeTrades, setActiveTrades] = useState<Trade[]>([])
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([])

  // Keep refs in sync with state
  useEffect(() => { currentIndexRef.current = currentIndex }, [currentIndex])
  useEffect(() => { accountBalanceRef.current = accountBalance }, [accountBalance])
  useEffect(() => { riskPercentRef.current = riskPercent }, [riskPercent])
  useEffect(() => { activeTradesRef.current = activeTrades }, [activeTrades])

  // Internal undo (used by both button and keyboard shortcut)
  const undoLastDrawingInternal = useCallback(() => {
    const history = actionHistoryRef.current
    if (history.length === 0) return
    const action = history.pop()

    if (action.type === 'create') {
      chartRef.current?.removeOverlay(action.id)
      setActiveTrades(prev => prev.filter(t => t.overlayId !== action.id))
      activeTradesRef.current = activeTradesRef.current.filter(t => t.overlayId !== action.id)
    } else if (action.type === 'delete') {
      chartRef.current?.createOverlay(action.oldOverlay)
      if (action.oldTrade) {
        setActiveTrades(prev => [...prev, action.oldTrade])
        activeTradesRef.current = [...activeTradesRef.current, action.oldTrade]
      }
    } else if (action.type === 'update') {
      chartRef.current?.overrideOverlay(action.oldOverlay)
      if (action.oldTrade) {
        setActiveTrades(prev => prev.map(t => t.overlayId === action.oldTrade.overlayId ? action.oldTrade : t))
        activeTradesRef.current = activeTradesRef.current.map(t => t.overlayId === action.oldTrade.overlayId ? action.oldTrade : t)
      }
    }
  }, [])

  // ─── Init Chart ────────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const container = chartContainerRef.current
    if (!container) return

    const chart = init(container)
    if (!chart) return

    chart.setTimezone('Asia/Bangkok')

    chartRef.current = chart

    // Apply default style
    chart.setStyles(lightStyles as any)

    // Keyboard shortcuts
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveTool('cursor')
        setSelectedOverlay(null)
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Find if we have a selected overlay state
        setSelectedOverlay((prev: any) => {
          if (prev && chartRef.current) {
            chartRef.current.removeOverlay({ id: prev.id })
            return null
          }
          return prev
        })
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        undoLastDrawingInternal()
      }
    }
    window.addEventListener('keydown', onKey)

    const ro = new ResizeObserver(() => { chart.resize() })
    ro.observe(container)

    return () => {
      ro.disconnect()
      window.removeEventListener('keydown', onKey)
      dispose(container)
      chartRef.current = null
    }
  }, [])

  // ─── Dark/Light toggle ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartRef.current) return
    chartRef.current.setStyles(isDark ? (darkStyles as any) : (lightStyles as any))
  }, [isDark])

  // No useEffect needed for drawing tools — createOverlay is called directly in handleToolClick

  // MA indicators — createIndicator on candle_pane, removeIndicator by paneId='candle_pane'
  useEffect(() => {
    if (!chartRef.current) return
    // Remove all MA indicators first
    maConfigs.forEach(ma => {
      try { chartRef.current!.removeIndicator('candle_pane', `MA_${ma.period}`) } catch { /* ignore */ }
    })
    // Re-add enabled ones
    maConfigs.filter(ma => ma.enabled).forEach(ma => {
      chartRef.current!.createIndicator(
        { name: 'MA', calcParams: [ma.period], styles: { line: { dataSource: [{ color: ma.color }] } } } as any,
        true,  // isStack = true → overlay on candle pane
        { id: 'candle_pane' }
      )
    })
  }, [maConfigs])

  // ICT Killzones
  useEffect(() => {
    if (!chartRef.current) return
    
    // Always remove first to clear old states or offsets
    try { chartRef.current.removeIndicator('candle_pane', 'ICT_Killzones') } catch { /* ignore */ }
    
    if (showKillzones && fullData.length > 0) {
      chartRef.current.createIndicator(
        { name: 'ICT_Killzones', calcParams: [kzOffset] },
        true, // isStack = true -> draw on main pane
        { id: 'candle_pane' }
      )
    }
  }, [showKillzones, kzOffset, fullData])

  // SMC Indicator
  useEffect(() => {
    if (!chartRef.current) return
    
    try { chartRef.current.removeIndicator('candle_pane', 'SMC_Concepts') } catch { /* ignore */ }
    
    if (showSMC && fullData.length > 0) {
      chartRef.current.createIndicator(
        { name: 'SMC_Concepts' },
        true, 
        { id: 'candle_pane' }
      )
    }
  }, [showSMC, fullData])

  // ─── Update chart data ─────────────────────────────────────────────────────
  useEffect(() => {
    if (chartRef.current && fullData.length > 0) {
      const visibleData = fullData.slice(0, currentIndex + 1)
      chartRef.current.applyNewData(visibleData)
      chartRef.current.scrollToRealTime()
    }
  }, [currentIndex, fullData])

  // ─── Playback loop & Trade Evaluation ───────────────────────────────────────
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && fullData.length > 0 && currentIndex < fullData.length) {
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev + 1 >= fullData.length) { setIsPlaying(false); return prev }
          return prev + 1
        })
      }, playbackSpeed)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentIndex, fullData, playbackSpeed])

  // Evaluate Active Trades whenever currentIndex changes
  // Uses activeTradesRef to avoid stale closures and infinite loops
  useEffect(() => {
    if (activeTradesRef.current.length === 0 || fullData.length === 0) return

    const currentCandle = fullData[currentIndex]
    if (!currentCandle) return

    const trades = activeTradesRef.current
    const remaining: Trade[] = []
    const closed: Trade[] = []
    let pnlDelta = 0

    for (const trade of trades) {
      // Only evaluate if candle is strictly after openIndex
      if (currentIndex <= trade.openIndex) {
        remaining.push(trade)
        continue
      }

      let isWin = false
      let isLoss = false
      
      if (trade.type === 'long') {
        if (currentCandle.low <= trade.slPrice) isLoss = true
        else if (currentCandle.high >= trade.tpPrice) isWin = true
      } else {
        if (currentCandle.high >= trade.slPrice) isLoss = true
        else if (currentCandle.low <= trade.tpPrice) isWin = true
      }

      if (isWin || isLoss) {
        const pnl = isWin ? (trade.riskAmount * trade.rr) : -trade.riskAmount
        pnlDelta += pnl
        closed.push({ 
          ...trade, 
          status: (isWin ? 'win' : 'loss') as 'win'|'loss', 
          closeIndex: currentIndex, 
          pnl 
        })
      } else {
        remaining.push(trade)
      }
    }

    if (closed.length > 0) {
      // Immediately update the ref so next evaluation uses fresh data
      activeTradesRef.current = remaining
      setActiveTrades(remaining)
      setTradeHistory(h => [...closed, ...h])
      setAccountBalance(b => b + pnlDelta)
    }
  }, [currentIndex, fullData])

  // ─── CSV Parsing ───────────────────────────────────────────────────────────
  const parseCSVText = (text: string, name: string) => {
    setFileName(name)
    const lines = text.split('\n')
    const parsedData: KLineData[] = []

    const headerLine = lines[0]?.trim().toLowerCase() || ''
    const headers = headerLine.split(',')
    const hasSeparateTime = headers.length > 1 &&
      (headers[1] === 'time' || (headers[1] !== 'open' && headers[1].includes('time')))

    let dateCol = 0, timeCol = -1, oCol = 1, hCol = 2, lCol = 3, cCol = 4
    if (hasSeparateTime) { timeCol = 1; oCol = 2; hCol = 3; lCol = 4; cCol = 5 }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      const cols = line.split(',')
      if (cols.length < cCol + 1) continue
      try {
        let rawDate = (cols[dateCol]?.trim() || '').replace(/\./g, '-')
        const rawTime = timeCol >= 0 ? cols[timeCol]?.trim() : ''
        let dateStr: string
        if (rawTime)              dateStr = rawDate + 'T' + rawTime
        else if (rawDate.includes(' ')) dateStr = rawDate.replace(' ', 'T')
        else                      dateStr = rawDate

        const timestamp = new Date(dateStr).getTime()
        if (isNaN(timestamp)) continue

        const open  = parseFloat(cols[oCol])
        const high  = parseFloat(cols[hCol])
        const low   = parseFloat(cols[lCol])
        const close = parseFloat(cols[cCol])
        if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) continue

        parsedData.push({ timestamp, open, high, low, close,
          volume: cols[cCol + 1] ? parseFloat(cols[cCol + 1]) || 0 : 0, turnover: 0 })
      } catch { /* skip bad row */ }
    }

    if (parsedData.length > 0) {
      parsedData.sort((a, b) => a.timestamp - b.timestamp)
      setFullData(parsedData)
      setCurrentIndex(Math.min(100, parsedData.length - 1))
    } else {
      alert("Could not parse valid OHLC data from CSV.\n\nExpected: time,open,high,low,close (MT5) or Date,Time,Open,High,Low,Close (MT4)")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => parseCSVText(ev.target?.result as string, file.name)
    reader.readAsText(file)
  }

  const loadPresetTimeframe = async (tf: string) => {
    try {
      const res = await fetch(`/data/XAUUSD_${tf}_4months.csv`)
      if (!res.ok) throw new Error("Not found")
      parseCSVText(await res.text(), `XAUUSD_${tf}_4months.csv`)
    } catch { alert(`Could not load ${tf} data. Ensure it exists in public/data/`) }
  }

  // ─── Chart actions ─────────────────────────────────────────────────────────
  const togglePlay   = () => setIsPlaying(p => !p)
  const stepForward  = () => { setIsPlaying(false); if (currentIndex < fullData.length - 1) setCurrentIndex(p => p + 1) }
  const stepBackward = () => { setIsPlaying(false); if (currentIndex > 0) setCurrentIndex(p => p - 1) }
  const zoomIn  = () => chartRef.current?.zoomAtCoordinate(1.2)
  const zoomOut = () => chartRef.current?.zoomAtCoordinate(0.8)

  const clearAllDrawings = () => {
    chartRef.current?.removeOverlay({})
    actionHistoryRef.current = []
    setActiveTool('cursor')

    // Clear all active trades as well
    setActiveTrades([])
    activeTradesRef.current = []
  }

  // ─── Drawing tool handler ──────────────────────────────────────────────────
  // createOverlay is called directly here so klinecharts enters interactive drawing mode.
  // The active button stays highlighted until user clicks Cursor or presses Esc.
  const handleToolClick = (tool: DrawTool) => {
    if (!chartRef.current) return
    if (tool === 'cursor') {
      // Cancel any in-progress overlay drawing and return to cursor mode
      chartRef.current.removeOverlay({})
      setActiveTool('cursor')
      return
    }
    // Enter drawing mode
    setActiveTool(tool)
    
    const overlayParams: any = { 
      name: tool,
      onSelected: (e: any) => setSelectedOverlay(e.overlay),
      onDeselected: () => setSelectedOverlay(null)
    }

    // For position tools: update trade prices when user drags a dot
    if (tool === 'longPosition' || tool === 'shortPosition') {
      const updateTradeFromEvent = (event: any) => {
        const overlayId = event.overlay.id
        const isLong = tool === 'longPosition'

        // Use module-level var first (updated synchronously by createPointFigures before this fires)
        let entry: number, tp: number, sl: number
        if (lastPositionPrices.overlayId === overlayId && lastPositionPrices.entryPrice !== 0) {
          entry = lastPositionPrices.entryPrice
          tp    = lastPositionPrices.tpPrice
          sl    = lastPositionPrices.slPrice
        } else {
          const ext = event.overlay.extendData as any
          if (!ext || typeof ext.entryPrice !== 'number') return
          entry = ext.entryPrice
          tp    = ext.tpPrice
          sl    = ext.slPrice
        }

        // Auto-correct orientation after drag
        if (isLong) {
          if (tp < sl) { [tp, sl] = [sl, tp] }
          if (tp <= entry) tp = entry + Math.abs(entry - sl)
          if (sl >= entry) sl = entry - Math.abs(tp - entry)
        } else {
          if (tp > sl) { [tp, sl] = [sl, tp] }
          if (sl <= entry) sl = entry + Math.abs(entry - tp)
          if (tp >= entry) tp = entry - Math.abs(sl - entry)
        }

        const risk = Math.abs(entry - sl)
        const reward = Math.abs(tp - entry)
        const rr = risk > 0 ? reward / risk : 0

        // Update the matching active trade
        setActiveTrades(prev => {
          const updated = prev.map(trade =>
            trade.overlayId === overlayId
              ? { ...trade, entryPrice: entry, tpPrice: tp, slPrice: sl, rr }
              : trade
          )
          activeTradesRef.current = updated
          return updated
        })
      }

        // Hook to klinecharts real-time moving and drawing events
        
        let preMoveOverlayState: any = null
        let preMoveTradeState: any = null

        overlayParams.onPressedMoveStart = (event: any) => {
          preMoveOverlayState = cloneOverlayState(event.overlay)
          preMoveTradeState = activeTradesRef.current.find(t => t.overlayId === event.overlay.id)
        }

        overlayParams.onPressedMoving = updateTradeFromEvent
        overlayParams.onPressedMoveEnd = (event: any) => {
          if (preMoveOverlayState) {
            actionHistoryRef.current.push({ type: 'update', oldOverlay: preMoveOverlayState, oldTrade: preMoveTradeState })
          }
          updateTradeFromEvent(event)
        }
        overlayParams.onDrawing = updateTradeFromEvent
    }

    if (tool === 'customText' || tool === 'rect' || tool === 'longPosition' || tool === 'shortPosition') {
      overlayParams.onDrawEnd = (event: any) => {
        const overlayId = event.overlay.id
        
        if (tool === 'longPosition' || tool === 'shortPosition') {
          // Priority 1: module-level lastPositionPrices (set by createPointFigures synchronously
          //             before this onDrawEnd fires — most reliable because klinecharts may
          //             reset overlay.extendData before calling the callback)
          const ext = event.overlay.extendData as any
          const coords = event.overlay.points

          let entry: number, rawTp: number, rawSl: number

          if (lastPositionPrices.overlayId === overlayId && lastPositionPrices.entryPrice !== 0) {
            // ✅ Module-level var: always up-to-date from last createPointFigures call
            entry = lastPositionPrices.entryPrice
            rawTp = lastPositionPrices.tpPrice
            rawSl = lastPositionPrices.slPrice
          } else if (ext && typeof ext.entryPrice === 'number') {
            // ✅ extendData backup
            entry = ext.entryPrice
            rawTp = ext.tpPrice
            rawSl = ext.slPrice
          } else {
            // Fallback: read from points array
            entry = coords?.[0]?.value ?? 0
            rawTp = coords?.[1]?.value ?? entry
            rawSl = coords?.[2]?.value ?? (entry - (rawTp - entry))
          }

          const isLong = tool === 'longPosition'

          // Auto-correct TP/SL orientation
          let tp = rawTp, sl = rawSl
          if (isLong) {
            if (tp < sl) { [tp, sl] = [sl, tp] }
            if (tp <= entry) tp = entry + Math.abs(entry - sl)
            if (sl >= entry) sl = entry - Math.abs(tp - entry)
          } else {
            if (tp > sl) { [tp, sl] = [sl, tp] }
            if (sl <= entry) sl = entry + Math.abs(entry - tp)
            if (tp >= entry) tp = entry - Math.abs(sl - entry)
          }
          const risk = Math.abs(entry - sl)
          const reward = Math.abs(tp - entry)
          if (risk > 0) {
            const rr = reward / risk
            const riskAmount = (accountBalanceRef.current * riskPercentRef.current) / 100
            const snapshotIndex = currentIndexRef.current
            const newTrade: Trade = {
              id: Math.random().toString(36).substr(2, 9),
              type: isLong ? 'long' : 'short',
              entryPrice: entry,
              slPrice: sl,
              tpPrice: tp,
              riskAmount,
              rr,
              overlayId,
              status: 'open',
              openIndex: snapshotIndex
            }
            setActiveTrades(prev => [...prev, newTrade])
            activeTradesRef.current = [...activeTradesRef.current, newTrade]
            actionHistoryRef.current.push({ type: 'create', id: overlayId })
          }
        } else {
          const promptMsg = tool === 'rect' ? 'Enter text for box (optional):' : 'Enter text to display:'
          const text = window.prompt(promptMsg)
          if (text) {
            chartRef.current?.overrideOverlay({ id: overlayId, extendData: { text, color: '#facc15' } })
            setSelectedOverlay({ ...event.overlay, extendData: { text, color: '#facc15' } })
          } else if (tool === 'customText') {
            chartRef.current?.removeOverlay(overlayId)
          } else {
            chartRef.current?.overrideOverlay({ id: overlayId, extendData: { text: '', color: '#facc15' } })
            setSelectedOverlay({ ...event.overlay, extendData: { text: '', color: '#facc15' } })
          }
          actionHistoryRef.current.push({ type: 'create', id: overlayId })
        }
      }
    }

    const id = chartRef.current.createOverlay(overlayParams) as string | null
    if (id) {
      if (tool !== 'customText' && tool !== 'rect' && tool !== 'longPosition' && tool !== 'shortPosition') {
        actionHistoryRef.current.push({ type: 'create', id })
      }
    }
  }

  const undoLastDrawing = undoLastDrawingInternal

  const toggleMA = (idx: number) => {
    setMaConfigs(prev => prev.map((m, i) => i === idx ? { ...m, enabled: !m.enabled } : m))
  }

  // ─── Drawing tool config ───────────────────────────────────────────────────
  const drawingTools: { tool: DrawTool; icon: React.ReactNode; label: string }[] = [
    { tool: 'cursor',                 icon: <Crosshair className="size-4" />,   label: 'Cursor (Esc)' },
    { tool: 'segment',               icon: <TrendingUp className="size-4" />,  label: 'Trend Line (segment)' },
    { tool: 'straightLine',          icon: <Minus className="size-3" />,        label: 'Extended Line' },
    { tool: 'rayLine',               icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="4" y1="20" x2="20" y2="4"/><polygon points="20,4 14,4 20,10" fill="currentColor"/></svg>, label: 'Ray Line' },
    { tool: 'horizontalStraightLine',icon: <Minus className="size-4" />,        label: 'Horizontal Line' },
    { tool: 'rect',                  icon: <Square className="size-4" />,       label: 'Rectangle / Box' },
    { tool: 'premiumDiscount',       icon: <BarChart2 className="size-4" />,    label: 'Premium Discount' },
    { tool: 'customText',            icon: <Type className="size-4" />,         label: 'Text' },
    { tool: 'longPosition',          icon: <div className="text-[10px] font-bold border-b border-t border-slate-400 px-0.5" style={{lineHeight:'1'}}>L</div>, label: 'Long Position' },
    { tool: 'shortPosition',         icon: <div className="text-[10px] font-bold border-b border-t border-slate-400 px-0.5" style={{lineHeight:'1'}}>S</div>, label: 'Short Position' },
  ]

  return (
    <>
      <Header />
      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto flex-1 flex flex-col overflow-hidden h-[calc(100vh-80px)]">

        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">Custom CSV Backtester</h2>
            <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
              {fullData.length > 0 ? "Data Loaded" : "Waiting for Data"}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Quick TF */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {['1m','5m','15m','30m','1h','4h'].map(tf => (
                <button key={tf} onClick={() => loadPresetTimeframe(tf)}
                  className="px-2 py-1 text-xs font-bold text-slate-600 hover:text-sky-600 hover:bg-white rounded shadow-sm transition-all">
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>

            {/* CSV Upload */}
            <div className="relative">
              <input type="file" accept=".csv" onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                <Upload className="size-4" />
                {fileName ? "Change CSV" : "Upload CSV"}
              </button>
            </div>

            {/* Playback */}
            <div className={`flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm transition-opacity ${fullData.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
              <button onClick={stepBackward} className="p-2 text-slate-400 hover:text-sky-500 transition-colors" title="Step Back (←)">
                <ChevronLeft className="size-4" />
              </button>
              <button onClick={togglePlay}
                className={`p-2 transition-colors ${isPlaying ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-400 hover:text-sky-500'}`}>
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-current" />}
              </button>
              <button onClick={stepForward} className="p-2 text-slate-400 hover:text-slate-700 transition-colors" title="Step Forward (→)">
                <ChevronRight className="size-4" />
              </button>
              <div className="w-px h-4 bg-slate-200 mx-1" />
              <select value={playbackSpeed} onChange={e => setPlaybackSpeed(Number(e.target.value))}
                className="text-xs font-bold text-slate-600 bg-transparent border-none focus:ring-0 py-1 pl-2 pr-6 cursor-pointer">
                <option value={1000}>1x (1s)</option>
                <option value={500}>2x (0.5s)</option>
                <option value={100}>5x (0.1s)</option>
                <option value={10}>Max</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Main area ─────────────────────────────────────────────────────── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">

          {/* Chart Area */}
          <div className={`lg:col-span-3 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border flex flex-col overflow-hidden relative transition-colors ${isDark ? 'bg-[#131722] border-white/10' : 'bg-white border-slate-100'}`}>

            {/* Chart Toolbar */}
            <div className={`h-14 border-b flex items-center justify-between px-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50/50'}`}>
              {/* Symbol info */}
              <div className="flex items-center gap-4">
                <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {fileName ? fileName.replace('.csv','').toUpperCase() : 'XAUUSD (Awaiting CSV)'}
                </span>
                <span className={isDark ? 'text-white/20' : 'text-slate-300'}>|</span>
                <span className={`font-medium text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>LOCAL DATA</span>
                {fullData.length > 0 && (
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                    Bar {currentIndex + 1} / {fullData.length}
                  </span>
                )}
              </div>

              {/* Drawing tools */}
              <div className="flex items-center gap-1">
                {/* Separator */}
                {drawingTools.map(({ tool, icon, label }) => (
                  <button key={tool} title={label} onClick={() => handleToolClick(tool)}
                    className={`p-2 rounded-lg transition-all ${activeTool === tool
                      ? 'bg-sky-500 text-white shadow-sm'
                      : isDark ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
                    {icon}
                  </button>
                ))}

                <div className={`w-px h-5 mx-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

                {/* Undo */}
                <button title="Undo last drawing (Ctrl+Z)" onClick={undoLastDrawing}
                  className={`p-2 rounded-lg transition-all ${isDark ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
                  <Undo2 className="size-4" />
                </button>

                {/* Clear all */}
                <button title="Clear all drawings" onClick={clearAllDrawings}
                  className={`p-2 rounded-lg transition-all ${isDark ? 'text-white/50 hover:text-red-400 hover:bg-white/10' : 'text-slate-400 hover:text-red-500 hover:bg-slate-100'}`}>
                  <Trash2 className="size-4" />
                </button>

                <div className={`w-px h-5 mx-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

                {/* Zoom */}
                <button title="Zoom In" onClick={zoomIn}
                  className={`p-2 rounded-lg transition-all ${isDark ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
                  <ZoomIn className="size-4" />
                </button>
                <button title="Zoom Out" onClick={zoomOut}
                  className={`p-2 rounded-lg transition-all ${isDark ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
                  <ZoomOut className="size-4" />
                </button>

                <div className={`w-px h-5 mx-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

                {/* Dark mode */}
                <button title="Toggle dark mode" onClick={() => setIsDark(d => !d)}
                  className={`p-2 rounded-lg transition-all ${isDark ? 'text-amber-400 hover:text-amber-300 hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
                  {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                </button>
              </div>
            </div>

            {/* Indicators and Killzones */}
            <div className={`flex items-center gap-3 px-4 py-2 border-b ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/30'} flex-wrap`}>
              
              {/* ICT Killzones */}
              <div className={`flex items-center gap-2 pr-4 border-r ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <button 
                  onClick={() => setShowKillzones(p => !p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    showKillzones 
                      ? 'bg-sky-500 text-white shadow-sm' 
                      : isDark ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'
                  }`}>
                  ICT Killzones
                </button>
                
                {showKillzones && (
                  <select 
                    value={kzOffset} 
                    onChange={e => setKzOffset(Number(e.target.value))}
                    className={`text-xs font-bold px-2 py-1 rounded outline-none cursor-pointer ${
                      isDark ? 'bg-white/10 text-white/80 border-none' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                    title="Adjust timezone offset for killzones">
                    <option value={0}>Chart Time</option>
                    {[-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,1,2,3,4,5,6,7,8,9,10,11,12].map(h => (
                      <option key={h} value={h}>{h > 0 ? '+' : ''}{h}h</option>
                    ))}
                  </select>
                )}

                <div className={`w-px h-5 mx-2 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

                <button 
                  onClick={() => setShowSMC(p => !p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    showSMC 
                      ? 'bg-emerald-500 text-white shadow-sm' 
                      : isDark ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'
                  }`}>
                  SMC Indicator
                </button>
              </div>

              {/* MAs */}
              <span className={`text-[10px] font-bold uppercase tracking-wider mr-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>MA</span>
              {maConfigs.map((ma, idx) => (
                <button key={ma.period} onClick={() => toggleMA(idx)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                    ma.enabled
                      ? 'text-white border-transparent shadow-sm'
                      : isDark ? 'text-white/30 border-white/10 hover:border-white/30' : 'text-slate-400 border-slate-200 hover:border-slate-400'
                  }`}
                  style={ma.enabled ? { backgroundColor: ma.color, borderColor: ma.color } : {}}>
                  <span className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: ma.enabled ? 'rgba(255,255,255,0.6)' : ma.color }} />
                  EMA {ma.period}
                </button>
              ))}
            </div>

            {/* Chart canvas */}
            <div className="relative flex-1 w-full h-full">
              {/* Selected Overlay Floating Toolbar */}
              {selectedOverlay && (
                <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-lg border backdrop-blur-md transition-all ${isDark ? 'bg-[#1e2530]/90 border-white/10' : 'bg-white/90 border-slate-200'}`}>
                  
                  {/* Colors */}
                  {['#facc15', '#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#ffffff'].map(c => (
                    <button key={c} onClick={() => {
                        const oldOverlay = cloneOverlayState(selectedOverlay)
                        const oldTrade = activeTradesRef.current.find(t => t.overlayId === selectedOverlay.id)
                        const oldData = selectedOverlay.extendData || {}
                        const newData = typeof oldData === 'string' ? { text: oldData, color: c } : { ...oldData, color: c }
                        chartRef.current.overrideOverlay({ id: selectedOverlay.id, extendData: newData })
                        // If it's a standard line, also update its styles
                        chartRef.current.overrideOverlay({ id: selectedOverlay.id, styles: { line: { color: c }, polygon: { color: c + '20', borderColor: c } } })
                        setSelectedOverlay({ ...selectedOverlay, extendData: newData })
                        actionHistoryRef.current.push({ type: 'update', oldOverlay, oldTrade })
                      }}
                      className="w-5 h-5 rounded-full border border-black/10 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                    />
                  ))}

                  <div className={`w-px h-5 mx-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

                  {/* Edit Text */}
                  {(selectedOverlay.name === 'rect' || selectedOverlay.name === 'customText' || selectedOverlay.name === 'killzoneBox') && (
                    <button onClick={() => {
                        const oldText = typeof selectedOverlay.extendData === 'string' ? selectedOverlay.extendData : (selectedOverlay.extendData?.text || '')
                        const newText = window.prompt('Edit text:', oldText)
                        if (newText !== null && chartRef.current) {
                          const oldOverlay = cloneOverlayState(selectedOverlay)
                          const oldTrade = activeTradesRef.current.find(t => t.overlayId === selectedOverlay.id)
                          const oldData = selectedOverlay.extendData || {}
                          const newData = typeof oldData === 'string' ? { text: newText } : { ...oldData, text: newText }
                          chartRef.current.overrideOverlay({ id: selectedOverlay.id, extendData: newData })
                          setSelectedOverlay({ ...selectedOverlay, extendData: newData })
                          actionHistoryRef.current.push({ type: 'update', oldOverlay, oldTrade })
                        }
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                      title="Edit Text">
                      <Type className="size-4" />
                    </button>
                  )}

                  {/* Lock/Unlock */}
                  <button onClick={() => {
                      const oldOverlay = cloneOverlayState(selectedOverlay)
                      const oldTrade = activeTradesRef.current.find(t => t.overlayId === selectedOverlay.id)
                      const isLocked = !!selectedOverlay.lock
                      chartRef.current?.overrideOverlay({ id: selectedOverlay.id, lock: !isLocked })
                      setSelectedOverlay({ ...selectedOverlay, lock: !isLocked })
                      actionHistoryRef.current.push({ type: 'update', oldOverlay, oldTrade })
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                    title={selectedOverlay.lock ? "Unlock" : "Lock"}>
                    {selectedOverlay.lock ? <Lock className="size-4 text-amber-500" /> : <Unlock className="size-4" />}
                  </button>

                  {/* Delete */}
                  <button onClick={() => {
                      const oldOverlay = cloneOverlayState(selectedOverlay)
                      const oldTrade = activeTradesRef.current.find(t => t.overlayId === selectedOverlay.id)
                      
                      chartRef.current?.removeOverlay({ id: selectedOverlay.id })
                      
                      // Also remove from active trades if it's a position
                      setActiveTrades(prev => prev.filter(t => t.overlayId !== selectedOverlay.id))
                      activeTradesRef.current = activeTradesRef.current.filter(t => t.overlayId !== selectedOverlay.id)

                      actionHistoryRef.current.push({ type: 'delete', oldOverlay, oldTrade })
                      setSelectedOverlay(null)
                    }}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50/10 transition-colors"
                    title="Delete">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )}

              <div
                ref={chartContainerRef}
                className={`w-full h-full transition-colors ${isDark ? 'bg-[#131722]' : 'bg-white'}`}
                style={{ minHeight: '360px' }}
              />
            </div>

            {/* Empty state */}
            {fullData.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                <FileText className="size-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No Chart Data</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-md text-center">
                  Upload a CSV file or click a timeframe button above to load XAUUSD data.
                </p>
                <div className="mt-6 relative">
                  <input type="file" accept=".csv" onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <button className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-sky-500/20 transition-all">
                    Browse CSV File
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right panel ───────────────────────────────────────────────── */}
          <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto">

            {/* Order Entry */}
            <div className={`bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 shrink-0 transition-opacity ${fullData.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Order Entry</h3>
                <div className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  Balance: ${accountBalance.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 bg-slate-50 p-1 rounded-xl border border-slate-100">
                <button className="flex-1 py-2 rounded-lg text-xs font-bold transition-all bg-white text-slate-800 shadow-sm border border-slate-200">Market</button>
                <button className="flex-1 py-2 rounded-lg text-xs font-bold transition-all text-slate-500 hover:text-slate-800">Limit</button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-500">Risk %</span>
                    <span className="font-bold text-slate-800">{riskPercent.toFixed(1)}% (${(accountBalance * riskPercent / 100).toLocaleString()})</span>
                  </div>
                  <input 
                    type="range" 
                    className="w-full accent-sky-500" 
                    min="0.1" 
                    max="5" 
                    step="0.1" 
                    value={riskPercent} 
                    onChange={(e) => setRiskPercent(parseFloat(e.target.value))} 
                  />
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">SL</span>
                  <input type="number" placeholder="Price" className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-sky-500 text-slate-800 font-mono" />
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">TP</span>
                  <input type="number" placeholder="Price" className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-sky-500 text-slate-800 font-mono" />
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

            {/* Active Position */}
            <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex-1 flex flex-col min-h-[180px]">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">Active Position</h3>
              
              {activeTrades.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400">
                  <Crosshair className="size-8 mb-2 opacity-20" />
                  <p className="text-xs font-medium">No active positions</p>
                  <p className="text-[10px]">Draw Long/Short tool to execute.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
                  {activeTrades.map(trade => {
                    const currentPrice = fullData[currentIndex]?.close || trade.entryPrice
                    let floatPnL = 0
                    if (trade.type === 'long') {
                      floatPnL = ((currentPrice - trade.entryPrice) / (trade.tpPrice - trade.entryPrice)) * (trade.riskAmount * trade.rr)
                    } else {
                      floatPnL = ((trade.entryPrice - currentPrice) / (trade.entryPrice - trade.tpPrice)) * (trade.riskAmount * trade.rr)
                    }
                    
                    return (
                      <div key={trade.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm relative overflow-hidden group">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${trade.type === 'long' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        <div className="flex justify-between items-start mb-2 pl-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${trade.type === 'long' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              {trade.type}
                            </span>
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">
                              RR {trade.rr?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                          <div className={`text-sm font-bold ${floatPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {floatPnL >= 0 ? '+' : ''}{floatPnL.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                          </div>
                        </div>
                        <div className="pl-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                          <div className="text-slate-500">Entry: <span className="text-slate-700 font-mono font-bold">{trade.entryPrice.toFixed(3)}</span></div>
                          <div className="text-slate-500 text-right">Risk: <span className="text-slate-700 font-mono font-bold">${trade.riskAmount.toLocaleString()}</span></div>
                          <div className="text-rose-500">SL: <span className="font-mono font-bold">{trade.slPrice.toFixed(3)}</span></div>
                          <div className="text-emerald-500 text-right">TP: <span className="font-mono font-bold">{trade.tpPrice.toFixed(3)}</span></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Trade History */}
            {tradeHistory.length > 0 && (
              <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex-1 flex flex-col min-h-[180px] mt-6">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">Trade History (Last 5)</h3>
                <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
                  {tradeHistory.slice(0, 5).map(trade => (
                    <div key={trade.id} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${trade.type === 'long' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {trade.type}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${trade.status === 'win' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                            {trade.status === 'win' ? 'WIN' : 'LOSS'}
                          </span>
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">
                            RR {trade.rr?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <div className={`text-xs font-bold ${trade.pnl && trade.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {trade.pnl && trade.pnl >= 0 ? '+' : ''}{trade.pnl?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1 mt-1.5 text-[9px] font-mono">
                        <div className="text-slate-400">E: <span className="text-slate-600 font-bold">{trade.entryPrice.toFixed(2)}</span></div>
                        <div className="text-rose-400 text-center">SL: <span className="font-bold">{trade.slPrice.toFixed(2)}</span></div>
                        <div className="text-emerald-400 text-right">TP: <span className="font-bold">{trade.tpPrice.toFixed(2)}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </>
  )
}
