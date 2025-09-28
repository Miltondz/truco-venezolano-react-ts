import React, { useState, useEffect } from 'react';
import { LessonScreenProps, TutorialStep } from '../types';

const LessonScreen: React.FC<LessonScreenProps> = ({
  lesson,
  progress,
  onBack,
  onProgressUpdate,
  onComplete
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isStepCompleted, setIsStepCompleted] = useState(false);

  const currentStep = lesson.steps[currentStepIndex];
  const isLastStep = currentStepIndex === lesson.steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  useEffect(() => {
    // Verificar si este paso ya está completado
    const completedSteps = progress.completedSteps[lesson.id] || [];
    setIsStepCompleted(completedSteps.includes(currentStep.id));
  }, [currentStep.id, lesson.id, progress.completedSteps]);

  const handleStepComplete = () => {
    const newProgress = { ...progress };
    
    // Marcar paso como completado
    if (!newProgress.completedSteps[lesson.id]) {
      newProgress.completedSteps[lesson.id] = [];
    }
    
    if (!newProgress.completedSteps[lesson.id].includes(currentStep.id)) {
      newProgress.completedSteps[lesson.id].push(currentStep.id);
    }

    setIsStepCompleted(true);
    
    // Si es el último paso, marcar lección como completada
    if (isLastStep) {
      if (!newProgress.completedLessons.includes(lesson.id)) {
        newProgress.completedLessons.push(lesson.id);
      }
      
      // Calcular progreso total
      const totalSteps = lesson.steps.length;
      const completedStepsCount = newProgress.completedSteps[lesson.id].length;
      newProgress.totalProgress = Math.round((completedStepsCount / totalSteps) * 100);
      
      onComplete();
    }

    onProgressUpdate(newProgress);
  };

  const goToNextStep = () => {
    if (!isLastStep && isStepCompleted) {
      setCurrentStepIndex(currentStepIndex + 1);
      setIsStepCompleted(false);
    }
  };

  const goToPreviousStep = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
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

  return (
    <div className="lesson-screen screen active">
      <button className="back-button" onClick={onBack}>← Volver</button>
      
      <div className="lesson-screen-content">
        {/* Header de la lección */}
        <div className="lesson-header">
          <div className="lesson-title-container">
            <span className="lesson-icon">{lesson.icon}</span>
            <h2 className="game-title">{lesson.title}</h2>
          </div>
          
          <div className="lesson-meta">
            <span 
              className="lesson-difficulty" 
              style={{ color: getDifficultyColor(lesson.difficulty) }}
            >
              {getDifficultyLabel(lesson.difficulty)}
            </span>
            <span className="lesson-time">⏱️ {lesson.estimatedTime} min</span>
          </div>

          <div className="lesson-progress-bar">
            <div 
              className="lesson-progress-fill"
              style={{ 
                width: `${((currentStepIndex + (isStepCompleted ? 1 : 0)) / lesson.steps.length) * 100}%` 
              }}
            />
            <span className="lesson-progress-text">
              Paso {currentStepIndex + 1} de {lesson.steps.length}
            </span>
          </div>
        </div>

        {/* Contenido del paso actual */}
        <div className="lesson-step-container">
          <div className="lesson-step">
            <h3 className="step-title">{currentStep.title}</h3>
            
            <div className="step-content-scrollable">
              <div className="step-content text-content">
                <div dangerouslySetInnerHTML={{ __html: currentStep.content }} />
              </div>

              {/* Elemento interactivo si existe */}
              {currentStep.interactiveElement && (
                <div className="step-interactive">
                  {currentStep.interactiveElement}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controles de navegación */}
        <div className="lesson-controls">
          <button 
            className="btn-secondary"
            onClick={goToPreviousStep}
            disabled={isFirstStep}
          >
            ← Anterior
          </button>

          <div className="step-action">
            {!isStepCompleted ? (
              <button 
                className="btn-primary step-complete-btn"
                onClick={handleStepComplete}
              >
                ✓ Entendido
              </button>
            ) : (
              <div className="step-completed">
                <span className="completed-icon">✅</span>
                <span>¡Paso completado!</span>
              </div>
            )}
          </div>

          <button 
            className="btn-secondary"
            onClick={goToNextStep}
            disabled={!isStepCompleted || isLastStep}
          >
            {isLastStep ? '🎯 Lección Completada' : 'Siguiente →'}
          </button>
        </div>

        {/* Mensaje de completación */}
        {isLastStep && isStepCompleted && (
          <div className="lesson-completion">
            <div className="completion-message">
              <span className="completion-icon">🎉</span>
              <h3>¡Lección Completada!</h3>
              <p>Has completado exitosamente: <strong>{lesson.title}</strong></p>
              {lesson.completionReward && (
                <p className="completion-reward">🏆 {lesson.completionReward}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonScreen;