import React, { useState } from 'react'
import { Check, X, Trash2 } from 'lucide-react'
import { S } from '../../utils/constants'

export default function FilterSelect({ placeholder, value, onChange, options, onAdd, onRemove, fill }) {
  const [adding, setAdding] = useState(false)
  const [newVal, setNewVal] = useState('')

  const confirmAdd = () => {
    const v = newVal.trim()
    if (v && !options.includes(v)) onAdd(v)
    setNewVal(''); setAdding(false)
  }

  const handleRemove = () => {
    if (!value) return
    if (!window.confirm(`Eliminar "${value}" da lista?`)) return
    onRemove(value)
    onChange('')
  }

  if (adding) return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <input
        style={{ ...S.inp, width: 110, padding: '6px 8px', fontSize: 12 }}
        value={newVal} onChange={e => setNewVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') setAdding(false) }}
        placeholder="Novo…" autoFocus
      />
      <button onClick={confirmAdd} style={{ background: 'rgba(200,150,62,0.2)', border: 'none', borderRadius: 5, color: '#c8963e', cursor: 'pointer', padding: '5px 7px', display: 'flex' }}><Check size={12} /></button>
      <button onClick={() => setAdding(false)} style={{ background: 'none', border: 'none', color: '#6a6058', cursor: 'pointer', padding: '5px 4px', display: 'flex' }}><X size={12} /></button>
    </div>
  )

  return (
    <div style={{ display: 'flex', gap: fill ? 6 : 3, alignItems: fill ? undefined : 'center', width: fill ? '100%' : undefined }}>
      <select
        style={{ ...S.inp, width: fill ? undefined : 'auto', flex: fill ? 1 : undefined, minWidth: fill ? 0 : undefined, fontSize: fill ? 14 : 12, cursor: 'pointer', paddingRight: 24 }}
        value={value} onChange={e => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <button onClick={() => setAdding(true)} title={`Adicionar a ${placeholder}`}
        style={fill
          ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#9a8f82', cursor: 'pointer', padding: '0 10px', fontSize: 18 }
          : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 5, color: '#6a6058', cursor: 'pointer', padding: '4px 7px', fontSize: 15, lineHeight: 1, display: 'flex', alignItems: 'center' }}>+</button>
      {onRemove && value && (
        <button onClick={handleRemove} title={`Eliminar "${value}"`}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, color: '#3a3530', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', transition: 'color 0.15s, border-color 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#e87080'; e.currentTarget.style.borderColor = 'rgba(232,112,128,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#3a3530'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
          <Trash2 size={11} />
        </button>
      )}
    </div>
  )
}
