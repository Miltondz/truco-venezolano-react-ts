# 🎴 Truco Venezolano - React TypeScript Edition

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Una implementación digital completa del **Truco Venezolano**, el popular juego de cartas tradicional de Venezuela, desarrollado con React y TypeScript. Esta versión mantiene toda la autenticidad del juego tradicional mientras ofrece una experiencia moderna con interfaz visual inspirada en Balatro.

## 🎯 ¿Qué es Truco Venezolano?

### Antecedentes Históricos

El Truco es un juego de cartas que se originó en España durante la Edad Media, evolucionando a través de las colonias españolas en América Latina. En Venezuela, el Truco se juega con una baraja española de 40 cartas (sin los 8s y 9s) y tiene reglas específicas que lo distinguen de otras variantes latinoamericanas.

El juego llegó a Venezuela durante la época colonial española y se popularizó especialmente en las zonas rurales y urbanas, convirtiéndose en parte integral de la cultura venezolana. Se juega tradicionalmente en mesas de dominó, con bebidas y conversaciones animadas, siendo un elemento social importante en reuniones familiares y entre amigos.

### Reglas del Juego

#### 🎴 Baraja y Cartas
- **Baraja**: Española de 40 cartas (sin 8s y 9s)
- **Palos**: Espadas (♠), Bastos (♣), Oros (♦), Copas (♥)
- **Valores**: 1 (As), 2, 3, 4, 5, 6, 7, 10 (Sota), 11 (Caballo), 12 (Rey)

#### 🏆 Jerarquía de Cartas (de mayor a menor)
1. **As de Espadas** (14 puntos) - La carta más poderosa
2. **As de Bastos** (13 puntos)
3. **7 de Espadas** (12 puntos)
4. **7 de Oros** (11 puntos)
5. **3 de cualquier palo** (10 puntos)
6. **2 de cualquier palo** (9 puntos)
7. **As del resto de palos** (8 puntos)
8. **Rey de cualquier palo** (7 puntos)
9. **Caballo de cualquier palo** (6 puntos)
10. **Sota de cualquier palo** (5 puntos)
11. **7 del resto de palos** (4 puntos)
12. **6 de cualquier palo** (3 puntos)
13. **5 de cualquier palo** (2 puntos)
14. **4 de cualquier palo** (1 punto)

#### 🎮 Mecánica del Juego

##### Estructura Básica
- **Jugadores**: 2 (humano vs computadora)
- **Cartas por jugador**: 3 por mano
- **Rondas por mano**: Hasta 3 (al mejor de 3)
- **Objetivo**: Llegar primero a 30 puntos

##### Desarrollo de una Mano
1. **Reparto**: Cada jugador recibe 3 cartas
2. **Rondas**: Se juegan hasta 3 rondas
3. **Ganador de ronda**: Carta más alta gana la ronda
4. **Ganador de mano**: Quien gane 2 de 3 rondas
5. **Puntuación**: El ganador suma puntos según apuestas

#### 🎵 Sistema de Apuestas - Envido

El Envido se canta cuando tienes 2 cartas del mismo palo. Los puntos se calculan sumando los valores de las cartas del mismo palo (las figuras valen 0).

**Tipos de Envido:**
- **Envido**: Apuesta base (2 puntos)
- **Real Envido**: Apuesta más alta (3 puntos)
- **Falta Envido**: Apuesta todos los puntos restantes para llegar a 30

**Cálculo de puntos:**
- Suma los valores de las cartas del mismo palo
- Si la suma es menor a 20, se le suman 20 puntos
- Ejemplo: As(1) + 3(3) = 4 → 4 + 20 = 24 puntos

#### ⚡ Sistema de Apuestas - Truco

El Truco aumenta la apuesta de la mano en juego.

**Niveles de Truco:**
- **Truco**: Aumenta a 2 puntos
- **Retruco**: Respuesta, aumenta a 3 puntos
- **Vale 4**: Máxima apuesta, aumenta a 4 puntos

**Dinámica:**
- Un jugador canta "Truco"
- El oponente puede aceptar, rechazar o subir la apuesta
- Si rechaza, pierde los puntos de la apuesta anterior
- Si acepta, continúa el juego con apuesta aumentada

#### 🌸 La Flor

**Condición**: Tres cartas del mismo palo
**Valor**: 3 puntos automáticos (sin importar las cartas)
**Dinámica**: Se canta antes de jugar cualquier carta y gana automáticamente

#### 🃏 Desarrollo del Juego

1. **Inicio**: Se reparten 3 cartas a cada jugador
2. **Fase de cantos**: Se pueden cantar Envido, Flor, o Truco
3. **Juego de cartas**: Se juegan las 3 rondas
4. **Evaluación**: Se determina ganador de rondas y mano
5. **Puntuación**: Se suman puntos según apuestas aceptadas
6. **Continuación**: Nueva mano hasta llegar a 30 puntos

#### 🏅 Sistema de Puntuación

| Acción | Puntos |
|--------|--------|
| Mano normal | 1 |
| Truco aceptado | 2 |
| Retruco aceptado | 3 |
| Vale 4 aceptado | 4 |
| Envido | 2 |
| Real Envido | 3 |
| Falta Envido | Puntos restantes |
| Flor | 3 |

## 🏗️ Arquitectura de la Aplicación

### Estructura de Componentes

```
src/
├── components/           # Componentes React
│   ├── App.tsx          # Componente principal
│   ├── MainScreen.tsx   # Pantalla principal/menú
│   ├── SetupScreen.tsx  # Selección de deck y tablero
│   ├── DifficultyScreen.tsx # Selección de dificultad IA
│   ├── GameBoard.tsx    # Tablero de juego principal
│   ├── Card.tsx         # Componente de carta individual
│   ├── InstructionsScreen.tsx # Pantalla de instrucciones
│   ├── StatsScreen.tsx  # Estadísticas del jugador
│   ├── AchievementsScreen.tsx # Logros desbloqueables
│   ├── SettingsScreen.tsx # Configuración del juego
│   ├── TutorialScreen.tsx # Tutorial interactivo
│   ├── LoadingScreen.tsx # Pantalla de carga
│   ├── Notification.tsx # Notificaciones toast
│   ├── Modal.tsx        # Modales de confirmación
│   └── AchievementPopup.tsx # Popups de logros
├── styles/              # Estilos CSS
│   ├── variables.css    # Variables CSS personalizadas
│   ├── App.css          # Estilos principales
│   └── components.css   # Estilos de componentes
├── types/               # Definiciones TypeScript
│   └── index.ts         # Interfaces y tipos
├── utils/               # Utilidades y lógica de juego
│   ├── cards.ts         # Datos de cartas y jerarquía
│   ├── gameLogic.ts     # Lógica principal del juego
│   ├── ai.ts            # Inteligencia artificial
│   ├── sound.ts         # Sistema de audio
│   └── storage.ts       # Persistencia localStorage
└── assets/              # Recursos estáticos
    └── images/          # Imágenes de cartas, fondos, avatares
```

### Flujo de la Aplicación

1. **Inicialización**: Carga configuración, estadísticas y logros desde localStorage
2. **Pantalla Principal**: Menú con opciones de juego, tutorial, estadísticas, etc.
3. **Configuración**: Selección de deck de cartas y fondo de tablero
4. **Dificultad**: Elección del nivel de IA (Principiante, Intermedio, Experto, Maestro)
5. **Juego**: Loop principal con reparto, cantos, juego de cartas y evaluación
6. **Resultados**: Actualización de estadísticas y verificación de logros

### Gestión de Estado

La aplicación utiliza React hooks para manejar el estado:

- **gameState**: Estado actual del juego (cartas, puntuación, turno, etc.)
- **gameSettings**: Configuración del usuario (sonido, animaciones, dificultad, etc.)
- **playerStats**: Estadísticas persistentes del jugador
- **achievements**: Sistema de logros desbloqueables

### Sistema de IA

**Niveles de Dificultad:**

1. **Principiante**: Juega aleatoriamente, consejos activados
2. **Intermedio**: IA básica con lógica simple de ganar rondas
3. **Experto**: IA avanzada que considera estrategia a largo plazo
4. **Maestro**: IA perfecta con decisiones óptimas

**Personalidades de IA:**
- **Equilibrada**: Decisiones balanceadas
- **Agresiva**: Tiende a aceptar apuestas
- **Conservadora**: Prefiere rechazar riesgos
- **Impredecible**: Comportamiento aleatorio

## 🔧 Aspectos Técnicos

### Tecnologías Utilizadas

- **React 18**: Framework principal con hooks y componentes funcionales
- **TypeScript**: Tipado estático completo para mayor robustez
- **CSS3**: Estilos modernos con variables CSS y animaciones
- **Web Audio API**: Sistema de sonido procedural
- **localStorage**: Persistencia de datos del usuario
- **Canvas API**: Efectos visuales y partículas (planeado)

### Características Técnicas

#### 🎨 Diseño Visual
- **Estilo Balatro**: Inspirado en el popular juego de cartas
- **Canvas Optimizado**: Área de juego fija 1280x720 con fondo negro
- **Pixel Art**: Gráficos retro con estética nostálgica
- **Animaciones CSS**: Transiciones fluidas y efectos hover
- **Responsive Design**: Adaptable a móviles y desktop
- **Tema Oscuro**: Interfaz oscura con acentos dorados
- **Efectos de Zoom**: Vista previa 2x en selección de cartas y tableros

#### 🎵 Sistema de Audio
- **Audio Procedural**: Sonidos generados con Web Audio API
- **Efectos de Sonido**: Feedback auditivo para acciones del juego
- **Música de Fondo**: Ambientación opcional
- **Controles de Volumen**: Ajustes independientes para efectos y música

#### 💾 Persistencia de Datos
- **localStorage**: Guardado automático de progreso
- **Estadísticas**: Seguimiento detallado de rendimiento
- **Configuración**: Preferencias personalizables
- **Logros**: Sistema de desbloqueables persistente

#### 🎯 Optimizaciones
- **Lazy Loading**: Carga diferida de componentes
- **Memoización**: Optimización con React.memo y useMemo
- **Bundle Splitting**: División del código para mejor performance
- **Image Optimization**: Sprites y formatos optimizados

### Arquitectura de Código

#### Principios SOLID
- **Single Responsibility**: Cada componente tiene una responsabilidad clara
- **Open/Closed**: Fácil extensión sin modificar código existente
- **Liskov Substitution**: Interfaces consistentes
- **Interface Segregation**: Interfaces específicas por funcionalidad
- **Dependency Inversion**: Dependencias abstractas

#### Patrones de Diseño
- **Observer Pattern**: Gestión de estado con React hooks
- **Factory Pattern**: Creación de componentes de cartas
- **Strategy Pattern**: Diferentes algoritmos de IA
- **Command Pattern**: Sistema de acciones del juego

## 🚀 Posibles Mejoras y Características Futuras

### 🎮 Funcionalidades del Juego
- **Multijugador Online**: Modo PvP con WebSockets
- **Modo Torneo**: Series de juegos con brackets
- **Cartas Especiales**: Poderes únicos y modificadores
- **Modo Historia**: Campaña con narrativa
- **Logros Avanzados**: Más objetivos desbloqueables

### 🎨 Mejoras Visuales
- **Animaciones Avanzadas**: Sistema de partículas completo
- **Efectos Especiales**: Shaders y filtros visuales
- **Temas Personalizables**: Skins y personalizaciones
- **Modo Accesibilidad**: Alto contraste y navegación por teclado
- **Animaciones 3D**: Efectos tridimensionales con Three.js

### 🔊 Audio y Multimedia
- **Banda Sonora Original**: Música compuesta específicamente
- **Efectos de Ambiente**: Sonidos ambientales contextuales
- **Narración por Voz**: Guía auditiva para tutoriales
- **Audio 3D**: Efectos posicionales inmersivos

### 🤖 Inteligencia Artificial
- **Machine Learning**: IA que aprende del jugador
- **Personalización Avanzada**: IA que adapta estilo de juego
- **Modos de Dificultad Dinámica**: Ajuste automático según rendimiento
- **Análisis Post-Juego**: Estadísticas detalladas de decisiones

### 📱 Experiencia Móvil
- **Progressive Web App**: Instalable como aplicación nativa
- **Controles Táctiles**: Optimizados para pantallas touch
- **Modo Offline**: Juego completo sin conexión
- **Sincronización**: Progreso entre dispositivos

### 🔧 Mejoras Técnicas
- **WebAssembly**: Optimizaciones de performance críticas
- **Service Workers**: Caching avanzado y offline
- **WebRTC**: Comunicación peer-to-peer para multijugador
- **WebGL**: Gráficos 3D y efectos avanzados
- **Testing Suite**: Cobertura completa de tests unitarios e integración

### 🌐 Internacionalización
- **Múltiples Idiomas**: Soporte para español, inglés, portugués
- **Variantes Regionales**: Diferentes reglas por país
- **Contenido Localizado**: Adaptaciones culturales específicas

### 📊 Analytics y Telemetría
- **Seguimiento de Uso**: Métricas de engagement anónimas
- **Análisis de Jugabilidad**: Balance y dificultad
- **Feedback del Usuario**: Sistema de reportes integrado
- **Actualizaciones Dinámicas**: Contenido descargable

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js 16+
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/truco-venezolano-react.git
cd truco-venezolano-react

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start

# Construir para producción
npm run build
```

### Scripts Disponibles
- `npm start`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm test`: Ejecuta los tests
- `npm run eject`: Expulsa la configuración (irreversible)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- Inspirado en el Truco Venezolano tradicional
- Estilo visual inspirado en **Balatro** de LocalThunk
- Comunidad de desarrollo React y TypeScript
- Jugadores de Truco que mantienen viva la tradición

---

**¡Disfruta del Truco Venezolano en su forma más moderna!** 🎴⚡
