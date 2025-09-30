// Debug script para verificar el layout del selector de oponentes
// Ejecuta este código en la consola del navegador cuando estés en la pantalla Setup

function debugOpponentLayout() {
  console.log('=== DEBUGGING OPPONENT LAYOUT ===');
  
  // Verificar elementos principales
  const setupScreen = document.getElementById('setup-screen');
  const opponentSection = document.querySelector('.setup-section.opponent-section');
  const opponentSelector = document.querySelector('.opponent-selector');
  const opponentCard = document.querySelector('.opponent-card');
  const navButtons = document.querySelector('.opponent-nav-buttons');
  
  console.log('1. ELEMENTOS ENCONTRADOS:');
  console.log('setup-screen:', setupScreen ? '✓' : '✗');
  console.log('opponent-section:', opponentSection ? '✓' : '✗');
  console.log('opponent-selector:', opponentSelector ? '✓' : '✗');
  console.log('opponent-card:', opponentCard ? '✓' : '✗');
  console.log('nav-buttons:', navButtons ? '✓' : '✗');
  
  if (opponentSection) {
    const rect = opponentSection.getBoundingClientRect();
    const styles = window.getComputedStyle(opponentSection);
    
    console.log('\n2. OPPONENT-SECTION DIMENSIONS:');
    console.log(`Tamaño: ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px`);
    console.log(`Max-height CSS: ${styles.maxHeight}`);
    console.log(`Overflow CSS: ${styles.overflow}`);
    console.log(`Padding: ${styles.padding}`);
    
    // Verificar si se desborda
    const isOverflowing = opponentSection.scrollHeight > opponentSection.clientHeight;
    console.log(`¿Se desborda verticalmente? ${isOverflowing ? '⚠️ SÍ' : '✓ NO'}`);
    if (isOverflowing) {
      console.log(`Content height: ${opponentSection.scrollHeight}px vs Container: ${opponentSection.clientHeight}px`);
    }
  }
  
  if (opponentSelector) {
    const rect = opponentSelector.getBoundingClientRect();
    const styles = window.getComputedStyle(opponentSelector);
    
    console.log('\n3. OPPONENT-SELECTOR DIMENSIONS:');
    console.log(`Tamaño: ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px`);
    console.log(`Max-height CSS: ${styles.maxHeight}`);
    console.log(`Overflow CSS: ${styles.overflow}`);
  }
  
  if (opponentCard) {
    const rect = opponentCard.getBoundingClientRect();
    const styles = window.getComputedStyle(opponentCard);
    
    console.log('\n4. OPPONENT-CARD DIMENSIONS:');
    console.log(`Tamaño: ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px`);
    console.log(`Max-height CSS: ${styles.maxHeight}`);
    console.log(`Grid template: ${styles.gridTemplateColumns} / ${styles.gridTemplateRows}`);
    console.log(`Gap: ${styles.gap}`);
  }
  
  if (navButtons) {
    const rect = navButtons.getBoundingClientRect();
    const parentRect = opponentSection ? opponentSection.getBoundingClientRect() : null;
    
    console.log('\n5. NAV-BUTTONS POSITION:');
    console.log(`Buttons position: ${rect.left.toFixed(0)}, ${rect.top.toFixed(0)}`);
    console.log(`Buttons size: ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px`);
    
    if (parentRect) {
      const isOutside = rect.bottom > parentRect.bottom || rect.right > parentRect.right || 
                       rect.left < parentRect.left || rect.top < parentRect.top;
      console.log(`¿Fuera del contenedor? ${isOutside ? '⚠️ SÍ' : '✓ NO'}`);
      
      if (isOutside) {
        console.log('Parent bounds:', {
          left: parentRect.left.toFixed(0),
          top: parentRect.top.toFixed(0), 
          right: parentRect.right.toFixed(0),
          bottom: parentRect.bottom.toFixed(0)
        });
        console.log('Buttons bounds:', {
          left: rect.left.toFixed(0),
          top: rect.top.toFixed(0),
          right: rect.right.toFixed(0), 
          bottom: rect.bottom.toFixed(0)
        });
      }
    }
  }
  
  // Verificar layout específico
  const avatar = document.querySelector('.opponent-avatar');
  const description = document.querySelector('.opponent-description');
  const stats = document.querySelector('.opponent-stats');
  const tags = document.querySelector('.opponent-tags');
  
  console.log('\n6. LAYOUT VERIFICATION:');
  if (avatar && description) {
    const avatarRect = avatar.getBoundingClientRect();
    const descRect = description.getBoundingClientRect();
    const isDescBelow = descRect.top > avatarRect.bottom - 10; // 10px tolerance
    console.log(`¿Descripción bajo avatar? ${isDescBelow ? '✓ SÍ' : '⚠️ NO'}`);
  }
  
  if (avatar && stats) {
    const avatarRect = avatar.getBoundingClientRect();
    const statsRect = stats.getBoundingClientRect();
    const isStatsRight = statsRect.left > avatarRect.right - 10; // 10px tolerance
    console.log(`¿Stats a la derecha del avatar? ${isStatsRight ? '✓ SÍ' : '⚠️ NO'}`);
  }
  
  console.log('\n=== FIN DEBUG ===');
  
  return {
    opponentSection,
    opponentSelector,
    opponentCard,
    navButtons
  };
}

// Ejecutar automáticamente si estamos en setup screen
if (document.getElementById('setup-screen')) {
  console.log('Ejecutando debug automáticamente...');
  debugOpponentLayout();
} else {
  console.log('Navega a la pantalla Setup y ejecuta: debugOpponentLayout()');
}