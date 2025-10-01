import React, { useState, useEffect } from 'react';
import { BaseScreenProps, TutorialProgress, TutorialLesson } from '../types';
import { tutorialLessons } from '../data/tutorialLessons';
import LessonScreen from './LessonScreen';

const TutorialScreen: React.FC<BaseScreenProps> = ({ onNavigate }) => {
  const [currentLesson, setCurrentLesson] = useState<TutorialLesson | null>(null);
  const [progress, setProgress] = useState<TutorialProgress>({
    currentStepIndex: 0,
    completedLessons: [],
    completedSteps: {},
    totalProgress: 0
  });

  // CARGAR PROGRESO Y CONFIGURAR SCROLL INICIAL
  useEffect(() => {
    // Cargar progreso guardado del localStorage
    const savedProgress = localStorage.getItem('truco-tutorial-progress');
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (error) {
        console.error('Error loading tutorial progress:', error);
      }
    }
    
    // SCROLL INICIAL: Posicionar en la parte superior para mostrar el header
    // IMPORTANTE: No usar scroll automático que oculte el header
    // El CSS tiene padding-top: 80px para garantizar que el header sea visible
    setTimeout(() => {
      const tutorialScreen = document.getElementById('tutorial-screen');
      if (tutorialScreen) {
        tutorialScreen.scrollTo({
          top: 0, // SIEMPRE comenzar desde arriba
          behavior: 'smooth'
        });
      }
    }, 100);
  }, []);

  // Guardar progreso en localStorage
  const saveProgress = (newProgress: TutorialProgress) => {
    setProgress(newProgress);
    localStorage.setItem('truco-tutorial-progress', JSON.stringify(newProgress));
  };

  const handleLessonStart = (lesson: TutorialLesson) => {
    setCurrentLesson(lesson);
  };

  const handleLessonComplete = () => {
    // La lección se marca como completada desde LessonScreen
    setCurrentLesson(null);
  };

  const handleBackToMenu = () => {
    setCurrentLesson(null);
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress.completedLessons.includes(lessonId);
  };

  const getLessonProgress = (lessonId: string) => {
    const lesson = tutorialLessons.find(l => l.id === lessonId);
    if (!lesson) return 0;
    
    const completedSteps = progress.completedSteps[lessonId] || [];
    return Math.round((completedSteps.length / lesson.steps.length) * 100);
  };

  const getTotalProgress = () => {
    const totalSteps = tutorialLessons.reduce((acc, lesson) => acc + lesson.steps.length, 0);
    const completedSteps = Object.values(progress.completedSteps)
      .reduce((acc, steps) => acc + steps.length, 0);
    return Math.round((completedSteps / totalSteps) * 100);
  };

  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'difficulty-beginner';
      case 'intermediate': return 'difficulty-intermediate';
      case 'advanced': return 'difficulty-advanced';
      default: return '';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🟢 Principiante';
      case 'intermediate': return '🟡 Intermedio';
      case 'advanced': return '🔴 Avanzado';
      default: return 'Sin definir';
    }
  };

  // Si hay una lección activa, mostrar LessonScreen
  if (currentLesson) {
    return (
      <LessonScreen
        lesson={currentLesson}
        progress={progress}
        onBack={handleBackToMenu}
        onProgressUpdate={saveProgress}
        onComplete={handleLessonComplete}
      />
    );
  }

  return (
    <div id="tutorial-screen" className="screen active">
      <button className="back-button" onClick={() => onNavigate('main-screen')}>← Volver</button>
        {/* Título Principal */}
        <div className="tutorial-header">
          <h2 className="game-title">Bienvenido al Tutorial</h2>
          <p className="tutorial-subtitle">
            Aprende a jugar Truco Venezolano paso a paso con nuestro tutorial interactivo.
          </p>
        </div>

        {/* Sección de Lecciones */}
        <div className="lessons-section">
          <h3 className="section-title">📚 Lecciones Disponibles</h3>
          <div className="lessons-grid">
            {tutorialLessons.map((lesson) => {
              const isCompleted = isLessonCompleted(lesson.id);
              const lessonProgress = getLessonProgress(lesson.id);
              
              return (
                <div key={lesson.id} className="lesson-card">
                  <div className="lesson-card-header">
                    <span className="lesson-card-icon">{lesson.icon}</span>
                    <div className="lesson-card-status">
                      {isCompleted ? (
                        <span className="lesson-completed-badge">✅ Completada</span>
                      ) : lessonProgress > 0 ? (
                        <span className="lesson-progress-badge">{lessonProgress}% En progreso</span>
                      ) : (
                        <span className="lesson-new-badge">🆕 Nueva</span>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="lesson-card-title">{lesson.title}</h4>
                  <p className="lesson-card-description">{lesson.description}</p>
                  
                  <div className="lesson-card-meta">
                    <span className={`lesson-card-difficulty ${getDifficultyClass(lesson.difficulty)}`}>
                      {getDifficultyLabel(lesson.difficulty)}
                    </span>
                    <span className="lesson-card-time">⏱️ {lesson.estimatedTime} min</span>
                  </div>
                  
                  {lessonProgress > 0 && (
                    <div className="lesson-card-progress">
                      <div className="lesson-mini-progress-bar">
                        <div 
                          className="lesson-mini-progress-fill"
                          style={{ width: `${lessonProgress}%` }}
                        />
                      </div>
                      <span className="lesson-mini-progress-text">
                        {Math.round((progress.completedSteps[lesson.id]?.length || 0) / lesson.steps.length * lesson.steps.length)} de {lesson.steps.length} pasos
                      </span>
                    </div>
                  )}
                  
                  <button 
                    className={`lesson-start-btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => handleLessonStart(lesson)}
                    aria-label={`${isCompleted ? 'Revisar' : 'Comenzar'} lección: ${lesson.title}`}
                  >
                    {isCompleted ? '🔄 Revisar' : lessonProgress > 0 ? '▶️ Continuar' : '🚀 Comenzar'}
                  </button>
                  
                  {isCompleted && lesson.completionReward && (
                    <div className="lesson-reward">
                      <span className="reward-icon">🏆</span>
                      <span className="reward-text">{lesson.completionReward}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Consejos finales - TEMPORALMENTE DESHABILITADO */}
        {/* <div className="tutorial-tips">
          <h3 className="instruction-title">💡 Consejos para Aprender</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <span className="tip-icon">📖</span>
              <div className="tip-card-content">
                <h4>Lee con Atención</h4>
                <p>Cada lección contiene información valiosa que te ayudará a mejorar tu juego.</p>
              </div>
            </div>
            <div className="tip-card">
              <span className="tip-icon">🎯</span>
              <div className="tip-card-content">
                <h4>Practica lo Aprendido</h4>
                <p>Después de cada lección, juega algunas partidas para aplicar lo que aprendiste.</p>
              </div>
            </div>
            <div className="tip-card">
              <span className="tip-icon">🔄</span>
              <div className="tip-card-content">
                <h4>Repite las Lecciones</h4>
                <p>No hay problema en revisar las lecciones las veces que necesites.</p>
              </div>
            </div>
          </div>
        </div> */}
    </div>
  );
};

export default TutorialScreen;
