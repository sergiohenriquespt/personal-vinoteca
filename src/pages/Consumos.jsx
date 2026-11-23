import React, { useState } from 'react'
import { Search, LogOut, Edit2, Trash2 } from 'lucide-react'
import { S } from '../utils/constants'
import Stars from '../components/ui/Stars'
import RowBtn from '../components/ui/RowBtn'
import { searchInput } from './Entradas'

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
        <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9a8f82' }} />
        <input style={{ ...S.inp, paddingLeft: 46, ...searchInput }} value={searchConsumos} onChange={e => setSearchConsumos(e.target.value)} placeholder="Pesquisar…" />
      </div>
      {filtered.length === 0
        ? <p style={{ textAlign: 'center', color: '#9a8f82', paddingTop: 40, fontSize: 16 }}>{searchConsumos ? 'Nenhum resultado.' : 'Sem consumos registados.'}</p>
        : filtered.map(c => {
          const w = wines.find(x => x.id === c.wineId)
          return (
            <div key={c.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, borderRadius: 18, padding: '14px 12px 14px 14px' }}>
              <div style={{ width: 44, height: 44, background: 'rgba(200,150,62,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LogOut size={20} color="#c8963e" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 500, color: '#e8dece', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w?.name || '(removido)'}</div>
                <div style={{ fontSize: 15, color: '#9a8f82', marginTop: 2, marginBottom: c.notes ? 4 : 0 }}>{c.date} · {c.quantity} {c.quantity === 1 ? 'garrafa' : 'garrafas'}</div>
                {c.rating > 0 && <div style={{ marginBottom: c.notes ? 4 : 0 }}><Stars value={c.rating} size={15} /></div>}
                {c.notes && <div style={{ fontSize: 15, color: '#9a8f82', fontStyle: 'italic' }}>{c.notes}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <RowBtn label="Editar consumo" onClick={() => { if (w) onEditConsumption(c, w) }}><Edit2 size={18} /></RowBtn>
                <RowBtn danger label="Cancelar consumo" onClick={() => { if (window.confirm(`Cancelar consumo de ${c.quantity} ${c.quantity === 1 ? 'garrafa' : 'garrafas'} de "${w?.name}"? O stock será reposto.`)) onDeleteConsumption(c) }}><Trash2 size={18} /></RowBtn>
              </div>
            </div>
          )
        })}
    </div>
  )
}
