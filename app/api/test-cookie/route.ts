import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  // Crear una respuesta simple
  const response = NextResponse.json({
    message: 'Test cookie set',
    timestamp: new Date().toISOString()
  })

  // Establecer una cookie de prueba simple
  response.headers.set('Set-Cookie', 'test-cookie=test-value; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600')
  
  return response
}

export async function POST() {
  // Probar múltiples métodos
  const response = NextResponse.json({
    message: 'Multiple cookie test',
    timestamp: new Date().toISOString()
  })

  // Método 1: Set-Cookie directo
  response.headers.set('Set-Cookie', 'method1=direct-header; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600')
  
  // Método 2: cookies.set
  response.cookies.set({
    name: 'method2',
    value: 'cookies-api',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 3600
  })

  return response
}