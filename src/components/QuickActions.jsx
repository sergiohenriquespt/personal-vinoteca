import React from 'react'
import { createPortal } from 'react-dom'
import { Wine, LogOut, LogIn } from 'lucide-react'
import { FONT } from '../utils/constants'

const ACTIONS = [
  { id: 'newCons',  icon: LogOut, title: 'Consumir garrafa', sub: 'Retira do stock e avalia', primary: true },
  { id: 'newEntry', icon: LogIn,  title: 'Registar entrada', sub: 'Compra de um vinho que já existe' },
  { id: 'addWine',  icon: Wine,   title: 'Novo vinho',       sub: 'Adicionar uma referência à adega' },
]

// Escolha do tipo de registo: folha inferior em mobile, janela centrada em desktop
export default function QuickActions({ onAction, onClose, centered }) {
  // portal: a barra lateral é sticky (contexto de empilhamento próprio) e escondia a janela atrás da página
  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: centered ? 'center' : 'flex-end', justifyContent: 'center', fontFamily: FONT }}>
      <div role="dialog" aria-label="Novo registo" onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: centered ? 460 : undefined, background: '#161310', border: '1px solid rgba(255,255,255,0.10)', borderRadius: centered ? 24 : '28px 28px 0 0', padding: centered ? 20 : '12px 16px max(24px, env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {!centered && <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.18)', alignSelf: 'center', marginBottom: 8 }} />}
        <div style={{ fontSize: 22, color: '#e8dece', padding: '0 6px 6px' }}>O que queres registar?</div>
        {ACTIONS.map(({ id, icon: Icon, title, sub, primary }) => (
          <button key={id} onClick={() => { onClose(); onAction(id) }}
            style={{ display: 'flex', alignItems: 'center', gap: 16, minHeight: 80, padding: '0 18px', borderRadius: 20, cursor: 'pointer', fontFamily: FONT, textAlign: 'left',
              ...(primary ? { background: '#c8963e', color: '#0d0b09', border: 'none' } : { background: '#1e1b16', color: '#e8dece', border: '1px solid rgba(255,255,255,0.08)' }) }}>
            <span style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: primary ? 'rgba(13,11,9,0.14)' : 'rgba(200,150,62,0.12)', color: primary ? '#0d0b09' : '#c8963e' }}><Icon size={24} strokeWidth={2.2} /></span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 18, fontWeight: primary ? 600 : 500 }}>{title}</span>
              <span style={{ fontSize: 14, color: primary ? 'rgba(13,11,9,0.75)' : '#9a8f82' }}>{sub}</span>
            </span>
          </button>
        ))}
        <button onClick={onClose} style={{ height: 56, marginTop: 4, borderRadius: 18, background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#e8dece', fontFamily: FONT, fontSize: 17, fontWeight: 500, cursor: 'pointer' }}>Cancelar</button>
      </div>
    </div>,
    document.body
  )
}
