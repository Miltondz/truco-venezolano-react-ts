# Notas Técnicas - Truco React TypeScript

## 📋 **Información General**
- **Proyecto**: Truco Venezolano en React TypeScript
- **Versión**: 0.1.0
- **Framework**: React 18+ con TypeScript
- **Estilo**: CSS Modules + CSS Variables
- **Tema**: Cyberpunk/Neon con elementos pixel art

---

## 🛠️ **Problemas Técnicos Resueltos**

### 1. **Tutorial - Sistema de Scroll (Sept 28, 2025)**
- **Problema**: Contenido cortado en lecciones, scroll no funcional
- **Solución**: Reestructuración de layout con Flexbox y reglas CSS ultra específicas
- **Archivos afectados**: `LessonScreen.tsx`, `components.css`, `tutorialLessons.tsx`
- **Documentación**: [LESSON_SCROLL_ISSUES.md](./LESSON_SCROLL_ISSUES.md)

---

## 🏗️ **Arquitectura del Proyecto**

### Estructura de Directorios:
```
src/
├── components/           # Componentes React
│   ├── GameBoard.tsx    # Tablero principal del juego
│   ├── LessonScreen.tsx # Sistema de lecciones del tutorial
│   └── TutorialScreen.tsx # Pantalla principal del tutorial
├── data/                # Datos del juego
│   └── tutorialLessons.tsx # Contenido de las lecciones
├── styles/              # Estilos CSS
│   ├── App.css         # Estilos principales
│   ├── components.css  # Estilos de componentes
│   └── variables.css   # Variables CSS globales
├── types/              # Definiciones TypeScript
│   └── index.ts        # Tipos principales del juego
└── utils/              # Utilidades
    ├── gameLogic.ts    # Lógica del juego
    └── testFramework.ts # Framework de testing
```

### Componentes Principales:
1. **App.tsx** - Componente raíz con gestión de estado global
2. **GameBoard.tsx** - Tablero de juego con lógica principal
3. **TutorialScreen.tsx** - Sistema de tutorial interactivo
4. **LessonScreen.tsx** - Renderizador individual de lecciones

---

## 🎨 **Sistema de Estilos**

### Variables CSS Principales:
```css
:root {
  /* Colores primarios */
  --primary-bg: #0F0A30;
  --secondary-bg: #1A1143;
  --accent-bg: #2A1E5C;
  
  /* Colores de texto */
  --text-primary: #E0E0E0;
  --text-secondary: #C0C0C0;
  --text-accent: #00FFFF;
  
  /* Efectos neon */
  --border-electric: #00FFFF;
  --glow-primary: 0 0 20px rgba(0, 255, 255, 0.6);
  
  /* Botones */
  --btn1-bg: linear-gradient(135deg, #8A2BE2, #FF69B4);
  --btn2-bg: linear-gradient(135deg, #00CED1, #00BFFF);
}
```

### Clases Principales:
- `.screen` - Contenedor de pantallas
- `.game-canvas` - Canvas principal del juego
- `.lesson-screen` - Contenedor de lecciones
- `.step-content-scrollable` - Área de contenido con scroll

---

## 🎮 **Lógica del Juego**

### Estados Principales:
```typescript
interface GameState {
  gamePhase: 'setup' | 'envido' | 'truco' | 'playing' | 'finished';
  players: Player[];
  currentHand: Card[];
  score: { player1: number; player2: number };
  trucoCalls: TrucoCall[];
  envidoCalls: EnvidoCall[];
}
```

### Sistema de Tutorial:
- **Progresión**: Basada en pasos completados
- **Persistencia**: LocalStorage para guardar progreso
- **Lecciones**: Estructura modular en `tutorialLessons.tsx`
- **Interactividad**: Elementos React embebidos en contenido HTML

---

## 📱 **Responsive Design**

### Breakpoints:
- **Desktop**: > 769px (canvas 1280x720px)
- **Tablet**: 481-768px (layout adaptativo)
- **Mobile**: < 480px (layout vertical)

### Consideraciones:
- Canvas fijo en desktop para consistencia visual
- Layout flexible en mobile
- Botones de tamaño táctil apropiado (min 44px)

---

## 🔧 **Herramientas de Desarrollo**

### Scripts NPM:
```bash
npm start          # Servidor de desarrollo
npm run build      # Compilación para producción
npm test           # Ejecutar tests
npm run eject      # Eject de Create React App
```

### Dependencias Principales:
- React 18+
- TypeScript 4+
- React Scripts (Create React App)

---

## 🐛 **Debugging y Testing**

### Herramientas:
- React DevTools (recomendado)
- Chrome DevTools para CSS
- TypeScript compiler para validación de tipos

### Testing Manual:
1. Verificar funcionalidad del juego principal
2. Probar tutorial completo
3. Verificar responsive design
4. Comprobar persistencia de datos

---

## 📦 **Deploy y Distribución**

### Build Process:
```bash
npm run build     # Genera carpeta build/
serve -s build    # Servidor local para testing
```

### Archivos Generados:
- `build/static/js/` - JavaScript minificado
- `build/static/css/` - CSS minificado
- `build/index.html` - HTML principal

---

## 📝 **Convenciones de Código**

### TypeScript:
- Interfaces para props y estado
- Tipos explícitos para funciones complejas
- Enums para constantes del juego

### CSS:
- Variables CSS para temas consistentes
- Clases BEM para componentes complejos
- Mobile-first para responsive

### React:
- Functional components con hooks
- Estado local vs global claramente definido
- Props drilling evitado cuando sea posible

---

## 🚀 **Futuras Mejoras**

### Funcionalidades Pendientes:
- [ ] Sistema de multijugador online
- [ ] IA más avanzada para oponente
- [ ] Modo torneo
- [ ] Estadísticas detalladas
- [ ] Temas adicionales
- [ ] Sonidos y música

### Optimizaciones Técnicas:
- [ ] Code splitting para mejor performance
- [ ] PWA para instalación offline
- [ ] Testing automatizado
- [ ] CI/CD pipeline

---

## 📚 **Recursos de Referencia**

### Documentación:
- [React Documentation](https://reactjs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

### Juego de Truco:
- Reglas del Truco Venezolano
- Sistemas de puntuación
- Estrategias de juego

---

**Última actualización**: 28 de septiembre, 2025  
**Mantenedor**: Proyecto Open Source