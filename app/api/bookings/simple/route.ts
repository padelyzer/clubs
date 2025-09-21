import { NextRequest, NextResponse } from 'next/server'

// Mock data store (in production this would be in database)
let bookings = [
  {
    id: '1',
    playerName: 'Juan Pérez',
    playerEmail: 'juan@example.com',
    playerPhone: '555-0101',
    court: { id: '1', name: 'Cancha Central' },
    date: new Date().toISOString(),
    startTime: '09:00',
    endTime: '10:30',
    duration: 90,
    price: 300,
    status: 'confirmed',
    paymentStatus: 'paid',
    notes: 'Reserva regular'
  },
  {
    id: '2',
    playerName: 'María García',
    playerEmail: 'maria@example.com',
    playerPhone: '555-0102',
    court: { id: '2', name: 'Cancha Norte' },
    date: new Date().toISOString(),
    startTime: '10:00',
    endTime: '11:30',
    duration: 90,
    price: 300,
    status: 'confirmed',
    paymentStatus: 'pending',
    notes: 'Primera vez en el club'
  },
  {
    id: '3',
    playerName: 'Carlos López',
    playerEmail: 'carlos@example.com',
    playerPhone: '555-0103',
    court: { id: '1', name: 'Cancha Central' },
    date: new Date().toISOString(),
    startTime: '14:00',
    endTime: '15:30',
    duration: 90,
    price: 350,
    status: 'pending',
    paymentStatus: 'pending',
    notes: ''
  }
]

// GET all bookings
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const date = searchParams.get('date')
  const status = searchParams.get('status')
  
  let filteredBookings = [...bookings]
  
  if (date) {
    // Simple date filter (in production use proper date comparison)
    filteredBookings = filteredBookings.filter(b => 
      b.date.startsWith(date)
    )
  }
  
  if (status) {
    filteredBookings = filteredBookings.filter(b => 
      b.status === status
    )
  }
  
  return NextResponse.json(filteredBookings)
}

// POST create new booking
export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const newBooking = {
    id: String(Date.now()),
    playerName: body.playerName,
    playerEmail: body.playerEmail || '',
    playerPhone: body.playerPhone,
    court: { 
      id: body.courtId, 
      name: body.courtName || 'Cancha Central' 
    },
    date: body.date,
    startTime: body.startTime,
    endTime: body.endTime,
    duration: body.duration || 90,
    price: body.price || 300,
    status: 'pending',
    paymentStatus: 'pending',
    notes: body.notes || ''
  }
  
  bookings.push(newBooking)
  
  return NextResponse.json(newBooking, { status: 201 })
}

// PUT update booking
export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...updateData } = body
  
  const bookingIndex = bookings.findIndex(b => b.id === id)
  
  if (bookingIndex === -1) {
    return NextResponse.json(
      { error: 'Booking not found' },
      { status: 404 }
    )
  }
  
  bookings[bookingIndex] = {
    ...bookings[bookingIndex],
    ...updateData
  }
  
  return NextResponse.json(bookings[bookingIndex])
}

// DELETE booking
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json(
      { error: 'ID is required' },
      { status: 400 }
    )
  }
  
  const bookingIndex = bookings.findIndex(b => b.id === id)
  
  if (bookingIndex === -1) {
    return NextResponse.json(
      { error: 'Booking not found' },
      { status: 404 }
    )
  }
  
  bookings.splice(bookingIndex, 1)
  
  return NextResponse.json({ success: true })
}