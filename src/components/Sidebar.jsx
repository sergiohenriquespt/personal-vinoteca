import React, { useState } from 'react'
import { Home, Wine, Plus, BarChart3, FileText, Settings, LogOut } from 'lucide-react'
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
  const link = { background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: FONT, fontSize: 15, textAlign: 'left' }
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

      <div style={{ marginTop: 'auto', padding: '16px 8px 0', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontSize: 14, color: '#9a8f82', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>
        <button onClick={onAbout} style={{ ...link, color: '#9a8f82' }}>Quem é o Videiras?</button>
        <button onClick={onLogout} style={{ ...link, color: '#f08a98', display: 'flex', alignItems: 'center', gap: 8 }}><LogOut size={16} />Terminar sessão</button>
      </div>

      {sheet && <QuickActions centered onAction={onAction} onClose={() => setSheet(false)} />}
    </aside>
  )
}
