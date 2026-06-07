import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  return NextResponse.json({
    keys: Object.keys(prisma),
    hasUser: !!prisma.user,
    hasAccount: !!prisma.account,
    typeofUser: typeof prisma.user,
  });
}
