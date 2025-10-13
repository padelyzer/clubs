import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Corrigiendo destinatarios de WhatsApp...\n')
  console.log('Cambio: Los links ahora abrirán WhatsApp con el CLIENTE como destinatario\n')
  
  // Get all notifications with their bookings
  const notifications = await prisma.notification.findMany({
    where: { whatsappLink: { not: null } },
    include: {
      Booking: {
        include: {
          Club: true,
          Court: true
        }
      }
    }
  })
  
  console.log(`Encontradas ${notifications.length} notificaciones para corregir\n`)
  
  for (const notification of notifications) {
    if (!notification.whatsappLink || !notification.recipientPhone) continue
    
    // Extract clean phone number from recipient
    let clientPhone = notification.recipientPhone.replace(/[^\d]/g, '')
    
    // Ensure it has Mexico country code
    if (clientPhone.length === 10) {
      clientPhone = '52' + clientPhone
    } else if (clientPhone.length === 8) {
      // Some phones might be stored as 8 digits
      clientPhone = '52' + clientPhone
    }
    
    const playerName = notification.recipient
    const clubName = notification.Booking?.Club.name || 'Club Padel Puebla'

    // Generate message from CLUB to CLIENT perspective
    let newMessage = ''

    switch (notification.type) {
      case 'BOOKING_CONFIRMATION':
        if (notification.Booking) {
          newMessage = `¡Hola ${playerName}! 👋\n\n` +
            `Tu reserva en ${clubName} ha sido confirmada:\n\n` +
            `📅 Fecha: ${notification.Booking.date.toLocaleDateString('es-MX')}\n` +
            `⏰ Hora: ${notification.Booking.startTime}\n` +
            `🎾 Cancha: ${notification.Booking.Court.name}\n` +
            `💰 Total: $${(notification.Booking.price / 100).toFixed(2)} MXN\n\n` +
            `¡Te esperamos! 🎾`
        }
        break

      case 'PAYMENT_REMINDER':
        newMessage = `¡Hola ${playerName}! 💰\n\n` +
          `Te recordamos que tienes un pago pendiente para tu reserva en ${clubName}.\n\n` +
          `Por favor completa el pago lo antes posible para confirmar tu reserva.\n\n` +
          `Link de pago: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/pay/${notification.bookingId} 🎾`
        break

      case 'SPLIT_PAYMENT_REQUEST':
        newMessage = `¡Hola ${playerName}! 💸\n\n` +
          `Te han invitado a dividir el pago de una reserva en ${clubName}.\n\n` +
          `Por favor completa tu parte del pago para confirmar tu participación.\n\n` +
          `¡Nos vemos en la cancha! 🎾`
        break

      case 'BOOKING_CANCELLATION':
        newMessage = `¡Hola ${playerName}! ❌\n\n` +
          `Tu reserva en ${clubName} ha sido cancelada.\n\n` +
          `Si tienes alguna duda, no dudes en contactarnos.\n\n` +
          `Teléfono: ${notification.Booking?.Club.phone || '+52 222 123 4567'} 📞`
        break
        
      default:
        newMessage = `¡Hola ${playerName}! 👋\n\n` +
          `${clubName} tiene una notificación para ti.\n\n` +
          `¡Gracias por elegirnos! 🎾`
    }
    
    // Create link with CLIENT phone as destination
    const encodedMessage = encodeURIComponent(newMessage)
    const newLink = `https://wa.me/${clientPhone}?text=${encodedMessage}`
    
    // Update notification
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        whatsappLink: newLink,
        message: newMessage
      }
    })
    
    console.log(`✅ Corregido: ${playerName}`)
    console.log(`   Número del cliente: +${clientPhone}`)
    console.log(`   Tipo: ${notification.type}`)
  }
  
  console.log('\n✨ ¡Todos los links han sido corregidos!')
  console.log('\n📱 Ahora los links abren WhatsApp con:')
  console.log('   - DESTINATARIO: El cliente (quien recibe el mensaje)')
  console.log('   - REMITENTE: El club (quien envía el mensaje)')
  console.log('   - MENSAJE: Desde la perspectiva del club hacia el cliente')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())