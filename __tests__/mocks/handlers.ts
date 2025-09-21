import { http, HttpResponse } from 'msw'

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      success: true,
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'CLUB_OWNER',
        clubId: 'test-club-id'
      },
      tokens: {
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token'
      }
    })
  }),

  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({
      success: true,
      accessToken: 'new-fake-access-token',
      refreshToken: 'new-fake-refresh-token'
    })
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      success: true,
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'CLUB_OWNER',
        clubId: 'test-club-id'
      }
    })
  }),

  // Club endpoints
  http.get('/api/clubs', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'test-club-id',
          name: 'Test Padel Club',
          email: 'club@test.com',
          phone: '5551234567',
          address: 'Test Address 123',
          city: 'Test City',
          state: 'Test State',
          status: 'APPROVED',
          active: true
        }
      ]
    })
  }),

  http.get('/api/clubs/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        name: 'Test Padel Club',
        email: 'club@test.com',
        phone: '5551234567',
        address: 'Test Address 123',
        city: 'Test City',
        state: 'Test State',
        status: 'APPROVED',
        active: true,
        courts: [
          {
            id: 'test-court-1',
            name: 'Court 1',
            type: 'PADEL',
            indoor: false,
            active: true
          }
        ],
        schedules: [
          {
            id: 'test-schedule-1',
            dayOfWeek: 1,
            openTime: '08:00',
            closeTime: '22:00',
            active: true
          }
        ],
        pricing: {
          id: 'test-pricing-1',
          hourlyRate: 30000, // $300 MXN
          peakHourRate: 40000, // $400 MXN
          weekendRate: 35000, // $350 MXN
          currency: 'MXN'
        }
      }
    })
  }),

  // Booking endpoints
  http.get('/api/bookings', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'test-booking-1',
          date: new Date().toISOString(),
          startTime: '10:00',
          endTime: '11:00',
          playerName: 'Test Player',
          playerEmail: 'player@test.com',
          playerPhone: '5551234567',
          totalPlayers: 4,
          price: 30000,
          status: 'CONFIRMED',
          paymentStatus: 'completed',
          paymentType: 'FULL',
          clubId: 'test-club-id',
          courtId: 'test-court-1'
        }
      ]
    })
  }),

  http.post('/api/bookings', async ({ request }) => {
    const booking = await request.json() as Record<string, any>
    return HttpResponse.json({
      success: true,
      data: {
        id: 'new-booking-id',
        ...booking,
        status: 'PENDING',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
      }
    })
  }),

  // Stripe endpoints
  http.post('/api/stripe/payments/create-intent', () => {
    return HttpResponse.json({
      success: true,
      clientSecret: 'pi_fake_client_secret',
      amount: 30000,
      bookingDetails: {
        id: 'test-booking-1',
        clubName: 'Test Padel Club',
        courtName: 'Court 1',
        date: new Date().toISOString(),
        startTime: '10:00',
        endTime: '11:00'
      }
    })
  }),

  http.post('/api/stripe/payments/confirm', () => {
    return HttpResponse.json({
      success: true,
      message: 'Payment confirmed successfully'
    })
  }),

  http.post('/api/stripe/webhook', () => {
    return HttpResponse.json({
      success: true,
      message: 'Webhook processed'
    })
  }),

  // WhatsApp endpoints
  http.post('/api/whatsapp/send', () => {
    return HttpResponse.json({
      success: true,
      messageSid: 'fake-message-sid',
      status: 'sent'
    })
  }),

  http.post('/api/whatsapp/send-bulk', () => {
    return HttpResponse.json({
      success: true,
      results: [
        {
          phone: '5551234567',
          result: {
            success: true,
            messageSid: 'fake-message-sid-1'
          }
        }
      ]
    })
  }),

  // Public widget endpoints
  http.get('/api/public/clubs/:clubId', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        id: params.clubId,
        name: 'Test Padel Club',
        address: 'Test Address 123',
        city: 'Test City',
        phone: '5551234567',
        email: 'club@test.com',
        active: true,
        courts: [
          {
            id: 'test-court-1',
            name: 'Court 1',
            type: 'PADEL',
            indoor: false,
            active: true
          }
        ],
        schedules: [
          {
            dayOfWeek: 1,
            openTime: '08:00',
            closeTime: '22:00',
            active: true
          }
        ],
        pricing: {
          hourlyRate: 30000,
          currency: 'MXN'
        }
      }
    })
  }),

  http.get('/api/public/clubs/:clubId/bookings', () => {
    return HttpResponse.json({
      success: true,
      data: []
    })
  }),

  // Error handlers for testing error cases
  http.get('/api/error/500', () => {
    return new HttpResponse(null, { status: 500 })
  }),

  http.get('/api/error/401', () => {
    return HttpResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }),

  http.get('/api/error/404', () => {
    return HttpResponse.json(
      { error: 'Not found' },
      { status: 404 }
    )
  }),
]