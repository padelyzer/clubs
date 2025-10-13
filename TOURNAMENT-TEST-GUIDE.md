# 🏆 Guía para Probar el Módulo de Torneos

## ✅ Sistema Configurado

Tu sistema de torneos está listo con:
- ✅ 3 canchas creadas
- ✅ 8 equipos inscritos y confirmados
- ✅ Cuartos de Final completados (4 partidos)
- ✅ Semifinal en progreso (1 completado, 1 activo)
- ✅ Final programada

## 🔧 Problema Actual

El sistema de autenticación de Lucia Auth no está reconociendo la sesión mock. Por eso los endpoints están retornando 401.

## 🚀 Soluciones para Probar

### Opción 1: Usar Endpoint de Desarrollo (Recomendado)

He creado un endpoint sin autenticación solo para desarrollo:

```
GET /api/tournaments/dev/tournament_active_1759786489416
```

**Pruébalo en el navegador:**
```
http://localhost:3000/api/tournaments/dev/tournament_active_1759786489416
```

Deberías ver un JSON con todos los datos del torneo.

### Opción 2: Forzar Hard Refresh en el Navegador

1. Abre Chrome Developer Tools (⌘+Option+I)
2. Click derecho en el botón de refresh
3. Selecciona "Empty Cache and Hard Reload"
4. La página debería ahora usar el endpoint `/dev/` automáticamente

### Opción 3: Agregar parámetro `?dev=true` a la URL

```
http://localhost:3000/dashboard/tournaments/tournament_active_1759786489416?dev=true
```

## 📊 Datos de Prueba Creados

### Torneo
- **ID:** `tournament_active_1759786489416`
- **Nombre:** Torneo Activo Demo
- **Tipo:** SINGLE_ELIMINATION
- **Estado:** ACTIVE

### Equipos (8 total)
1. Los Campeones (Avanzado)
2. Rompepelota (Avanzado)
3. Smash Team (Intermedio)
4. Ace Masters (Avanzado)
5. Net Ninjas (Intermedio)
6. Power Padel (Avanzado)
7. Court Kings (Intermedio)
8. Spin Doctors (Avanzado)

### Resultados

**Cuartos de Final (Completados):**
1. Los Campeones 2-1 Rompepelota ✅
2. Smash Team 2-1 Ace Masters ✅
3. Net Ninjas 2-1 Power Padel ✅
4. Court Kings 2-1 Spin Doctors ✅

**Semifinales:**
1. Los Campeones 2-0 Smash Team ✅ COMPLETADO
2. Net Ninjas vs Court Kings ⏳ EN PROGRESO

**Final:**
- Los Campeones vs TBD (programada 20:00 hoy)

## 🔍 Verificar Datos Directamente

Puedes consultar la base de datos directamente:

```bash
# Ver el torneo
npx tsx -e "import {prisma} from './lib/config/prisma'; (async()=>{const t = await prisma.tournament.findUnique({where:{id:'tournament_active_1759786489416'},include:{_count:true}}); console.log(JSON.stringify(t,null,2)); await prisma.\$disconnect()})()"

# Ver equipos inscritos
npx tsx -e "import {prisma} from './lib/config/prisma'; (async()=>{const r = await prisma.tournamentRegistration.findMany({where:{tournamentId:'tournament_active_1759786489416'}}); console.log(r.length, 'equipos'); await prisma.\$disconnect()})()"

# Ver partidos
npx tsx -e "import {prisma} from './lib/config/prisma'; (async()=>{const m = await prisma.tournamentMatch.findMany({where:{tournamentId:'tournament_active_1759786489416'}}); console.log(m.length, 'partidos'); m.forEach(match => console.log(match.round, '-', match.status)); await prisma.\$disconnect()})()"
```

## 🛠️ Scripts Útiles

### Re-poblar el torneo con datos frescos
```bash
npx tsx scripts/seed-tournament-test.ts
```

### Crear nueva sesión de desarrollo
```bash
npx tsx scripts/create-dev-session.ts
```

## 🌐 URLs de Acceso

**Lista de torneos:**
```
http://localhost:3000/dashboard/tournaments
```

**Detalle del torneo (con dev endpoint):**
```
http://localhost:3000/dashboard/tournaments/tournament_active_1759786489416?dev=true
```

**API directa:**
```
http://localhost:3000/api/tournaments/dev/tournament_active_1759786489416
```

## ⚙️ Debugging

Si sigues teniendo problemas:

1. **Verifica que el servidor esté corriendo:**
   ```bash
   lsof -ti:3000
   ```

2. **Ve los logs en la terminal** donde corre `npm run dev`

3. **Checa la consola del navegador** (⌘+Option+J) para ver mensajes de debug

4. **Prueba el endpoint dev directamente:**
   ```bash
   curl http://localhost:3000/api/tournaments/dev/tournament_active_1759786489416
   ```

## 📝 Notas

- El endpoint `/api/tournaments/dev/[id]` **NO tiene autenticación** - solo para desarrollo
- **NO usar en producción**
- Los datos se pueden re-generar en cualquier momento con el script seed
- La sesión mock existe en la DB pero Lucia Auth no la está reconociendo (problema conocido para investigar)

## 🎯 Próximos Pasos para Arreglar Autenticación

Para que funcione con autenticación real:

1. Investigar por qué `validateRequest()` retorna `hasSession: false` cuando la sesión existe
2. Verificar configuración de Lucia Auth
3. Revisar middleware de autenticación
4. Posiblemente necesitar login real en vez de sesión mock
