import React, { useState } from 'react'
import { Home, Wine, Plus, BarChart3, LayoutGrid, LogOut, LogIn } from 'lucide-react'
import { FONT } from '../utils/constants'

// Separador ativo: Registos cobre entradas/consumos; Mais cobre relatórios/definições
const TAB_OF = { dashboard: 'dashboard', adega: 'adega', entradas: 'registos', consumos: 'registos', mais: 'mais', relatorios: 'mais', definicoes: 'mais' }

const ACTIONS = [
  { id: 'newCons',  icon: LogOut, title: 'Consumir garrafa', sub: 'Retira do stock e avalia', primary: true },
  { id: 'newEntry', icon: LogIn,  title: 'Registar entrada', sub: 'Compra de um vinho que já existe' },
  { id: 'addWine',  icon: Wine,   title: 'Novo vinho',       sub: 'Adicionar uma referência à adega' },
]

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

      {sheet && (
        <div onClick={() => setSheet(false)} style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', fontFamily: FONT }}>
          <div role="dialog" aria-label="Novo registo" onClick={e => e.stopPropagation()}
            style={{ width: '100%', background: '#161310', borderTop: '1px solid rgba(255,255,255,0.10)', borderRadius: '28px 28px 0 0', padding: '12px 16px max(24px, env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.18)', alignSelf: 'center', marginBottom: 8 }} />
            <div style={{ fontSize: 22, color: '#e8dece', padding: '0 6px 6px' }}>O que queres registar?</div>
            {ACTIONS.map(({ id, icon: Icon, title, sub, primary }) => (
              <button key={id} onClick={() => { setSheet(false); onAction(id) }}
                style={{ display: 'flex', alignItems: 'center', gap: 16, minHeight: 80, padding: '0 18px', borderRadius: 20, cursor: 'pointer', fontFamily: FONT, textAlign: 'left',
                  ...(primary ? { background: '#c8963e', color: '#0d0b09', border: 'none' } : { background: '#1e1b16', color: '#e8dece', border: '1px solid rgba(255,255,255,0.08)' }) }}>
                <span style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: primary ? 'rgba(13,11,9,0.14)' : 'rgba(200,150,62,0.12)', color: primary ? '#0d0b09' : '#c8963e' }}><Icon size={24} strokeWidth={2.2} /></span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 18, fontWeight: primary ? 600 : 500 }}>{title}</span>
                  <span style={{ fontSize: 14, color: primary ? 'rgba(13,11,9,0.75)' : '#9a8f82' }}>{sub}</span>
                </span>
              </button>
            ))}
            <button onClick={() => setSheet(false)} style={{ height: 56, marginTop: 4, borderRadius: 18, background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#e8dece', fontFamily: FONT, fontSize: 17, fontWeight: 500, cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}
    </>
  )
}
