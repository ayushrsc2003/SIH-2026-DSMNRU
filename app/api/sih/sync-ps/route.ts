import { NextResponse } from 'next/server';
import sihProblemStatements from '@/data/sihProblemStatements.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      count: sihProblemStatements.length,
      problemStatements: sihProblemStatements,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch problem statements.' }, { status: 500 });
  }
}
