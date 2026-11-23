import React, { useState } from 'react'
import { Search, LogIn, Edit2, Trash2 } from 'lucide-react'
import { S } from '../utils/constants'
import { fmt } from '../utils/format'
import RowBtn from '../components/ui/RowBtn'

export const searchInput = { minHeight: 54, fontSize: 17, borderRadius: 16, background: '#1e1b16' }

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
        <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9a8f82' }} />
        <input style={{ ...S.inp, paddingLeft: 46, ...searchInput }} value={searchEntradas} onChange={e => setSearchEntradas(e.target.value)} placeholder="Pesquisar…" />
      </div>
      {filtered.length === 0
        ? <p style={{ textAlign: 'center', color: '#9a8f82', paddingTop: 40, fontSize: 16 }}>{searchEntradas ? 'Nenhum resultado.' : 'Sem entradas registadas.'}</p>
        : filtered.map(e => {
          const w = wines.find(x => x.id === e.wineId)
          return (
            <div key={e.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, borderRadius: 18, padding: '14px 12px 14px 14px' }}>
              <div style={{ width: 44, height: 44, background: 'rgba(104,200,128,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LogIn size={20} color="#68c880" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 500, color: '#e8dece', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w?.name || '(removido)'}</div>
                <div style={{ fontSize: 15, color: '#9a8f82', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.supplier} · {e.date}</div>
                <div style={{ fontSize: 15, marginTop: 2 }}><span style={{ color: '#68c880', fontWeight: 500 }}>+{e.quantity}</span> <span style={{ color: '#9a8f82' }}>· {fmt(e.price)}/un</span></div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <RowBtn label="Editar entrada" onClick={() => { if (w) onEditEntry(e, w) }}><Edit2 size={18} /></RowBtn>
                <RowBtn danger label="Cancelar entrada" onClick={() => { if (window.confirm(`Cancelar entrada de ${e.quantity} ${e.quantity === 1 ? 'garrafa' : 'garrafas'} de "${w?.name}"? O stock será revertido.`)) onDeleteEntry(e) }}><Trash2 size={18} /></RowBtn>
              </div>
            </div>
          )
        })}
    </div>
  )
}
