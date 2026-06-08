import React, { useState, useEffect, useRef } from 'react'
import { S, FONT } from '../utils/constants'
import Badge from './ui/Badge'
import WineThumb from './ui/WineThumb'

export default function WineNameAutocomplete({ value, onChange, allWines, onExactMatch, onPartialMatch }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  const q = value.trim().toLowerCase()
  const suggestions = q.length >= 2
    ? allWines.filter(w => w.name.toLowerCase().includes(q)).slice(0, 8)
    : []

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        style={S.inp}
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => { if (suggestions.length) setOpen(true) }}
        placeholder="Ex: Quinta da Gaivosa"
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, marginTop: 4,
          background: '#1e1b16', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)', overflow: 'hidden',
        }}>
          <div style={{ padding: '6px 12px 4px', fontSize: 10, color: '#4a453f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Vinhos existentes — clica para dar entrada
          </div>
          {suggestions.map(w => (
            <div key={w.id}
              onMouseDown={e => { e.preventDefault(); setOpen(false); onExactMatch(w) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                cursor: 'pointer', transition: 'background 0.1s', borderTop: '1px solid rgba(255,255,255,0.04)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <WineThumb photo={w.photo} type={w.type} size={18} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#e8dece', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</div>
                <div style={{ fontSize: 11, color: '#9a8f82' }}>{w.year} · {w.region}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <Badge type={w.type} />
                  <div style={{ fontSize: 10, color: w.quantity > 0 ? '#68c880' : '#e87080', marginTop: 2 }}>
                    {w.quantity > 0 ? `${w.quantity} em stock` : 'sem stock'}
                  </div>
                </div>
                <button
                  onMouseDown={e => { e.stopPropagation(); e.preventDefault(); setOpen(false); onPartialMatch(w) }}
                  title="Criar novo vintage com este nome"
                  style={{ padding: '4px 8px', borderRadius: 5, border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)', color: '#6a6058', fontSize: 10,
                    cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  + vintage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
