import React from 'react';

export default function MarketProgress({ market }) {
  const [a, b] = market.outcomes;
  const totalShares = parseInt(market.totalShares) || 1;
  const percent = Math.round((parseInt(a.shares) / totalShares) * 100);

  return (
    <div className="mb-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
        <span style={{ color: '#3b82f6' }}>{a.name}: {percent}%</span>
        <span style={{ color: '#ec4899' }}>{b.name}: {100 - percent}%</span>
      </div>

      <div className="progress-container">
        <div 
          className="progress-fill" 
          style={{ width: `${percent}%`, backgroundColor: '#3b82f6' }} 
        />
        <div 
          className="progress-fill" 
          style={{ width: `${100 - percent}%`, backgroundColor: '#ec4899' }} 
        />
      </div>
    </div>
  );
}