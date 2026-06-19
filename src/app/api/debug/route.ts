import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { trades: true }
        },
        accounts: true
      }
    });

    const userSummary = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      tradeCount: u._count.trades,
      providers: u.accounts.map(a => a.provider)
    }));

    return NextResponse.json({
      currentSession: {
        userEmail: session?.user?.email || 'Not logged in',
        userId: (session?.user as any)?.id || 'No ID in session',
      },
      totalUsers: users.length,
      users: userSummary,
      dbHost: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
