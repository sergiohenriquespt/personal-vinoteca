import React, { useState, useEffect } from 'react'
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

const RAIL_W = 96

// Barra compacta (desktop): ícone + etiqueta, como a navegação mobile
export default function Sidebar({ view, setView, onAction, email, onAbout, onLogout }) {
  const [sheet, setSheet] = useState(false)
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    if (!menu) return
    const h = (e) => { if (e.key === 'Escape') setMenu(false) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [menu])

  const menuItem = (color) => ({ width: '100%', height: 48, borderRadius: 12, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 12, border: 'none', background: 'transparent', color, cursor: 'pointer', fontFamily: FONT, fontSize: 16, fontWeight: 500, textAlign: 'left' })
  const hoverBg = (bg) => ({ onMouseEnter: e => { e.currentTarget.style.background = bg }, onMouseLeave: e => { e.currentTarget.style.background = 'transparent' } })

  return (
    <aside style={{ width: RAIL_W, flexShrink: 0, boxSizing: 'border-box', background: '#0d0b09', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '24px 0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', fontFamily: FONT }}>
      <span title="Videiras" style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Wine size={22} color="#c8963e" /></span>

      <button onClick={() => setSheet(true)} aria-label="Novo registo" title="Novo registo"
        style={{ width: 56, height: 56, borderRadius: 28, border: 'none', background: '#c8963e', color: '#0d0b09', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: '0 6px 20px rgba(200,150,62,0.25)' }}>
        <Plus size={26} strokeWidth={2.4} />
      </button>

      <nav aria-label="Navegação principal" style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', padding: '0 8px', boxSizing: 'border-box' }}>
        {NAV.map(({ id, icon: Icon, label, match }) => {
          const on = match.includes(view)
          return (
            <button key={id} onClick={() => { if (!on) setView(id) }} aria-current={on ? 'page' : undefined}
              style={{ padding: '6px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: FONT, color: on ? '#e8dece' : '#9a8f82' }}
              onMouseEnter={e => { if (!on) { e.currentTarget.style.color = '#e8dece'; e.currentTarget.firstChild.style.background = 'rgba(255,255,255,0.05)' } }}
              onMouseLeave={e => { if (!on) { e.currentTarget.style.color = '#9a8f82'; e.currentTarget.firstChild.style.background = 'transparent' } }}>
              <span style={{ width: 56, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', background: on ? 'rgba(200,150,62,0.16)' : 'transparent', color: on ? '#c8963e' : 'inherit' }}>
                <Icon size={22} strokeWidth={on ? 2.2 : 1.9} />
              </span>
              <span style={{ fontSize: 13, fontWeight: on ? 600 : 500 }}>{label}</span>
            </button>
          )
        })}
      </nav>

      <button onClick={() => setMenu(p => !p)} aria-label="Conta" aria-expanded={menu} title={email}
        style={{ marginTop: 'auto', width: 44, height: 44, borderRadius: 22, border: `1px solid ${menu ? 'rgba(200,150,62,0.5)' : 'rgba(255,255,255,0.08)'}`, background: 'rgba(200,150,62,0.14)', color: '#c8963e', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
        <User size={20} />
      </button>

      {menu && <>
        <div onClick={() => setMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
        <div role="menu" style={{ position: 'fixed', left: RAIL_W + 8, bottom: 16, zIndex: 41, width: 260, padding: 8, borderRadius: 18, background: '#1e1b16', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
          <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 6 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#e8dece' }}>A minha conta</div>
            <div title={email} style={{ fontSize: 13, color: '#9a8f82', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</div>
          </div>
          <button role="menuitem" onClick={() => { setMenu(false); onAbout() }} style={menuItem('#e8dece')} {...hoverBg('rgba(255,255,255,0.05)')}>
            <Wine size={20} color="#c8963e" />Quem é o Videiras?
          </button>
          <button role="menuitem" onClick={() => { setMenu(false); onLogout() }} style={menuItem('#f08a98')} {...hoverBg('rgba(192,48,74,0.10)')}>
            <LogOut size={20} />Terminar sessão
          </button>
        </div>
      </>}

      {sheet && <QuickActions centered onAction={onAction} onClose={() => setSheet(false)} />}
    </aside>
  )
}
