import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Corrigiendo mensajes de WhatsApp...\n')
  
  // Get all notifications
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
    if (!notification.whatsappLink) continue
    
    let newMessage = ''
    const playerName = notification.recipient
    const clubName = notification.Booking?.Club.name || 'Club Padel Puebla'
    
    // Generate correct message based on type
    switch (notification.type) {
      case 'BOOKING_CONFIRMATION':
        if (notification.Booking) {
          newMessage = `Hola! Soy ${playerName} 👋\n\n` +
            `Quisiera confirmar mi reserva:\n\n` +
            `📅 Fecha: ${notification.Booking.date.toLocaleDateString('es-MX')}\n` +
            `⏰ Hora: ${notification.Booking.startTime}\n` +
            `🎾 Cancha: ${notification.Booking.Court.name}\n` +
            `💰 Total: $${(notification.Booking.price / 100).toFixed(2)} MXN\n\n` +
            `¿Está todo correcto? 🎾`
        }
        break
        
      case 'PAYMENT_REMINDER':
        newMessage = `Hola! Soy ${playerName} 💰\n\n` +
          `Tengo un pago pendiente para mi reserva en ${clubName}.\n\n` +
          `¿Me pueden proporcionar los datos para completar el pago? 🎾`
        break
        
      case 'SPLIT_PAYMENT_REQUEST':
        newMessage = `Hola! Soy ${playerName} 💸\n\n` +
          `Me invitaron a dividir el pago de una reserva en ${clubName}.\n\n` +
          `¿Me pueden dar información sobre cómo completar mi parte del pago? 🎾`
        break
        
      case 'BOOKING_CANCELLATION':
        newMessage = `Hola! Soy ${playerName} ❌\n\n` +
          `Necesito información sobre la cancelación de mi reserva en ${clubName}.\n\n` +
          `¿Podrían ayudarme con esto? 📞`
        break
        
      default:
        newMessage = `Hola! Soy ${playerName} 👋\n\n` +
          `Tengo una consulta sobre ${clubName}.\n\n` +
          `¿Me pueden ayudar? 🎾`
    }
    
    // Update the link with new message
    const encodedMessage = encodeURIComponent(newMessage)
    const newLink = `https://wa.me/525549125610?text=${encodedMessage}`
    
    // Update notification
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        whatsappLink: newLink,
        message: newMessage
      }
    })
    
    console.log(`✅ Corregido mensaje para ${playerName} (${notification.type})`)
  }
  
  console.log('\n✨ Todos los mensajes han sido corregidos!')
  console.log('\nAhora los mensajes están redactados desde la perspectiva del CLIENTE')
  console.log('que le escribe al CLUB (+525549125610)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())