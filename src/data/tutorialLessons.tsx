import React from 'react';
import { TutorialLesson } from '../types';

// Componente para mostrar cartas visualmente en las lecciones
const CardDisplay: React.FC<{ cards: string[] }> = ({ cards }) => (
  <div className="tutorial-cards-display">
    {cards.map((card, index) => (
      <div key={index} className="tutorial-card">
        {card}
      </div>
    ))}
  </div>
);

// Componente para ejemplos de puntos
const PointsExample: React.FC<{ title: string; description: string; points: number }> = ({ 
  title, description, points 
}) => (
  <div className="points-example">
    <div className="points-example-title">{title}</div>
    <div className="points-example-description">{description}</div>
    <div className="points-example-score">{points} puntos</div>
  </div>
);

export const tutorialLessons: TutorialLesson[] = [
  // ========================================
  // LECCIÓN 1: CARTAS BÁSICAS
  // ========================================
  {
    id: 'cartas-basicas',
    title: 'Cartas Básicas',
    description: 'Aprende sobre las cartas, sus valores y jerarquía en el Truco',
    icon: '🃏',
    difficulty: 'beginner',
    estimatedTime: 8,
    completionReward: 'Desbloqueaste conocimiento sobre la baraja española',
    steps: [
      {
        id: 'baraja-espanola',
        title: 'La Baraja Española',
        content: `
          <p>El Truco se juega con una <strong>baraja española de 40 cartas</strong>, sin 8, 9 y 10.</p>
          <p>Los <strong>cuatro palos</strong> son:</p>
          <ul>
            <li><span style="color: var(--danger-color);">♦️ <strong>Oro</strong></span> (Diamantes)</li>
            <li><span style="color: var(--danger-color);">♥️ <strong>Copa</strong></span> (Corazones)</li>
            <li><strong>♠️ Espada</strong> (Picas)</li>
            <li><strong>♣️ Basto</strong> (Tréboles)</li>
          </ul>
          <p>Cada palo tiene: <strong>1, 2, 3, 4, 5, 6, 7, 11 (Sota), 12 (Caballo), 13 (Rey)</strong></p>
        `,
        interactiveElement: <CardDisplay cards={['A♦️', '2♥️', '3♠️', '4♣️', '5♦️', '6♥️', '7♠️', 'J♣️', 'Q♦️', 'K♥️']} />,
        tips: [
          'El 1 se llama "As" y es muy importante en el juego',
          'Los números 8, 9 y 10 NO se usan en el Truco tradicional',
          'Sota = 11, Caballo = 12, Rey = 13'
        ]
      },
      {
        id: 'jerarquia-cartas',
        title: 'Jerarquía de las Cartas',
        content: `
          <h4>🏆 Orden de Mayor a Menor:</h4>
          <div class="card-hierarchy">
            <div class="hierarchy-level">
              <strong>1️⃣ MAYORES (Las más fuertes):</strong>
              <p>🥇 <strong>1 de Espada</strong> - La carta más fuerte</p>
              <p>🥈 <strong>1 de Basto</strong> - Segunda más fuerte</p>
              <p>🥉 <strong>7 de Espada</strong> - Tercera más fuerte</p>
              <p>🏅 <strong>7 de Oro</strong> - Cuarta más fuerte</p>
            </div>
            
            <div class="hierarchy-level">
              <strong>2️⃣ LOS TRES:</strong>
              <p>Todos los <strong>3</strong> (de cualquier palo) vienen después</p>
            </div>
            
            <div class="hierarchy-level">
              <strong>3️⃣ LOS DOS:</strong>
              <p>Todos los <strong>2</strong> (de cualquier palo)</p>
            </div>
            
            <div class="hierarchy-level">
              <strong>4️⃣ ASES FALSOS:</strong>
              <p><strong>1 de Copa</strong> y <strong>1 de Oro</strong></p>
            </div>
            
            <div class="hierarchy-level">
              <strong>5️⃣ FIGURAS:</strong>
              <p>Rey (12) → Caballo (11) → Sota (10)</p>
            </div>
            
            <div class="hierarchy-level">
              <strong>6️⃣ NÚMEROS:</strong>
              <p>7 → 6 → 5 → 4 (los 7 normales, no los de Oro y Espada)</p>
            </div>
          </div>
        `,
        tips: [
          'Los 4 primeros se llaman "cartas mayores" o "matadores"',
          'Entre cartas del mismo valor, no hay diferencia por palo (excepto los especiales)',
          'Memorizar el orden es clave para ganar en Truco'
        ]
      },
      {
        id: 'cartas-especiales',
        title: 'Cartas Especiales',
        content: `
          <h4>⭐ Las 4 Cartas Más Importantes:</h4>
          
          <div class="special-cards">
            <div class="special-card">
              <div class="card-name">🗡️ AS DE ESPADA</div>
              <div class="card-nickname">"El Espadita"</div>
              <div class="card-description">La carta MÁS FUERTE de toda la baraja. Gana a cualquier otra carta.</div>
            </div>
            
            <div class="special-card">
              <div class="card-name">🏒 AS DE BASTO</div>
              <div class="card-nickname">"El Bastito"</div>
              <div class="card-description">Segunda carta más fuerte. Solo la puede ganar el As de Espada.</div>
            </div>
            
            <div class="special-card">
              <div class="card-name">⚔️ 7 DE ESPADA</div>
              <div class="card-nickname">"El Siete de Espada"</div>
              <div class="card-description">Tercera más fuerte. Una de las cartas más codiciadas.</div>
            </div>
            
            <div class="special-card">
              <div class="card-name">💎 7 DE ORO</div>
              <div class="card-nickname">"El Siete de Oro"</div>
              <div class="card-description">Cuarta más fuerte. Completa las "cartas mayores".</div>
            </div>
          </div>
          
          <div class="important-note">
            <strong>💡 Dato importante:</strong> Si tienes 2 o más de estas cartas, tienes una mano muy fuerte para el Truco.
          </div>
        `,
        tips: [
          'Estas 4 cartas se llaman colectivamente "las cartas mayores"',
          'Con una carta mayor ya puedes pensar en cantar Truco',
          'El As de Espada nunca pierde una mano individual'
        ]
      },
      {
        id: 'comparacion-cartas',
        title: 'Comparando Cartas',
        content: `
          <h4>🎯 Ejemplos de Comparación:</h4>
          
          <div class="card-comparisons">
            <div class="comparison-example">
              <div class="vs-cards">
                <span class="card-winner">As de Espada ⚔️</span>
                <span class="vs">VS</span>
                <span class="card-loser">Cualquier otra carta</span>
              </div>
              <div class="result">✅ <strong>Gana:</strong> As de Espada (siempre)</div>
            </div>
            
            <div class="comparison-example">
              <div class="vs-cards">
                <span class="card-winner">3 de Oro 3️⃣</span>
                <span class="vs">VS</span>
                <span class="card-loser">Rey de Copa 👑</span>
              </div>
              <div class="result">✅ <strong>Gana:</strong> 3 de Oro (los 3 son más fuertes que figuras)</div>
            </div>
            
            <div class="comparison-example">
              <div class="vs-cards">
                <span class="card-winner">2 de Basto 2️⃣</span>
                <span class="vs">VS</span>
                <span class="card-loser">As de Copa ♥️</span>
              </div>
              <div class="result">✅ <strong>Gana:</strong> 2 de Basto (los 2 le ganan a los ases falsos)</div>
            </div>
            
            <div class="comparison-example">
              <div class="vs-cards">
                <span class="card-equal">Rey de Oro 👑</span>
                <span class="vs">VS</span>
                <span class="card-equal">Rey de Espada 👑</span>
              </div>
              <div class="result">🤝 <strong>Empate:</strong> Mismo valor, diferentes palos</div>
            </div>
          </div>
        `,
        tips: [
          'Cuando hay empate en una mano, esa mano se considera "parda"',
          'En caso de empate, se decide en las siguientes manos',
          'Practica comparando cartas hasta que sea automático'
        ]
      }
    ]
  },

  // ========================================
  // LECCIÓN 2: ENVIDO
  // ========================================
  {
    id: 'envido',
    title: 'El Envido',
    description: 'Aprende a calcular y jugar el Envido, la primera fase del juego',
    icon: '🎵',
    difficulty: 'beginner',
    estimatedTime: 10,
    completionReward: 'Ahora puedes calcular puntos de Envido como un experto',
    steps: [
      {
        id: 'que-es-envido',
        title: '¿Qué es el Envido?',
        content: `
          <p>El <strong>Envido</strong> es la primera fase del juego, donde se comparan los <strong>puntos de las cartas</strong> antes de jugar las manos.</p>
          
          <h4>🎯 Objetivo:</h4>
          <p>Tener la mayor cantidad de puntos sumando cartas del <strong>mismo palo</strong>.</p>
          
          <h4>📊 Valores para Envido:</h4>
          <div class="envido-values">
            <div class="value-row"><strong>1, 2, 3, 4, 5, 6, 7</strong> → Valen su número</div>
            <div class="value-row"><strong>Sota, Caballo, Rey</strong> → Valen <strong>0 puntos</strong></div>
          </div>
          
          <div class="important-note">
            ⚠️ <strong>Solo cuentan cartas del mismo palo</strong>. Si no tienes 2 cartas del mismo palo, tu envido es la carta más alta + 20.
          </div>
        `,
        tips: [
          'El Envido se canta ANTES de jugar cualquier carta',
          'Solo importa el palo, no el valor para el truco',
          'Las figuras (Sota, Caballo, Rey) no suman en Envido'
        ]
      },
      {
        id: 'calcular-envido',
        title: 'Cómo Calcular el Envido',
        content: `
          <h4>🧮 Fórmula del Envido:</h4>
          
          <div class="formula">
            <strong>Envido = 20 + (suma de las 2 cartas más altas del mismo palo)</strong>
          </div>
          
          <h4>📝 Ejemplos:</h4>
          
          <div class="envido-examples">
            <div class="example">
              <div class="hand">Mano: 7♦️, 6♦️, 4♠️</div>
              <div class="calculation">Cálculo: 20 + 7 + 6 = <strong>33 puntos</strong></div>
              <div class="explanation">✅ Dos cartas de Oro: 7 y 6</div>
            </div>
            
            <div class="example">
              <div class="hand">Mano: 1♠️, 5♠️, Rey♠️</div>
              <div class="calculation">Cálculo: 20 + 1 + 5 = <strong>26 puntos</strong></div>
              <div class="explanation">✅ Rey vale 0, se usan As(1) y 5</div>
            </div>
            
            <div class="example">
              <div class="hand">Mano: 7♦️, 4♠️, 2♥️</div>
              <div class="calculation">Cálculo: 20 + 7 = <strong>27 puntos</strong></div>
              <div class="explanation">⚠️ Sin pareja, solo carta más alta + 20</div>
            </div>
            
            <div class="example">
              <div class="hand">Mano: Rey♣️, Caballo♠️, Sota♦️</div>
              <div class="calculation">Cálculo: 20 + 0 = <strong>20 puntos</strong></div>
              <div class="explanation">😢 Solo figuras = 20 (mínimo posible)</div>
            </div>
          </div>
        `,
        interactiveElement: <PointsExample 
          title="Practica:" 
          description="Si tienes 6♥️, 4♥️, Rey♠️" 
          points={30} 
        />,
        tips: [
          'Siempre suma 20 como base',
          'Solo cuentan las 2 cartas más altas del mismo palo',
          'El envido mínimo es 20, el máximo es 33 (7+6+20)'
        ]
      },
      {
        id: 'cantos-envido',
        title: 'Cantos del Envido',
        content: `
          <h4>🗣️ Secuencia de Cantos:</h4>
          
          <div class="canto-sequence">
            <div class="canto-level">
              <div class="canto-name">💬 <strong>ENVIDO</strong></div>
              <div class="canto-value">Vale: 2 puntos</div>
              <div class="canto-description">El canto básico del envido</div>
            </div>
            
            <div class="canto-level">
              <div class="canto-name">🔥 <strong>REAL ENVIDO</strong></div>
              <div class="canto-value">Vale: 3 puntos</div>
              <div class="canto-description">Más fuerte que Envido simple</div>
            </div>
            
            <div class="canto-level">
              <div class="canto-name">⚡ <strong>FALTA ENVIDO</strong></div>
              <div class="canto-value">Vale: Los puntos que faltan para ganar</div>
              <div class="canto-description">¡El canto más arriesgado!</div>
            </div>
          </div>
          
          <h4>🎮 Cómo Funciona:</h4>
          <div class="how-it-works">
            <div class="step">
              <strong>1️⃣</strong> Un jugador canta "¡ENVIDO!"
            </div>
            <div class="step">
              <strong>2️⃣</strong> El oponente puede:
              <ul>
                <li><strong>Quiero</strong> → Acepta el envido</li>
                <li><strong>No quiero</strong> → Rechaza (1 punto al cantante)</li>
                <li><strong>Real Envido</strong> → Sube la apuesta</li>
              </ul>
            </div>
            <div class="step">
              <strong>3️⃣</strong> Si acepta: Se comparan puntos, mayor gana
            </div>
          </div>
        `,
        tips: [
          'Canta Envido cuando tengas 28+ puntos',
          'Con 20-25 puntos, mejor no cantar',
          'Falta Envido es muy arriesgado, úsalo solo si estás seguro'
        ]
      },
      {
        id: 'estrategia-envido',
        title: 'Estrategia del Envido',
        content: `
          <h4>🧠 Cuándo Cantar Envido:</h4>
          
          <div class="envido-strategy">
            <div class="strategy-level good">
              <div class="points-range">🔥 <strong>30-33 puntos</strong></div>
              <div class="recommendation">¡Canta siempre! Tienes muy buenas chances</div>
            </div>
            
            <div class="strategy-level ok">
              <div class="points-range">⚡ <strong>27-29 puntos</strong></div>
              <div class="recommendation">Canta, pero cuidado con Real Envido del rival</div>
            </div>
            
            <div class="strategy-level caution">
              <div class="points-range">⚠️ <strong>24-26 puntos</strong></div>
              <div class="recommendation">Dudoso. Depende de tu estilo y el rival</div>
            </div>
            
            <div class="strategy-level bad">
              <div class="points-range">❌ <strong>20-23 puntos</strong></div>
              <div class="recommendation">No cantes. Muy riesgo, poca ganancia</div>
            </div>
          </div>
          
          <h4>🎯 Tips Avanzados:</h4>
          <ul>
            <li><strong>🎭 Blofea ocasionalmente</strong>: Canta con puntos bajos para confundir</li>
            <li><strong>👁️ Observa patrones</strong>: ¿Tu oponente acepta o rechaza mucho?</li>
            <li><strong>🎲 Calcula probabilidades</strong>: ¿Qué puntos es probable que tenga?</li>
            <li><strong>⏰ Timing</strong>: A veces es mejor no cantar si vas ganando el juego</li>
          </ul>
          
          <div class="pro-tip">
            <strong>💎 Consejo de Experto:</strong> El Envido no solo es sobre tus puntos, sino sobre leer a tu oponente y gestionar el riesgo.
          </div>
        `,
        tips: [
          'El Envido es tanto suerte como estrategia',
          'Aprende a leer las reacciones de tu oponente',
          'No siempre cantes con buenas cartas, varía tu juego'
        ]
      }
    ]
  },

  // ========================================
  // LECCIÓN 3: TRUCO
  // ========================================
  {
    id: 'truco',
    title: 'El Truco',
    description: 'Domina la secuencia de cantos de Truco y cuándo usarlos',
    icon: '⚡',
    difficulty: 'intermediate',
    estimatedTime: 12,
    completionReward: 'Eres un maestro del Truco y sus cantos',
    steps: [
      {
        id: 'que-es-truco',
        title: '¿Qué es el Truco?',
        content: `
          <p>El <strong>Truco</strong> es el corazón del juego. Es la apuesta principal donde se juegan las cartas para ganar manos.</p>
          
          <h4>🎯 Objetivo del Truco:</h4>
          <p>Ganar <strong>2 de las 3 manos</strong> jugadas con las cartas más fuertes.</p>
          
          <h4>🏆 Sistema de Manos:</h4>
          <div class="hand-system">
            <div class="hand-explanation">
              <strong>🥇 Primera Mano:</strong> Cada jugador pone una carta, la más fuerte gana
            </div>
            <div class="hand-explanation">
              <strong>🥈 Segunda Mano:</strong> Se repite con la segunda carta
            </div>
            <div class="hand-explanation">
              <strong>🥉 Tercera Mano:</strong> Solo si es necesario decidir el ganador
            </div>
          </div>
          
          <div class="winning-conditions">
            <h4>✅ Formas de Ganar:</h4>
            <ul>
              <li><strong>2-0:</strong> Ganas las dos primeras manos</li>
              <li><strong>2-1:</strong> Ganas 2 de las 3 manos</li>
              <li><strong>1-0 + Parda:</strong> Ganas una y empatas otra</li>
            </ul>
          </div>
        `,
        tips: [
          'No necesitas ganar las 3 manos, solo 2',
          'Si empatas una mano (parda), esa mano no la gana nadie',
          'El Truco se puede cantar en cualquier momento durante las manos'
        ]
      },
      {
        id: 'secuencia-cantos-truco',
        title: 'Secuencia de Cantos',
        content: `
          <h4>📈 La Escalera del Truco:</h4>
          
          <div class="truco-sequence">
            <div class="truco-level">
              <div class="level-number">1️⃣</div>
              <div class="level-info">
                <div class="level-name"><strong>TRUCO</strong></div>
                <div class="level-value">Vale: 2 puntos</div>
                <div class="level-description">El canto básico</div>
              </div>
            </div>
            
            <div class="arrow">↓</div>
            
            <div class="truco-level">
              <div class="level-number">2️⃣</div>
              <div class="level-info">
                <div class="level-name"><strong>RE TRUCO</strong></div>
                <div class="level-value">Vale: 3 puntos</div>
                <div class="level-description">Respuesta al Truco</div>
              </div>
            </div>
            
            <div class="arrow">↓</div>
            
            <div class="truco-level">
              <div class="level-number">3️⃣</div>
              <div class="level-info">
                <div class="level-name"><strong>VALE CUATRO</strong></div>
                <div class="level-value">Vale: 4 puntos</div>
                <div class="level-description">¡El máximo!</div>
              </div>
            </div>
          </div>
          
          <h4>🎮 Cómo Funciona:</h4>
          <div class="truco-flow">
            <div class="flow-step">
              <strong>Jugador A:</strong> "¡TRUCO!" 🗣️
            </div>
            <div class="flow-step">
              <strong>Jugador B puede:</strong>
              <ul>
                <li>✅ <strong>"Quiero"</strong> → Acepta (vale 2 pts)</li>
                <li>❌ <strong>"No quiero"</strong> → Rechaza (1 pto a A)</li>
                <li>🔥 <strong>"RE TRUCO"</strong> → Contraataca (vale 3 pts)</li>
              </ul>
            </div>
            <div class="flow-step">
              <strong>Si cantó Re Truco:</strong> Ahora A puede "querer", "no querer" o "VALE CUATRO"
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, rgba(0, 191, 255, 0.15), rgba(0, 255, 255, 0.15)); border: 1px solid #00BFFF; border-radius: 8px;">
            <h4 style="color: #00FFFF; margin-bottom: 10px;">💡 Consejos Importantes:</h4>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Cada canto debe ser aceptado o rechazado</li>
              <li>Si no quieres, el que cantó gana automáticamente</li>
              <li>Vale Cuatro es el máximo, no hay cantos superiores</li>
            </ul>
          </div>
        `,
      },
      {
        id: 'cuando-cantar-truco',
        title: 'Cuándo Cantar Truco',
        content: `
          <h4>🎯 Situaciones para Cantar:</h4>
          
          <div class="truco-situations">
            <div class="situation excellent">
              <div class="situation-title">🌟 <strong>EXCELENTE</strong></div>
              <div class="situation-cards">
                <strong>Cartas:</strong> As de Espada, 7 de Oro, 3 cualquiera
              </div>
              <div class="situation-description">
                Tienes 2+ cartas mayores. ¡Canta sin miedo!
              </div>
            </div>
            
            <div class="situation good">
              <div class="situation-title">👍 <strong>BUENA</strong></div>
              <div class="situation-cards">
                <strong>Cartas:</strong> 1 carta mayor + 2 cartas medias (3, 2)
              </div>
              <div class="situation-description">
                Buenas chances. Canta Truco, pero cuidado con Re Truco.
              </div>
            </div>
            
            <div class="situation risky">
              <div class="situation-title">⚠️ <strong>ARRIESGADA</strong></div>
              <div class="situation-cards">
                <strong>Cartas:</strong> Solo figuras y números bajos
              </div>
              <div class="situation-description">
                Solo si quieres blofear o el rival parece inseguro.
              </div>
            </div>
            
            <div class="situation bluff">
              <div class="situation-title">🎭 <strong>BLOFEO</strong></div>
              <div class="situation-cards">
                <strong>Cartas:</strong> Cualquier cosa (incluso mala)
              </div>
              <div class="situation-description">
                Estrategia psicológica. ¡Puede funcionar si tu rival se asusta!
              </div>
            </div>
          </div>
          
          <h4>🧠 Análisis de la Mesa:</h4>
          <ul>
            <li><strong>🔍 Observa las cartas jugadas:</strong> ¿Ya salieron cartas fuertes?</li>
            <li><strong>⏱️ Timing:</strong> ¿Cuándo canta tu rival? ¿Antes o después de ver cartas?</li>
            <li><strong>🎯 Situación del juego:</strong> ¿Necesitas puntos urgentemente?</li>
            <li><strong>👤 Perfil del rival:</strong> ¿Es agresivo o conservador?</li>
          </ul>
        `,
        tips: [
          'Con 1 carta mayor ya puedes considerar cantar',
          'El timing del canto dice mucho sobre tu mano',
          'A veces es mejor esperar a ver la primera carta del rival'
        ]
      },
      {
        id: 'estrategias-avanzadas-truco',
        title: 'Estrategias Avanzadas',
        content: `
          <h4>🎪 Técnicas de Experto:</h4>
          
          <div class="advanced-strategies">
            <div class="strategy">
              <div class="strategy-name">🎭 <strong>EL BLOFEO PERFECTO</strong></div>
              <div class="strategy-description">
                Canta Truco con cartas malas cuando tu rival parece inseguro. 
                ¡A veces funciona mejor que las buenas cartas!
              </div>
              <div class="strategy-example">
                <em>Ejemplo:</em> Tu rival duda antes de jugar → "¡TRUCO!" con figuras
              </div>
            </div>
            
            <div class="strategy">
              <div class="strategy-name">⏰ <strong>TIMING PSICOLÓGICO</strong></div>
              <div class="strategy-description">
                <strong>Canto rápido:</strong> Pareces muy seguro (puede ser blofeo)<br>
                <strong>Canto tardío:</strong> Calculaste después de ver algo
              </div>
              <div class="strategy-example">
                <em>Truco:</em> Varía tu timing para confundir
              </div>
            </div>
            
            <div class="strategy">
              <div class="strategy-name">🔄 <strong>GESTIÓN DE RIESGO</strong></div>
              <div class="strategy-description">
                No siempre respondas igual. Si vas perdiendo 0-10, arriesga más.
                Si vas ganando 14-8, juega más conservador.
              </div>
              <div class="strategy-example">
                <em>Regla:</em> Tu estrategia cambia según el marcador
              </div>
            </div>
            
            <div class="strategy">
              <div class="strategy-name">🎯 <strong>LA TERCERA MANO</strong></div>
              <div class="strategy-description">
                Si llegan 1-1 a la tercera mano, el que tiene la carta más fuerte 
                casi siempre gana. ¡Aquí los nervios deciden!
              </div>
              <div class="strategy-example">
                <em>Tip:</em> Guarda tu mejor carta para la tercera si es posible
              </div>
            </div>
          </div>
          
          <div class="master-advice">
            <h4>👑 Consejo de Maestro:</h4>
            <p>El Truco se gana tanto con cartas como con psicología. Aprende a leer a tu oponente y a controlar tus propias reacciones. ¡Un buen blofeo vale más que cualquier carta!</p>
          </div>
        `,
        tips: [
          'La psicología es tan importante como las cartas',
          'Varía tu estilo: a veces conservador, a veces agresivo',
          'El silencio también comunica, úsalo estratégicamente'
        ]
      }
    ]
  },

  // ========================================
  // LECCIÓN 4: LA FLOR
  // ========================================
  {
    id: 'flor',
    title: 'La Flor',
    description: 'Aprende sobre la Flor, el canto especial del Truco',
    icon: '🌸',
    difficulty: 'intermediate',
    estimatedTime: 8,
    completionReward: 'Dominas todos los cantos especiales del Truco',
    steps: [
      {
        id: 'que-es-flor',
        title: '¿Qué es la Flor?',
        content: `
          <p>La <strong>Flor</strong> es un canto especial que se produce cuando tienes <strong>3 cartas del mismo palo</strong>.</p>
          
          <h4>🌺 Características de la Flor:</h4>
          <div class="flor-features">
            <div class="feature">
              <strong>🎯 Condición:</strong> Tener 3 cartas del mismo palo
            </div>
            <div class="feature">
              <strong>💎 Valor:</strong> 3 puntos automáticos
            </div>
            <div class="feature">
              <strong>⏰ Cuándo:</strong> Se canta al inicio, antes que Envido o Truco
            </div>
            <div class="feature">
              <strong>🏆 Ventaja:</strong> Es automática, el rival no puede rechazarla
            </div>
          </div>
          
          <h4>📊 Cálculo de la Flor:</h4>
          <p>Se suma igual que el Envido: <strong>20 + las 2 cartas más altas</strong></p>
          
          <div class="flor-examples">
            <div class="example">
              <div class="hand">🌸 <strong>Flor de Oro:</strong> 7♦️, 6♦️, 4♦️</div>
              <div class="calculation">20 + 7 + 6 = <strong>33 puntos</strong></div>
            </div>
            <div class="example">
              <div class="hand">🌸 <strong>Flor de Espada:</strong> 1♠️, Rey♠️, 5♠️</div>
              <div class="calculation">20 + 1 + 5 = <strong>26 puntos</strong> (Rey = 0)</div>
            </div>
          </div>
          
          <div class="important-note">
            ⚠️ <strong>Importante:</strong> La Flor es obligatoria cantarla si la tienes. ¡No puedes ocultarla!
          </div>
        `,
        tips: [
          'La Flor es muy rara, solo pasa ~2% de las veces',
          'Cuando tienes Flor, ya ganaste 3 puntos seguros',
          'La Flor se canta antes que cualquier otra cosa'
        ]
      },
      {
        id: 'tipos-flor',
        title: 'Tipos de Flor',
        content: `
          <h4>🌺 Variantes de la Flor:</h4>
          
          <div class="flor-types">
            <div class="flor-type">
              <div class="type-name">🌸 <strong>FLOR</strong></div>
              <div class="type-value">Vale: 3 puntos</div>
              <div class="type-description">
                Flor simple. Solo tú tienes 3 cartas del mismo palo.
              </div>
              <div class="type-action">El rival dice "Con las mías no llego" y pierdes 3 pts.</div>
            </div>
            
            <div class="flor-type">
              <div class="type-name">🌺 <strong>CONTRA FLOR</strong></div>
              <div class="type-value">Vale: 4 puntos</div>
              <div class="type-description">
                ¡Ambos jugadores tienen Flor! Se comparan los puntos.
              </div>
              <div class="type-action">El que tenga más puntos gana 4 puntos.</div>
            </div>
            
            <div class="flor-type">
              <div class="type-name">💥 <strong>CONTRA FLOR AL RESTO</strong></div>
              <div class="type-value">Vale: Puntos restantes para ganar</div>
              <div class="type-description">
                La apuesta máxima cuando hay Contra Flor.
              </div>
              <div class="type-action">¡El que gana se lleva toda la partida!</div>
            </div>
          </div>
          
          <h4>🎲 ¿Cómo se Desarrolla?</h4>
          <div class="flor-sequence">
            <div class="sequence-step">
              <strong>1️⃣</strong> Jugador A: "¡FLOR!" 🌸
            </div>
            <div class="sequence-step">
              <strong>2️⃣</strong> Jugador B:
              <ul>
                <li>"Con las mías no llego" → A gana 3 pts</li>
                <li>"¡CONTRA FLOR!" → Ambos tienen flor, vale 4 pts</li>
              </ul>
            </div>
            <div class="sequence-step">
              <strong>3️⃣</strong> Si hay Contra Flor, A puede:
              <ul>
                <li>"Quiero" → Se comparan puntos (4 pts al ganador)</li>
                <li>"¡CONTRA FLOR AL RESTO!" → ¡Vale toda la partida!</li>
              </ul>
            </div>
          </div>
        `,
        tips: [
          'Contra Flor es muy rara, casi nunca pasa',
          'Si tienes Flor mala (20-24 pts), cuidado con Contra Flor',
          'Contra Flor al Resto es todo o nada'
        ]
      },
      {
        id: 'estrategia-flor',
        title: 'Estrategia con Flor',
        content: `
          <h4>🧠 Cómo Jugar tu Flor:</h4>
          
          <div class="flor-strategy">
            <div class="strategy-level">
              <div class="points-range">🔥 <strong>Flor de 30+ puntos</strong></div>
              <div class="strategy-advice">
                <strong>¡Agresivo total!</strong> Si el rival canta Contra Flor, acepta.
                Incluso considera Contra Flor al Resto si la situación lo amerita.
              </div>
            </div>
            
            <div class="strategy-level">
              <div class="points-range">⚡ <strong>Flor de 26-29 puntos</strong></div>
              <div class="strategy-advice">
                <strong>Canta tu Flor normalmente.</strong> Si el rival tiene Contra Flor,
                evalúa: ¿qué tan buena parece su flor? ¿Te conviene arriesgar?
              </div>
            </div>
            
            <div class="strategy-level">
              <div class="points-range">⚠️ <strong>Flor de 20-25 puntos</strong></div>
              <div class="strategy-advice">
                <strong>Canta pero con cuidado.</strong> Si hay Contra Flor, probablemente
                quieras rechazarla. 3 puntos seguros es mejor que perder 4.
              </div>
            </div>
          </div>
          
          <h4>🎯 Situaciones Especiales:</h4>
          <div class="special-situations">
            <div class="situation">
              <strong>📊 Vas perdiendo mucho (0-12):</strong>
              <p>Arriesga más con Contra Flor. Necesitas recuperar puntos rápido.</p>
            </div>
            
            <div class="situation">
              <strong>🏆 Vas ganando cómodo (14-3):</strong>
              <p>Juega conservador. Los 3 puntos de Flor te acercan a la victoria.</p>
            </div>
            
            <div class="situation">
              <strong>🔥 Match point (estás a 1-2 puntos de ganar):</strong>
              <p>¡La Flor te da la victoria! No arriesgues con Contra Flor innecesariamente.</p>
            </div>
          </div>
          
          <div class="flor-tips">
            <h4>💡 Tips de Experto:</h4>
            <ul>
              <li><strong>🎭 Psicología:</strong> Si tienes Flor mala, actúa seguro. El rival puede no tener Contra Flor.</li>
              <li><strong>⚡ Speed:</strong> Canta Flor rápido y decidido, sin importar los puntos.</li>
              <li><strong>🧮 Matemáticas:</strong> Recuerda que con 3 cartas del mismo palo, tu Envido también es excelente.</li>
              <li><strong>🎯 Timing:</strong> La Flor se canta antes que todo, pero puedes jugar después con ventaja psicológica.</li>
            </ul>
          </div>
        `,
        tips: [
          'La Flor te da ventaja psicológica para el resto de la mano',
          'Con Flor, tu Envido también suele ser muy bueno',
          'No todas las Flores son iguales, evalúa tus puntos'
        ]
      }
    ]
  },

  // ========================================
  // LECCIÓN 5: ESTRATEGIA AVANZADA
  // ========================================
  {
    id: 'estrategia',
    title: 'Estrategia Avanzada',
    description: 'Tips y técnicas para convertirte en un experto del Truco',
    icon: '🧠',
    difficulty: 'advanced',
    estimatedTime: 15,
    completionReward: '¡Eres oficialmente un maestro del Truco Venezolano!',
    steps: [
      {
        id: 'lectura-oponente',
        title: 'Lectura del Oponente',
        content: `
          <h4>👁️ Cómo Leer a tu Rival:</h4>
          
          <div class="reading-techniques">
            <div class="technique">
              <div class="technique-name">⏱️ <strong>TIMING DE DECISIONES</strong></div>
              <div class="technique-description">
                <strong>Rápido:</strong> Muy seguro o muy inseguro (blofeo)<br>
                <strong>Lento:</strong> Está calculando, tiene opciones<br>
                <strong>Muy lento:</strong> Decisión difícil, mano intermedia
              </div>
            </div>
            
            <div class="technique">
              <div class="technique-name">🗣️ <strong>PATRONES DE CANTO</strong></div>
              <div class="technique-description">
                <strong>Agresivo:</strong> Canta mucho Truco, acepta desafíos<br>
                <strong>Conservador:</strong> Solo canta con cartas fuertes<br>
                <strong>Errático:</strong> Impredecible, mezcla estrategias
              </div>
            </div>
            
            <div class="technique">
              <div class="technique-name">🎯 <strong>MOMENTO DEL CANTO</strong></div>
              <div class="technique-description">
                <strong>Antes de cartas:</strong> Muy seguro de su mano<br>
                <strong>Después de ver tu carta:</strong> Reaccionó a lo que vio<br>
                <strong>En segunda/tercera mano:</strong> Calculó sus chances
              </div>
            </div>
          </div>
          
          <h4>🕵️ Señales a Observar:</h4>
          <div class="behavioral-signals">
            <div class="signal positive">
              <strong>🔥 Confianza (tiene buenas cartas):</strong>
              <ul>
                <li>Canta rápido y sin dudar</li>
                <li>Acepta Re Trucos fácilmente</li>
                <li>Juega cartas fuertes sin miedo</li>
                <li>Mantiene ritmo constante</li>
              </ul>
            </div>
            
            <div class="signal negative">
              <strong>😰 Inseguridad (cartas malas):</strong>
              <ul>
                <li>Duda antes de aceptar cantos</li>
                <li>Rechaza Envidos rápidamente</li>
                <li>Juega cartas conservadoramente</li>
                <li>Cambia de ritmo repentinamente</li>
              </ul>
            </div>
            
            <div class="signal bluff">
              <strong>🎭 Posible Blofeo:</strong>
              <ul>
                <li>Canta muy rápido (demasiado seguro)</li>
                <li>Inconsistencia con manos anteriores</li>
                <li>Cambio drástico de estrategia</li>
                <li>Over-acting (actuar demasiado)</li>
              </ul>
            </div>
          </div>
        `,
        tips: [
          'Cada jugador tiene patrones únicos, aprende a identificarlos',
          'Tus primeras impresiones suelen ser correctas',
          'No te obsesiones con leer, también enfócate en tu juego'
        ]
      },
      {
        id: 'gestion-bankroll',
        title: 'Gestión de Puntos',
        content: `
          <h4>📊 Estrategia Según el Marcador:</h4>
          
          <div class="score-strategies">
            <div class="score-situation winning">
              <div class="situation-title">🏆 <strong>VAS GANANDO (12+ puntos)</strong></div>
              <div class="strategy-description">
                <strong>Juega CONSERVADOR:</strong>
                <ul>
                  <li>No cantes Truco sin cartas muy fuertes</li>
                  <li>Acepta solo Envidos que tengas 28+ puntos</li>
                  <li>Evita riesgos innecesarios</li>
                  <li>Deja que el rival tome riesgos</li>
                </ul>
              </div>
            </div>
            
            <div class="score-situation losing">
              <div class="situation-title">😤 <strong>VAS PERDIENDO (0-6 puntos)</strong></div>
              <div class="strategy-description">
                <strong>Juega AGRESIVO:</strong>
                <ul>
                  <li>Canta Truco con manos medianas</li>
                  <li>Acepta más riesgos en Envido</li>
                  <li>Usa el blofeo más frecuentemente</li>
                  <li>Presiona psicológicamente</li>
                </ul>
              </div>
            </div>
            
            <div class="score-situation close">
              <div class="situation-title">⚖️ <strong>JUEGO CERRADO (8-10 puntos)</strong></div>
              <div class="strategy-description">
                <strong>Juega CALCULADO:</strong>
                <ul>
                  <li>Evalúa cada canto cuidadosamente</li>
                  <li>Considera las probabilidades</li>
                  <li>Un error puede costar el juego</li>
                  <li>Mantén la presión mental</li>
                </ul>
              </div>
            </div>
          </div>
          
          <h4>🎯 Situaciones Críticas:</h4>
          <div class="critical-situations">
            <div class="critical-moment">
              <strong>🔥 Match Point (14+ puntos):</strong>
              <p>¡Cualquier canto puede acabar el juego! Solo acepta con manos excepcionales.</p>
            </div>
            
            <div class="critical-moment">
              <strong>⚡ Desesperación (0-13):</strong>
              <p>Necesitas puntos YA. Arriesga todo, el blofeo es tu arma principal.</p>
            </div>
            
            <div class="critical-moment">
              <strong>🎲 All-in mental:</strong>
              <p>Cuando alguien canta Falta Envido o Contra Flor al Resto, evalúa: ¿vale la pena el riesgo total?</p>
            </div>
          </div>
        `,
        tips: [
          'El marcador cambia completamente tu estrategia',
          'Cuando vas perdiendo, el riesgo es tu amigo',
          'Un punto de diferencia puede cambiar todo tu enfoque'
        ]
      },
      {
        id: 'psicologia-mesa',
        title: 'Psicología de Mesa',
        content: `
          <h4>🧠 El Juego Mental:</h4>
          
          <div class="psychological-aspects">
            <div class="psychology-element">
              <div class="element-name">🎭 <strong>CONTROLA TUS EMOCIONES</strong></div>
              <div class="element-description">
                <strong>Poker Face:</strong> No muestres si tienes buenas o malas cartas<br>
                <strong>Consistencia:</strong> Mantén el mismo timing siempre<br>
                <strong>Respiración:</strong> No cambies tu ritmo respiratorio<br>
                <strong>Postura:</strong> Mantén la misma posición corporal
              </div>
            </div>
            
            <div class="psychology-element">
              <div class="element-name">🎯 <strong>PRESIÓN PSICOLÓGICA</strong></div>
              <div class="element-description">
                <strong>Variación:</strong> Cambia tu estilo impredeciblemente<br>
                <strong>Silencio:</strong> Úsalo para crear tensión<br>
                <strong>Confianza:</strong> Actúa seguro incluso con malas cartas<br>
                <strong>Paciencia:</strong> Espera el momento perfecto para atacar
              </div>
            </div>
            
            <div class="psychology-element">
              <div class="element-name">🔄 <strong>ADAPTABILIDAD</strong></div>
              <div class="element-description">
                <strong>Meta-juego:</strong> Juega contra la estrategia del rival<br>
                <strong>Niveles:</strong> "Él piensa que yo pienso que él piensa..."<br>
                <strong>Reset:</strong> Cambia completamente si te está leyendo<br>
                <strong>Exploit:</strong> Aprovecha los patrones que descubras
              </div>
            </div>
          </div>
          
          <h4>🎪 Técnicas Avanzadas:</h4>
          <div class="advanced-psychology">
            <div class="technique">
              <strong>🎭 El Blofeo Inverso:</strong>
              <p>Actúa inseguro cuando tienes buenas cartas. El rival puede subestimarte.</p>
            </div>
            
            <div class="technique">
              <strong>⏰ Control del Tempo:</strong>
              <p>Acelera o ralentiza el juego según te convenga. Presiona cuando vas perdiendo.</p>
            </div>
            
            <div class="technique">
              <strong>🎯 Seeding (Plantar Ideas):</strong>
              <p>Haz que el rival piense que tienes cierto tipo de mano con tus acciones.</p>
            </div>
            
            <div class="technique">
              <strong>🔄 El Switch:</strong>
              <p>Si llevás muchas manos jugando conservador, de repente sé agresivo (y viceversa).</p>
            </div>
          </div>
          
          <div class="master-mindset">
            <h4>👑 Mentalidad de Campeón:</h4>
            <blockquote>
              "El Truco no es solo un juego de cartas, es un juego de mentes. El que mejor controle sus emociones y lea a su oponente, gana más que el que tenga mejores cartas."
            </blockquote>
          </div>
        `,
        tips: [
          'El 70% del Truco es psicología, 30% cartas',
          'Practica mantener la misma expresión siempre',
          'Un buen blofeo en el momento correcto vale más que cualquier carta'
        ]
      },
      {
        id: 'situaciones-especiales',
        title: 'Situaciones Especiales',
        content: `
          <h4>🚨 Escenarios Únicos y Cómo Manejarlos:</h4>
          
          <div class="special-scenarios">
            <div class="scenario">
              <div class="scenario-title">⚡ <strong>LA MANO MIXTA</strong></div>
              <div class="scenario-description">
                Tienes 1 carta muy fuerte (As de Espada) y 2 muy débiles (figuras).
              </div>
              <div class="scenario-strategy">
                <strong>Estrategia:</strong> Juega la carta fuerte en primera mano para ganar psicológicamente.
                Después blofea o juega conservador según la reacción del rival.
              </div>
            </div>
            
            <div class="scenario">
              <div class="scenario-title">🎭 <strong>EL RIVAL PREDECIBLE</strong></div>
              <div class="scenario-description">
                Has identificado que tu oponente solo canta con cartas muy fuertes.
              </div>
              <div class="scenario-strategy">
                <strong>Estrategia:</strong> Rechaza todos sus cantos automáticamente y canta tú más seguido para presionar.
                Cuando finalmente acepte algo, sabes que tiene cartas excelentes.
              </div>
            </div>
            
            <div class="scenario">
              <div class="scenario-title">🔥 <strong>LA RACHA PERDEDORA</strong></div>
              <div class="scenario-description">
                Llevas varias manos perdiendo seguidas, estás 0-10.
              </div>
              <div class="scenario-strategy">
                <strong>Estrategia:</strong> Reset mental total. Cambia completamente tu estilo de juego.
                Si venías conservador, sé ultra-agresivo. Sorprende para romper la racha.
              </div>
            </div>
            
            <div class="scenario">
              <div class="scenario-title">🎯 <strong>FINAL DE PARTIDA</strong></div>
              <div class="scenario-description">
                Score: 14-13. Cualquier punto decide el juego.
              </div>
              <div class="scenario-strategy">
                <strong>Estrategia:</strong> Máxima concentración. Solo acepta cantos con cartas superiores a la media.
                Un error aquí cuesta todo. Presión psicológica máxima.
              </div>
            </div>
          </div>
          
          <h4>⚡ Reglas de Oro para Expertos:</h4>
          <div class="expert-rules">
            <div class="rule">
              <strong>🔵 Regla del 60%:</strong>
              <p>Si tienes más del 60% de probabilidades de ganar una apuesta, acéptala. Menos del 40%, recházala.</p>
            </div>
            
            <div class="rule">
              <strong>🔴 Regla de Adaptación:</strong>
              <p>Si una estrategia no te está funcionando después de 3-4 manos, cámbiala completamente.</p>
            </div>
            
            <div class="rule">
              <strong>🟡 Regla del Momentum:</strong>
              <p>El juego tiene ritmos. Aprovecha cuando estés en racha, protégete cuando vayas mal.</p>
            </div>
            
            <div class="rule">
              <strong>🟢 Regla de la Información:</strong>
              <p>Cada carta que se juega te da información. Úsala para tomar mejores decisiones.</p>
            </div>
          </div>
          
          <div class="final-wisdom">
            <h4>🏆 La Sabiduría Final:</h4>
            <p><strong>El Truco es un juego simple de aprender pero imposible de dominar completamente.</strong></p>
            <p>Cada partida es única, cada oponente es diferente, y siempre hay algo nuevo que aprender. 
            La clave es mantenerse adaptable, observador, y nunca dejar de mejorar.</p>
            <p><em>¡Que tengas muchas victorias en la mesa de Truco!</em> 🎉</p>
          </div>
        `,
        tips: [
          'Cada partida es una lección, ganes o pierdas',
          'Los mejores jugadores se adaptan constantemente',
          '¡La práctica hace al maestro, pero la observación hace al genio!'
        ]
      }
    ]
  },

  // ========================================
  // LECCIÓN 6: GLOSARIO Y TÉRMINOS
  // ========================================
  {
    id: 'glosario',
    title: 'Glosario de Truco',
    description: 'Conviértete en un experto del léxico del Truco y sus jergas',
    icon: '📖',
    difficulty: 'advanced',
    estimatedTime: 5,
    completionReward: 'Hablas el idioma del Truco con fluidez',
    steps: [
      {
        id: 'terminos-comunes',
        title: 'Términos Comunes',
        content: `
          <h4>Glosario Esencial del Truco:</h4>
          <p>Conocer la jerga del Truco no solo te ayuda a entender el juego, sino también a intimidar a tus oponentes.</p>
          <ul>
            <li><strong>Mano:</strong> Cada una de las tres rondas en que se juega una partida.</li>
            <li><strong>Parda:</strong> Empate en una mano.</li>
            <li><strong>Irse al mazo:</strong> Rendirse y no jugar las cartas.</li>
            <li><strong>Cantar:</strong> Anunciar una jugada como "Envido" o "Truco".</li>
            <li><strong>Tengo:</strong> Expresión para indicar que se tienen puntos de Envido.</li>
          </ul>
        `,
        tips: [
          'Usa estos términos con confianza para mostrar seguridad.',
          'Escucha atentamente lo que cantan tus oponentes.'
        ]
      }
    ]
  }
];

export default tutorialLessons;