import React, { useState, useEffect, useRef } from 'react'
import { Check, X, Camera, Search, ExternalLink, Trash2, ChevronDown, Plus, MapPin, Wine } from 'lucide-react'
import { supabase, isStorageUrl, uploadWinePhoto, deleteWinePhoto, ESTIMATE_FN_URL } from '../lib/supabase'
import { FONT, S, BOTTLE_SIZES, COUNTRIES_REGIONS, getTC, chipStyle } from '../utils/constants'
import { fmtNum } from '../utils/format'
import { readFileAsBase64 } from '../utils/format'
import Btn from './ui/Btn'
import Stars from './ui/Stars'
import Stepper from './ui/Stepper'
import FilterSelect from './ui/FilterSelect'
import WineNameAutocomplete from './WineNameAutocomplete'
import { ModalHeader } from './ui/ModalShell'

function StockSummary({ m, quantity, rows, locations }) {
  const locs = rows.map(r => ({ ...r, name: locations.find(l => l.id === r.locationId)?.name })).filter(r => r.name)
  return (
    <div style={{ flex: 1, minWidth: 0, background: '#0d0b09', border: '1px solid rgba(255,255,255,0.06)', borderRadius: m ? 16 : 8, padding: m ? 14 : 10, display: 'flex', flexDirection: 'column', gap: m ? 10 : 6 }}>
      <div>
        <div style={{ fontSize: m ? 14 : 10, color: '#9a8f82', textTransform: m ? 'none' : 'uppercase', letterSpacing: m ? 0 : '0.08em' }}>Em adega</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: m ? 44 : 28, fontWeight: 300, lineHeight: 1.05, color: quantity > 0 ? '#68c880' : '#e87080', fontFamily: FONT }}>{quantity}</span>
          <span style={{ fontSize: m ? 15 : 12, color: '#9a8f82' }}>{quantity === 1 ? 'garrafa' : 'garrafas'}</span>
        </div>
      </div>
      {locs.length
        ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {locs.map(l => (
              <span key={l.locationId} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: m ? '5px 10px' : '2px 8px', borderRadius: 14, background: 'rgba(200,150,62,0.10)', border: '1px solid rgba(200,150,62,0.3)', color: '#c8963e', fontSize: m ? 14 : 11, fontWeight: 500 }}>
                <MapPin size={m ? 13 : 10} />{l.name} · {l.quantity}
              </span>
            ))}
          </div>
        : <div style={{ fontSize: m ? 14 : 11, color: '#9a8f82' }}>Sem localização</div>}
    </div>
  )
}

function PhotoUpload({ value, onChange, userId, m }) {
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

  // Foto discreta: a própria miniatura abre o seletor; um pequeno ícone indica a ação
  const w = m ? 104 : 64, h = m ? 150 : 96
  return (
    <div style={{ position: 'relative', width: w, height: h, flexShrink: 0 }}>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      <button type="button" onClick={() => ref.current?.click()} disabled={uploading} aria-label={value ? 'Alterar foto' : 'Adicionar foto'}
        style={{ width: '100%', height: '100%', padding: 0, borderRadius: m ? 16 : 8, overflow: 'hidden', cursor: 'pointer', position: 'relative',
          background: '#0d0b09', border: value ? '1px solid rgba(255,255,255,0.1)' : '1px dashed rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {value
          ? <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: uploading ? 0.4 : 1 }} />
          : <Wine size={m ? 30 : 20} color="#3a3530" />}
        {uploading && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: m ? 13 : 10, color: '#e8dece', fontFamily: FONT }}>A carregar…</span>}
        <span style={{ position: 'absolute', right: 6, bottom: 6, width: m ? 30 : 22, height: m ? 30 : 22, borderRadius: '50%', background: 'rgba(13,11,9,0.75)', border: '1px solid rgba(255,255,255,0.12)', color: '#e8dece', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Camera size={m ? 15 : 11} />
        </span>
      </button>
      {value && !uploading && (
        <button type="button" onClick={handleRemove} aria-label="Remover foto" title="Remover foto"
          style={{ position: 'absolute', top: 6, right: 6, width: m ? 30 : 22, height: m ? 30 : 22, borderRadius: '50%', background: 'rgba(13,11,9,0.75)', border: '1px solid rgba(255,255,255,0.12)', color: '#e8dece', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <X size={m ? 15 : 11} />
        </button>
      )}
    </div>
  )
}

// Em mobile cada secção é um cartão; em desktop mantém o separador fino original.
// Fica fora do WineForm: um componente definido lá dentro remontava os inputs a cada tecla.
function Section({ m, title, collapsible, open = true, onToggle, children }) {
  if (m) return (
    <section style={{ background: '#161310', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 16, marginBottom: 14 }}>
      {collapsible
        ? <button type="button" onClick={onToggle} aria-expanded={open} style={{ width: '100%', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', padding: 0, color: '#e8dece', fontFamily: FONT, fontSize: 18, fontWeight: 500, cursor: 'pointer' }}>
            {title}<ChevronDown size={22} color="#9a8f82" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
        : <h3 style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 500, color: '#e8dece', fontFamily: FONT }}>{title}</h3>}
      {open && <div style={{ marginTop: collapsible ? 14 : 0 }}>{children}</div>}
    </section>
  )
  return (
    <>
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0 10px', cursor: collapsible ? 'pointer' : 'default', userSelect: 'none' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: collapsible ? '#9a8f82' : '#6a6058', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap', transition: 'color 0.15s' }}>
          {collapsible && <span style={{ display: 'inline-block', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s', fontSize: 8 }}>▶</span>}
          {title}
        </span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
      </div>
      {open && children}
    </>
  )
}

export default function WineForm({ wine, types, setTypes, countriesRegions, setCountriesRegions, allWines, onExactMatch, onSave, onClose, isMobile, locations = [], setLocations, session, wineLocationRows = [], critics = [], onDelete }) {
  const m = isMobile
  const blank = { name: '', type: 'Tinto', country: 'Portugal', region: '', year: new Date().getFullYear(), purchasePrice: '', marketPrice: '', personalRating: 0, vivinoRating: '', quantity: 0, photo: null, notes: '', castas: '', alcoholContent: '', producer: '', winemaker: '', bottleSize: 750, criticRatings: {} }
  const [f, setF] = useState(wine ? { ...wine, purchasePrice: fmtNum(wine.purchasePrice), marketPrice: fmtNum(wine.marketPrice), vivinoRating: fmtNum(wine.vivinoRating) } : blank)
  const [loadingV,     setLoadingV]     = useState(false)
  const [vivinoStatus, setVivinoStatus] = useState('idle')
  // Só Preços & Stock abre expandido; as restantes secções opcionais começam fechadas
  const [open, setOpen] = useState({ precos: true, tech: false, aval: false })
  const toggle = (k) => () => setOpen(p => ({ ...p, [k]: !p[k] }))
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
      quantity: wine ? f.quantity : 0 }) // stock de um vinho novo entra só via entradas
  }

  const confirmNewType = () => {
    const t = newType.trim()
    if (!t || types.includes(t)) return
    setTypes(p => [...p, t]); set('type', t); setNewType(''); setAddingType(false)
  }

  // Botões quadrados ao lado de inputs (confirmar, cancelar, links externos)
  const sq = (extra = {}) => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, ...(m ? { width: 52, borderRadius: 14 } : { padding: '0 10px', borderRadius: 6 }), ...extra })
  const linkSt = { ...sq({ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: m ? '#e8dece' : '#6a6058', textDecoration: 'none', transition: 'all 0.15s', minWidth: 36 }) }
  const hoverLink = m ? {} : {
    onMouseEnter: e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#e8dece' },
    onMouseLeave: e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#6a6058' },
  }
  const icon = m ? 20 : 13
  const grid = { display: 'grid', gridTemplateColumns: m ? '1fr' : '1fr 1fr', columnGap: 12, rowGap: m ? 14 : 12, marginBottom: m ? 0 : 12 }
  const newLocInput = (
    <>
      <input style={{ ...S.inp, flex: 1, minWidth: 0 }} value={newLocationName} onChange={e => setNewLocationName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') confirmAddLocationForRow(); if (e.key === 'Escape') { setAddingLocationForRow(null); setNewLocationName('') } }}
        placeholder="Nome da localização…" autoFocus />
      <button aria-label="Confirmar localização" onClick={confirmAddLocationForRow} style={sq({ background: 'rgba(200,150,62,0.2)', border: 'none', color: '#c8963e' })}><Check size={m ? 20 : 14} /></button>
      <button aria-label="Cancelar" onClick={() => { setAddingLocationForRow(null); setNewLocationName('') }} style={sq({ background: m ? 'rgba(255,255,255,0.05)' : 'none', border: 'none', color: m ? '#9a8f82' : '#6a6058' })}><X size={m ? 20 : 14} /></button>
    </>
  )

  return (
    <>
      <ModalHeader title={wine ? 'Editar Vinho' : 'Novo Vinho'} onClose={onClose} />

      <Section m={m} title="Identificação">
        <div style={{ display: 'flex', gap: m ? 14 : 12, alignItems: 'stretch', marginBottom: 14 }}>
          <PhotoUpload m={m} value={f.photo} onChange={v => set('photo', v)} userId={session?.user?.id} />
          {wine && <StockSummary m={m} quantity={wine.quantity} rows={wineLocationRows} locations={locations} />}
        </div>
        <div style={S.field}>
          <label style={S.lbl}>Nome *</label>
          {!wine && allWines
            ? <WineNameAutocomplete value={f.name} onChange={v => set('name', v)} allWines={allWines} currentYear={f.year} onExactMatch={onExactMatch}
                onPartialMatch={w => setF(p => ({ ...p, name: w.name, type: w.type, country: w.country, region: w.region, year: '', purchasePrice: '', personalRating: 0, vivinoRating: '', notes: '' }))} />
            : <input style={S.inp} value={f.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Quinta da Gaivosa" />
          }
        </div>
        <div style={grid}>
          <div>
            <label style={S.lbl}>Tipo</label>
            {m ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {types.map(t => {
                  const on = f.type === t
                  return (
                    <button type="button" key={t} aria-pressed={on} onClick={() => set('type', t)} style={chipStyle(on)}>
                      <span style={{ width: 10, height: 10, borderRadius: 5, background: on ? '#0d0b09' : getTC(t).fg }} />{t}
                    </button>
                  )
                })}
                {!addingType
                  ? <button type="button" onClick={() => setAddingType(true)} style={{ ...chipStyle(false), border: '1px dashed rgba(200,150,62,0.4)', color: '#c8963e' }}><Plus size={16} />Novo</button>
                  : <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                      <input style={{ ...S.inp, flex: 1, minWidth: 0 }} value={newType} onChange={e => setNewType(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmNewType()} placeholder="Novo tipo" autoFocus />
                      <button type="button" aria-label="Confirmar tipo" onClick={confirmNewType} style={sq({ background: 'rgba(200,150,62,0.2)', border: 'none', color: '#c8963e' })}><Check size={20} /></button>
                      <button type="button" aria-label="Cancelar" onClick={() => { setAddingType(false); setNewType('') }} style={sq({ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#9a8f82' })}><X size={20} /></button>
                    </div>}
              </div>
            ) : (
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
            )}
          </div>
          <div><label style={S.lbl}>Ano</label><input style={S.inp} type="number" inputMode="numeric" value={f.year} onChange={e => set('year', e.target.value)} min={1900} max={2100} /></div>
          <div>
            <label style={S.lbl}>País</label>
            <FilterSelect fill placeholder="Seleccionar país" value={f.country} onChange={v => { set('country', v); set('region', '') }} options={allCountriesForm} onAdd={addCountryForm} />
          </div>
          <div>
            <label style={S.lbl}>Região</label>
            <FilterSelect fill placeholder={regions.length ? 'Seleccionar região' : 'Livre'} value={f.region} onChange={v => set('region', v)} options={regions} onAdd={addRegionForm} />
          </div>
        </div>
      </Section>

      {/* Na criação, as localizações são definidas pela entrada (EntryForm); aqui só se corrigem na edição */}
      {wine && <Section m={m} title="Localizações">
        {locationRows.length === 0 && <p style={{ fontSize: m ? 16 : 12, color: m ? '#9a8f82' : '#4a453f', margin: '0 0 10px' }}>Sem localização definida.</p>}
        {locationRows.map((row, idx) => (
          <div key={idx} style={m
            ? { display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }
            : { display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
            {addingLocationForRow === idx ? newLocInput : (
              <>
                <select style={{ ...S.inp, flex: 1, minWidth: 0, cursor: 'pointer' }} value={row.locationId}
                  onChange={e => {
                    if (e.target.value === '__add__') { setAddingLocationForRow(idx) }
                    else setLocationRows(p => p.map((r, i) => i === idx ? { ...r, locationId: e.target.value } : r))
                  }}>
                  <option value="">— Seleccionar —</option>
                  {locations.filter(l => !locationRows.some((r, i) => i !== idx && r.locationId === l.id))
                    .map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  <option value="__add__">+ Nova localização</option>
                </select>
                {!m && <input style={{ ...S.inp, width: 64, flexShrink: 0 }} type="number" min={0} value={row.quantity}
                  onChange={e => setLocationRows(p => p.map((r, i) => i === idx ? { ...r, quantity: parseInt(e.target.value) || 0 } : r))} />}
                <button aria-label="Remover localização" onClick={() => setLocationRows(p => p.filter((_, i) => i !== idx))}
                  style={m
                    ? sq({ background: 'rgba(192,48,74,0.12)', border: 'none', color: '#e87080' })
                    : { background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '0 6px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <X size={m ? 20 : 13} />
                </button>
              </>
            )}
            {m && <div style={{ width: '100%' }}><Stepper compact label="garrafas nesta localização" value={row.quantity} min={0}
              onChange={v => setLocationRows(p => p.map((r, i) => i === idx ? { ...r, quantity: v } : r))} /></div>}
          </div>
        ))}
        {(() => {
          const total = locationRows.reduce((s, r) => s + (parseInt(r.quantity) || 0), 0)
          const max = parseInt(f.quantity) || 0
          return max > 0 && total > max ? (
            <div style={{ fontSize: m ? 14 : 11, color: '#e87080', marginBottom: 8 }}>A soma das localizações ({total}) excede o total do vinho ({max}).</div>
          ) : null
        })()}
        {addingLocationForRow === 'new' ? (
          <div style={{ display: 'flex', gap: m ? 8 : 6, marginBottom: 10 }}>{newLocInput}</div>
        ) : (
          <button onClick={() => setLocationRows(p => [...p, { locationId: '', quantity: 1 }])}
            style={m
              ? { width: '100%', minHeight: 52, fontSize: 16, fontWeight: 500, color: '#c8963e', background: 'none', border: '1.5px dashed rgba(200,150,62,0.4)', borderRadius: 14, cursor: 'pointer', fontFamily: FONT }
              : { fontSize: 12, color: '#c8963e', background: 'none', border: '1px dashed rgba(200,150,62,0.3)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', marginBottom: 4, fontFamily: FONT }}>
            + Adicionar localização
          </button>
        )}
      </Section>}

      <Section m={m} title="Preços" collapsible open={open.precos} onToggle={toggle('precos')}>
        <div style={grid}>
          <div><label style={S.lbl}>Preço de Compra (€)</label><input style={S.inp} inputMode="decimal" value={f.purchasePrice} onChange={e => set('purchasePrice', e.target.value)} placeholder="0,00" /></div>
          <div>
            <label style={S.lbl}>Preço de Mercado (€)</label>
            <div style={{ display: 'flex', gap: m ? 8 : 6 }}>
              <input style={{ ...S.inp, flex: 1, minWidth: 0 }} inputMode="decimal" value={f.marketPrice} onChange={e => set('marketPrice', e.target.value)} placeholder="0,00" />
              {f.name && (
                <a href={`https://www.wine-searcher.com/find/${encodeURIComponent([f.name, f.year].filter(Boolean).join(' '))}`}
                  target="_blank" rel="noopener noreferrer" aria-label="Pesquisar no Wine-Searcher"
                  title={`Pesquisar "${f.name}${f.year ? ` ${f.year}` : ''}" no Wine-Searcher`}
                  style={linkSt} {...hoverLink}>
                  <Search size={icon} />
                </a>
              )}
            </div>
          </div>
        </div>
      </Section>

      <Section m={m} title="Detalhes Técnicos" collapsible open={open.tech} onToggle={toggle('tech')}>
        <div style={grid}>
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
      </Section>

      <Section m={m} title="Avaliação" collapsible open={open.aval} onToggle={toggle('aval')}>
        <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={S.lbl}>Classificação Pessoal</label>
            <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: m ? 12 : 8 }}>
              <Stars value={f.personalRating} onChange={v => set('personalRating', v)} size={m ? 44 : 22} />
              <span style={{ fontSize: m ? 17 : 13, color: '#e8dece' }}>{f.personalRating || '—'}</span>
            </div>
          </div>
          <div>
            <label style={S.lbl}>Rating Vivino</label>
            <div style={{ display: 'flex', gap: m ? 8 : 6 }}>
              <input style={{ ...S.inp, flex: 1, minWidth: 0 }} inputMode="decimal" value={f.vivinoRating} onChange={e => set('vivinoRating', e.target.value)} placeholder="0,0" />
              {f.name && (
                <a href={`https://www.vivino.com/search/wines?q=${encodeURIComponent([f.name, f.year].filter(Boolean).join(' '))}`}
                  target="_blank" rel="noopener noreferrer" aria-label="Pesquisar no Vivino"
                  title={`Pesquisar "${f.name}${f.year ? ` ${f.year}` : ''}" no Vivino`}
                  style={linkSt} {...hoverLink}>
                  <ExternalLink size={icon} />
                </a>
              )}
            </div>
          </div>
        </div>

        {critics.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <label style={S.lbl}>Pontuações de Críticos</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: m ? 10 : 7, marginTop: 8 }}>
              {critics.map(c => {
                const hasVal = c.abbrev in (f.criticRatings || {})
                if (hasVal) return (
                  <div key={c.abbrev} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'rgba(200,150,62,0.06)', border: '1px solid rgba(200,150,62,0.22)', borderRadius: m ? 14 : 8, padding: m ? '10px 8px 10px 12px' : '8px 10px', minWidth: m ? 84 : 60 }}>
                    <span style={{ fontSize: m ? 12 : 9, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{c.abbrev}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <input style={{ ...S.inp, width: m ? 60 : 44, textAlign: 'center', padding: '3px 4px', fontSize: 16, fontWeight: 300 }} inputMode="numeric"
                        type="number" min={0} max={c.scale} value={f.criticRatings[c.abbrev]}
                        onChange={e => set('criticRatings', { ...(f.criticRatings || {}), [c.abbrev]: e.target.value })} />
                      <button aria-label={`Remover ${c.abbrev}`} onClick={() => { const { [c.abbrev]: _, ...rest } = f.criticRatings || {}; set('criticRatings', rest) }}
                        style={{ background: 'none', border: 'none', color: m ? '#9a8f82' : '#4a453f', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, width: m ? 36 : undefined, height: m ? 44 : undefined }}>
                        <X size={m ? 18 : 10} />
                      </button>
                    </div>
                  </div>
                )
                return (
                  <button key={c.abbrev}
                    onClick={() => set('criticRatings', { ...(f.criticRatings || {}), [c.abbrev]: '' })}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: m ? 14 : 8, padding: m ? '12px 14px' : '8px 10px', minWidth: m ? 72 : 60, cursor: 'pointer', color: m ? '#9a8f82' : '#4a453f', fontFamily: FONT }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,150,62,0.25)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
                    <span style={{ fontSize: m ? 13 : 9, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{c.abbrev}</span>
                    <span style={{ fontSize: m ? 20 : 15, lineHeight: 1 }}>+</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ ...S.field, marginBottom: m ? 0 : S.field.marginBottom }}>
          <label style={S.lbl}>Notas</label>
          <textarea style={{ ...S.inp, minHeight: m ? 96 : 64, resize: 'vertical' }} value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="Notas de prova, potencial de guarda…" />
        </div>
      </Section>

      {onDelete && <Btn variant="danger" onClick={onDelete} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}><Trash2 size={m ? 18 : 14} />Eliminar vinho</Btn>}
      <div className="vt-actions" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        {!m && <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>}
        <Btn variant="gold" onClick={handleSave}><Check size={m ? 20 : 14} />{wine ? 'Guardar' : 'Adicionar Vinho'}</Btn>
      </div>
    </>
  )
}
