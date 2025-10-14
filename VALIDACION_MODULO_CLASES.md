# Plan de Validación del Módulo de Clases - 100%

**Fecha:** 2025-10-14
**Ambiente:** Producción (padelyzer.app)
**Usuario:** owner@clubdemo.padelyzer.com / demo123

---

## 🎯 Objetivo

Validar TODAS las funcionalidades del módulo de clases en producción antes de continuar con otras tareas.

## 📋 Checklist de Validación

### 1. ✅ Verificación de Base de Datos

- [ ] **1.1** Verificar schema de Class tiene courtCost e instructorCost
  - URL: `https://www.padelyzer.app/api/verify-class-schema`
  - Esperado: `fieldsFound: { courtCost: true, instructorCost: true }`

- [ ] **1.2** Verificar que hay instructores disponibles
  - Dashboard → Instructores/Coaches
  - Verificar que hay al menos 1 instructor activo

- [ ] **1.3** Verificar que hay canchas disponibles
  - Dashboard → Canchas
  - Verificar que hay al menos 1 cancha activa

### 2. ✅ CRUD Básico de Clases

#### 2.1 CREATE - Crear Clase Única

- [ ] **2.1.1** Navegar a Dashboard → Clases
- [ ] **2.1.2** Click en "Nueva Clase" o botón similar
- [ ] **2.1.3** Llenar formulario:
  - Instructor: Seleccionar uno disponible
  - Nombre: "Clase de Prueba 1"
  - Cancha: Seleccionar una disponible
  - Fecha: Hoy + 1 día
  - Hora inicio: "10:00"
  - Hora fin: "11:00"
  - Tipo: "PRIVATE"
  - Nivel: "INTERMEDIATE"
  - Máx estudiantes: 2
  - Precio: 500
- [ ] **2.1.4** Click en "Crear Clase"
- [ ] **2.1.5** Verificar mensaje de éxito
- [ ] **2.1.6** Verificar que clase aparece en la lista
- [ ] **2.1.7** Verificar datos mostrados correctamente

#### 2.2 CREATE - Crear Clase Recurrente

- [ ] **2.2.1** Click en "Nueva Clase"
- [ ] **2.2.2** Llenar formulario:
  - Instructor: Seleccionar uno
  - Nombre: "Clase Grupal Semanal"
  - Cancha: Seleccionar una
  - Fecha inicio: Hoy + 2 días
  - Hora inicio: "18:00"
  - Hora fin: "19:00"
  - Tipo: "GROUP"
  - Nivel: "ALL_LEVELS"
  - Máx estudiantes: 8
  - Precio: 200
  - **RECURRENCIA:**
    - Activar opción "Recurrente"
    - Frecuencia: Semanal
    - Días: Lunes, Miércoles, Viernes
    - Duración: 4 semanas (12 clases)
- [ ] **2.2.3** Click en "Crear Clase"
- [ ] **2.2.4** Verificar mensaje indicando cuántas clases se crearon
- [ ] **2.2.5** Verificar que múltiples clases aparecen en calendario

#### 2.3 READ - Visualizar Clases

- [ ] **2.3.1** Vista de Lista
  - Verificar que todas las clases creadas aparecen
  - Verificar filtros por instructor
  - Verificar filtros por tipo
  - Verificar filtros por nivel
  - Verificar filtros por fecha

- [ ] **2.3.2** Vista de Calendario (si existe)
  - Navegar a Dashboard → Calendario o Clases → Calendario
  - Verificar que clases aparecen en las fechas correctas
  - Verificar colores/indicadores por tipo o estado

- [ ] **2.3.3** Detalle de Clase
  - Click en una clase de la lista
  - Verificar que muestra toda la información:
    - Nombre, instructor, cancha, fecha/hora
    - Precio, tipo, nivel, máx estudiantes
    - Espacios disponibles
    - Lista de estudiantes inscritos (vacía por ahora)

#### 2.4 UPDATE - Editar Clase

- [ ] **2.4.1** Seleccionar clase "Clase de Prueba 1"
- [ ] **2.4.2** Click en "Editar" o ícono de edición
- [ ] **2.4.3** Modificar:
  - Nombre: "Clase de Prueba 1 - Modificada"
  - Hora fin: "11:30"
  - Precio: 600
- [ ] **2.4.4** Guardar cambios
- [ ] **2.4.5** Verificar mensaje de éxito
- [ ] **2.4.6** Verificar que cambios se reflejan en la lista

#### 2.5 DELETE - Cancelar/Eliminar Clase

- [ ] **2.5.1** Seleccionar una clase recurrente
- [ ] **2.5.2** Click en "Cancelar" o "Eliminar"
- [ ] **2.5.3** Si hay opción, elegir "Solo esta clase" (no toda la serie)
- [ ] **2.5.4** Confirmar cancelación
- [ ] **2.5.5** Verificar que estado cambió a "CANCELLED" o se eliminó
- [ ] **2.5.6** Verificar que otras clases de la serie siguen activas

### 3. ✅ Gestión de Estudiantes

#### 3.1 Inscripción de Estudiante

- [ ] **3.1.1** Verificar que existe al menos un jugador/player
  - Dashboard → Jugadores
  - Si no existe, crear uno: "Estudiante Prueba" con email y teléfono

- [ ] **3.1.2** Ir a detalle de "Clase de Prueba 1 - Modificada"
- [ ] **3.1.3** Click en "Inscribir Estudiante" o botón similar
- [ ] **3.1.4** Seleccionar "Estudiante Prueba"
- [ ] **3.1.5** Confirmar inscripción
- [ ] **3.1.6** Verificar que estudiante aparece en lista de inscritos
- [ ] **3.1.7** Verificar que espacios disponibles disminuyó (2 → 1)

- [ ] **3.1.8** Inscribir un segundo estudiante
- [ ] **3.1.9** Verificar que espacios disponibles = 0
- [ ] **3.1.10** Intentar inscribir un tercero
- [ ] **3.1.11** Verificar que muestra error "Clase llena"

#### 3.2 Check-in de Estudiante

- [ ] **3.2.1** Cambiar fecha de la clase a HOY (editar clase)
- [ ] **3.2.2** Ir a detalle de la clase
- [ ] **3.2.3** Ver lista de estudiantes inscritos
- [ ] **3.2.4** Click en botón "Check-in" del primer estudiante
- [ ] **3.2.5** Verificar que estado cambia a "Presente" o similar
- [ ] **3.2.6** Verificar marca visual (✓ o color verde)

- [ ] **3.2.7** Probar Check-in Masivo (si existe)
  - Click en "Check-in Todos" o similar
  - Verificar que todos los estudiantes se marcan como presentes

#### 3.3 Cancelar Inscripción

- [ ] **3.3.1** Seleccionar un estudiante inscrito
- [ ] **3.3.2** Click en "Cancelar inscripción" o ícono de eliminar
- [ ] **3.3.3** Confirmar cancelación
- [ ] **3.3.4** Verificar que estudiante se elimina de la lista
- [ ] **3.3.5** Verificar que espacios disponibles aumenta

### 4. ✅ Pagos de Clases

#### 4.1 Verificar Precio de Clase

- [ ] **4.1.1** En detalle de clase verificar que muestra precio correcto
- [ ] **4.1.2** Verificar que precio está en pesos (no centavos)

#### 4.2 Registrar Pago de Estudiante

- [ ] **4.2.1** Inscribir un estudiante nuevo
- [ ] **4.2.2** Verificar que aparece como "Pago Pendiente" o similar
- [ ] **4.2.3** Click en "Registrar Pago" o ícono de pago
- [ ] **4.2.4** Seleccionar método: CASH o CARD
- [ ] **4.2.5** Confirmar pago
- [ ] **4.2.6** Verificar que estado cambia a "Pagado" o marca visual (✓)

#### 4.3 Verificar Link de Pago (si existe)

- [ ] **4.3.1** Para estudiante sin pagar, generar link de pago
- [ ] **4.3.2** Verificar que se genera URL correcta
- [ ] **4.3.3** Copiar link
- [ ] **4.3.4** Abrir en modo incógnito/privado
- [ ] **4.3.5** Verificar que muestra página de pago
- [ ] **4.3.6** Verificar que muestra datos correctos:
  - Nombre de clase
  - Precio
  - Instructor
  - Fecha/hora

### 5. ✅ Reportes y Análisis

#### 5.1 Reporte de Asistencia

- [ ] **5.1.1** Navegar a sección de Reportes o Clases → Reportes
- [ ] **5.1.2** Seleccionar filtros:
  - Fecha: Última semana
  - Instructor: Todos
- [ ] **5.1.3** Generar reporte
- [ ] **5.1.4** Verificar que muestra:
  - Total de clases
  - Total de estudiantes
  - Tasa de asistencia
  - Ingresos generados

#### 5.2 Historial de Clase

- [ ] **5.2.1** Ver historial de una clase específica
- [ ] **5.2.2** Verificar que muestra:
  - Estudiantes que asistieron
  - Pagos recibidos
  - Cambios realizados (si hay log de cambios)

### 6. ✅ Notificaciones (Opcional)

- [ ] **6.1** Verificar que se envía notificación al inscribir estudiante
- [ ] **6.2** Verificar recordatorio 24hrs antes de clase
- [ ] **6.3** Verificar notificación al cancelar clase

### 7. ✅ Edge Cases y Validaciones

#### 7.1 Validaciones de Negocio

- [ ] **7.1.1** Intentar crear clase sin instructor → Debe mostrar error
- [ ] **7.1.2** Intentar crear clase sin cancha → Debe mostrar error
- [ ] **7.1.3** Intentar crear clase con hora fin < hora inicio → Debe mostrar error
- [ ] **7.1.4** Intentar crear clase en horario ya ocupado → Debe mostrar error o advertencia
- [ ] **7.1.5** Intentar inscribir estudiante sin espacio disponible → Debe mostrar error

#### 7.2 Permisos y Seguridad

- [ ] **7.2.1** Verificar que solo usuarios autenticados pueden ver clases
- [ ] **7.2.2** Verificar que solo pueden ver clases de su club
- [ ] **7.2.3** Verificar que instructores solo ven sus propias clases (si aplica)

#### 7.3 Responsividad y UX

- [ ] **7.3.1** Probar en móvil/tablet (resize browser)
- [ ] **7.3.2** Verificar que formularios son usables
- [ ] **7.3.3** Verificar que botones son accesibles
- [ ] **7.3.4** Verificar mensajes de carga (spinners/loaders)

### 8. ✅ Integración con Otros Módulos

#### 8.1 Integración con Finanzas

- [ ] **8.1.1** Navegar a Dashboard → Finanzas
- [ ] **8.1.2** Verificar que ingresos de clases se reflejan en dashboard
- [ ] **8.1.3** Verificar que transacciones de pago aparecen en historial

#### 8.2 Integración con Canchas

- [ ] **8.2.1** Verificar que canchas ocupadas por clases no aparecen disponibles para reservas
- [ ] **8.2.2** En gestión de canchas, verificar que muestra clases programadas

#### 8.3 Integración con Instructores

- [ ] **8.3.1** En perfil/dashboard de instructor (si existe)
- [ ] **8.3.2** Verificar que muestra sus clases programadas
- [ ] **8.3.3** Verificar cálculo de ingresos/comisiones

---

## 📊 Resumen de Validación

Al completar todas las pruebas, llenar este resumen:

### Funcionalidades Probadas: ___ / 80
### Funcionalidades Exitosas: ___
### Funcionalidades con Errores: ___
### Bloqueadores Críticos: ___

### Errores Encontrados:

1.
2.
3.

### Mejoras Sugeridas:

1.
2.
3.

---

## 🚀 Estado Actual

**Inicio de Validación:** [PENDIENTE]
**Fin de Validación:** [PENDIENTE]
**Resultado Final:** [PENDIENTE]

---

## 📝 Notas

- Documentar cada error con screenshots si es posible
- Registrar tiempo de respuesta de cada operación
- Anotar cualquier comportamiento inesperado
- Priorizar errores que bloquean funcionalidad crítica

