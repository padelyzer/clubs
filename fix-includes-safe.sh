#!/bin/bash

# Script seguro para corregir include statements
# Solo cambia dentro de bloques include, NO en JSON responses

echo "🔧 Corrigiendo include statements de forma segura..."

# Lista de archivos con errores TS2561
files=(
  "lib/services/whatsapp-service.ts"
  "lib/payments/commission-system.ts"
  "app/api/stripe/payments/confirm/route.ts"
  "app/api/class-bookings/[id]/check-in/route.ts"
  "app/api/tournaments/[id]/conflicts/route.ts"
  "app/api/cron/reminders/route.ts"
  "app/api/classes/pending-payments/route.ts"
  "app/api/booking-groups/[id]/route.ts"
  "lib/whatsapp/interactive-messages.ts"
  "app/api/students/[id]/classes/route.ts"
  "app/api/finance/export/route.ts"
  "app/api/classes/[id]/quick-checkin/route.ts"
  "app/api/classes/[id]/attendance/route.ts"
  "app/api/class-bookings/[id]/route.ts"
  "app/api/bookings/[id]/payment/route.ts"
  "app/api/bookings/[id]/payment-link/route.ts"
  "app/api/booking-groups/[id]/split-payments/route.ts"
  "lib/whatsapp/notification-hooks.ts"
  "lib/tournaments/court-blocker.ts"
  "lib/services/qr-code-service.ts"
  "lib/services/email-service.ts"
  "lib/services/club-admin-integration.ts"
  "app/widget/[clubId]/actions.ts"
  "app/select-club/page.tsx"
  "app/c/[clubSlug]/dashboard/notifications/page.tsx"
)

count=0
for file in "${files[@]}"; do
  full_path="/Users/ja/v4/bmad-nextjs-app/$file"

  if [ -f "$full_path" ]; then
    # Backup
    cp "$full_path" "$full_path.inc2.bak"

    # Correcciones específicas para include blocks
    # Usamos patrones específicos para evitar afectar JSON
    sed -i '' \
      -e '/include: {/,/^      }/ s/          club: true/          Club: true/g' \
      -e '/include: {/,/^      }/ s/          court: true/          Court: true/g' \
      -e '/include: {/,/^      }/ s/          booking: true/          Booking: true/g' \
      -e '/include: {/,/^      }/ s/          user: true/          User: true/g' \
      -e '/include: {/,/^      }/ s/          payment: true/          Payment: true/g' \
      -e '/include: {/,/^      }/ s/          tournament: true/          Tournament: true/g' \
      -e '/include: {/,/^      }/ s/          class: true/          Class: true/g' \
      -e '/include: {/,/^      }/ s/          instructor: true/          Instructor: true/g' \
      -e '/include: {/,/^      }/ s/          coach: true/          Coach: true/g' \
      -e '/include: {/,/^      }/ s/          player: true/          Player: true/g' \
      -e '/include: {/,/^      }/ s/          club: {/          Club: {/g' \
      -e '/include: {/,/^      }/ s/          court: {/          Court: {/g' \
      -e '/include: {/,/^      }/ s/          booking: {/          Booking: {/g' \
      -e '/include: {/,/^      }/ s/          bookings: {/          Booking: {/g' \
      -e '/include: {/,/^      }/ s/          user: {/          User: {/g' \
      "$full_path"

    count=$((count + 1))
    echo "  ✓ $file"
  else
    echo "  ⚠ No encontrado: $file"
  fi
done

echo "✅ Procesados $count archivos"
echo "💾 Backups: *.inc2.bak"
