import React, { useState } from 'react'
import { LogIn } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { FONT, S, SUPPLIERS } from '../utils/constants'
import { fmtNum } from '../utils/format'
import Btn from './ui/Btn'
import FilterSelect from './ui/FilterSelect'
import { ModalHeader } from './ui/ModalShell'

export default function EntryForm({ wine, entry, suppliers, setSuppliers, entries, onSave, onClose, session, locations = [], noPrefill = false }) {
  const [f, setF] = useState(entry
    ? { date: entry.date, quantity: entry.quantity, supplier: entry.supplier || '', price: fmtNum(entry.price), locationId: '' }
    : { date: new Date().toISOString().slice(0, 10), quantity: 1, supplier: noPrefill ? '' : (suppliers?.[0] ?? SUPPLIERS[0]), price: noPrefill ? '' : fmtNum(wine?.purchasePrice), locationId: '' })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const list = suppliers ?? SUPPLIERS

  return (
    <>
      <ModalHeader title={entry ? 'Editar Entrada' : 'Registar Entrada'} subtitle={`${wine.name} · ${wine.year}`} onClose={onClose} />
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}><label style={S.lbl}>Data</label><input style={S.inp} type="date" value={f.date} onChange={e => set('date', e.target.value)} /></div>
        <div style={{ width: 80, flexShrink: 0 }}><label style={S.lbl}>Quantidade</label><input style={S.inp} type="number" min={1} value={f.quantity} onChange={e => set('quantity', e.target.value)} /></div>
      </div>
      <div style={S.field}>
        <label style={S.lbl}>Fornecedor</label>
        <FilterSelect
          placeholder="Seleccionar fornecedor"
          value={f.supplier}
          onChange={v => set('supplier', v)}
          options={list}
          onAdd={async (v) => {
            await supabase.from('videiras_suppliers').insert({ name: v, user_id: session.user.id })
            setSuppliers?.(p => [...p, v].sort((a, b) => a.localeCompare(b, 'pt')))
            set('supplier', v)
          }}
          onRemove={async (v) => {
            const hasMovements = (entries || []).some(e => e.supplier === v)
            if (hasMovements) { alert(`"${v}" tem entradas associadas e não pode ser eliminado.`); return }
            await supabase.from('videiras_suppliers').delete().eq('name', v)
            setSuppliers?.(p => p.filter(s => s !== v))
            set('supplier', list.find(s => s !== v) || '')
          }}
        />
      </div>
      <div style={S.field}><label style={S.lbl}>Preço por Garrafa (€)</label><input style={S.inp} value={f.price} onChange={e => set('price', e.target.value)} placeholder="0,00" /></div>
      {!entry && locations.length > 0 && (
        <div style={S.field}>
          <label style={S.lbl}>Localização (opcional)</label>
          <select style={{ ...S.inp, cursor: 'pointer' }} value={f.locationId} onChange={e => set('locationId', e.target.value)}>
            <option value="">— Sem localização —</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="gold" onClick={() => {
          if (f.quantity >= 1) {
            if (entry || window.confirm(`Registar entrada de ${f.quantity} ${parseInt(f.quantity) === 1 ? 'garrafa' : 'garrafas'} de "${wine.name}"?`))
              onSave({ ...f, quantity: parseInt(f.quantity), price: parseFloat((f.price + '').replace(',', '.')) || 0 })
          }
        }}><LogIn size={14} />{entry ? 'Guardar' : 'Registar Entrada'}</Btn>
      </div>
    </>
  )
}
