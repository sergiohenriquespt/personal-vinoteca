import React from 'react'
import { MapPin, Check } from 'lucide-react'
import { FONT, S } from '../../utils/constants'
import { localISODate } from '../../utils/format'

// Cartão de escolha única (ex.: localização), com indicador de seleção à direita
export function ChoiceTile({ on, onClick, label, detail }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      style={{ width: '100%', minHeight: 64, padding: '0 16px', borderRadius: 18, boxSizing: 'border-box', cursor: 'pointer', fontFamily: FONT,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, color: '#e8dece',
        background: on ? 'rgba(200,150,62,0.10)' : '#161310', border: on ? '1.5px solid #c8963e' : '1px solid rgba(255,255,255,0.08)' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><MapPin size={20} color={on ? '#c8963e' : '#9a8f82'} /><span style={{ fontSize: 17, fontWeight: 500 }}>{label}</span></span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {detail && <span style={{ fontSize: 15, color: '#9a8f82' }}>{detail}</span>}
        <span style={{ width: 26, height: 26, borderRadius: 13, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', ...(on ? { background: '#c8963e' } : { border: '2px solid #5a524a' }) }}>
          {on && <Check size={14} color="#0d0b09" strokeWidth={3.5} />}
        </span>
      </span>
    </button>
  )
}

const chip = (on) => ({
  minHeight: 52, borderRadius: 14, fontFamily: FONT, fontSize: 16, cursor: 'pointer',
  ...(on ? { border: '1.5px solid #c8963e', background: 'rgba(200,150,62,0.12)', color: '#c8963e', fontWeight: 600 }
         : { border: '1px solid rgba(255,255,255,0.10)', background: '#161310', color: '#e8dece' }),
})

// Data com atalhos Hoje/Ontem e um campo para qualquer outra data
export function DateQuickPick({ value, onChange }) {
  const today = localISODate(), yesterday = localISODate(-1)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: 8 }}>
      <button type="button" onClick={() => onChange(today)} style={chip(value === today)}>Hoje</button>
      <button type="button" onClick={() => onChange(yesterday)} style={chip(value === yesterday)}>Ontem</button>
      <input aria-label="Outra data" className="vt-date" style={{ ...S.inp, minWidth: 0, width: '100%' }} type="date" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}
