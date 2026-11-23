import React, { useState, useEffect } from 'react'
import { LogIn } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { S, SUPPLIERS } from '../utils/constants'
import { fmtNum, localISODate } from '../utils/format'
import Btn from './ui/Btn'
import Stepper from './ui/Stepper'
import { ChoiceTile, DateQuickPick } from './ui/Choice'
import FilterSelect from './ui/FilterSelect'
import { ModalHeader } from './ui/ModalShell'
import WineSearchSelect from './ui/WineSearchSelect'

export default function EntryForm({ wine, entry, suppliers, setSuppliers, entries, onSave, onClose, session, locations = [], noPrefill = false, allowWineSelection = false, onWineChange }) {
  const [selectedWine, setSelectedWine] = useState(null)
  const [wineOptions, setWineOptions] = useState([])
  const effectiveWine = allowWineSelection ? selectedWine : wine

  const [f, setF] = useState(entry
    ? { date: entry.date, quantity: entry.quantity, supplier: entry.supplier || '', price: fmtNum(entry.price), locationId: '' }
    : { date: localISODate(), quantity: 1, supplier: noPrefill ? '' : (suppliers?.[0] ?? SUPPLIERS[0]), price: (noPrefill || allowWineSelection) ? '' : fmtNum(wine?.purchasePrice), locationId: '' })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const list = suppliers ?? SUPPLIERS

  useEffect(() => {
    if (!allowWineSelection) return
    supabase.from('videiras_wines').select('id,name,year,purchase_price,producer').order('name')
      .then(({ data }) => setWineOptions(data || []))
  }, [allowWineSelection])

  const handleWineSelect = (row) => {
    if (!row) { setSelectedWine(null); onWineChange?.(null); return }
    const w = { id: row.id, name: row.name, year: row.year, purchasePrice: parseFloat(row.purchase_price) || 0 }
    setSelectedWine(w)
    set('price', fmtNum(w.purchasePrice))
    onWineChange?.(w)
  }

  // uma entrada nova tem de ir para uma localização (quando existem localizações)
  const missingLocation = !entry && locations.length > 0 && !f.locationId

  return (
    <>
      <ModalHeader title={entry ? 'Editar Entrada' : 'Registar Entrada'} subtitle={effectiveWine ? `${effectiveWine.name} · ${effectiveWine.year}` : undefined} onClose={onClose} />
      {allowWineSelection && (
        <div style={S.field}>
          <label style={S.lbl}>Vinho</label>
          <WineSearchSelect
            wines={wineOptions}
            onSelect={handleWineSelect}
            renderOption={w => `${w.name}${w.year ? ` (${w.year})` : ''}`}
          />
        </div>
      )}
      <div style={S.field}>
        <label style={S.lbl}>Quantidade</label>
        <Stepper value={f.quantity} min={1} onChange={v => set('quantity', v)} />
      </div>
      <div style={S.field}>
        <label style={S.lbl}>Data</label>
        <DateQuickPick value={f.date} onChange={v => set('date', v)} />
      </div>
      <div style={S.field}>
        <label style={S.lbl}>Fornecedor</label>
        <FilterSelect
          fill
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
      <div style={S.field}><label style={S.lbl}>Preço por Garrafa (€)</label><input style={S.inp} inputMode="decimal" value={f.price} onChange={e => set('price', e.target.value)} placeholder="0,00" /></div>
      {!entry && locations.length > 0 && (
        <div style={S.field}>
          <label style={S.lbl}>Localização *</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {locations.map(l => <ChoiceTile key={l.id} on={f.locationId === l.id} onClick={() => set('locationId', l.id)} label={l.name} />)}
          </div>
        </div>
      )}
      <div className="vt-actions" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="gold" disabled={(allowWineSelection && !selectedWine) || missingLocation} onClick={() => {
          if (!effectiveWine || missingLocation) return
          if (f.quantity >= 1) {
            if (entry || window.confirm(`Registar entrada de ${f.quantity} ${parseInt(f.quantity) === 1 ? 'garrafa' : 'garrafas'} de "${effectiveWine.name}"?`))
              onSave({ ...f, quantity: parseInt(f.quantity), price: parseFloat((f.price + '').replace(',', '.')) || 0 })
          }
        }}><LogIn size={18} />{entry ? 'Guardar' : 'Registar Entrada'}</Btn>
      </div>
    </>
  )
}
