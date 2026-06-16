import React, { useState, useEffect, useRef } from 'react'
import { FONT, S } from '../../utils/constants'

export default function WineSearchSelect({ wines = [], onSelect, placeholder = 'Pesquisar vinho...', renderOption }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = query.length < 1 ? [] : wines.filter(w => {
    const q = query.toLowerCase()
    return (w.name || '').toLowerCase().includes(q)
      || (w.producer || '').toLowerCase().includes(q)
      || String(w.year || '').includes(q)
  })

  const handleSelect = (wine) => {
    setQuery(wine.name)
    setOpen(false)
    onSelect(wine)
  }

  const handleChange = (e) => {
    const v = e.target.value
    setQuery(v)
    setOpen(v.length >= 1)
    if (!v) onSelect(null)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        style={S.inp}
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          zIndex: 50, marginTop: 4,
          background: '#1e1b16', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 6, overflowY: 'auto', maxHeight: 304,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {filtered.map((wine, i) => (
            <div
              key={wine.id}
              onMouseDown={e => { e.preventDefault(); handleSelect(wine) }}
              style={{
                padding: '9px 12px', cursor: 'pointer',
                fontSize: 13, color: '#e8dece', fontFamily: FONT,
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                transition: 'background 0.1s, color 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,150,62,0.1)'; e.currentTarget.style.color = '#c8963e' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#e8dece' }}
            >
              {renderOption ? renderOption(wine) : wine.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
