// Script para verificar si las nuevas reglas CSS están funcionando
// Ejecutar en la consola cuando estés en la pantalla Setup

function verifyWidthOverride() {
  console.log('=== VERIFICANDO OVERRIDE DE RESTRICCIONES DE ANCHO ===\n');
  
  const setupScreen = document.getElementById('setup-screen');
  if (!setupScreen) {
    console.error('❌ No estás en Setup Screen. Ve a "Preparar Partida" primero.');
    return;
  }
  
  // Verificar opponent-section
  const opponentSection = setupScreen.querySelector('.setup-section.opponent-section');
  if (opponentSection) {
    const styles = window.getComputedStyle(opponentSection);
    const rect = opponentSection.getBoundingClientRect();
    
    console.log('🎯 OPPONENT SECTION:');
    console.log(`  Ancho computado (CSS): ${styles.width}`);
    console.log(`  Ancho real (visual): ${rect.width.toFixed(1)}px`);
    console.log(`  Max-width computado: ${styles.maxWidth}`);
    console.log(`  Min-width computado: ${styles.minWidth}`);
    console.log(`  Flex: ${styles.flex}`);
    console.log(`  Box-sizing: ${styles.boxSizing}`);
    
    if (rect.width >= 700) {
      console.log('  ✅ ÉXITO: El ancho ya NO está restringido a 100%');
    } else {
      console.log('  ❌ PROBLEMA: Aún está limitado por reglas padre');
      
      // Buscar el elemento padre que puede estar limitando
      let parent = opponentSection.parentElement;
      while (parent && parent !== document.body) {
        const parentStyles = window.getComputedStyle(parent);
        const parentRect = parent.getBoundingClientRect();
        
        if (parentRect.width < 700) {
          console.log(`  ⚠️ LIMITADOR: ${parent.className || parent.tagName} tiene ancho de ${parentRect.width.toFixed(1)}px`);
          console.log(`    Max-width: ${parentStyles.maxWidth}`);
          break;
        }
        parent = parent.parentElement;
      }
    }
  }
  
  // Verificar setup-grid
  const setupGrid = setupScreen.querySelector('.setup-grid');
  if (setupGrid) {
    const styles = window.getComputedStyle(setupGrid);
    const rect = setupGrid.getBoundingClientRect();
    
    console.log('\n📐 SETUP-GRID:');
    console.log(`  Ancho computado: ${styles.width}`);
    console.log(`  Ancho real: ${rect.width.toFixed(1)}px`);
    console.log(`  Min-width: ${styles.minWidth}`);
    console.log(`  Max-width: ${styles.maxWidth}`);
    console.log(`  Gap: ${styles.gap}`);
    
    if (rect.width >= 1280) {
      console.log('  ✅ Grid tiene espacio suficiente para contenido');
    } else {
      console.log('  ❌ Grid muy estrecho para acomodar 700px');
    }
  }
  
  // Verificar si las reglas globales problemáticas siguen activas
  console.log('\n🔍 VERIFICANDO REGLAS GLOBALES:');
  
  const gameCanvas = document.querySelector('.game-canvas');
  if (gameCanvas) {
    const canvasStyles = window.getComputedStyle(gameCanvas);
    console.log(`  .game-canvas width: ${canvasStyles.width}`);
    console.log(`  .game-canvas max-width: ${canvasStyles.maxWidth}`);
  }
  
  // Test dinámico
  console.log('\n🧪 TEST DINÁMICO:');
  if (opponentSection) {
    // Intentar forzar 800px para ver si funciona
    const originalWidth = opponentSection.style.width;
    opponentSection.style.width = '800px';
    opponentSection.style.minWidth = '800px';
    opponentSection.style.maxWidth = '800px';
    
    // Medir después del cambio
    setTimeout(() => {
      const newRect = opponentSection.getBoundingClientRect();
      if (newRect.width >= 800) {
        console.log('  ✅ Las reglas inline SÍ pueden cambiar el ancho');
      } else {
        console.log('  ❌ Aún hay restricciones que impiden cambios');
      }
      
      // Restaurar
      opponentSection.style.width = originalWidth;
      opponentSection.style.minWidth = '';
      opponentSection.style.maxWidth = '';
    }, 100);
  }
  
  console.log('\n=== FIN VERIFICACIÓN ===');
}

// Función para forzar los anchos específicos manualmente
function forceSpecificWidths() {
  console.log('🔧 FORZANDO ANCHOS ESPECÍFICOS...\n');
  
  const setupScreen = document.getElementById('setup-screen');
  if (!setupScreen) return;
  
  // Forzar ancho del opponent section
  const opponentSection = setupScreen.querySelector('.setup-section.opponent-section');
  if (opponentSection) {
    opponentSection.style.cssText += `
      width: 700px !important;
      min-width: 700px !important;
      max-width: 700px !important;
      flex: 0 0 700px !important;
      flex-shrink: 0 !important;
    `;
  }
  
  // Forzar ancho de otras secciones
  const otherSections = setupScreen.querySelectorAll('.setup-section:not(.opponent-section)');
  otherSections.forEach(section => {
    section.style.cssText += `
      width: 290px !important;
      min-width: 290px !important;
      max-width: 290px !important;
      flex: 0 0 290px !important;
      flex-shrink: 0 !important;
    `;
  });
  
  // Asegurar que el grid tenga espacio
  const setupGrid = setupScreen.querySelector('.setup-grid');
  if (setupGrid) {
    setupGrid.style.cssText += `
      min-width: 1280px !important;
      max-width: none !important;
      width: 100% !important;
    `;
  }
  
  console.log('✅ Anchos forzados aplicados');
}

// Ejecutar verificación automáticamente
verifyWidthOverride();

console.log('\n💡 Para forzar anchos manualmente: forceSpecificWidths()');