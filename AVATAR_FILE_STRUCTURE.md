# Estructura de Archivos de Avatar - Avatar File Structure

## Problemas Corregidos ✅

### 1. **Bucle Infinito de Carga de Imágenes**
- **Problema:** Los avatares parpadeaban constantemente intentando cargar imágenes
- **Causa:** El `onError` creaba un bucle infinito
- **Solución:** Agregado sistema de estado para prevenir bucles infinitos

### 2. **Prefijo Correcto para Jugador** 
- **Problema:** Avatar del jugador no usaba el prefijo correcto
- **Corrección:** Ahora usa `player-` como prefijo para todos los moods

## Estructura de Archivos Correcta

### 📁 `/public/images/avatars/`

#### **Avatar del Jugador (Player)**
```
player-default.jpg    <- Avatar default del jugador
player-happy.jpg      <- Jugador feliz
player-sad.jpg        <- Jugador triste  
player-smug.jpg       <- Jugador confiado/presumido
```

#### **Avatares del Oponente (Computer)**
```
avatar1.jpg           <- Avatar 1 default
avatar1-happy.jpg     <- Avatar 1 feliz
avatar1-sad.jpg       <- Avatar 1 triste
avatar1-smug.jpg      <- Avatar 1 confiado

avatar2.jpg           <- Avatar 2 default  
avatar2-happy.jpg     <- Avatar 2 feliz
avatar2-sad.jpg       <- Avatar 2 triste
avatar2-smug.jpg      <- Avatar 2 confiado

... (y así sucesivamente para cada avatar disponible)
```

## Sistema de Carga Corregido

### **GameBoard.tsx**
```typescript
// Estado para prevenir bucles infinitos
const [avatarErrors, setAvatarErrors] = useState<{computer: boolean, player: boolean}>({
  computer: false, 
  player: false
});

// Manejo de errores sin bucles
const handleAvatarError = (e, isPlayer) => {
  const errorKey = isPlayer ? 'player' : 'computer';
  if (!avatarErrors[errorKey]) {
    // Solo intenta fallback una vez
    img.src = getFallbackAvatarPath(gameState.selectedAvatar, isPlayer);
    setAvatarErrors(prev => ({ ...prev, [errorKey]: true }));
  }
};
```

### **Rutas de Imagen Actualizadas**
```typescript
// avatarMoods.ts - getAvatarImagePath
if (isPlayer) {
  // Jugador SIEMPRE usa prefijo 'player-'
  if (mood === 'default') {
    return '/images/avatars/player-default.jpg';
  } else {
    return `/images/avatars/player-${mood}.jpg`;
  }
} else {
  // Oponente usa avatar seleccionado
  if (mood === 'default') {
    return `/images/avatars/${baseAvatar}`; // ej: avatar1.jpg
  } else {
    return `/images/avatars/${avatarName}-${mood}.jpg`; // ej: avatar1-happy.jpg
  }
}
```

## Fallbacks del Sistema

### **Jugador**
1. Intenta: `player-default.jpg` 
2. Si falla: Para de intentar (evita bucle)

### **Oponente**  
1. Intenta: `avatar1.jpg` (o el seleccionado)
2. Si falla: Para de intentar (evita bucle)

## Estado Actual del Sistema

### ✅ **Funcionando Correctamente:**
1. **Sin bucles infinitos** - Sistema de estado previene parpadeo
2. **Nomenclatura correcta** - `player-default.jpg` para jugador
3. **Fallbacks robustos** - Una sola oportunidad de fallback
4. **Reset de errores** - Se resetea cuando cambian los moods

### ⚠️ **Requiere Archivos de Imagen:**
Para que funcione completamente, necesitas crear/colocar estos archivos:

#### **Mínimo Requerido (para que no haya errores):**
```
/public/images/avatars/
├── player-default.jpg     <- REQUERIDO para jugador
├── avatar1.jpg           <- REQUERIDO para oponente default
├── avatar2.jpg           <- Si usas este avatar
├── avatar3.jpg           <- Si usas este avatar
└── ...
```

#### **Para Sistema Completo de Moods:**
```
/public/images/avatars/
├── player-default.jpg
├── player-happy.jpg
├── player-sad.jpg
├── player-smug.jpg
├── avatar1.jpg
├── avatar1-happy.jpg
├── avatar1-sad.jpg
├── avatar1-smug.jpg
└── ... (para cada avatar disponible)
```

## Testing

### **Para verificar que funciona:**
1. **Abrir consola del navegador** (F12)
2. **Iniciar juego**
3. **Verificar que NO aparezcan errores** 404 de imágenes
4. **Los avatares deben mostrarse** sin parpadear

### **Si siguen parpadeando:**
- Significa que las imágenes `player-default.jpg` y/o `avatar1.jpg` no existen
- Crear archivos placeholder o copiar imágenes existentes con los nombres correctos

## Build Status
- ✅ **Compilación exitosa** 
- ✅ **Sistema de prevención de bucles implementado**
- ✅ **Nomenclatura corregida a `player-` prefix**
- ✅ **Listo para usar con archivos de imagen apropiados**
