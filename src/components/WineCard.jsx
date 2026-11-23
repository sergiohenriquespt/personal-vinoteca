import React, { useState, useMemo } from 'react'
import { Wine, MapPin } from 'lucide-react'
import { getWineLocationData } from '../lib/supabase'
import { FONT, getTC } from '../utils/constants'
import { fmt } from '../utils/format'
import { useSortable } from '../hooks/useSortable'
import Badge from './ui/Badge'
import Stars from './ui/Stars'
import WineThumb from './ui/WineThumb'
import PhotoLightbox from './PhotoLightbox'

// Tabela da Adega (desktop): mesmas colunas no cabeçalho e nas linhas
const COLS = '40px minmax(0, 3fr) 120px 150px 64px 64px 104px 64px 96px'
const locLabel = (id, wineLocations, locations) => {
  const locData = getWineLocationData(id, wineLocations, locations)
  return locData.length === 0 ? null : locData.length === 1 ? locData[0].name : `${locData.length} locais`
}

function WineListRow({ wine, onClick, wineLocations = [], locations = [] }) {
  const [lightbox, setLightbox] = useState(false)
  const loc = locLabel(wine.id, wineLocations, locations)
  return (
    <div onClick={onClick}
      style={{ display: 'grid', gridTemplateColumns: COLS, gap: 16, alignItems: 'center', padding: '10px 20px', minHeight: 64, boxSizing: 'border-box', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.12s', opacity: wine.quantity === 0 ? 0.45 : 1, fontFamily: FONT }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      {lightbox && <PhotoLightbox src={wine.photo} onClose={() => setLightbox(false)} />}
      <WineThumb photo={wine.photo} type={wine.type} size={34} onClick={wine.photo ? e => { e.stopPropagation(); setLightbox(true) } : undefined} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: '#e8dece', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wine.name}</div>
        <div style={{ fontSize: 14, color: '#9a8f82', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{[wine.region, wine.country].filter(Boolean).join(', ')}</div>
      </div>
      <div><Badge type={wine.type} /></div>
      <div style={{ minWidth: 0 }}>
        {loc && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#c8963e', maxWidth: '100%' }}><MapPin size={14} style={{ flexShrink: 0 }} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loc}</span></span>}
      </div>
      <div style={{ fontSize: 15, color: '#9a8f82', textAlign: 'center' }}>{wine.alcoholContent ? `${wine.alcoholContent}%` : '—'}</div>
      <div style={{ fontSize: 15, color: '#9a8f82', textAlign: 'center' }}>{wine.year || '—'}</div>
      <div><Stars value={wine.personalRating} size={15} /></div>
      <div style={{ fontSize: 20, textAlign: 'right', color: wine.quantity > 0 ? '#68c880' : '#e87080' }}>{wine.quantity}</div>
      <div style={{ fontSize: 15, textAlign: 'right', color: '#c8963e' }}>{fmt(wine.purchasePrice)}</div>
    </div>
  )
}

export function WineListView({ wines, onWineClick, wineLocations = [], locations = [] }) {
  const { sortKey, sortDir, handleSort } = useSortable('name')

  const sorted = useMemo(() => {
    const getLocKey = (w) => {
      const names = wineLocations.filter(wl => wl.wine_id === w.id && wl.quantity > 0)
        .map(wl => locations.find(l => l.id === wl.location_id)?.name).filter(Boolean).sort()
      return names[0] || ''
    }
    return [...wines].sort((a, b) => {
      let av = sortKey === 'location' ? getLocKey(a) : (a[sortKey] ?? '')
      let bv = sortKey === 'location' ? getLocKey(b) : (b[sortKey] ?? '')
      if ((av == null || av === '') && (bv == null || bv === '')) return 0
      if (av == null || av === '') return 1
      if (bv == null || bv === '') return -1
      const cmp = typeof av === 'string' ? av.localeCompare(bv, 'pt') * sortDir : (av - bv) * sortDir
      if (cmp !== 0) return cmp
      return (a.year ?? 0) - (b.year ?? 0)
    })
  }, [wines, sortKey, sortDir, wineLocations, locations])

  const ColHead = ({ label, col, align = 'left' }) => {
    const active = sortKey === col
    return (
      <button onClick={() => handleSort(col)}
        style={{ background: 'none', border: 'none', padding: 0, fontFamily: FONT, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: align,
          cursor: 'pointer', fontWeight: 600, color: active ? '#c8963e' : '#9a8f82', transition: 'color 0.15s' }}>
        {label}{active ? (sortDir === 1 ? ' ↑' : ' ↓') : ''}
      </button>
    )
  }

  return (
    <div style={{ background: '#1e1b16', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: 16, alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#161310' }}>
        <span />
        <ColHead label="Vinho"  col="name" />
        <ColHead label="Tipo"   col="type" />
        <ColHead label="Local"  col="location" />
        <ColHead label="Álcool" col="alcoholContent" align="center" />
        <ColHead label="Ano"    col="year" align="center" />
        <ColHead label="Pessoal" col="personalRating" />
        <ColHead label="Qtd."   col="quantity" align="right" />
        <ColHead label="Preço"  col="purchasePrice" align="right" />
      </div>
      {sorted.length === 0
        ? <div style={{ textAlign: 'center', padding: '56px 0', color: '#9a8f82' }}><Wine size={36} style={{ marginBottom: 10, opacity: 0.3 }} /><p style={{ fontSize: 16 }}>Nenhum vinho encontrado.</p></div>
        : sorted.map(w => <WineListRow key={w.id} wine={w} onClick={() => onWineClick(w)} wineLocations={wineLocations} locations={locations} />)}
    </div>
  )
}

export function WineGridView({ wines, onWineClick, wineLocations = [], locations = [] }) {
  if (wines.length === 0) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9a8f82' }}><Wine size={40} style={{ marginBottom: 12, opacity: 0.3 }} /><p style={{ fontSize: 16 }}>Nenhum vinho encontrado.</p></div>
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
      {wines.map(w => {
        const c = getTC(w.type)
        const loc = locLabel(w.id, wineLocations, locations)
        return (
          <button key={w.id} onClick={() => onWineClick(w)}
            style={{ background: '#1e1b16', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', cursor: 'pointer', padding: 0, textAlign: 'left', fontFamily: FONT, color: '#e8dece', transition: 'transform 0.15s, border-color 0.15s', opacity: w.quantity === 0 ? 0.45 : 1 }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(200,150,62,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
            {w.photo
              ? <img src={w.photo} alt="" loading="lazy" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
              : <div style={{ height: 160, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wine size={40} color={c.fg} style={{ opacity: 0.6 }} /></div>}
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Badge type={w.type} />
                <span style={{ fontSize: 20, color: w.quantity > 0 ? '#68c880' : '#e87080' }}>{w.quantity}</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.3 }}>{w.name}</div>
              <div style={{ fontSize: 14, color: '#9a8f82' }}>{[w.region, w.country].filter(Boolean).join(', ')}{w.year ? ` · ${w.year}` : ''}</div>
              {loc && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#c8963e' }}><MapPin size={14} />{loc}</span>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <Stars value={w.personalRating} size={15} />
                <span style={{ fontSize: 16, color: '#c8963e' }}>{fmt(w.purchasePrice)}</span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// Lista mobile: um cartão grande por vinho (ordem por nome vem já do Supabase)
export function WineMobileList({ wines, onWineClick, wineLocations = [], locations = [] }) {
  if (wines.length === 0) return <div style={{ textAlign: 'center', padding: '64px 0', color: '#9a8f82' }}><Wine size={40} style={{ marginBottom: 12, opacity: 0.3 }} /><p style={{ fontSize: 16 }}>Nenhum vinho encontrado.</p></div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {wines.map(w => {
        const c = getTC(w.type)
        const locData = getWineLocationData(w.id, wineLocations, locations)
        const loc = locData.length === 0 ? null : locData.length === 1 ? locData[0].name : `${locData.length} locais`
        return (
          <button key={w.id} onClick={() => onWineClick(w)}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px 12px 12px', borderRadius: 20, background: '#1e1b16', border: '1px solid rgba(255,255,255,0.06)', color: '#e8dece', fontFamily: FONT, textAlign: 'left', cursor: 'pointer', width: '100%', opacity: w.quantity === 0 ? 0.5 : 1 }}>
            {w.photo
              ? <img src={w.photo} alt="" loading="lazy" style={{ width: 56, height: 76, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }} />
              : <span style={{ width: 56, height: 76, borderRadius: 12, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Wine size={26} color={c.fg} style={{ opacity: 0.7 }} /></span>}
            <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 17, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</span>
              <span style={{ fontSize: 15, color: '#9a8f82', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{[w.region || w.country, w.year].filter(Boolean).join(' · ')}</span>
              {loc && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#c8963e' }}><MapPin size={13} />{loc}</span>}
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
              <span style={{ fontSize: 26, lineHeight: 1, color: w.quantity > 0 ? '#68c880' : '#e87080' }}>{w.quantity}</span>
              <span style={{ fontSize: 12, color: '#9a8f82' }}>{w.quantity === 1 ? 'garrafa' : 'garrafas'}</span>
              <span style={{ fontSize: 15, color: '#c8963e', marginTop: 2 }}>{fmt(w.purchasePrice)}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
