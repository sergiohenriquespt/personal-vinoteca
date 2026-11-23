import React, { useState } from 'react'
import { Home, Wine, Plus, BarChart3, LayoutGrid } from 'lucide-react'
import { FONT } from '../utils/constants'
import QuickActions from './QuickActions'

// Separador ativo: Registos cobre entradas/consumos; Mais cobre relatórios/definições
const TAB_OF = { dashboard: 'dashboard', adega: 'adega', entradas: 'registos', consumos: 'registos', mais: 'mais', relatorios: 'mais', definicoes: 'mais' }

export default function MobileNav({ view, setView, onAction }) {
  const [sheet, setSheet] = useState(false)
  const active = TAB_OF[view]
  const tab = (id, Icon, label, go) => {
    const on = active === id
    return (
      <button key={id} onClick={go} aria-current={on ? 'page' : undefined}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT, color: on ? '#c8963e' : '#9a8f82', minWidth: 0, padding: 0 }}>
        <span style={{ padding: '4px 16px', borderRadius: 14, background: on ? 'rgba(200,150,62,0.14)' : 'transparent', display: 'flex', transition: 'background 0.15s' }}><Icon size={24} strokeWidth={1.9} /></span>
        <span style={{ fontSize: 12, fontWeight: on ? 600 : 500 }}>{label}</span>
      </button>
    )
  }

  return (
    <>
      <nav aria-label="Navegação principal" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 20, background: '#161310', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', height: 'calc(70px + env(safe-area-inset-bottom))', padding: '4px 8px env(safe-area-inset-bottom)' }}>
        {tab('dashboard', Home, 'Início', () => setView('dashboard'))}
        {tab('adega', Wine, 'Adega', () => setView('adega'))}
        <button onClick={() => setSheet(true)} aria-label="Novo registo" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
          <span style={{ width: 62, height: 62, marginTop: -24, borderRadius: 31, background: '#c8963e', color: '#0d0b09', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(200,150,62,0.35), 0 0 0 6px #0d0b09' }}><Plus size={30} strokeWidth={2.4} /></span>
        </button>
        {tab('registos', BarChart3, 'Registos', () => { if (active !== 'registos') setView('consumos') })}
        {tab('mais', LayoutGrid, 'Mais', () => setView('mais'))}
      </nav>

      {sheet && <QuickActions onAction={onAction} onClose={() => setSheet(false)} />}
    </>
  )
}
