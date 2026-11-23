import React from 'react'

// Editar/apagar numa linha: 44px em mobile, compacto com hover em desktop
export default function RowBtn({ m, danger, label, onClick, children }) {
  const hover = danger ? ['#e87080', 'rgba(232,112,128,0.1)'] : ['#c8963e', 'rgba(200,150,62,0.1)']
  return (
    <button onClick={onClick} title={label} aria-label={label}
      style={{ background: m ? 'rgba(255,255,255,0.05)' : 'none', border: 'none', color: m ? (danger ? '#e87080' : '#e8dece') : '#6a5f52', cursor: 'pointer', padding: m ? 0 : '4px 6px', width: m ? 44 : undefined, height: m ? 44 : undefined, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: m ? 12 : 5, transition: 'color 0.15s, background 0.15s' }}
      onMouseEnter={m ? undefined : e => { e.currentTarget.style.color = hover[0]; e.currentTarget.style.background = hover[1] }}
      onMouseLeave={m ? undefined : e => { e.currentTarget.style.color = '#6a5f52'; e.currentTarget.style.background = 'none' }}>
      {children}
    </button>
  )
}
