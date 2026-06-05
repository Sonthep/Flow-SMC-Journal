import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    let exitReason = undefined;
    if (body.outcome === 'WIN') exitReason = 'HIT_TP';
    else if (body.outcome === 'LOSS' || body.outcome === 'BE') exitReason = 'HIT_SL';
    
    const updateData: any = {};
    if (body.outcome) updateData.outcome = body.outcome;
    if (body.realizedRR !== undefined) updateData.realizedRR = body.realizedRR !== null ? parseFloat(body.realizedRR) : null;
    if (body.journalNote !== undefined) updateData.journalNote = body.journalNote;
    if (body.title !== undefined) updateData.title = body.title;
    if (exitReason) updateData.exitReason = exitReason;

    const trade = await prisma.tradeLog.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, trade })
  } catch (error: any) {
    console.error('Failed to update trade:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.tradeLog.delete({
      where: { id }
    });
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to delete trade:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
