import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        baseCurrency: true,
        accountSize: true,
      }
    })

    if (!user) {
       return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    const user = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        name: body.name,
        baseCurrency: body.baseCurrency,
        accountSize: parseFloat(body.accountSize) || 10000,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        baseCurrency: true,
        accountSize: true,
      }
    })

    return NextResponse.json({ success: true, user })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Delete trades only, not the user account (as requested in UI: "Delete Data")
    await prisma.tradeLog.deleteMany({
      where: { userId: (session.user as any).id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
