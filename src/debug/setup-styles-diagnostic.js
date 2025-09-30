// Script de diagnóstico para verificar qué estilos se están aplicando realmente
// Ejecutar en la consola cuando estés en la pantalla Setup

function diagnosticSetupStyles() {
  console.log('=== DIAGNÓSTICO DE ESTILOS EN SETUP SCREEN ===\n');
  
  // 1. Verificar si estamos en setup screen
  const setupScreen = document.getElementById('setup-screen');
  if (!setupScreen) {
    console.error('❌ No estás en la pantalla Setup. Navega allí primero.');
    return;
  }
  
  // 2. Analizar setup-grid
  console.log('1️⃣ SETUP-GRID:');
  const setupGrid = setupScreen.querySelector('.setup-grid');
  if (setupGrid) {
    const computed = window.getComputedStyle(setupGrid);
    console.log(`  Gap: ${computed.gap}`);
    console.log(`  Overflow: ${computed.overflow}`);
    console.log(`  Overflow-X: ${computed.overflowX}`);
    console.log(`  Overflow-Y: ${computed.overflowY}`);
    console.log(`  Max-Height: ${computed.maxHeight}`);
    
    // Verificar qué regla CSS está ganando
    const rules = window.getMatchedCSSRules ? window.getMatchedCSSRules(setupGrid) : null;
    if (rules) {
      console.log('  Reglas aplicadas:', rules.length);
    }
  }
  
  // 3. Analizar selection-grid
  console.log('\n2️⃣ SELECTION-GRID:');
  const selectionGrids = setupScreen.querySelectorAll('.selection-grid');
  selectionGrids.forEach((grid, index) => {
    const computed = window.getComputedStyle(grid);
    console.log(`  Grid #${index + 1}:`);
    console.log(`    Gap: ${computed.gap}`);
    console.log(`    Overflow: ${computed.overflow}`);
  });
  
  // 4. Analizar opponent-section
  console.log('\n3️⃣ OPPONENT-SECTION:');
  const opponentSection = setupScreen.querySelector('.setup-section.opponent-section');
  if (opponentSection) {
    const computed = window.getComputedStyle(opponentSection);
    console.log(`  Max-Width: ${computed.maxWidth}`);
    console.log(`  Max-Height: ${computed.maxHeight}`);
    console.log(`  Overflow: ${computed.overflow}`);
    console.log(`  Width actual: ${opponentSection.offsetWidth}px`);
  }
  
  // 5. Detectar reglas !important problemáticas
  console.log('\n4️⃣ DETECCIÓN DE REGLAS PROBLEMÁTICAS:');
  
  // Buscar todas las hojas de estilo
  const styleSheets = Array.from(document.styleSheets);
  let problematicRules = [];
  
  styleSheets.forEach(sheet => {
    try {
      const rules = Array.from(sheet.cssRules || sheet.rules || []);
      rules.forEach(rule => {
        if (rule.selectorText && rule.style) {
          // Buscar reglas que afectan overflow con !important
          if (rule.selectorText.includes('screen:not(.game-board)') && 
              rule.style.overflow && 
              rule.style.getPropertyPriority('overflow') === 'important') {
            problematicRules.push({
              selector: rule.selectorText,
              overflow: rule.style.overflow,
              source: sheet.href || 'inline'
            });
          }
        }
      });
    } catch (e) {
      // Ignorar errores de CORS
    }
  });
  
  if (problematicRules.length > 0) {
    console.log('  ⚠️ Reglas con overflow !important encontradas:');
    problematicRules.forEach(rule => {
      console.log(`    - "${rule.selector}" -> overflow: ${rule.overflow} !important`);
    });
  }
  
  // 6. Intentar aplicar estilos y ver si funcionan
  console.log('\n5️⃣ TEST DE APLICACIÓN DE ESTILOS:');
  if (opponentSection) {
    const originalWidth = opponentSection.style.maxWidth;
    
    // Intentar cambiar max-width
    opponentSection.style.maxWidth = '800px';
    const newComputed = window.getComputedStyle(opponentSection);
    
    if (newComputed.maxWidth === '800px') {
      console.log('  ✅ Los estilos inline SÍ se pueden aplicar');
    } else {
      console.log(`  ❌ Los estilos inline NO se aplican. Valor computado: ${newComputed.maxWidth}`);
      console.log('     Esto indica que hay una regla CSS con !important que lo sobrescribe');
    }
    
    // Restaurar
    opponentSection.style.maxWidth = originalWidth;
  }
  
  console.log('\n=== FIN DEL DIAGNÓSTICO ===');
  
  return {
    setupGrid,
    selectionGrids,
    opponentSection,
    problematicRules
  };
}

// Función para intentar forzar los estilos deseados
function forceSetupStyles() {
  console.log('\n🔧 FORZANDO ESTILOS CORRECTOS...\n');
  
  // Crear una hoja de estilos con máxima especificidad
  const styleId = 'setup-screen-override-styles';
  let styleSheet = document.getElementById(styleId);
  
  if (!styleSheet) {
    styleSheet = document.createElement('style');
    styleSheet.id = styleId;
    document.head.appendChild(styleSheet);
  }
  
  styleSheet.textContent = `
    /* Override problemático overflow hidden */
    #setup-screen.screen.active .setup-grid {
      gap: 0.5rem !important;
      overflow: visible !important;
    }
    
    #setup-screen.screen.active .selection-grid {
      gap: 0.05rem !important;
      overflow: visible !important;
    }
    
    #setup-screen.screen.active .setup-section.opponent-section {
      max-width: 700px !important;
      overflow: hidden !important;
    }
    
    #setup-screen.screen.active .setup-section:not(.opponent-section) {
      overflow-y: auto !important;
      overflow-x: hidden !important;
      max-height: 380px !important;
    }
    
    /* Asegurar que los items puedan hacer hover */
    #setup-screen.screen.active .selection-item:hover {
      overflow: visible !important;
      z-index: 9999 !important;
      transform: scale(2) !important;
    }
  `;
  
  console.log('✅ Estilos override aplicados. Verifica si ahora funcionan correctamente.');
}

// Ejecutar diagnóstico automáticamente
console.log('Ejecutando diagnóstico...');
const result = diagnosticSetupStyles();

// Preguntar si quiere aplicar fix
console.log('\n💡 Para aplicar los estilos correctos, ejecuta: forceSetupStyles()');