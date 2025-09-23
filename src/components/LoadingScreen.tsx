import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-screen" id="loading-screen">
      <div className="loading-spinner"></div>
      <div className="loading-text">Cargando Truco Venezolano...</div>
    </div>
  );
};

export default LoadingScreen;