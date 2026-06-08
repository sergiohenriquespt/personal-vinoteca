import React, { useState, useEffect, useRef } from 'react'
import { Check, X, Camera, ImageOff, Search, ExternalLink } from 'lucide-react'
import { supabase, isStorageUrl, uploadWinePhoto, deleteWinePhoto, ESTIMATE_FN_URL } from '../lib/supabase'
import { FONT, S, BOTTLE_SIZES, COUNTRIES_REGIONS } from '../utils/constants'
import { fmtNum } from '../utils/format'
import { readFileAsBase64 } from '../utils/format'
import Btn from './ui/Btn'
import Stars from './ui/Stars'
import FilterSelect from './ui/FilterSelect'
import WineNameAutocomplete from './WineNameAutocomplete'
import { ModalHeader } from './ui/ModalShell'

function PhotoUpload({ value, onChange, userId }) {
  const ref = useRef()
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (!userId) { onChange(await readFileAsBase64(file)); return }
    setUploading(true)
    try {
      if (isStorageUrl(value)) await deleteWinePhoto(value)
      const url = await uploadWinePhoto(file, userId)
      onChange(url)
    } catch (err) {
      alert('Erro ao carregar foto: ' + err.message)
    }
    setUploading(false)
  }

  const handleRemove = async () => {
    if (isStorageUrl(value)) await deleteWinePhoto(value)
    onChange(null)
  }

  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
      {value
        ? <img src={value} alt="" style={{ width: 52, height: 78, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' }} />
        : <div style={{ width: 52, height: 78, borderRadius: 6, background: '#0d0b09', border: '1px dashed rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Camera size={18} color="#4a453f" />
          </div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        <Btn variant="ghost" onClick={() => ref.current?.click()} disabled={uploading}>
          <Camera size={13} />{uploading ? 'A carregar…' : value ? 'Alterar foto' : 'Adicionar foto'}
        </Btn>
        {value && !uploading && <Btn variant="danger" onClick={handleRemove} style={{ padding: '4px 10px', fontSize: 12 }}><ImageOff size={12} />Remover</Btn>}
      </div>
    </div>
  )
}

export default function WineForm({ wine, types, setTypes, countriesRegions, setCountriesRegions, allWines, onExactMatch, onSave, onClose, isMobile, locations = [], setLocations, session, wineLocationRows = [], critics = [] }) {
  const blank = { name: '', type: 'Tinto', country: 'Portugal', region: '', year: new Date().getFullYear(), purchasePrice: '', marketPrice: '', personalRating: 0, vivinoRating: '', quantity: 0, photo: null, notes: '', castas: '', alcoholContent: '', producer: '', winemaker: '', bottleSize: 750, criticRatings: {} }
  const [f, setF] = useState(wine ? { ...wine, purchasePrice: fmtNum(wine.purchasePrice), marketPrice: fmtNum(wine.marketPrice), vivinoRating: fmtNum(wine.vivinoRating) } : blank)
  const [loadingV,     setLoadingV]     = useState(false)
  const [vivinoStatus, setVivinoStatus] = useState('idle')
  const [showTech,     setShowTech]     = useState(!!(wine && (wine.producer || wine.winemaker || wine.castas || (wine.alcoholContent !== '' && wine.alcoholContent != null))))
  const [newType,      setNewType]      = useState('')
  const [addingType,   setAddingType]   = useState(false)
  const [locationRows,          setLocationRows]          = useState(wineLocationRows)
  const [addingLocationForRow,  setAddingLocationForRow]  = useState(null)
  const [newLocationName,       setNewLocationName]       = useState('')

  useEffect(() => {
    if (wine?.photo !== undefined && f.photo === undefined) set('photo', wine.photo || null)
  }, [wine?.photo])

  const confirmAddLocationForRow = async () => {
    const name = newLocationName.trim()
    if (!name) return
    const { data } = await supabase.from('videiras_locations').insert({ name, user_id: session?.user?.id }).select().single()
    if (data) {
      setLocations?.(p => [...p, data].sort((a, b) => a.name.localeCompare(b.name, 'pt')))
      if (typeof addingLocationForRow === 'number') {
        setLocationRows(p => p.map((r, i) => i === addingLocationForRow ? { ...r, locationId: data.id } : r))
      } else {
        setLocationRows(p => [...p, { locationId: data.id, quantity: 1 }])
      }
    }
    setAddingLocationForRow(null)
    setNewLocationName('')
  }

  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const regions = (countriesRegions || COUNTRIES_REGIONS)[f.country] || []
  const allCountriesForm = Object.keys(countriesRegions || COUNTRIES_REGIONS)

  const addCountryForm = (name) => { setCountriesRegions?.(p => ({ ...p, [name]: [] })); set('country', name); set('region', '') }
  const addRegionForm = (region) => { setCountriesRegions?.(p => ({ ...p, [f.country]: [...(p[f.country] || []), region] })); set('region', region) }

  const fetchVivino = async () => {
    if (!f.name) return
    setLoadingV(true); setVivinoStatus('idle')
    try {
      const { data: { session: s } } = await supabase.auth.getSession()
      const res = await fetch(ESTIMATE_FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${s.access_token}` },
        body: JSON.stringify({ name: f.name, year: f.year || null }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const parsed = await res.json()
      if (parsed.rating && parsed.rating >= 1 && parsed.rating <= 5) {
        set('vivinoRating', parsed.rating.toFixed(1)); setVivinoStatus('ok')
      } else { setVivinoStatus('error') }
    } catch (_) { setVivinoStatus('error') }
    setLoadingV(false)
    setTimeout(() => setVivinoStatus('idle'), 3000)
  }

  const handleSave = () => {
    if (!f.name.trim()) return
    const criticRatings = Object.fromEntries(
      Object.entries(f.criticRatings || {}).map(([k, v]) => [k, parseInt(v)]).filter(([, v]) => !isNaN(v))
    )
    onSave({ ...f, locationRows, criticRatings,
      purchasePrice: parseFloat((f.purchasePrice + '').replace(',', '.')) || 0,
      marketPrice: parseFloat((f.marketPrice + '').replace(',', '.')) || null,
      vivinoRating: parseFloat((f.vivinoRating + '').replace(',', '.')) || null,
      year: parseInt(f.year) || null, personalRating: f.personalRating || 0,
      quantity: wine ? f.quantity : parseInt(f.quantity) || 0 })
  }

  const confirmNewType = () => {
    const t = newType.trim()
    if (!t || types.includes(t)) return
    setTypes(p => [...p, t]); set('type', t); setNewType(''); setAddingType(false)
  }

  const secHead = (label, collapsible, open, onToggle) => (
    <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0 10px', cursor: collapsible ? 'pointer' : 'default', userSelect: 'none' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: collapsible ? '#9a8f82' : '#6a6058', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap', transition: 'color 0.15s' }}>
        {collapsible && <span style={{ display: 'inline-block', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s', fontSize: 8 }}>▶</span>}
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
    </div>
  )

  return (
    <>
      <ModalHeader title={wine ? 'Editar Vinho' : 'Novo Vinho'} onClose={onClose} />
      {secHead('Identificação', false)}
      <div style={S.field}><label style={S.lbl}>Fotografia</label><PhotoUpload value={f.photo} onChange={v => set('photo', v)} userId={session?.user?.id} /></div>
      <div style={S.field}>
        <label style={S.lbl}>Nome *</label>
        {!wine && allWines
          ? <WineNameAutocomplete value={f.name} onChange={v => set('name', v)} allWines={allWines} currentYear={f.year} onExactMatch={onExactMatch}
              onPartialMatch={w => setF(p => ({ ...p, name: w.name, type: w.type, country: w.country, region: w.region, year: '', purchasePrice: '', personalRating: 0, vivinoRating: '', notes: '' }))} />
          : <input style={S.inp} value={f.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Quinta da Gaivosa" />
        }
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', columnGap: 12, rowGap: 12, marginBottom: 12 }}>
        <div>
          <label style={S.lbl}>Tipo</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <select style={{ ...S.inp, cursor: 'pointer', flex: 1 }} value={f.type} onChange={e => set('type', e.target.value)}>
              {types.map(t => <option key={t}>{t}</option>)}
            </select>
            {!addingType
              ? <button onClick={() => setAddingType(true)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#9a8f82', cursor: 'pointer', padding: '0 10px', fontSize: 18 }}>+</button>
              : <div style={{ display: 'flex', gap: 4 }}>
                  <input style={{ ...S.inp, width: 84, padding: 8 }} value={newType} onChange={e => setNewType(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmNewType()} placeholder="Tipo" autoFocus />
                  <button onClick={confirmNewType} style={{ background: 'rgba(200,150,62,0.2)', border: 'none', borderRadius: 6, color: '#c8963e', cursor: 'pointer', padding: '0 8px' }}><Check size={14} /></button>
                </div>}
          </div>
        </div>
        <div><label style={S.lbl}>Ano</label><input style={S.inp} type="number" value={f.year} onChange={e => set('year', e.target.value)} min={1900} max={2100} /></div>
        <div>
          <label style={S.lbl}>País</label>
          <FilterSelect fill placeholder="Seleccionar país" value={f.country} onChange={v => { set('country', v); set('region', '') }} options={allCountriesForm} onAdd={addCountryForm} />
        </div>
        <div>
          <label style={S.lbl}>Região</label>
          <FilterSelect fill placeholder={regions.length ? 'Seleccionar região' : 'Livre'} value={f.region} onChange={v => set('region', v)} options={regions} onAdd={addRegionForm} />
        </div>
      </div>

      {secHead('Localizações', false)}
      {locationRows.length === 0 && <p style={{ fontSize: 12, color: '#4a453f', margin: '0 0 10px' }}>Sem localização definida.</p>}
      {locationRows.map((row, idx) => (
        <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
          {addingLocationForRow === idx ? (
            <>
              <input style={{ ...S.inp, flex: 1 }} value={newLocationName} onChange={e => setNewLocationName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmAddLocationForRow(); if (e.key === 'Escape') { setAddingLocationForRow(null); setNewLocationName('') } }}
                placeholder="Nome da localização…" autoFocus />
              <button onClick={confirmAddLocationForRow} style={{ background: 'rgba(200,150,62,0.2)', border: 'none', borderRadius: 6, color: '#c8963e', cursor: 'pointer', padding: '0 10px', display: 'flex', alignItems: 'center', flexShrink: 0 }}><Check size={14} /></button>
              <button onClick={() => { setAddingLocationForRow(null); setNewLocationName('') }} style={{ background: 'none', border: 'none', color: '#6a6058', cursor: 'pointer', padding: '0 8px', display: 'flex', alignItems: 'center', flexShrink: 0 }}><X size={14} /></button>
            </>
          ) : (
            <>
              <select style={{ ...S.inp, flex: 1, cursor: 'pointer' }} value={row.locationId}
                onChange={e => {
                  if (e.target.value === '__add__') { setAddingLocationForRow(idx) }
                  else setLocationRows(p => p.map((r, i) => i === idx ? { ...r, locationId: e.target.value } : r))
                }}>
                <option value="">— Seleccionar —</option>
                {locations.filter(l => !locationRows.some((r, i) => i !== idx && r.locationId === l.id))
                  .map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                <option value="__add__">+ Nova localização</option>
              </select>
              <input style={{ ...S.inp, width: 64, flexShrink: 0 }} type="number" min={0} value={row.quantity}
                onChange={e => setLocationRows(p => p.map((r, i) => i === idx ? { ...r, quantity: parseInt(e.target.value) || 0 } : r))} />
              <button onClick={() => setLocationRows(p => p.filter((_, i) => i !== idx))}
                style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '0 6px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <X size={13} />
              </button>
            </>
          )}
        </div>
      ))}
      {(() => {
        const total = locationRows.reduce((s, r) => s + (parseInt(r.quantity) || 0), 0)
        const max = parseInt(f.quantity) || 0
        return max > 0 && total > max ? (
          <div style={{ fontSize: 11, color: '#e87080', marginBottom: 8 }}>A soma das localizações ({total}) excede o total do vinho ({max}).</div>
        ) : null
      })()}
      {addingLocationForRow === 'new' ? (
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <input style={{ ...S.inp, flex: 1 }} value={newLocationName} onChange={e => setNewLocationName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirmAddLocationForRow(); if (e.key === 'Escape') { setAddingLocationForRow(null); setNewLocationName('') } }}
            placeholder="Nome da localização…" autoFocus />
          <button onClick={confirmAddLocationForRow} style={{ background: 'rgba(200,150,62,0.2)', border: 'none', borderRadius: 6, color: '#c8963e', cursor: 'pointer', padding: '0 10px', display: 'flex', alignItems: 'center' }}><Check size={14} /></button>
          <button onClick={() => { setAddingLocationForRow(null); setNewLocationName('') }} style={{ background: 'none', border: 'none', color: '#6a6058', cursor: 'pointer', padding: '0 8px', display: 'flex', alignItems: 'center' }}><X size={14} /></button>
        </div>
      ) : (
        <button onClick={() => setLocationRows(p => [...p, { locationId: '', quantity: 1 }])}
          style={{ fontSize: 12, color: '#c8963e', background: 'none', border: '1px dashed rgba(200,150,62,0.3)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', marginBottom: 4, fontFamily: FONT }}>
          + Adicionar localização
        </button>
      )}

      {secHead('Preços & Stock', false)}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', columnGap: 12, rowGap: 12, marginBottom: 12 }}>
        <div><label style={S.lbl}>Preço de Compra (€)</label><input style={S.inp} value={f.purchasePrice} onChange={e => set('purchasePrice', e.target.value)} placeholder="0,00" /></div>
        <div>
          <label style={S.lbl}>Preço de Mercado (€)</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input style={{ ...S.inp, flex: 1 }} value={f.marketPrice} onChange={e => set('marketPrice', e.target.value)} placeholder="0,00" />
            {f.name && (
              <a href={`https://www.wine-searcher.com/find/${encodeURIComponent([f.name, f.year].filter(Boolean).join(' '))}`}
                target="_blank" rel="noopener noreferrer"
                title={`Pesquisar "${f.name}${f.year ? ` ${f.year}` : ''}" no Wine-Searcher`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#6a6058', textDecoration: 'none', transition: 'all 0.15s', minWidth: 36 }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#e8dece' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#6a6058' }}>
                <Search size={13} />
              </a>
            )}
          </div>
        </div>
        {!wine && <div><label style={S.lbl}>Quantidade Inicial</label><input style={S.inp} type="number" value={f.quantity} onChange={e => set('quantity', e.target.value)} min={0} /></div>}
      </div>

      {secHead('Detalhes Técnicos', true, showTech, () => setShowTech(p => !p))}
      {showTech && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', columnGap: 12, rowGap: 12, marginBottom: 12 }}>
          <div><label style={S.lbl}>Produtor</label><input style={S.inp} value={f.producer} onChange={e => set('producer', e.target.value)} placeholder="Ex: Quinta do Crasto" /></div>
          <div><label style={S.lbl}>Enólogo</label><input style={S.inp} value={f.winemaker} onChange={e => set('winemaker', e.target.value)} placeholder="Ex: Domingos Soares Franco" /></div>
          <div><label style={S.lbl}>Castas</label><input style={S.inp} value={f.castas} onChange={e => set('castas', e.target.value)} placeholder="Touriga Nacional, Aragonez…" /></div>
          <div><label style={S.lbl}>Teor Alcoólico (%)</label><input style={S.inp} type="text" inputMode="decimal" value={f.alcoholContent} onChange={e => set('alcoholContent', e.target.value)} placeholder="13,5" /></div>
          <div>
            <label style={S.lbl}>Formato</label>
            <select style={{ ...S.inp, cursor: 'pointer' }} value={f.bottleSize} onChange={e => set('bottleSize', parseInt(e.target.value))}>
              {BOTTLE_SIZES.map(b => <option key={b.ml} value={b.ml}>{b.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {secHead('Avaliação', false)}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={S.lbl}>Classificação Pessoal</label>
          <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Stars value={f.personalRating} onChange={v => set('personalRating', v)} size={22} />
            <span style={{ fontSize: 13, color: '#e8dece' }}>{f.personalRating || '—'}</span>
          </div>
        </div>
        <div>
          <label style={S.lbl}>Rating Vivino</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input style={{ ...S.inp, flex: 1 }} value={f.vivinoRating} onChange={e => set('vivinoRating', e.target.value)} placeholder="0,0" />
            {f.name && (
              <a href={`https://www.vivino.com/search/wines?q=${encodeURIComponent([f.name, f.year].filter(Boolean).join(' '))}`}
                target="_blank" rel="noopener noreferrer"
                title={`Pesquisar "${f.name}${f.year ? ` ${f.year}` : ''}" no Vivino`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#6a6058', textDecoration: 'none', transition: 'all 0.15s', minWidth: 36 }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#e8dece' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#6a6058' }}>
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      </div>

      {critics.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <label style={S.lbl}>Pontuações de Críticos</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 8 }}>
            {critics.map(c => {
              const hasVal = c.abbrev in (f.criticRatings || {})
              if (hasVal) return (
                <div key={c.abbrev} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'rgba(200,150,62,0.06)', border: '1px solid rgba(200,150,62,0.22)', borderRadius: 8, padding: '8px 10px', minWidth: 60 }}>
                  <span style={{ fontSize: 9, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{c.abbrev}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <input style={{ ...S.inp, width: 44, textAlign: 'center', padding: '3px 4px', fontSize: 14, fontWeight: 300 }}
                      type="number" min={0} max={c.scale} value={f.criticRatings[c.abbrev]}
                      onChange={e => set('criticRatings', { ...(f.criticRatings || {}), [c.abbrev]: e.target.value })} />
                    <button onClick={() => { const { [c.abbrev]: _, ...rest } = f.criticRatings || {}; set('criticRatings', rest) }}
                      style={{ background: 'none', border: 'none', color: '#4a453f', cursor: 'pointer', padding: 0, display: 'flex', lineHeight: 1 }}>
                      <X size={10} />
                    </button>
                  </div>
                </div>
              )
              return (
                <button key={c.abbrev}
                  onClick={() => set('criticRatings', { ...(f.criticRatings || {}), [c.abbrev]: '' })}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 10px', minWidth: 60, cursor: 'pointer', color: '#4a453f', fontFamily: FONT }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,150,62,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
                  <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{c.abbrev}</span>
                  <span style={{ fontSize: 15, lineHeight: 1 }}>+</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div style={S.field}>
        <label style={S.lbl}>Notas</label>
        <textarea style={{ ...S.inp, minHeight: 64, resize: 'vertical' }} value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="Notas de prova, potencial de guarda…" />
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="gold" onClick={handleSave}><Check size={14} />{wine ? 'Guardar' : 'Adicionar Vinho'}</Btn>
      </div>
    </>
  )
}
