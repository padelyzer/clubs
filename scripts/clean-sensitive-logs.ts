#!/usr/bin/env npx tsx
/**
 * Script para eliminar logs sensibles del código
 * Ejecutar con: npx tsx scripts/clean-sensitive-logs.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

const SENSITIVE_PATTERNS = [
  /console\.log\s*\(\s*['"`].*[Pp]assword.*['"`],.*\)/gm,
  /console\.log\s*\(\s*['"`].*[Ss]ecret.*['"`],.*\)/gm,
  /console\.log\s*\(\s*['"`].*[Tt]oken.*['"`],.*\)/gm,
  /console\.log\s*\(\s*['"`].*[Kk]ey.*['"`],.*\)/gm,
]

const FILES_TO_CLEAN = [
  'prisma/seed.ts',
  'prisma/seed-demo.ts',
  'prisma/seed-enhanced.ts',
  'test-auth.js',
  'check-isolation-club-users.ts'
]

let totalCleaned = 0
let filesModified = 0

function cleanFile(filePath: string) {
  const fullPath = path.join(process.cwd(), filePath)

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Archivo no encontrado: ${filePath}`)
    return
  }

  let content = fs.readFileSync(fullPath, 'utf8')
  let originalContent = content
  let cleanedInFile = 0

  SENSITIVE_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      cleanedInFile += matches.length
      content = content.replace(pattern, '  // [REMOVED: Sensitive log for security]')
    }
  })

  if (cleanedInFile > 0) {
    fs.writeFileSync(fullPath, content)
    console.log(`✅ Limpiado: ${filePath} (${cleanedInFile} logs removidos)`)
    totalCleaned += cleanedInFile
    filesModified++
  } else {
    console.log(`✓  Sin cambios: ${filePath}`)
  }
}

console.log('🧹 Iniciando limpieza de logs sensibles...\n')

// Limpiar archivos específicos
FILES_TO_CLEAN.forEach(file => {
  cleanFile(file)
})

// Buscar otros archivos con posibles logs sensibles
console.log('\n🔍 Buscando otros archivos con logs sensibles...')

const allFiles = glob.sync('**/*.{ts,tsx,js}', {
  ignore: ['node_modules/**', '.next/**', 'scripts/clean-sensitive-logs.ts']
})

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8')

  SENSITIVE_PATTERNS.forEach(pattern => {
    if (pattern.test(content)) {
      console.log(`⚠️  Posible log sensible en: ${file}`)
    }
  })
})

console.log('\n📊 Resumen de limpieza:')
console.log(`   - Archivos modificados: ${filesModified}`)
console.log(`   - Logs removidos: ${totalCleaned}`)
console.log('\n✅ Limpieza completada')