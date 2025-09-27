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

  // Cargar progreso desde localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('truco-tutorial-progress');
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (error) {
        console.error('Error loading tutorial progress:', error);
      }
    }
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'var(--success-color)';
      case 'intermediate': return 'var(--warning-color)';
      case 'advanced': return 'var(--danger-color)';
      default: return 'var(--text-secondary)';
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
      <div className="screen-content">
        <h2 className="game-title">Tutorial Interactivo</h2>
        
        {/* Progreso general */}
        <div className="tutorial-progress-section">
          <h3 className="instruction-title">📊 Tu Progreso General</h3>
          <div className="overall-progress-bar">
            <div 
              className="overall-progress-fill"
              style={{ width: `${getTotalProgress()}%` }}
            />
            <span className="overall-progress-text">
              {getTotalProgress()}% Completado
            </span>
          </div>
          <p className="progress-description">
            Has completado {progress.completedLessons.length} de {tutorialLessons.length} lecciones
          </p>
        </div>

        {/* Introducción */}
        <div className="instruction-section">
          <h3 className="instruction-title">🎯 Bienvenido al Tutorial</h3>
          <p className="instruction-text">
            Aprende a jugar Truco Venezolano paso a paso con nuestro tutorial interactivo. 
            Cada lección incluye explicaciones detalladas, ejemplos prácticos y consejos de expertos.
          </p>
        </div>

        {/* Lista de lecciones */}
        <div className="lessons-section">
          <h3 className="instruction-title">📚 Lecciones Disponibles</h3>
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
                    <span 
                      className="lesson-card-difficulty"
                      style={{ color: getDifficultyColor(lesson.difficulty) }}
                    >
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

        {/* Consejos finales */}
        <div className="tutorial-tips">
          <h3 className="instruction-title">💡 Consejos para Aprender</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <span className="tip-icon">📖</span>
              <h4>Lee con Atención</h4>
              <p>Cada lección contiene información valiosa que te ayudará a mejorar tu juego.</p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">🎯</span>
              <h4>Practica lo Aprendido</h4>
              <p>Después de cada lección, juega algunas partidas para aplicar lo que aprendiste.</p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">🔄</span>
              <h4>Repite las Lecciones</h4>
              <p>No hay problema en revisar las lecciones las veces que necesites.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialScreen;
