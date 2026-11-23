import React, { useState, useEffect, useRef } from 'react'
import { Check, X, Camera, Search, ExternalLink, Trash2, ChevronDown, ChevronLeft, ChevronRight, Plus, MapPin, Wine } from 'lucide-react'
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

function StockSummary({ quantity, rows, locations }) {
  const locs = rows.map(r => ({ ...r, name: locations.find(l => l.id === r.locationId)?.name })).filter(r => r.name)
  return (
    <div style={{ flex: 1, minWidth: 0, background: '#0d0b09', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <div style={{ fontSize: 14, color: '#9a8f82' }}>Em adega</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 44, fontWeight: 300, lineHeight: 1.05, color: quantity > 0 ? '#68c880' : '#e87080', fontFamily: FONT }}>{quantity}</span>
          <span style={{ fontSize: 15, color: '#9a8f82' }}>{quantity === 1 ? 'garrafa' : 'garrafas'}</span>
        </div>
      </div>
      {locs.length
        ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {locs.map(l => (
              <span key={l.locationId} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 14, background: 'rgba(200,150,62,0.10)', border: '1px solid rgba(200,150,62,0.3)', color: '#c8963e', fontSize: 14, fontWeight: 500 }}>
                <MapPin size={13} />{l.name} · {l.quantity}
              </span>
            ))}
          </div>
        : <div style={{ fontSize: 14, color: '#9a8f82' }}>Sem localização</div>}
    </div>
  )
}

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

  // Foto discreta: a própria miniatura abre o seletor; um pequeno ícone indica a ação
  const w = 104, h = 150
  return (
    <div style={{ position: 'relative', width: w, height: h, flexShrink: 0 }}>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      <button type="button" onClick={() => ref.current?.click()} disabled={uploading} aria-label={value ? 'Alterar foto' : 'Adicionar foto'}
        style={{ width: '100%', height: '100%', padding: 0, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', position: 'relative',
          background: '#0d0b09', border: value ? '1px solid rgba(255,255,255,0.1)' : '1px dashed rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {value
          ? <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: uploading ? 0.4 : 1 }} />
          : <Wine size={30} color="#3a3530" />}
        {uploading && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#e8dece', fontFamily: FONT }}>A carregar…</span>}
        <span style={{ position: 'absolute', right: 6, bottom: 6, width: 30, height: 30, borderRadius: '50%', background: 'rgba(13,11,9,0.75)', border: '1px solid rgba(255,255,255,0.12)', color: '#e8dece', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Camera size={15} />
        </span>
      </button>
      {value && !uploading && (
        <button type="button" onClick={handleRemove} aria-label="Remover foto" title="Remover foto"
          style={{ position: 'absolute', top: 6, right: 6, width: 30, height: 30, borderRadius: '50%', background: 'rgba(13,11,9,0.75)', border: '1px solid rgba(255,255,255,0.12)', color: '#e8dece', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <X size={15} />
        </button>
      )}
    </div>
  )
}

const STEPS = ['Identificação e Preços', 'Detalhes', 'Avaliação']

// Indicador de passos da criação; cada passo é clicável (só depois de haver nome)
function StepBar({ step, setStep, canAdvance }) {
  return (
    <div role="tablist" aria-label="Passos" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 4, padding: 4, background: '#0d0b09', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 14 }}>
      {STEPS.map((label, i) => {
        const on = i === step, done = i < step, off = i > 0 && !canAdvance
        return (
          <button key={label} type="button" role="tab" aria-selected={on} disabled={off} onClick={() => setStep(i)}
            style={{ minHeight: 52, borderRadius: 12, border: 'none', padding: '6px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: FONT, cursor: off ? 'not-allowed' : 'pointer', opacity: off ? 0.45 : 1,
              background: on ? '#2e2920' : 'transparent', color: on ? '#e8dece' : '#9a8f82' }}>
            <span style={{ width: 24, height: 24, borderRadius: 12, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: on || done ? '#c8963e' : 'transparent', color: on || done ? '#0d0b09' : '#9a8f82', border: on || done ? 'none' : '1px solid rgba(255,255,255,0.15)' }}>
              {done ? <Check size={14} strokeWidth={3} /> : i + 1}
            </span>
            <span style={{ fontSize: 13, fontWeight: on ? 600 : 500, lineHeight: 1.2, textAlign: 'center' }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

// Cada secção é um cartão. Fica fora do WineForm: um componente definido lá dentro remontava os inputs a cada tecla.
function Section({ title, collapsible, open = true, onToggle, children }) {
  return (
    <section style={{ background: '#161310', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 16, marginBottom: 14 }}>
      {collapsible
        ? <button type="button" onClick={onToggle} aria-expanded={open} style={{ width: '100%', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', padding: 0, color: '#e8dece', fontFamily: FONT, fontSize: 18, fontWeight: 500, cursor: 'pointer' }}>
            {title}<ChevronDown size={22} color="#9a8f82" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
        : <h3 style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 500, color: '#e8dece', fontFamily: FONT }}>{title}</h3>}
      {open && <div style={{ marginTop: collapsible ? 14 : 0 }}>{children}</div>}
    </section>
  )
}

export default function WineForm({ wine, types, setTypes, countriesRegions, setCountriesRegions, allWines, onExactMatch, onSave, onClose, isMobile, locations = [], setLocations, session, wineLocationRows = [], critics = [], onDelete }) {
  const blank = { name: '', type: 'Tinto', country: 'Portugal', region: '', year: new Date().getFullYear(), purchasePrice: '', marketPrice: '', personalRating: 0, vivinoRating: '', quantity: 0, photo: null, notes: '', castas: '', alcoholContent: '', producer: '', winemaker: '', bottleSize: 750, criticRatings: {} }
  const [f, setF] = useState(wine ? { ...wine, purchasePrice: fmtNum(wine.purchasePrice), marketPrice: fmtNum(wine.marketPrice), vivinoRating: fmtNum(wine.vivinoRating) } : blank)
  const [loadingV,     setLoadingV]     = useState(false)
  const [vivinoStatus, setVivinoStatus] = useState('idle')
  // Só Preços & Stock abre expandido; as restantes secções opcionais começam fechadas
  const [open, setOpen] = useState({ precos: true, tech: false, aval: false })
  const toggle = (k) => () => setOpen(p => ({ ...p, [k]: !p[k] }))
  // Criação em 3 passos; a edição mantém as secções expansíveis para ir direto ao campo
  const wizard = !wine
  const [step, setStepRaw] = useState(0)
  const topRef = useRef()
  const setStep = (i) => { setStepRaw(i); topRef.current?.scrollIntoView({ block: 'start' }) }
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
  const sq = (extra = {}) => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, width: 52, borderRadius: 14, ...extra })
  const linkSt = sq({ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#e8dece', textDecoration: 'none' })
  const grid = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', columnGap: 12, rowGap: 14 }
  const newLocInput = (
    <>
      <input style={{ ...S.inp, flex: 1, minWidth: 0 }} value={newLocationName} onChange={e => setNewLocationName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') confirmAddLocationForRow(); if (e.key === 'Escape') { setAddingLocationForRow(null); setNewLocationName('') } }}
        placeholder="Nome da localização…" autoFocus />
      <button aria-label="Confirmar localização" onClick={confirmAddLocationForRow} style={sq({ background: 'rgba(200,150,62,0.2)', border: 'none', color: '#c8963e' })}><Check size={20} /></button>
      <button aria-label="Cancelar" onClick={() => { setAddingLocationForRow(null); setNewLocationName('') }} style={sq({ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#9a8f82'})}><X size={20} /></button>
    </>
  )

  return (
    <>
      <div ref={topRef} />
      <ModalHeader title={wine ? 'Editar Vinho' : 'Novo Vinho'} onClose={onClose} />
      {wizard && <StepBar step={step} setStep={setStep} canAdvance={!!f.name.trim()} />}

      {/* altura estável entre passos no desktop: o modal não salta nem muda de posição */}
      <div style={wizard && !isMobile ? { minHeight: 'min(600px, 60vh)' } : undefined}>
      {(!wizard || step === 0) && <Section title="Identificação">
        <div style={{ display: 'flex', gap: 14, alignItems: 'stretch', marginBottom: 14 }}>
          <PhotoUpload value={f.photo} onChange={v => set('photo', v)} userId={session?.user?.id} />
          {wine && <StockSummary quantity={wine.quantity} rows={wineLocationRows} locations={locations} />}
        </div>
        <div style={S.field}>
          <label style={S.lbl}>Nome *</label>
          {!wine && allWines
            ? <WineNameAutocomplete value={f.name} onChange={v => set('name', v)} allWines={allWines} currentYear={f.year} onExactMatch={onExactMatch}
                onPartialMatch={w => setF(p => ({ ...p, name: w.name, type: w.type, country: w.country, region: w.region, year: '', purchasePrice: '', personalRating: 0, vivinoRating: '', notes: '' }))} />
            : <input style={S.inp} value={f.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Quinta da Gaivosa" />
          }
        </div>
        <div style={{ ...grid, gridTemplateColumns: isMobile ? '1fr' : '120px 1fr 1fr' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={S.lbl}>Tipo</label>
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
      </Section>}

      {/* Na criação, as localizações são definidas pela entrada (EntryForm); aqui só se corrigem na edição */}
      {wine && <Section title="Localizações">
        {locationRows.length === 0 && <p style={{ fontSize: 16, color: '#9a8f82', margin: '0 0 10px' }}>Sem localização definida.</p>}
        {locationRows.map((row, idx) => (
          <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
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
                <button aria-label="Remover localização" onClick={() => setLocationRows(p => p.filter((_, i) => i !== idx))}
                  style={sq({ background: 'rgba(192,48,74,0.12)', border: 'none', color: '#e87080' })}>
                  <X size={20} />
                </button>
              </>
            )}
            <div style={{ width: '100%' }}><Stepper compact label="garrafas nesta localização" value={row.quantity} min={0}
              onChange={v => setLocationRows(p => p.map((r, i) => i === idx ? { ...r, quantity: v } : r))} /></div>
          </div>
        ))}
        {(() => {
          const total = locationRows.reduce((s, r) => s + (parseInt(r.quantity) || 0), 0)
          const max = parseInt(f.quantity) || 0
          return max > 0 && total > max ? (
            <div style={{ fontSize: 14, color: '#e87080', marginBottom: 8 }}>A soma das localizações ({total}) excede o total do vinho ({max}).</div>
          ) : null
        })()}
        {addingLocationForRow === 'new' ? (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>{newLocInput}</div>
        ) : (
          <button onClick={() => setLocationRows(p => [...p, { locationId: '', quantity: 1 }])}
            style={{ width: '100%', minHeight: 52, fontSize: 16, fontWeight: 500, color: '#c8963e', background: 'none', border: '1.5px dashed rgba(200,150,62,0.4)', borderRadius: 14, cursor: 'pointer', fontFamily: FONT }}>
            + Adicionar localização
          </button>
        )}
      </Section>}

      {(!wizard || step === 0) && <Section title="Preços" collapsible={!wizard} open={wizard || open.precos} onToggle={toggle('precos')}>
        <div style={grid}>
          <div><label style={S.lbl}>Preço de Compra (€)</label><input style={S.inp} inputMode="decimal" value={f.purchasePrice} onChange={e => set('purchasePrice', e.target.value)} placeholder="0,00" /></div>
          <div>
            <label style={S.lbl}>Preço de Mercado (€)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={{ ...S.inp, flex: 1, minWidth: 0 }} inputMode="decimal" value={f.marketPrice} onChange={e => set('marketPrice', e.target.value)} placeholder="0,00" />
              {f.name && (
                <a href={`https://www.wine-searcher.com/find/${encodeURIComponent([f.name, f.year].filter(Boolean).join(' '))}`}
                  target="_blank" rel="noopener noreferrer" aria-label="Pesquisar no Wine-Searcher"
                  title={`Pesquisar "${f.name}${f.year ? ` ${f.year}` : ''}" no Wine-Searcher`}
                  style={linkSt}>
                  <Search size={20} />
                </a>
              )}
            </div>
          </div>
        </div>
      </Section>}

      {(!wizard || step === 1) && <Section title="Detalhes Técnicos" collapsible={!wizard} open={wizard || open.tech} onToggle={toggle('tech')}>
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
      </Section>}

      {(!wizard || step === 2) && <Section title="Avaliação" collapsible={!wizard} open={wizard || open.aval} onToggle={toggle('aval')}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={S.lbl}>Classificação Pessoal</label>
            <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Stars value={f.personalRating} onChange={v => set('personalRating', v)} size={44} />
              <span style={{ fontSize: 17, color: '#e8dece' }}>{f.personalRating || '—'}</span>
            </div>
          </div>
          <div>
            <label style={S.lbl}>Rating Vivino</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={{ ...S.inp, flex: 1, minWidth: 0 }} inputMode="decimal" value={f.vivinoRating} onChange={e => set('vivinoRating', e.target.value)} placeholder="0,0" />
              {f.name && (
                <a href={`https://www.vivino.com/search/wines?q=${encodeURIComponent([f.name, f.year].filter(Boolean).join(' '))}`}
                  target="_blank" rel="noopener noreferrer" aria-label="Pesquisar no Vivino"
                  title={`Pesquisar "${f.name}${f.year ? ` ${f.year}` : ''}" no Vivino`}
                  style={linkSt}>
                  <ExternalLink size={20} />
                </a>
              )}
            </div>
          </div>
        </div>

        {critics.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <label style={S.lbl}>Pontuações de Críticos</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
              {critics.map(c => {
                const hasVal = c.abbrev in (f.criticRatings || {})
                if (hasVal) return (
                  <div key={c.abbrev} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'rgba(200,150,62,0.06)', border: '1px solid rgba(200,150,62,0.22)', borderRadius: 14, padding: '10px 8px 10px 12px', minWidth: 84 }}>
                    <span style={{ fontSize: 12, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{c.abbrev}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <input style={{ ...S.inp, width: 60, textAlign: 'center', padding: '3px 4px', fontSize: 16, fontWeight: 300 }} inputMode="numeric"
                        type="number" min={0} max={c.scale} value={f.criticRatings[c.abbrev]}
                        onChange={e => set('criticRatings', { ...(f.criticRatings || {}), [c.abbrev]: e.target.value })} />
                      <button aria-label={`Remover ${c.abbrev}`} onClick={() => { const { [c.abbrev]: _, ...rest } = f.criticRatings || {}; set('criticRatings', rest) }}
                        style={{ background: 'none', border: 'none', color: '#9a8f82', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, width: 36, height: 44 }}>
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                )
                return (
                  <button key={c.abbrev}
                    onClick={() => set('criticRatings', { ...(f.criticRatings || {}), [c.abbrev]: '' })}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 14px', minWidth: 72, cursor: 'pointer', color: '#9a8f82', fontFamily: FONT }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,150,62,0.25)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
                    <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{c.abbrev}</span>
                    <span style={{ fontSize: 20, lineHeight: 1 }}>+</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ ...S.field, marginBottom: 0 }}>
          <label style={S.lbl}>Notas</label>
          <textarea style={{ ...S.inp, minHeight: 96, resize: 'vertical' }} value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="Notas de prova, potencial de guarda…" />
        </div>
      </Section>}
      </div>

      {onDelete && <Btn variant="danger" onClick={onDelete} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}><Trash2 size={18} />Eliminar vinho</Btn>}
      <div className="vt-actions" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        {wizard && step > 0 && (
          <button type="button" aria-label="Passo anterior" onClick={() => setStep(step - 1)}
            style={{ flex: '0 0 54px', width: 54, minHeight: 54, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#e8dece', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
            <ChevronLeft size={22} />
          </button>
        )}
        {wizard && step < STEPS.length - 1
          ? <>
              {/* Guardar já: os passos seguintes são opcionais */}
              <Btn onClick={handleSave} disabled={!f.name.trim()}><Check size={20} />Guardar</Btn>
              <Btn variant="gold" onClick={() => setStep(step + 1)} disabled={!f.name.trim()}>Seguinte<ChevronRight size={20} /></Btn>
            </>
          : <Btn variant="gold" onClick={handleSave} disabled={!f.name.trim()}><Check size={20} />{wine ? 'Guardar' : 'Adicionar Vinho'}</Btn>}
      </div>
    </>
  )
}
