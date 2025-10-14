# Validación Rápida Manual - Módulo de Clases

**Objetivo:** Validar funcionalidad crítica en 10 minutos
**URL:** https://www.padelyzer.app
**Usuario:** owner@clubdemo.padelyzer.com / demo123

---

## ✅ Checklist Express (10 minutos)

### 1️⃣ Verificación Inicial (2 min)

**1.1 Schema de DB**
```
Abre: https://www.padelyzer.app/api/verify-class-schema
```
- [ ] ¿Retorna JSON con success: true?
- [ ] ¿fieldsFound.courtCost = true?
- [ ] ¿fieldsFound.instructorCost = true?
- [ ] ¿prismaQueryTest.success = true?

**Resultado:** ________________

---

### 2️⃣ CREAR Clase Única (3 min)

**2.1 Navegar al módulo**
- [ ] Dashboard → Clases
- [ ] Click en "Nueva Clase" o botón +

**2.2 Llenar formulario mínimo**
```
Instructor:     [Selecciona cualquiera]
Nombre:         "Test Validación"
Cancha:         [Selecciona cualquiera]
Fecha:          [Mañana]
Hora inicio:    10:00
Hora fin:       11:00
Tipo:           PRIVATE
Máx estudiantes: 2
Precio:         500
```

**2.3 Crear**
- [ ] Click en "Crear" o "Guardar"
- [ ] ¿Muestra mensaje de éxito?
- [ ] ¿Aparece en la lista de clases?

**Resultado:** ________________
**Screenshot/Error:** ________________

---

### 3️⃣ LEER Clase (1 min)

**3.1 Ver detalle**
- [ ] Click en la clase "Test Validación"
- [ ] ¿Muestra todos los datos correctos?
- [ ] ¿Precio aparece como $500 (no 50000)?
- [ ] ¿Espacios disponibles = 2?

**Resultado:** ________________

---

### 4️⃣ INSCRIBIR Estudiante (2 min)

**4.1 Verificar jugadores**
- [ ] Dashboard → Jugadores
- [ ] ¿Hay al menos 1 jugador?
- [ ] Si no, crear uno: "Test Player" con email/teléfono

**4.2 Inscribir**
- [ ] Volver a detalle de clase "Test Validación"
- [ ] Click en "Inscribir Estudiante"
- [ ] Seleccionar el jugador
- [ ] Confirmar

**4.3 Verificar**
- [ ] ¿Aparece en lista de inscritos?
- [ ] ¿Espacios disponibles = 1?

**Resultado:** ________________

---

### 5️⃣ EDITAR Clase (1 min)

**5.1 Modificar**
- [ ] En detalle de clase, click "Editar"
- [ ] Cambiar nombre a: "Test Validación - OK"
- [ ] Guardar

**5.2 Verificar**
- [ ] ¿Nombre actualizado en la lista?

**Resultado:** ________________

---

### 6️⃣ CANCELAR Clase (1 min)

**6.1 Eliminar**
- [ ] Click en "Cancelar" o "Eliminar"
- [ ] Confirmar

**6.2 Verificar**
- [ ] ¿Estado cambió a CANCELLED o se eliminó?

**Resultado:** ________________

---

## 📊 RESUMEN FINAL

**Funcionalidades Probadas:** ___ / 6
**Funcionalidades Exitosas:** ___
**Errores Críticos:** ___

### Errores Encontrados:

1. ____________________________________________
   - Error: _________________________________
   - Screenshot/Detalles: ____________________

2. ____________________________________________
   - Error: _________________________________
   - Screenshot/Detalles: ____________________

3. ____________________________________________
   - Error: _________________________________
   - Screenshot/Detalles: ____________________

---

## 🚨 Si Encuentras Error 500 al Crear Clase

**Captura esto de la consola del navegador (F12 → Console):**

```javascript
// Busca la línea que dice:
POST https://www.padelyzer.app/api/classes 500

// Click en ella y copia TODO el JSON de Response:
{
  "success": false,
  "error": "...",
  "details": "...",  // ← ESTO ES LO MÁS IMPORTANTE
  "stack": "..."
}
```

**Comparte el campo `details` completo** - ahí está el error real.

---

## ⏱️ Tiempo Total Estimado: 10 minutos

**Inicio:** ____________
**Fin:** ____________

