import React, { useRef } from 'react'
import { X } from 'lucide-react'
import { FONT } from '../../utils/constants'

// fullScreen (formulários/detalhe): ecrã inteiro em mobile, janela larga em desktop; sem ele: folha inferior / janela estreita
export default function ModalShell({ onClose, children, isMobile, fullScreen }) {
  const bdRef = useRef(false)
  const panel = !isMobile
    ? { borderRadius: 24, padding: '28px 28px 0', width: '100%', maxWidth: fullScreen ? 720 : 480, maxHeight: 'calc(100vh - 48px)' }
    : fullScreen
      ? { width: '100%', height: '100dvh', borderRadius: 0, border: 'none', padding: 'max(16px, env(safe-area-inset-top)) 16px 0', overflowX: 'hidden' }
      : { width: '100%', maxWidth: '100vw', maxHeight: '92dvh', borderRadius: '24px 24px 0 0', padding: '20px 16px 0', overflowX: 'hidden' }
  return (
    <div
      onMouseDown={e => { bdRef.current = e.target === e.currentTarget }}
      onClick={e => { if (bdRef.current && e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)',
        display: 'flex', zIndex: 100, backdropFilter: 'blur(4px)',
        ...(isMobile
          ? { alignItems: 'flex-end', justifyContent: 'stretch' }
          : { alignItems: 'center', justifyContent: 'center', padding: '24px 16px' })
      }}>
      <div onClick={e => e.stopPropagation()} className="vt-m"
        style={{
          background: '#1e1b16', border: '1px solid rgba(255,255,255,0.1)',
          fontFamily: FONT, overflowY: 'auto', boxSizing: 'border-box',
          ...panel,
        }}>
        {children}
        {/* espaço final quando o formulário não tem barra de ações fixa */}
        <div className="vt-endpad" style={{ height: isMobile ? 'max(16px, env(safe-area-inset-bottom))' : 24 }} />
      </div>
    </div>
  )
}

export function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
      <div style={{ minWidth: 0 }}>
        <h2 className="vt-mtitle" style={{ margin: 0, fontSize: 18, fontWeight: 300, color: '#e8dece', fontFamily: FONT, letterSpacing: '-0.01em' }}>{title}</h2>
        {subtitle && <p className="vt-msub" style={{ margin: '4px 0 0', fontSize: 13, color: '#9a8f82' }}>{subtitle}</p>}
      </div>
      <button className="vt-close" aria-label="Fechar" onClick={onClose} style={{ background: 'none', border: 'none', color: '#9a8f82', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
        <X size={18} />
      </button>
    </div>
  )
}
