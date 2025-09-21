'use client'

import { useEffect, useState } from 'react'

export default function PayDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const bookingId = 'cmejccxfa0001r4wwwtzbjio3'

  useEffect(() => {
    testPaymentFlow()
  }, [])

  const testPaymentFlow = async () => {
    const info: any = {}
    
    try {
      // Test 1: Stripe config
      const configResponse = await fetch(`/api/stripe/config?bookingId=${bookingId}`)
      const configData = await configResponse.json()
      info.stripeConfig = {
        status: configResponse.status,
        success: configData.success,
        hasPublicKey: !!configData.publicKey,
        hasClubConfig: configData.hasClubConfig
      }

      // Test 2: Create payment intent
      const intentResponse = await fetch('/api/stripe/payments/create-intent-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      })
      const intentData = await intentResponse.json()
      info.paymentIntent = {
        status: intentResponse.status,
        success: intentData.success,
        hasClientSecret: !!intentData.clientSecret,
        amount: intentData.amount,
        error: intentData.error,
        bookingFound: !!intentData.bookingDetails
      }

      // Test 3: Check booking details
      if (intentData.bookingDetails) {
        info.booking = {
          id: intentData.bookingDetails.id,
          playerName: intentData.bookingDetails.playerName,
          price: intentData.bookingDetails.price,
          date: intentData.bookingDetails.date,
          courtName: intentData.bookingDetails.courtName
        }
      }

    } catch (error: any) {
      info.error = {
        message: error.message,
        stack: error.stack
      }
    }

    setDebugInfo(info)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Payment Debug Page</h1>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Payment Debug Information</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <a 
                href={`/pay/${bookingId}`}
                className="block text-blue-600 hover:underline"
              >
                → Go to Payment Page
              </a>
              <button
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:underline"
              >
                → Refresh Debug Info
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-3">Test Results</h2>
            <div className="space-y-2">
              <div>
                ✅ Stripe Config: {debugInfo.stripeConfig?.success ? 'OK' : 'FAILED'}
              </div>
              <div>
                {debugInfo.paymentIntent?.success ? '✅' : '❌'} Payment Intent: {debugInfo.paymentIntent?.success ? 'OK' : debugInfo.paymentIntent?.error || 'FAILED'}
              </div>
              <div>
                {debugInfo.booking ? '✅' : '❌'} Booking Found: {debugInfo.booking ? debugInfo.booking.playerName : 'NOT FOUND'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}