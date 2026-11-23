import React, { useState } from 'react'
import { Home, Wine, Plus, BarChart3, FileText, Settings, LogOut, User } from 'lucide-react'
import { FONT } from '../utils/constants'
import QuickActions from './QuickActions'

const NAV = [
  { id: 'dashboard',  icon: Home,      label: 'Início',     match: ['dashboard'] },
  { id: 'adega',      icon: Wine,      label: 'Adega',      match: ['adega'] },
  { id: 'consumos',   icon: BarChart3, label: 'Registos',   match: ['consumos', 'entradas'] },
  { id: 'relatorios', icon: FileText,  label: 'Relatórios', match: ['relatorios'] },
  { id: 'definicoes', icon: Settings,  label: 'Definições', match: ['definicoes'] },
]

export default function Sidebar({ view, setView, onAction, email, onAbout, onLogout }) {
  const [sheet, setSheet] = useState(false)
  // rodapé com o mesmo formato dos itens de navegação (48px, ícone + texto)
  const footerBtn = (color) => ({ height: 48, borderRadius: 12, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 12, border: 'none', background: 'transparent', color, cursor: 'pointer', fontFamily: FONT, fontSize: 16, fontWeight: 500, textAlign: 'left', transition: 'background 0.15s, color 0.15s' })
  return (
    <aside style={{ width: 248, flexShrink: 0, boxSizing: 'border-box', background: '#161310', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', fontFamily: FONT }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px' }}>
        <span style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Wine size={20} color="#c8963e" /></span>
        <span style={{ fontSize: 16, fontWeight: 300, color: '#e8dece', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Videiras</span>
      </div>

      <button onClick={() => setSheet(true)} style={{ height: 48, borderRadius: 14, border: 'none', background: '#c8963e', color: '#0d0b09', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 16, fontWeight: 600, fontFamily: FONT, cursor: 'pointer' }}>
        <Plus size={20} strokeWidth={2.4} />Novo registo
      </button>

      <nav aria-label="Navegação principal" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(({ id, icon: Icon, label, match }) => {
          const on = match.includes(view)
          return (
            <button key={id} onClick={() => { if (!on) setView(id) }} aria-current={on ? 'page' : undefined}
              style={{ height: 48, borderRadius: 12, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 12, border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 16, fontWeight: on ? 600 : 500, textAlign: 'left', transition: 'background 0.15s, color 0.15s',
                background: on ? 'rgba(200,150,62,0.12)' : 'transparent', color: on ? '#c8963e' : '#9a8f82' }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.color = '#e8dece' }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.color = '#9a8f82' }}>
              <Icon size={20} strokeWidth={1.9} />{label}
            </button>
          )
        })}
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, marginBottom: 6, borderRadius: 16, background: '#1e1b16', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ width: 40, height: 40, borderRadius: 20, background: 'rgba(200,150,62,0.14)', color: '#c8963e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><User size={20} /></span>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: '#e8dece' }}>A minha conta</span>
            <span title={email} style={{ fontSize: 13, color: '#9a8f82', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>
          </span>
        </div>
        <button onClick={onAbout} style={footerBtn('#9a8f82')}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#e8dece' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9a8f82' }}>
          <Wine size={20} strokeWidth={1.9} />Quem é o Videiras?
        </button>
        <button onClick={onLogout} style={footerBtn('#f08a98')}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,48,74,0.10)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
          <LogOut size={20} strokeWidth={1.9} />Terminar sessão
        </button>
      </div>

      {sheet && <QuickActions centered onAction={onAction} onClose={() => setSheet(false)} />}
    </aside>
  )
}
