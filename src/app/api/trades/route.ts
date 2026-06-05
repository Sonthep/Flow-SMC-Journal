import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Default mapped values to match the Prisma Schema
    const trade = await prisma.tradeLog.create({
      data: {
        title: body.title || null,
        createdAt: body.entryDate ? new Date(body.entryDate) : undefined,
        pair: body.asset || 'XAUUSD',
        timeframe: body.timeframe || null,
        session: body.session || 'LONDON',
        direction: body.direction || 'BUY',
        riskPercent: parseFloat(body.riskPercent) || 0.5,
        entryPrice: parseFloat(body.entryPrice) || 0,
        stopLoss: parseFloat(body.stopLoss) || 0,
        takeProfit: parseFloat(body.takeProfit) || 0,
        realizedRR: (() => {
          if (body.outcome === 'WIN') return Math.abs(parseFloat(body.takeProfit) - parseFloat(body.entryPrice)) / Math.abs(parseFloat(body.entryPrice) - parseFloat(body.stopLoss));
          if (body.outcome === 'LOSS') return -1;
          if (body.outcome === 'BE') return 0;
          return null;
        })(),
        outcome: body.outcome || 'PENDING',
        sweepType: 'EXTERNAL_MAJOR', // Default enum mapping
        hasChoch: body.tags?.chochWick || body.tags?.microChoch || false,
        entryZone: 'FVG', // Default enum mapping
        valueZone: body.checklist?.premiumDiscount ? 'DISCOUNT' : 'PREMIUM', // Derived mapping
        preEmotion: body.preEmotion || 'CALM',
        duringEmotion: body.duringEmotion || 'PATIENT',
        exitReason: body.outcome === 'WIN' ? 'HIT_TP' : body.outcome === 'LOSS' || body.outcome === 'BE' ? 'HIT_SL' : 'RUNNING',
        journalNote: body.narrative || '',
        contextImgUrl: body.imageUrl || null,
      }
    })

    return NextResponse.json({ success: true, trade })
  } catch (error: any) {
    console.error('Failed to save trade:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const trades = await prisma.tradeLog.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ success: true, trades })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
