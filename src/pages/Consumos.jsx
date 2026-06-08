import React, { useState } from 'react'
import { Search, LogOut, Edit2, Trash2 } from 'lucide-react'
import { S } from '../utils/constants'
import Stars from '../components/ui/Stars'

export default function Consumos({ consumptions, wines, onEditConsumption, onDeleteConsumption }) {
  const [searchConsumos, setSearchConsumos] = useState('')

  const q = searchConsumos.toLowerCase()
  const filtered = [...consumptions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter(c => {
      const w = wines.find(x => x.id === c.wineId)
      return !q || w?.name.toLowerCase().includes(q) || c.notes?.toLowerCase().includes(q) || c.date.includes(q)
    })

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a453f' }} />
        <input style={{ ...S.inp, paddingLeft: 34 }} value={searchConsumos} onChange={e => setSearchConsumos(e.target.value)} placeholder="Pesquisar por vinho ou observações…" />
      </div>
      {filtered.length === 0
        ? <p style={{ textAlign: 'center', color: '#4a453f', paddingTop: 40, fontSize: 13 }}>{searchConsumos ? 'Nenhum resultado.' : 'Sem consumos registados.'}</p>
        : filtered.map(c => {
          const w = wines.find(x => x.id === c.wineId)
          return (
            <div key={c.id} style={{ ...S.card, display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, background: 'rgba(200,150,62,0.1)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LogOut size={13} color="#c8963e" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#e8dece', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w?.name || '(removido)'}</div>
                <div style={{ fontSize: 11, color: '#9a8f82', marginBottom: c.notes ? 4 : 0 }}>{c.date} · {c.quantity} {c.quantity === 1 ? 'garrafa' : 'garrafas'}</div>
                {c.notes && <div style={{ fontSize: 12, color: '#7a6f62', fontStyle: 'italic' }}>{c.notes}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <Stars value={c.rating} size={12} />
                <button onClick={() => { if (w) onEditConsumption(c, w) }} title="Editar consumo"
                  style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', flexShrink: 0, display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#c8963e'; e.currentTarget.style.background = 'rgba(200,150,62,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#6a5f52'; e.currentTarget.style.background = 'none' }}>
                  <Edit2 size={13} />
                </button>
                <button onClick={() => { if (window.confirm(`Cancelar consumo de ${c.quantity} ${c.quantity === 1 ? 'garrafa' : 'garrafas'} de "${w?.name}"? O stock será reposto.`)) onDeleteConsumption(c) }}
                  title="Cancelar consumo"
                  style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', flexShrink: 0, display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#e87080'; e.currentTarget.style.background = 'rgba(232,112,128,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#6a5f52'; e.currentTarget.style.background = 'none' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )
        })}
    </div>
  )
}
