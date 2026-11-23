import React from 'react'

// Editar/apagar numa linha de lista (44px)
export default function RowBtn({ danger, label, onClick, children }) {
  return (
    <button onClick={onClick} title={label} aria-label={label}
      style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: danger ? '#e87080' : '#e8dece', cursor: 'pointer', padding: 0, width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, transition: 'background 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.background = danger ? 'rgba(232,112,128,0.14)' : 'rgba(200,150,62,0.14)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}>
      {children}
    </button>
  )
}
