import React, { useEffect, useRef } from 'react'
import { FONT } from '../utils/constants'

export default function QuoteOverlay({ quote, onClose }) {
  const bdRef = useRef(false)
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  if (!quote) return null
  return (
    <div
      onMouseDown={e => { bdRef.current = e.target === e.currentTarget }}
      onClick={e => { if (bdRef.current && e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, cursor: 'pointer',
      }}>
      <div onClick={e => e.stopPropagation()} style={{
        maxWidth: 480, width: '100%', background: '#161310',
        border: '1px solid rgba(200,150,62,0.25)', borderRadius: 16,
        padding: '40px 36px', textAlign: 'center', cursor: 'default',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>
        <div style={{ fontSize: 28, color: 'rgba(200,150,62,0.3)', fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: 16 }}>"</div>
        <p style={{ fontSize: 16, fontWeight: 300, color: '#e8dece', fontFamily: FONT, lineHeight: 1.65, margin: '0 0 20px', letterSpacing: '0.01em' }}>
          {quote.quote}
        </p>
        {quote.author && (
          <p style={{ fontSize: 12, color: '#6a5f52', fontStyle: 'italic', margin: '0 0 28px' }}>— {quote.author}</p>
        )}
        <button onClick={onClose} style={{
          padding: '9px 28px', borderRadius: 7, border: '1px solid rgba(200,150,62,0.3)',
          background: 'rgba(200,150,62,0.08)', color: '#c8963e', cursor: 'pointer',
          fontFamily: FONT, fontSize: 12, fontWeight: 500, transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,150,62,0.16)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,150,62,0.08)' }}>
          Continuar
        </button>
      </div>
    </div>
  )
}
