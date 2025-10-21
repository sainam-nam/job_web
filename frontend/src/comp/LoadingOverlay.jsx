import React from "react";

const LoadingOverlay = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    color: '#7B6ADA',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <span className="loading loading-dots loading-xl"></span>
  </div>
);

export default LoadingOverlay;
