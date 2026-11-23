import React from 'react'
import { Minus, Plus } from 'lucide-react'

// Contador −/+ para mobile. compact: versão para linhas (ex.: quantidade por localização)
export default function Stepper({ value, onChange, min = 0, max = Infinity, sub, compact, label = 'quantidade' }) {
  const n = parseInt(value) || 0
  const btn = compact ? 44 : 60
  const st = (off) => ({ width: btn, height: btn, borderRadius: compact ? 12 : 16, border: 'none', background: '#2e2920', color: '#e8dece', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, opacity: off ? 0.4 : 1 })
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: compact ? 4 : 8, borderRadius: compact ? 16 : 20, background: '#0d0b09', border: '1px solid rgba(255,255,255,0.06)' }}>
      <button type="button" aria-label={`Diminuir ${label}`} disabled={n <= min} onClick={() => onChange(Math.max(min, n - 1))} style={st(n <= min)}><Minus size={compact ? 20 : 26} /></button>
      <div style={{ textAlign: 'center', minWidth: compact ? 32 : 60 }}>
        <div style={{ fontSize: compact ? 22 : 40, fontWeight: 300, lineHeight: 1, color: '#e8dece' }}>{n}</div>
        {sub && <div style={{ fontSize: 13, color: '#9a8f82', marginTop: 4 }}>{sub}</div>}
      </div>
      <button type="button" aria-label={`Aumentar ${label}`} disabled={n >= max} onClick={() => onChange(Math.min(max, n + 1))} style={st(n >= max)}><Plus size={compact ? 20 : 26} /></button>
    </div>
  )
}
