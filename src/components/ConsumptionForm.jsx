import React, { useState, useEffect } from 'react'
import { LogOut, MapPin, Check } from 'lucide-react'
import { supabase, getWineLocationData } from '../lib/supabase'
import { S, FONT } from '../utils/constants'
import { consumptionLocationOptions } from '../utils/consumptionLocation'
import { localISODate } from '../utils/format'
import Btn from './ui/Btn'
import Stars from './ui/Stars'
import Stepper from './ui/Stepper'
import { ModalHeader } from './ui/ModalShell'
import WineSearchSelect from './ui/WineSearchSelect'

const tileSt = (on) => ({
  width: '100%', minHeight: 64, padding: '0 16px', borderRadius: 18, boxSizing: 'border-box', cursor: 'pointer', fontFamily: FONT,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#e8dece',
  background: on ? 'rgba(200,150,62,0.10)' : '#161310',
  border: on ? '1.5px solid #c8963e' : '1px solid rgba(255,255,255,0.08)',
})
const radioSt = (on) => ({
  width: 26, height: 26, borderRadius: 13, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center',
  ...(on ? { background: '#c8963e' } : { border: '2px solid #5a524a' }),
})
const chipSt = (on) => ({
  minHeight: 52, borderRadius: 14, fontFamily: FONT, fontSize: 16, cursor: 'pointer',
  ...(on ? { border: '1.5px solid #c8963e', background: 'rgba(200,150,62,0.12)', color: '#c8963e', fontWeight: 600 }
         : { border: '1px solid rgba(255,255,255,0.10)', background: '#161310', color: '#e8dece' }),
})

export default function ConsumptionForm({ wine, consumption, onSave, onClose, wineLocations = [], locations = [], allowWineSelection = false, onWineChange, isMobile }) {
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
  const today = localISODate(), yesterday = localISODate(-1)

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
          {isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {locOptions.map(o => {
                const on = f.locationId === o.id
                return (
                  <button key={o.id} type="button" aria-pressed={on} onClick={() => pickLoc(o)} style={tileSt(on)}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><MapPin size={20} color={on ? '#c8963e' : '#9a8f82'} /><span style={{ fontSize: 17, fontWeight: 500 }}>{o.name}</span></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 15, color: '#9a8f82' }}>{o.quantity} {o.quantity === 1 ? 'garrafa' : 'garrafas'}</span>
                      <span style={radioSt(on)}>{on && <Check size={14} color="#0d0b09" strokeWidth={3.5} />}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <select style={{ ...S.inp, cursor: 'pointer' }} value={f.locationId} onChange={e => set('locationId', e.target.value)}>
              <option value="" disabled>— Escolher localização —</option>
              {locOptions.map(o => <option key={o.id} value={o.id}>{o.name} ({o.quantity})</option>)}
            </select>
          )}
        </div>
      )}
      {consLocName && (
        <div style={S.field}><label style={S.lbl}>Retirado de</label><div style={{ padding: '8px 0', fontSize: isMobile ? 17 : 14 }}>{consLocName}</div></div>
      )}
      {isMobile ? (
        <>
          <div style={S.field}>
            <label style={S.lbl}>Quantidade</label>
            <Stepper value={qty} min={1} max={maxQty} sub={`máx. ${maxQty}`} onChange={v => set('quantity', v)} />
          </div>
          <div style={S.field}>
            <label style={S.lbl}>Data</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: 8 }}>
              <button type="button" onClick={() => set('date', today)} style={chipSt(f.date === today)}>Hoje</button>
              <button type="button" onClick={() => set('date', yesterday)} style={chipSt(f.date === yesterday)}>Ontem</button>
              <input aria-label="Outra data" style={{ ...S.inp, minWidth: 0 }} type="date" value={f.date} onChange={e => set('date', e.target.value)} />
            </div>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1 }}><label style={S.lbl}>Data</label><input style={S.inp} type="date" value={f.date} onChange={e => set('date', e.target.value)} /></div>
          <div style={{ width: 80, flexShrink: 0 }}><label style={S.lbl}>Qtd. (máx. {maxQty})</label><input style={S.inp} type="number" min={1} max={maxQty} value={f.quantity} onChange={e => set('quantity', e.target.value)} /></div>
        </div>
      )}
      <div style={S.field}><label style={S.lbl}>Classificação Pessoal</label><div style={{ padding: '8px 0' }}><Stars value={f.rating} onChange={v => set('rating', v)} size={isMobile ? 44 : 22} /></div></div>
      <div style={S.field}><label style={S.lbl}>Observações</label><textarea style={{ ...S.inp, minHeight: isMobile ? 96 : 72, resize: 'vertical' }} value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="Ocasião, maridagem, notas de prova…" /></div>
      <div className="vt-actions" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {!isMobile && <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>}
        <Btn variant="gold" disabled={(allowWineSelection && !selectedWine) || missingLocation} onClick={() => {
          if (!effectiveWine || missingLocation) return
          if (f.quantity >= 1 && f.quantity <= maxQty) {
            if (consumption || window.confirm(`Registar consumo de ${f.quantity} ${parseInt(f.quantity) === 1 ? 'garrafa' : 'garrafas'} de "${effectiveWine.name}"?`))
              onSave({ ...f, quantity: parseInt(f.quantity), locationId: f.locationId === 'none' ? null : f.locationId || null })
          }
        }}><LogOut size={14} />{consumption ? 'Guardar' : isMobile ? `Registar ${qty} ${qty === 1 ? 'garrafa' : 'garrafas'}` : 'Registar Consumo'}</Btn>
      </div>
    </>
  )
}
