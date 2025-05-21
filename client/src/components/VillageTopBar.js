import React from 'react';

const VillageTopBar = ({ user, onBoardClick }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: 56,
    background: 'rgba(30,30,30,0.85)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
    padding: '0 32px',
    fontSize: 18
  }}>
    <div>
      <b>{user?.nickname || user?.username || 'Guest'}</b>
      <span style={{ marginLeft: 16, fontSize: 16, color: '#ffd700' }}>
        {user?.points ?? 0} 포인트
      </span>
    </div>
    <button
      style={{
        background: '#2196f3',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        padding: '8px 20px',
        fontSize: 16,
        cursor: 'pointer'
      }}
      onClick={onBoardClick}
    >
      게시판
    </button>
  </div>
);

export default VillageTopBar; 