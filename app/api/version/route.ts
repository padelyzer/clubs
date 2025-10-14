import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    version: '445df9f',
    timestamp: new Date().toISOString(),
    message: 'Deploy verification endpoint',
    commits: [
      '445df9f - Fix: Eliminar campo isRecurring del payload',
      'd62fcf5 - Fix: Agregar id y updatedAt requeridos',
      'fac7164 - Debug: Retornar error detallado',
    ],
    status: 'ready'
  })
}
