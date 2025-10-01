# 📜 Arquitectura de Scroll - Sistema de Lecciones

## 🎯 Objetivo
Establecer **UN ÚNICO PUNTO DE SCROLL** en el sistema de lecciones para evitar scrollbars duplicados y comportamientos conflictivos.

---

## 🏗️ Jerarquía de Componentes

```
html, body (position: fixed, overflow: hidden)
│
└── .lesson-screen.screen.active (position: absolute, overflow: hidden)
    ├── .back-button (sin scroll)
    ├── .lesson-header (sin scroll)
    │   ├── .lesson-title-container
    │   ├── .lesson-meta
    │   └── .lesson-progress-bar
    │
    ├── .lesson-step-container (overflow: hidden)
    │   └── .lesson-step (overflow: hidden)
    │       ├── .step-title (overflow: hidden)
    │       │
    │       └── ✅ .step-content-scrollable ← ÚNICO PUNTO DE SCROLL
    │           ├── .step-content.text-content
    │           └── .step-interactive (opcional)
    │
    ├── .lesson-controls (sin scroll)
    └── .lesson-completion (sin scroll)
```

---

## ✅ Regla de Oro: UN SOLO SCROLL

### Elemento con Scroll:
- **`.step-content-scrollable`** (línea ~1346 en components.css)
  - `overflow-y: auto !important`
  - `overflow-x: hidden !important`

### Todos los demás elementos:
- **`html, body`**: `overflow: hidden !important; position: fixed`
- **`.lesson-screen.screen`**: `overflow: hidden !important`
- **`.lesson-step-container`**: `overflow: hidden !important`
- **`.lesson-step`**: `overflow: hidden !important`
- **`.step-title`**: `overflow: hidden` (solo para text-overflow: ellipsis)

---

## 🔧 Cambios Realizados

### 1. **Eliminados Duplicados**
- ❌ `.lesson-screen-content` (NO SE USA en el código React)
- ❌ Definición duplicada de scrollbar Firefox (línea ~1396)
- ❌ Selectores duplicados para `.step-content-scrollable` (línea ~3163)

### 2. **Reglas Globales Corregidas**
```css
/* ANTES: Afectaba a lesson-screen */
.screen:not(.game-board) .screen-content {
  overflow-y: auto !important;
}

/* DESPUÉS: Excluye lesson-screen */
.screen:not(.game-board):not(.lesson-screen) .screen-content {
  overflow-y: auto !important;
}
```

### 3. **html, body fijados**
```css
html, body {
  overflow: hidden !important;
  position: fixed !important; /* CRÍTICO para prevenir scroll del body */
}
```

### 4. **Exclusión de lesson-screen de reglas globales**
```css
/* lesson-screen excluida de overflow: visible global */
.screen:not(.game-board):not(.lesson-screen) {
  overflow: visible !important;
}
```

---

## 📊 Conteo de Reglas de Overflow

| Ubicación | Cantidad | Propósito |
|-----------|----------|-----------|
| **Sistema de Lecciones** | **5** | Scroll controlado único |
| **Otras pantallas** | **~170** | Diversos componentes del juego |

---

## 🚫 Anti-Patrones Eliminados

### ❌ NO HACER:
```css
/* Múltiples definiciones del mismo selector */
.step-content-scrollable { overflow-y: auto; }
.step-content-scrollable { scrollbar-width: thin; } /* DUPLICADO */

/* Contenedores padres con scroll */
.lesson-screen { overflow-y: auto; } /* MAL */
.lesson-step { overflow-y: auto; } /* MAL */
```

### ✅ HACER:
```css
/* Una sola definición completa */
.lesson-screen .lesson-step .step-content-scrollable {
  overflow-y: auto !important;
  overflow-x: hidden !important;
  scrollbar-width: thin;
  scrollbar-color: #00FFFF rgba(0, 0, 0, 0.3);
}

/* Todos los padres sin scroll */
.lesson-screen { overflow: hidden !important; }
.lesson-step { overflow: hidden !important; }
```

---

## 🎨 Scrollbar Personalizado

### Webkit (Chrome, Edge, Safari)
```css
.step-content-scrollable::-webkit-scrollbar {
  width: 10px !important;
}

.step-content-scrollable::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3) !important;
  border-radius: 5px !important;
}

.step-content-scrollable::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #00BFFF, #00FFFF) !important;
  border-radius: 5px !important;
  border: 1px solid rgba(0, 255, 255, 0.5) !important;
}

.step-content-scrollable::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #00FFFF, #FFD700) !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.6) !important;
}
```

### Firefox
```css
.step-content-scrollable {
  scrollbar-width: thin;
  scrollbar-color: #00FFFF rgba(0, 0, 0, 0.3);
}
```

---

## 🧪 Verificación

### Para verificar que solo hay UN scroll:
1. Abrir DevTools (F12)
2. Ir a una lección
3. Inspeccionar elementos:
   - `html, body` → debe tener `overflow: hidden`
   - `.lesson-screen` → debe tener `overflow: hidden`
   - `.step-content-scrollable` → debe tener `overflow-y: auto`
4. Verificar visualmente: **debe haber solo UNA barra de scroll** a la derecha del contenido

---

## 📝 Archivos Modificados

- `src/styles/components.css` (líneas 1-8500)
  - Eliminadas ~50 líneas de código duplicado
  - Simplificadas reglas de overflow
  - Agregada documentación inline

---

## 🔮 Mantenimiento Futuro

### Al agregar nuevas lecciones:
1. ✅ El contenido HTML va dentro de `.step-content`
2. ✅ NO agregar clases con `overflow` en el contenido
3. ✅ Dejar que `.step-content-scrollable` maneje todo el scroll

### Al modificar estilos:
1. ❌ NO agregar más reglas de `overflow` a elementos padres
2. ❌ NO duplicar selectores para `.step-content-scrollable`
3. ✅ Mantener UN SOLO punto de scroll

---

## 📞 Soporte

Si aparece un segundo scrollbar:
1. Verificar que `html, body` tenga `position: fixed`
2. Verificar que `.lesson-screen` tenga `overflow: hidden`
3. Buscar reglas globales que afecten a `.lesson-screen`
4. Usar DevTools para identificar qué elemento tiene scroll no deseado

---

**Última actualización**: 2025-10-01
**Responsable**: Sistema de Tutorial Interactivo
**Estado**: ✅ Optimizado y Documentado
