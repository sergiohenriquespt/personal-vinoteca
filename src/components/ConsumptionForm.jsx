import React, { useState, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { supabase, getWineLocationData } from '../lib/supabase'
import { S } from '../utils/constants'
import Btn from './ui/Btn'
import Stars from './ui/Stars'
import { ModalHeader } from './ui/ModalShell'
import WineSearchSelect from './ui/WineSearchSelect'

export default function ConsumptionForm({ wine, consumption, onSave, onClose, wineLocations = [], locations = [], allowWineSelection = false, onWineChange }) {
  const [selectedWine, setSelectedWine] = useState(null)
  const [wineOptions, setWineOptions] = useState([])
  const effectiveWine = allowWineSelection ? selectedWine : wine

  const [f, setF] = useState(consumption
    ? { date: consumption.date, quantity: consumption.quantity, rating: consumption.rating || 0, notes: consumption.notes || '', locationId: '' }
    : { date: new Date().toISOString().slice(0, 10), quantity: 1, rating: wine?.personalRating || 0, notes: '', locationId: '' })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const maxQty = effectiveWine ? (consumption ? effectiveWine.quantity + consumption.quantity : effectiveWine.quantity) : 1
  const wineLocData = effectiveWine ? getWineLocationData(effectiveWine.id, wineLocations, locations) : []

  useEffect(() => {
    if (!allowWineSelection) return
    supabase.from('videiras_wines').select('id,name,year,quantity,personal_rating,producer').gt('quantity', 0).order('name')
      .then(({ data }) => setWineOptions(data || []))
  }, [allowWineSelection])

  const handleWineSelect = (row) => {
    if (!row) { setSelectedWine(null); onWineChange?.(null); return }
    const w = { id: row.id, name: row.name, year: row.year, quantity: row.quantity, personalRating: row.personal_rating || 0 }
    setSelectedWine(w)
    set('rating', w.personalRating)
    onWineChange?.(w)
  }

  return (
    <>
      <ModalHeader title={consumption ? 'Editar Consumo' : 'Registar Consumo'} subtitle={effectiveWine ? `${effectiveWine.name} · ${effectiveWine.year} · ${maxQty} disponíveis` : undefined} onClose={onClose} />
      {allowWineSelection && (
        <div style={S.field}>
          <label style={S.lbl}>Vinho</label>
          <WineSearchSelect
            wines={wineOptions}
            onSelect={handleWineSelect}
            renderOption={w => `${w.name}${w.year ? ` (${w.year})` : ''} — ${w.quantity} ${w.quantity === 1 ? 'garrafa' : 'garrafas'}`}
          />
        </div>
      )}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}><label style={S.lbl}>Data</label><input style={S.inp} type="date" value={f.date} onChange={e => set('date', e.target.value)} /></div>
        <div style={{ width: 80, flexShrink: 0 }}><label style={S.lbl}>Qtd. (máx. {maxQty})</label><input style={S.inp} type="number" min={1} max={maxQty} value={f.quantity} onChange={e => set('quantity', e.target.value)} /></div>
      </div>
      {!consumption && wineLocData.length > 0 && (
        <div style={S.field}>
          <label style={S.lbl}>Retirar de</label>
          <select style={{ ...S.inp, cursor: 'pointer' }} value={f.locationId} onChange={e => set('locationId', e.target.value)}>
            <option value="">— Não especificar —</option>
            {wineLocData.map(ld => <option key={ld.location_id} value={ld.location_id}>{ld.name} ({ld.quantity} disponíveis)</option>)}
          </select>
        </div>
      )}
      <div style={S.field}><label style={S.lbl}>Classificação Pessoal</label><div style={{ padding: '8px 0' }}><Stars value={f.rating} onChange={v => set('rating', v)} size={22} /></div></div>
      <div style={S.field}><label style={S.lbl}>Observações</label><textarea style={{ ...S.inp, minHeight: 72, resize: 'vertical' }} value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="Ocasião, maridagem, notas de prova…" /></div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="gold" disabled={allowWineSelection && !selectedWine} onClick={() => {
          if (!effectiveWine) return
          if (f.quantity >= 1 && f.quantity <= maxQty) {
            if (consumption || window.confirm(`Registar consumo de ${f.quantity} ${parseInt(f.quantity) === 1 ? 'garrafa' : 'garrafas'} de "${effectiveWine.name}"?`))
              onSave({ ...f, quantity: parseInt(f.quantity) })
          }
        }}><LogOut size={14} />{consumption ? 'Guardar' : 'Registar Consumo'}</Btn>
      </div>
    </>
  )
}
