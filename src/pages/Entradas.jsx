import React, { useState } from 'react'
import { Search, LogIn, Edit2, Trash2 } from 'lucide-react'
import { S } from '../utils/constants'
import { fmt } from '../utils/format'

export default function Entradas({ entries, wines, onEditEntry, onDeleteEntry }) {
  const [searchEntradas, setSearchEntradas] = useState('')

  const q = searchEntradas.toLowerCase()
  const filtered = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter(e => {
      const w = wines.find(x => x.id === e.wineId)
      return !q || w?.name.toLowerCase().includes(q) || e.supplier.toLowerCase().includes(q) || e.date.includes(q)
    })

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a453f' }} />
        <input style={{ ...S.inp, paddingLeft: 34 }} value={searchEntradas} onChange={e => setSearchEntradas(e.target.value)} placeholder="Pesquisar por vinho ou fornecedor…" />
      </div>
      {filtered.length === 0
        ? <p style={{ textAlign: 'center', color: '#4a453f', paddingTop: 40, fontSize: 13 }}>{searchEntradas ? 'Nenhum resultado.' : 'Sem entradas registadas.'}</p>
        : filtered.map(e => {
          const w = wines.find(x => x.id === e.wineId)
          return (
            <div key={e.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, background: 'rgba(104,200,128,0.1)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LogIn size={13} color="#68c880" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#e8dece', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w?.name || '(removido)'}</div>
                <div style={{ fontSize: 11, color: '#9a8f82' }}>{e.supplier} · {e.date}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#68c880' }}>+{e.quantity} gar.</div>
                <div style={{ fontSize: 11, color: '#9a8f82' }}>{fmt(e.price)}/un</div>
              </div>
              <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                <button onClick={() => { if (w) onEditEntry(e, w) }} title="Editar entrada"
                  style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                  onMouseEnter={e2 => { e2.currentTarget.style.color = '#c8963e'; e2.currentTarget.style.background = 'rgba(200,150,62,0.1)' }}
                  onMouseLeave={e2 => { e2.currentTarget.style.color = '#6a5f52'; e2.currentTarget.style.background = 'none' }}>
                  <Edit2 size={13} />
                </button>
                <button onClick={() => { if (window.confirm(`Cancelar entrada de ${e.quantity} ${e.quantity === 1 ? 'garrafa' : 'garrafas'} de "${w?.name}"? O stock será revertido.`)) onDeleteEntry(e) }}
                  title="Cancelar entrada"
                  style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', flexShrink: 0, display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                  onMouseEnter={e2 => { e2.currentTarget.style.color = '#e87080'; e2.currentTarget.style.background = 'rgba(232,112,128,0.1)' }}
                  onMouseLeave={e2 => { e2.currentTarget.style.color = '#6a5f52'; e2.currentTarget.style.background = 'none' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )
        })}
    </div>
  )
}
