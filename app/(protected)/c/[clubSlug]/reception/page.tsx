'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  UserPlus, 
  QrCode, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Calendar
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Booking {
  id: string
  bookingCode: string
  time: string
  court: string
  customer: {
    name: string
    email: string
    phone: string
  }
  status: string
  paymentStatus: string
  price: number
  notes?: string
  checkedInAt?: string
}

interface ReceptionData {
  club: {
    id: string
    name: string
  }
  date: string
  summary: {
    total: number
    upcoming: number
    checkedIn: number
    pending: number
  }
  bookings: {
    upcoming: Booking[]
    checkedIn: Booking[]
    pending: Booking[]
  }
}

export default function ReceptionPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ReceptionData | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      const response = await fetch('/api/mobile/reception/today', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Error loading data')
      }
      
      const result = await response.json()
      setData(result.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const handleCheckIn = async (bookingId: string) => {
    router.push(`/c/${params.clubSlug}/reception/checkin/${bookingId}`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price / 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No se pudo cargar la información de recepción
        </AlertDescription>
      </Alert>
    )
  }

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{booking.customer.name}</span>
              <Badge variant="outline" className="text-xs">
                {booking.bookingCode}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              <Clock className="inline-block h-3 w-3 mr-1" />
              {booking.time} • {booking.court}
            </div>
            {booking.customer.phone && (
              <div className="text-sm text-muted-foreground">
                📱 {booking.customer.phone}
              </div>
            )}
            <div className="text-sm font-medium">
              {formatPrice(booking.price)}
            </div>
          </div>
          
          {booking.status !== 'checked_in' && (
            <Button 
              size="sm"
              onClick={() => handleCheckIn(booking.id)}
            >
              <QrCode className="h-4 w-4 mr-1" />
              Check-in
            </Button>
          )}
          
          {booking.status === 'checked_in' && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Checked In
            </Badge>
          )}
        </div>
        
        {booking.notes && (
          <div className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded">
            {booking.notes}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Recepción</h1>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            size="sm"
            onClick={() => router.push(`/c/${params.clubSlug}/reception/walk-in`)}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Walk-in
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="p-4">
            <div className="text-2xl font-bold">{data.summary.total}</div>
            <CardDescription>Total Reservas</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <div className="text-2xl font-bold text-blue-600">{data.summary.upcoming}</div>
            <CardDescription>Por Llegar</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <div className="text-2xl font-bold text-green-600">{data.summary.checkedIn}</div>
            <CardDescription>Check-in</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <div className="text-2xl font-bold text-orange-600">{data.summary.pending}</div>
            <CardDescription>Pendientes</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Bookings Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming" className="relative">
            Por Llegar
            {data.bookings.upcoming.length > 0 && (
              <Badge className="ml-2" variant="secondary">
                {data.bookings.upcoming.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="checkedIn" className="relative">
            Check-in
            {data.bookings.checkedIn.length > 0 && (
              <Badge className="ml-2" variant="secondary">
                {data.bookings.checkedIn.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pendientes
            {data.bookings.pending.length > 0 && (
              <Badge className="ml-2" variant="secondary">
                {data.bookings.pending.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {data.bookings.upcoming.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No hay reservas próximas
              </CardContent>
            </Card>
          ) : (
            data.bookings.upcoming.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>

        <TabsContent value="checkedIn" className="space-y-3">
          {data.bookings.checkedIn.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No hay check-ins registrados
              </CardContent>
            </Card>
          ) : (
            data.bookings.checkedIn.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-3">
          {data.bookings.pending.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No hay pagos pendientes
              </CardContent>
            </Card>
          ) : (
            data.bookings.pending.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}