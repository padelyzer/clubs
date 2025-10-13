#!/usr/bin/env python3
"""
Corrige errores donde se usa booking.amount en lugar de booking.price
El modelo Booking en Prisma tiene 'price', no 'amount'
"""
import re
import sys
from pathlib import Path

def fix_booking_amount_in_file(file_path):
    """Corrige booking.amount → booking.price en un archivo"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        corrections = 0

        # Patrones a corregir
        patterns = [
            # booking.amount
            (r'\.amount\b', '.price', 'booking', ['booking', 'b', 'bkg']),
            # Booking select/aggregate con amount
            # Esto es más delicado, solo en contexto de Booking
        ]

        # Primera pasada: accesos directos a .amount en contexto de booking
        # Buscar patrones como: booking.amount, b.amount, bkg.amount
        lines = content.split('\n')
        new_lines = []

        for line in lines:
            new_line = line

            # Detectar si la línea tiene acceso a .amount en contexto de Booking
            # Patrones comunes:
            # - booking.amount
            # - b.amount (cuando b es un booking)
            # - reduce((sum, booking) => sum + booking.amount, 0)
            # - map(booking => booking.amount)

            # Caso 1: Variable explícitamente llamada 'booking'
            if 'booking' in line.lower() and '.amount' in line:
                # No reemplazar si es parte de otro modelo (payment.amount, transaction.amount, etc)
                if not any(x in line for x in ['payment.amount', 'transaction.amount', 'split.amount',
                                                'invoice.amount', 'expense.amount', 'fee.amount']):
                    new_line = re.sub(r'(booking[s]?\.)\s*amount\b', r'\1price', new_line, flags=re.IGNORECASE)
                    new_line = re.sub(r'(b\.)\s*amount\b', r'\1price', new_line)
                    new_line = re.sub(r'(bkg\.)\s*amount\b', r'\1price', new_line)
                    if new_line != line:
                        corrections += 1

            # Caso 2: En select/aggregate de Booking
            # select: { amount: true } → select: { price: true }
            if ('Booking' in line or 'booking' in line) and 'select:' in line and 'amount:' in line:
                new_line = re.sub(r'amount:', 'price:', new_line)
                if new_line != line:
                    corrections += 1

            # Caso 3: En aggregate
            # _sum: { amount: true } cuando está en contexto de booking
            if '_sum:' in line and 'amount:' in line:
                # Necesitamos contexto - verificar líneas anteriores
                # Por ahora, marcar para revisión manual
                pass

            new_lines.append(new_line)

        new_content = '\n'.join(new_lines)

        if new_content != original_content:
            # Crear backup
            backup_path = f"{file_path}.booking_amount.bak"
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)

            # Escribir contenido corregido
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)

            return corrections

        return 0

    except Exception as e:
        print(f"❌ Error procesando {file_path}: {e}")
        return 0

def find_files_with_booking_amount():
    """Encuentra archivos con booking.amount"""
    import subprocess

    # Buscar archivos que contengan 'booking' y '.amount'
    cmd = "grep -rl 'booking.*\\.amount' app/ lib/ components/ 2>/dev/null | grep -E '\\.(ts|tsx)$' | grep -v node_modules"

    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        files = [f.strip() for f in result.stdout.split('\n') if f.strip()]
        return files
    except:
        return []

def main():
    print("=" * 80)
    print("🔧 CORRECCIÓN: booking.amount → booking.price")
    print("=" * 80)
    print()

    # Encontrar archivos afectados
    print("🔍 Buscando archivos con 'booking.amount'...")
    files = find_files_with_booking_amount()

    if not files:
        print("✅ No se encontraron archivos con 'booking.amount'")
        return

    print(f"📁 Encontrados {len(files)} archivos")
    print()

    total_corrections = 0
    files_modified = 0

    for file_path in files:
        corrections = fix_booking_amount_in_file(file_path)
        if corrections > 0:
            files_modified += 1
            total_corrections += corrections
            print(f"✓ {file_path} ({corrections} correcciones)")

    print()
    print("=" * 80)
    print(f"✅ Corregidos {total_corrections} errores en {files_modified} archivos")
    print("💾 Backups: *.booking_amount.bak")
    print("=" * 80)

if __name__ == '__main__':
    main()
