#!/usr/bin/env python3
"""
Script para corregir include statements en archivos TypeScript
Convierte minúsculas a capitalizadas en bloques include
"""

import re
import sys
from pathlib import Path

# Patrones de corrección (minúscula → Capitalizada)
CORRECTIONS = {
    'club': 'Club',
    'court': 'Court',
    'booking': 'Booking',
    'bookings': 'Booking',  # plural → singular capitalizado
    'user': 'User',
    'payment': 'Payment',
    'payments': 'Payment',
    'tournament': 'Tournament',
    'class': 'Class',
    'student': 'Student',
    'instructor': 'Instructor',
    'coach': 'Coach',
    'player': 'Player',
    'invoice': 'Invoice',
    'bookingGroup': 'BookingGroup',
    'splitPayments': 'splitPayments',  # Este sí es correcto en minúscula
}

def fix_include_block(content):
    """Corrige include blocks sin afectar JSON responses"""
    lines = content.split('\n')
    result = []
    in_include = False
    indent_level = 0

    for line in lines:
        # Detectar inicio de include
        if re.search(r'include:\s*{', line):
            in_include = True
            indent_level = len(line) - len(line.lstrip())

        # Si estamos en un include block
        if in_include:
            # Aplicar correcciones
            for old, new in CORRECTIONS.items():
                # Patron para propiedades: "  old: true" o "  old: {"
                line = re.sub(
                    rf'^(\s+){old}(\s*):(.*)',
                    rf'\1{new}\2:\3',
                    line
                )

            # Detectar fin del include block (cierre de llave con mismo indent)
            if line.strip() in ['}', '},'] and (len(line) - len(line.lstrip())) <= indent_level + 2:
                result.append(line)
                if line.strip() == '}':
                    in_include = False
                continue

        result.append(line)

    return '\n'.join(result)

def process_file(file_path):
    """Procesa un archivo"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = fix_include_block(content)

        if content != new_content:
            # Backup
            backup_path = str(file_path) + '.py.bak'
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(content)

            # Write fixed content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)

            return True
        return False
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}", file=sys.stderr)
        return False

def main():
    base = Path('/Users/ja/v4/bmad-nextjs-app')

    # Lista de archivos con errores TS2561
    files = [
        "app/api/stripe/payments/confirm/route.ts",
        "app/api/class-bookings/[id]/check-in/route.ts",
        "app/api/tournaments/[id]/conflicts/route.ts",
        "app/api/cron/reminders/route.ts",
        "app/api/classes/pending-payments/route.ts",
        "app/api/booking-groups/[id]/route.ts",
        "lib/whatsapp/interactive-messages.ts",
        "app/api/students/[id]/classes/route.ts",
        "app/api/finance/export/route.ts",
        "app/api/classes/[id]/quick-checkin/route.ts",
        "app/api/classes/[id]/attendance/route.ts",
        "app/api/class-bookings/[id]/route.ts",
        "app/api/bookings/[id]/payment/route.ts",
        "app/api/bookings/[id]/payment-link/route.ts",
        "app/api/booking-groups/[id]/split-payments/route.ts",
        "lib/whatsapp/notification-hooks.ts",
        "lib/tournaments/court-blocker.ts",
        "lib/services/qr-code-service.ts",
        "lib/services/email-service.ts",
        "lib/services/club-admin-integration.ts",
        "app/widget/[clubId]/actions.ts",
        "app/select-club/page.tsx",
        "app/c/[clubSlug]/dashboard/notifications/page.tsx",
    ]

    count = 0
    for file_rel in files:
        file_path = base / file_rel
        if file_path.exists():
            if process_file(file_path):
                print(f"✓ {file_rel}")
                count += 1
            else:
                print(f"○ {file_rel} (sin cambios)")
        else:
            print(f"⚠ {file_rel} (no encontrado)")

    print(f"\n✅ Procesados {count} archivos")
    print("💾 Backups: *.py.bak")

if __name__ == '__main__':
    main()
