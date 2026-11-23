import React, { useState } from 'react'
import { Search, LogIn, Edit2, Trash2 } from 'lucide-react'
import { S } from '../utils/constants'
import { fmt } from '../utils/format'
import RowBtn from '../components/ui/RowBtn'

export const mobileSearch = { minHeight: 54, fontSize: 17, borderRadius: 16, background: '#1e1b16' }

export default function Entradas({ entries, wines, onEditEntry, onDeleteEntry, isMobile: m }) {
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
        <Search size={m ? 20 : 13} style={{ position: 'absolute', left: m ? 16 : 12, top: '50%', transform: 'translateY(-50%)', color: m ? '#9a8f82' : '#4a453f' }} />
        <input style={{ ...S.inp, paddingLeft: m ? 46 : 34, ...(m ? mobileSearch : {}) }} value={searchEntradas} onChange={e => setSearchEntradas(e.target.value)} placeholder={m ? 'Pesquisar…' : 'Pesquisar por vinho ou fornecedor…'} />
      </div>
      {filtered.length === 0
        ? <p style={{ textAlign: 'center', color: m ? '#9a8f82' : '#4a453f', paddingTop: 40, fontSize: m ? 16 : 13 }}>{searchEntradas ? 'Nenhum resultado.' : 'Sem entradas registadas.'}</p>
        : filtered.map(e => {
          const w = wines.find(x => x.id === e.wineId)
          return (
            <div key={e.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 14, marginBottom: m ? 10 : 8, ...(m ? { borderRadius: 18, padding: '14px 12px 14px 14px' } : {}) }}>
              <div style={{ width: m ? 44 : 32, height: m ? 44 : 32, background: 'rgba(104,200,128,0.1)', borderRadius: m ? 12 : 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LogIn size={m ? 20 : 13} color="#68c880" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: m ? 17 : 13, fontWeight: m ? 500 : 400, color: '#e8dece', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w?.name || '(removido)'}</div>
                <div style={{ fontSize: m ? 15 : 11, color: '#9a8f82', marginTop: m ? 2 : 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.supplier} · {e.date}</div>
                {m && <div style={{ fontSize: 15, marginTop: 2 }}><span style={{ color: '#68c880', fontWeight: 500 }}>+{e.quantity}</span> <span style={{ color: '#9a8f82' }}>· {fmt(e.price)}/un</span></div>}
              </div>
              {!m && (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#68c880' }}>+{e.quantity} gar.</div>
                  <div style={{ fontSize: 11, color: '#9a8f82' }}>{fmt(e.price)}/un</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: m ? 6 : 2, flexShrink: 0 }}>
                <RowBtn m={m} label="Editar entrada" onClick={() => { if (w) onEditEntry(e, w) }}><Edit2 size={m ? 18 : 13} /></RowBtn>
                <RowBtn m={m} danger label="Cancelar entrada" onClick={() => { if (window.confirm(`Cancelar entrada de ${e.quantity} ${e.quantity === 1 ? 'garrafa' : 'garrafas'} de "${w?.name}"? O stock será revertido.`)) onDeleteEntry(e) }}><Trash2 size={m ? 18 : 13} /></RowBtn>
              </div>
            </div>
          )
        })}
    </div>
  )
}
