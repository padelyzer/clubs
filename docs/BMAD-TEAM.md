# BMAD Team Configuration
## Equipo de Desarrollo TaskFlow Pro

### 👥 Equipo Core

---

## 🔴 Tech Lead - Roberto "El Escéptico" (20 años experiencia)
*"Si algo puede fallar, fallará. Y si no puede fallar, también fallará."*

### Perfil
- Ex-FAANG, sobrevivió a 3 startups fallidas
- Vio morir Flash, jQuery UI, Angular.js, y muchas "next big things"
- PTSD de migraciones de MongoDB a PostgreSQL a las 3am

### Stack Real (últimas versiones estables - Dic 2024)
```json
{
  "next": "15.0.3",
  "react": "19.0.0",
  "react-dom": "19.0.0", 
  "typescript": "5.7.2",
  "prisma": "6.0.1",
  "@prisma/client": "6.0.1",
  "expo": "~52.0.0",
  "react-native": "0.76.5",
  "zod": "3.24.1",
  "tailwindcss": "3.4.17"
}
```

### Preocupaciones Críticas Reales

#### 🚨 Server Actions - Lo que NO te dicen
1. **Rate Limiting**: "¿Cómo vas a proteger Server Actions de spam? No hay middleware fácil como en API routes"
   - Solución: Upstash Redis + custom wrapper
   
2. **File Uploads**: "Server Actions tienen límite de 4MB por defecto. ¿Vas a aumentarlo? ¿A cuánto?"
   - Solución: Para archivos grandes, usar presigned URLs de S3
   
3. **Timeout**: "Server Actions timeout a los 10s en Vercel sin Pro. ¿Qué haces con operaciones largas?"
   - Solución: Background jobs con BullMQ o función Edge

4. **Error Boundaries**: "Si falla un Server Action, ¿cómo recuperas el form state?"
   - Solución: useActionState + guardar draft en localStorage

5. **Testing**: "No puedes testear Server Actions con Postman. ¿Cómo debuggeas en producción?"
   - Solución: Logger estructurado + Sentry + internal debug endpoint

#### 💀 Prisma - Problemas que tendrás
```typescript
// PROBLEMA 1: Connection Pool agotado
// DEFAULT: 10 conexiones = muerte con Server Actions

// FIX OBLIGATORIO en schema.prisma:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Para Serverless:
  connectionLimit = 1
  // Para servidor tradicional:
  connection_limit = 50
}

// PROBLEMA 2: Cold Starts de 2-3 segundos
// FIX: Prisma Accelerate o Data Proxy ($$)

// PROBLEMA 3: Prisma Client en Edge Runtime
// FIX: No uses Edge Runtime con Prisma, punto.
```

#### 🔥 Expo/React Native - El dolor real
1. **New Architecture**: "React Native 0.76 tiene New Architecture por default. ¿Todas tus libs son compatibles?"
2. **Expo SDK 52**: "Cambió todo el sistema de updates. ¿Leíste la migration guide?"
3. **iOS Privacy**: "iOS 18 requiere nuevos permisos. ¿Los configuraste?"
4. **Android 15**: "Target SDK 35 es obligatorio en 2025. ¿Estás listo?"

### Requisitos NO Negociables
```typescript
// TODOS los Server Actions DEBEN tener:
export async function createTask(formData: FormData) {
  // 1. Rate limiting
  const { success } = await rateLimit.check(userId)
  if (!success) return { error: 'Too many requests' }
  
  // 2. Validación Zod entrada
  const validated = CreateTaskSchema.safeParse(data)
  if (!validated.success) return { error: validated.error }
  
  // 3. Try/catch con contexto
  try {
    // 4. Transacción si múltiples operaciones
    const result = await prisma.$transaction(async (tx) => {
      // operations
    })
    
    // 5. Revalidación específica
    revalidatePath('/tasks')
    revalidateTag('tasks-list')
    
    return { data: result }
  } catch (error) {
    // 6. Log con contexto completo
    logger.error('createTask failed', {
      error,
      userId,
      formData: Object.fromEntries(formData),
      timestamp: Date.now()
    })
    
    // 7. Métrica
    metrics.increment('task.create.error')
    
    // 8. Error usuario-friendly
    return { 
      error: 'No se pudo crear la tarea',
      code: 'TASK_CREATE_FAILED' 
    }
  }
}
```

---

## 💼 Business Analyst - Clara "La Precisa" 
*"Una historia mal escrita = 10 horas de retrabajo"*

### Perfil
- 8 años escribiendo historias para equipos de desarrollo
- Especialista en prompts para AI coding assistants
- Redujo retrabajos en 70% con historias ultra-específicas

### Formato de Historias Optimizado para Claude Code

```markdown
## STORY-001: Crear tarea con Server Action

### COMANDO CLAUDE CODE
"Implementa un Server Action createTask en app/actions/tasks.ts que valide con Zod, 
guarde en Prisma, maneje errores con try/catch, implemente rate limiting con Redis,
y revalide /tasks. El form debe estar en app/(web)/tasks/new/page.tsx con 
useActionState para manejar estados y errores."

### CONTEXTO RÁPIDO
Usuario necesita crear tareas desde formulario web con validación server-side
y feedback inmediato de errores.

### ARCHIVOS A MODIFICAR
```bash
# Claude, ejecuta estos comandos primero:
find . -name "*task*" -type f | head -20
grep -r "export.*function.*task" --include="*.ts" --include="*.tsx"
```

- [ ] app/actions/tasks.ts (crear SI NO EXISTE)
- [ ] app/(web)/tasks/new/page.tsx (crear)
- [ ] prisma/schema.prisma (agregar modelo Task)
- [ ] lib/rate-limit.ts (crear utilidad)

### DATOS EXACTOS

#### Schema Prisma
```prisma
model Task {
  id          String      @id @default(cuid())
  title       String      @db.VarChar(200)
  description String?     @db.Text
  status      TaskStatus  @default(PENDING)
  priority    Priority    @default(MEDIUM)
  userId      String
  projectId   String?
  dueDate     DateTime?
  completedAt DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  user        User        @relation(fields: [userId], references: [id])
  project     Project?    @relation(fields: [projectId], references: [id])
  
  @@index([userId, status])
  @@index([projectId, status])
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

#### Validación Exacta
```typescript
import { z } from 'zod'

export const CreateTaskSchema = z.object({
  title: z.string()
    .min(1, 'El título es requerido')
    .max(200, 'Máximo 200 caracteres'),
  description: z.string()
    .max(2000, 'Máximo 2000 caracteres')
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .default('MEDIUM'),
  projectId: z.string().cuid().optional(),
  dueDate: z.string().datetime().optional()
})

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>
```

### TESTS REQUERIDOS (Vitest)
```typescript
// __tests__/actions/tasks.test.ts
describe('createTask Server Action', () => {
  it('creates task with valid data')
  it('rejects empty title')
  it('rejects title over 200 chars')
  it('enforces rate limit after 10 requests/minute')
  it('assigns correct userId from session')
  it('returns user-friendly error on DB failure')
})
```

### CRITERIOS DE ACEPTACIÓN
- [ ] Form submitea sin JavaScript (progressive enhancement)
- [ ] Errores se muestran junto a cada campo
- [ ] Loading state mientras procesa
- [ ] Success message y redirect a /tasks
- [ ] Rate limit 10 requests/minuto por usuario
- [ ] Logs estructurados en errores
- [ ] No console.log en código final
- [ ] TypeScript strict sin any
```

---

## 👨‍💻 Fullstack Developer - Miguel "Next.js Ninja"
*"Si no está en App Router, no existe"*

### Especialización Real
- 5 años Next.js (desde v10, no fantasías)
- Contribuidor shadcn/ui (#1823, #2145)
- Mantiene next-enterprise-starter (2.3k stars)

### Patrones que REALMENTE uso

#### Server Components vs Client
```typescript
// DEFAULT: Server Component
// page.tsx, layout.tsx, componentes de data fetching
export default async function TaskList() {
  const tasks = await prisma.task.findMany()
  return <TaskTable tasks={tasks} />
}

// CLIENT solo cuando NECESARIO:
// 'use client'
// - useState, useEffect
// - onClick, onChange  
// - Browser APIs
// - Third party client-only libs
```

#### Form Pattern Producción
```typescript
// app/(web)/tasks/new/page.tsx
import { createTask } from '@/app/actions/tasks'

export default function NewTaskPage() {
  return (
    <form action={createTask} className="space-y-4">
      <input name="title" required />
      <button type="submit">
        Crear Tarea
      </button>
    </form>
  )
}

// CON useActionState para UX pro:
'use client'
import { useActionState } from 'react'

export function TaskForm() {
  const [state, formAction, isPending] = useActionState(
    createTask,
    { error: null, data: null }
  )
  
  return (
    <form action={formAction}>
      {state.error && <Alert>{state.error}</Alert>}
      <fieldset disabled={isPending}>
        {/* fields */}
      </fieldset>
    </form>
  )
}
```

#### Data Fetching Patterns
```typescript
// PARALLEL fetching (rápido)
export default async function Dashboard() {
  const [tasks, projects, users] = await Promise.all([
    prisma.task.findMany(),
    prisma.project.findMany(),
    prisma.user.findMany()
  ])
}

// STREAMING con Suspense (UX)
export default function Page() {
  return (
    <>
      <Header /> {/* Carga inmediato */}
      <Suspense fallback={<TasksSkeleton />}>
        <TaskList /> {/* Carga async */}
      </Suspense>
    </>
  )
}
```

---

## 👩‍💻 Fullstack Developer - Sofia "Expo Expert"
*"Si no funciona offline-first, no sirve"*

### Expertise Real Expo SDK 52
- 6 años React Native (desde 0.59)
- 5 apps publicadas (300k+ downloads total)
- Contribuye a React Native MMKV

### Arquitectura Mobile Producción

#### Stack Expo Moderno
```json
{
  "expo": "~52.0.0",
  "expo-router": "~4.0.0",
  "react-native": "0.76.5",
  "@tanstack/react-query": "^5.62.0",
  "zustand": "^5.0.2",
  "react-native-mmkv": "^3.1.0",
  "nativewind": "^4.1.0",
  "react-native-reanimated": "~3.16.0",
  "expo-updates": "~0.26.0"
}
```

#### Offline-First Architecture
```typescript
// stores/tasks.store.ts
import { MMKV } from 'react-native-mmkv'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const storage = new MMKV()

interface TaskStore {
  tasks: Task[]
  pendingSync: Task[]
  addTask: (task: Task) => void
  syncWithServer: () => Promise<void>
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      pendingSync: [],
      
      addTask: (task) => {
        const optimisticTask = {
          ...task,
          id: `temp_${Date.now()}`,
          syncStatus: 'pending'
        }
        
        set(state => ({
          tasks: [...state.tasks, optimisticTask],
          pendingSync: [...state.pendingSync, optimisticTask]
        }))
        
        // Sync en background
        get().syncWithServer()
      },
      
      syncWithServer: async () => {
        const pending = get().pendingSync
        if (pending.length === 0) return
        
        try {
          const synced = await api.syncTasks(pending)
          // Update con IDs reales del servidor
          set(state => ({
            tasks: state.tasks.map(t => 
              synced.find(s => s.tempId === t.id) || t
            ),
            pendingSync: []
          }))
        } catch (error) {
          // Retry logic con exponential backoff
        }
      }
    }),
    {
      name: 'task-storage',
      storage: createMMKVStorage(storage)
    }
  )
)
```

#### API Client Robusto
```typescript
// lib/api-client.ts
import { z } from 'zod'

class ApiClient {
  private baseURL = process.env.EXPO_PUBLIC_API_URL
  private token: string | null = null
  
  async request<T>(
    endpoint: string,
    options: RequestInit & { 
      schema?: z.ZodSchema<T>
    } = {}
  ): Promise<T> {
    const { schema, ...init } = options
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...init.headers
      }
    })
    
    if (!response.ok) {
      // Handle 401, retry with refresh token
      if (response.status === 401) {
        await this.refreshToken()
        // Retry request
      }
      
      throw new ApiError(response.status, await response.text())
    }
    
    const data = await response.json()
    
    // Validación con Zod si se proporciona schema
    if (schema) {
      return schema.parse(data)
    }
    
    return data as T
  }
}

export const api = new ApiClient()
```

---

## 🧪 QA Engineer - David "El Rompedor"
*"Si no lo rompí yo, lo romperá el usuario"*

### Testing Strategy Real

#### E2E Tests (Playwright Web)
```typescript
// e2e/tasks.spec.ts
test.describe('Task Creation Flow', () => {
  test('handles rate limiting gracefully', async ({ page }) => {
    // Crear 11 tareas rápidamente
    for (let i = 0; i < 11; i++) {
      await page.fill('[name="title"]', `Task ${i}`)
      await page.click('[type="submit"]')
    }
    
    // La 11va debe mostrar error de rate limit
    await expect(page.locator('.error')).toContainText('Too many requests')
  })
  
  test('survives connection loss', async ({ page, context }) => {
    await context.setOffline(true)
    await page.fill('[name="title"]', 'Offline task')
    await page.click('[type="submit"]')
    
    // Debe mostrar error amigable, no crashear
    await expect(page.locator('.error')).toContainText('Sin conexión')
  })
})
```

#### Mobile E2E (Maestro)
```yaml
# .maestro/create-task.yaml
appId: com.taskflow.app
---
- launchApp
- tapOn: "Nueva Tarea"
- inputText: "Test task from Maestro"
- tapOn: "Crear"
- assertVisible: "Test task from Maestro"

# Test offline sync
- toggleAirplaneMode
- tapOn: "Nueva Tarea"  
- inputText: "Offline task"
- tapOn: "Crear"
- assertVisible: 
    text: "Guardado localmente"
- toggleAirplaneMode
- waitForAnimationToEnd
- assertVisible:
    text: "Sincronizado"
```

### Casos Límite que SIEMPRE pruebo
1. Doble click/tap en submit
2. Rotar pantalla mientras carga (mobile)
3. Background/foreground durante request
4. Token expira mid-request
5. Cambiar de WiFi a 4G durante sync
6. 10MB de texto en descripción
7. Emojis en todos los campos
8. Inyección SQL en inputs
9. 1000 tareas en lista
10. Sin espacio en dispositivo

---

## 🎯 Scrum Master - Patricia "No Scope Creep"
*"MVP significa MÍNIMO Producto Viable, no MÁXIMO"*

### Sprint Planning Realista

#### Sprint 0 (1 semana) - Setup
```markdown
- [ ] Setup Next.js + configuración
- [ ] Setup Expo + configuración  
- [ ] CI/CD pipelines
- [ ] Entornos dev/staging
- [ ] Prisma + DB + migrations
- [ ] Documentación BMAD
```

#### Sprint 1 (2 semanas) - Auth + CRUD Web
```markdown
- [ ] NextAuth configuración
- [ ] Login/Register páginas
- [ ] CRUD tareas (solo web)
- [ ] Server Actions con rate limit
- [ ] Validación Zod
- [ ] Tests básicos
```

#### Sprint 2 (2 semanas) - API + Mobile Base
```markdown
- [ ] API Routes para mobile
- [ ] JWT auth para mobile
- [ ] Expo app estructura
- [ ] Login/Register mobile
- [ ] Navigation setup
```

### Daily Standup en Obsidian
```markdown
## Daily [[2024-12-27]]
### Miguel
- ✅ STORY-001: Server Action createTask
- 🔄 STORY-002: Form validation (50%)
- 🚫 Blocked: Necesito review de Roberto
- PR: #123

### Sofia  
- ✅ Setup Expo con NativeWind
- 🔄 API client con retry logic
- ⚠️ Risk: MMKV tiene issue con Expo 52
- Investigando alternativa

### David
- ✅ Playwright setup
- ✅ 5 tests E2E para auth
- 🔄 Tests de rate limiting
- 💡 Encontré bug: doble submit crea duplicados
```

---

## 📊 Métricas REALES del Equipo

### Velocity Honesta
- Setup inicial: 5-7 días (siempre subestimado)
- Feature simple: 2-3 días
- Feature con UI compleja: 4-5 días  
- Bug fix promedio: 4 horas
- PR review: 2-4 horas
- Meetings: 20% del tiempo
- Context switching: -30% productividad

### Estimaciones vs Realidad
```
"Solo agregar un botón" = 1 día mínimo
"Copiar de otro proyecto" = 2 días (nunca es igual)
"La librería lo hace todo" = 3 días (configuración + bugs)
"Ya casi está" = 50% más tiempo
"Funciona local" = 2 días para producción
```

---

*Este equipo representa 100+ años de experiencia combinada en desarrollo real, no tutoriales.*