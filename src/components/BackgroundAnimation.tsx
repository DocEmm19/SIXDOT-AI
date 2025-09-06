import React from 'react';

const BackgroundAnimation: React.FC = () => {
  return (
    <div className="bg-animation">
      <div className="aurora-line aurora1" style={{ '--rotation': '-45deg' } as React.CSSProperties}></div>
      <div className="aurora-line aurora2" style={{ '--rotation': '35deg' } as React.CSSProperties}></div>
      <div className="aurora-line aurora3" style={{ '--rotation': '-20deg' } as React.CSSProperties}></div>
      
      <div className="floating-particles particle1"></div>
      <div className="floating-particles particle2"></div>
      <div className="floating-particles particle3"></div>
      <div className="floating-particles particle4"></div>
    </div>
  );
};

export default BackgroundAnimation;