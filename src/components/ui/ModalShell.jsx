import React, { useRef } from 'react'
import { X } from 'lucide-react'
import { FONT } from '../../utils/constants'

export default function ModalShell({ onClose, children, isMobile }) {
  const bdRef = useRef(false)
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
      <div onClick={e => e.stopPropagation()}
        style={{
          background: '#1e1b16', border: '1px solid rgba(255,255,255,0.1)',
          fontFamily: FONT, overflowY: 'auto',
          ...(isMobile
            ? { width: '100%', maxHeight: '92vh', borderRadius: '16px 16px 0 0', padding: '20px 16px 32px', overflowX: 'hidden' }
            : { borderRadius: 14, padding: '28px 28px 24px', width: '100%', maxWidth: 560, maxHeight: 'calc(100vh - 48px)' })
        }}>
        {children}
      </div>
    </div>
  )
}

export function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 300, color: '#e8dece', fontFamily: FONT, letterSpacing: '-0.01em' }}>{title}</h2>
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9a8f82' }}>{subtitle}</p>}
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9a8f82', cursor: 'pointer', padding: 4 }}>
        <X size={18} />
      </button>
    </div>
  )
}
