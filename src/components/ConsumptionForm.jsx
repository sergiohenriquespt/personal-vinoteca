import React, { useState, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { supabase, getWineLocationData } from '../lib/supabase'
import { S } from '../utils/constants'
import { consumptionLocationOptions } from '../utils/consumptionLocation'
import { localISODate } from '../utils/format'
import Btn from './ui/Btn'
import Stars from './ui/Stars'
import Stepper from './ui/Stepper'
import { ChoiceTile, DateQuickPick } from './ui/Choice'
import { ModalHeader } from './ui/ModalShell'
import WineSearchSelect from './ui/WineSearchSelect'

export default function ConsumptionForm({ wine, consumption, onSave, onClose, wineLocations = [], locations = [], allowWineSelection = false, onWineChange }) {
  const [selectedWine, setSelectedWine] = useState(null)
  const [wineOptions, setWineOptions] = useState([])
  const effectiveWine = allowWineSelection ? selectedWine : wine

  const [f, setF] = useState(consumption
    ? { date: consumption.date, quantity: consumption.quantity, rating: consumption.rating || 0, notes: consumption.notes || '', locationId: '' }
    : { date: localISODate(), quantity: 1, rating: wine?.personalRating || 0, notes: '', locationId: '' })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const locOptions = effectiveWine && !consumption
    ? consumptionLocationOptions(effectiveWine.quantity, getWineLocationData(effectiveWine.id, wineLocations, locations))
    : []
  const selectedLoc = locOptions.find(o => o.id === f.locationId)
  // no edit, o máximo fica limitado ao que a localização original ainda tem + o que este consumo já retirou
  const consLoc = consumption?.locationId && wineLocations.find(wl => wl.wine_id === consumption.wineId && wl.location_id === consumption.locationId)
  const consLocName = consumption?.locationId && locations.find(l => l.id === consumption.locationId)?.name
  const maxQty = !effectiveWine ? 1
    : consumption ? (consLoc ? consLoc.quantity : effectiveWine.quantity) + consumption.quantity
    : selectedLoc ? selectedLoc.quantity
    : effectiveWine.quantity

  useEffect(() => {
    if (!consumption) set('locationId', locOptions.length === 1 ? locOptions[0].id : '')
  }, [effectiveWine?.id])

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

  const pickLoc = (o) => setF(p => ({ ...p, locationId: o.id, quantity: Math.min(parseInt(p.quantity) || 1, o.quantity) }))
  const qty = parseInt(f.quantity) || 1
  const missingLocation = locOptions.length > 0 && !f.locationId

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
      {locOptions.length > 0 && (
        <div style={S.field}>
          <label style={S.lbl}>Retirar de *</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {locOptions.map(o => <ChoiceTile key={o.id} on={f.locationId === o.id} onClick={() => pickLoc(o)} label={o.name} detail={`${o.quantity} ${o.quantity === 1 ? 'garrafa' : 'garrafas'}`} />)}
          </div>
        </div>
      )}
      {consLocName && (
        <div style={S.field}><label style={S.lbl}>Retirado de</label><div style={{ padding: '8px 0', fontSize: 17 }}>{consLocName}</div></div>
      )}
      <div style={S.field}>
        <label style={S.lbl}>Quantidade</label>
        <Stepper value={qty} min={1} max={maxQty} sub={`máx. ${maxQty}`} onChange={v => set('quantity', v)} />
      </div>
      <div style={S.field}>
        <label style={S.lbl}>Data</label>
        <DateQuickPick value={f.date} onChange={v => set('date', v)} />
      </div>
      <div style={S.field}><label style={S.lbl}>Classificação Pessoal</label><div style={{ padding: '8px 0' }}><Stars value={f.rating} onChange={v => set('rating', v)} size={40} /></div></div>
      <div style={S.field}><label style={S.lbl}>Observações</label><textarea style={{ ...S.inp, minHeight: 96, resize: 'vertical' }} value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="Ocasião, maridagem, notas de prova…" /></div>
      <div className="vt-actions" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="gold" disabled={(allowWineSelection && !selectedWine) || missingLocation} onClick={() => {
          if (!effectiveWine || missingLocation) return
          if (f.quantity >= 1 && f.quantity <= maxQty) {
            if (consumption || window.confirm(`Registar consumo de ${f.quantity} ${parseInt(f.quantity) === 1 ? 'garrafa' : 'garrafas'} de "${effectiveWine.name}"?`))
              onSave({ ...f, quantity: parseInt(f.quantity), locationId: f.locationId === 'none' ? null : f.locationId || null })
          }
        }}><LogOut size={18} />{consumption ? 'Guardar' : `Registar ${qty} ${qty === 1 ? 'garrafa' : 'garrafas'}`}</Btn>
      </div>
    </>
  )
}
