# Widget Embebible - Guía de Implementación

## 🎯 Descripción General

El widget embebible de Padelyzer permite a los clubes integrar un sistema completo de reservas en sus sitios web con una sola línea de código. Los usuarios pueden reservar canchas sin necesidad de registrarse.

## 🚀 Características

- ✅ **Sin registro requerido** - Los usuarios reservan directamente
- 📅 **Calendario en tiempo real** - Disponibilidad actualizada
- 💳 **Pago en el club** - Sin procesar pagos en línea
- 📱 **Totalmente responsive** - Funciona en móviles y desktop
- 🔧 **Fácil instalación** - Un iframe simple
- 🎨 **Estilos aislados** - No interfiere con el sitio padre
- 📧 **Confirmaciones automáticas** - WhatsApp, SMS y email
- 🔒 **Seguro y validado** - Rate limiting y validaciones

## 📋 URLs del Widget

### Página Standalone
```
https://padelyzer.app/widget/[club-slug]
```

### Modo Embebido (iframe)
```
https://padelyzer.app/widget/[club-slug]?embedded=true
```

## 🛠️ Implementación

### 1. Código HTML Básico

```html
<iframe 
  src="https://padelyzer.app/widget/tu-club-slug?embedded=true"
  width="100%" 
  height="600px"
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
</iframe>
```

### 2. WordPress

1. Edita la página donde quieres el widget
2. Agrega un bloque "HTML personalizado"
3. Pega el código del iframe
4. Publica la página

### 3. Wix

1. Ve al editor de Wix
2. Agrega un elemento "Insertar código"
3. Pega el código HTML del iframe
4. Ajusta el tamaño según necesites

### 4. Squarespace

1. Edita la página
2. Agrega un bloque "Código"
3. Pega el código HTML
4. Guarda y publica

### 5. Sitio Personalizado

Simplemente pega el código HTML donde quieras que aparezca el widget.

## ⚙️ Configuración

### Tamaños Recomendados

- **Responsive**: `width="100%" height="600px"`
- **Desktop fijo**: `width="800px" height="600px"`
- **Móvil**: `width="400px" height="500px"`
- **Compacto**: `width="100%" height="500px"`

### Parámetros URL

- `embedded=true` - Activa el modo embebido (requerido para iframe)
- `date=2024-01-15` - Fecha inicial a mostrar (opcional)

## 🔧 API Pública

El widget utiliza APIs públicas que también puedes consumir:

### Información del Club
```
GET /api/public/clubs/[clubId]
```

### Canchas Disponibles
```
GET /api/public/clubs/[clubId]/courts
```

### Horarios
```
GET /api/public/clubs/[clubId]/schedule
```

### Reservas Públicas
```
GET /api/public/clubs/[clubId]/bookings?date=2024-01-15
```

## 🛡️ Seguridad

### Rate Limiting
- Máximo 5 intentos de reserva por IP cada 5 minutos
- Máximo 10 requests por minuto a las APIs públicas

### Validaciones
- Números de teléfono válidos
- Emails válidos (opcional)
- Sanitización de inputs
- Fechas válidas (no pasadas, máximo 30 días futuro)

### CORS
- Headers configurados para embedding
- Origen `*` permitido para máxima compatibilidad

## 📱 Flujo de Reserva

1. **Usuario selecciona** fecha y hora disponible
2. **Completa formulario** con datos básicos:
   - Nombre completo
   - Teléfono (requerido)
   - Email (opcional)
   - Duración del juego
3. **Confirma reserva** - Se crea inmediatamente
4. **Recibe confirmación** vía WhatsApp/SMS/email
5. **Club recibe notificación** de nueva reserva
6. **Pago en el club** al llegar

## 🎨 Personalización

### CSS Override (Avanzado)

Puedes personalizar algunos estilos del widget:

```css
iframe[src*="padelyzer.app/widget"] {
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}
```

### Colores del Club

El widget automáticamente usa:
- **Verde principal**: Para botones y elementos activos
- **Logo del club**: Si está configurado
- **Nombre del club**: En el header

## 📊 Analytics y Métricas

Las reservas desde el widget aparecen en:
- ✅ Dashboard de reservas del club
- 📈 Reportes de ingresos
- 📱 Notificaciones de WhatsApp
- 📧 Sistema de confirmaciones

## ❓ Troubleshooting

### El widget no carga
- Verifica que el club esté activo y aprobado
- Revisa el slug del club en la URL
- Asegúrate de usar `?embedded=true` en iframes

### Reservas no se crean
- Verifica conectividad a internet
- Revisa que los datos sean válidos
- Puede haber alcanzado el rate limit

### Estilos se ven mal
- El widget usa estilos aislados
- Verifica que no hay CSS conflictivo
- Considera ajustar el tamaño del iframe

### WhatsApp no llega
- Es un sistema simulado en desarrollo
- En producción usaría Twilio WhatsApp Business API
- Revisa logs del servidor para errores

## 🚀 Próximas Características (Pro)

- 🎨 **Personalización de colores** - Colores del club
- 🖼️ **Branding personalizado** - Logo y headers custom
- 📊 **Analytics detallados** - Conversiones y métricas
- 🌍 **Multi-idioma** - Español e inglés
- 💳 **Pagos en línea** - Stripe Connect integrado
- 📧 **Templates de email** - Diseños personalizados

## 🆘 Soporte

Para soporte técnico:
- 📧 Email: soporte@padelyzer.app
- 💬 WhatsApp: +52 222 123 4567
- 📖 Documentación: https://docs.padelyzer.app

---

**Desarrollado por Padelyzer** - La plataforma #1 para gestión de clubes de pádel en México.