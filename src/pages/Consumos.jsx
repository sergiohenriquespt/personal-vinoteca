import React, { useState } from 'react'
import { Search, LogOut, Edit2, Trash2 } from 'lucide-react'
import { S } from '../utils/constants'
import Stars from '../components/ui/Stars'
import RowBtn from '../components/ui/RowBtn'
import { mobileSearch } from './Entradas'

export default function Consumos({ consumptions, wines, onEditConsumption, onDeleteConsumption, isMobile: m }) {
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
        <Search size={m ? 20 : 13} style={{ position: 'absolute', left: m ? 16 : 12, top: '50%', transform: 'translateY(-50%)', color: m ? '#9a8f82' : '#4a453f' }} />
        <input style={{ ...S.inp, paddingLeft: m ? 46 : 34, ...(m ? mobileSearch : {}) }} value={searchConsumos} onChange={e => setSearchConsumos(e.target.value)} placeholder={m ? 'Pesquisar…' : 'Pesquisar por vinho ou observações…'} />
      </div>
      {filtered.length === 0
        ? <p style={{ textAlign: 'center', color: m ? '#9a8f82' : '#4a453f', paddingTop: 40, fontSize: m ? 16 : 13 }}>{searchConsumos ? 'Nenhum resultado.' : 'Sem consumos registados.'}</p>
        : filtered.map(c => {
          const w = wines.find(x => x.id === c.wineId)
          return (
            <div key={c.id} style={{ ...S.card, display: 'flex', alignItems: m ? 'center' : 'flex-start', gap: 14, marginBottom: m ? 10 : 8, ...(m ? { borderRadius: 18, padding: '14px 12px 14px 14px' } : {}) }}>
              <div style={{ width: m ? 44 : 32, height: m ? 44 : 32, background: 'rgba(200,150,62,0.1)', borderRadius: m ? 12 : 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LogOut size={m ? 20 : 13} color="#c8963e" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: m ? 17 : 13, fontWeight: m ? 500 : 400, color: '#e8dece', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w?.name || '(removido)'}</div>
                <div style={{ fontSize: m ? 15 : 11, color: '#9a8f82', marginTop: m ? 2 : 0, marginBottom: c.notes ? 4 : 0 }}>{c.date} · {c.quantity} {c.quantity === 1 ? 'garrafa' : 'garrafas'}</div>
                {m && c.rating > 0 && <div style={{ marginBottom: c.notes ? 4 : 0 }}><Stars value={c.rating} size={15} /></div>}
                {c.notes && <div style={{ fontSize: m ? 15 : 12, color: m ? '#9a8f82' : '#7a6f62', fontStyle: 'italic' }}>{c.notes}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {!m && <Stars value={c.rating} size={12} />}
                <RowBtn m={m} label="Editar consumo" onClick={() => { if (w) onEditConsumption(c, w) }}><Edit2 size={m ? 18 : 13} /></RowBtn>
                <RowBtn m={m} danger label="Cancelar consumo" onClick={() => { if (window.confirm(`Cancelar consumo de ${c.quantity} ${c.quantity === 1 ? 'garrafa' : 'garrafas'} de "${w?.name}"? O stock será reposto.`)) onDeleteConsumption(c) }}><Trash2 size={m ? 18 : 13} /></RowBtn>
              </div>
            </div>
          )
        })}
    </div>
  )
}
