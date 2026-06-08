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

function WineListRow({ wine, onClick, isMobile, wineLocations = [], locations = [] }) {
  const [lightbox, setLightbox] = useState(false)
  const [hoveredPhoto, setHoveredPhoto] = useState(false)
  return (
    <div onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14, padding: isMobile ? '10px 14px' : '9px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.12s', opacity: wine.quantity === 0 ? 0.45 : 1 }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      {lightbox && <PhotoLightbox src={wine.photo} onClose={() => setLightbox(false)} />}
      {!isMobile && wine.photo
        ? <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 4, flexShrink: 0, width: 26, height: 39 }}
            onMouseEnter={() => setHoveredPhoto(true)} onMouseLeave={() => setHoveredPhoto(false)}>
            <img src={wine.photo} alt="" onClick={e => { e.stopPropagation(); setLightbox(true) }}
              style={{ width: 26, height: 39, objectFit: 'cover', display: 'block', cursor: 'zoom-in',
                transform: hoveredPhoto ? 'scale(1.07)' : 'scale(1)', transition: 'transform 0.2s ease' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)', opacity: hoveredPhoto ? 1 : 0, transition: 'opacity 0.2s ease', pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', bottom: 5, right: 5, background: 'rgba(13,11,9,0.65)', borderRadius: 3, padding: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8963e" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              </div>
            </div>
          </div>
        : <WineThumb photo={wine.photo} type={wine.type} size={isMobile ? 22 : 26} onClick={wine.photo ? e => { e.stopPropagation(); setLightbox(true) } : undefined} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 400, color: '#e8dece', fontFamily: FONT, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wine.name}</div>
        <div style={{ fontSize: 11, color: '#9a8f82', marginTop: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
            {isMobile
              ? <>{[wine.region, wine.country].filter(Boolean).join(', ')}{wine.year ? ` · ${wine.year}` : ''}</>
              : [wine.region, wine.country].filter(Boolean).join(', ')}
          </span>
          {isMobile && (() => {
            const locData = getWineLocationData(wine.id, wineLocations, locations)
            if (!locData.length) return null
            const label = locData.length === 1 ? locData[0].name : `${locData.length} locais`
            return (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 7px', borderRadius: 4, background: 'rgba(200,150,62,0.12)', color: '#c8963e', fontSize: 10, flexShrink: 0, whiteSpace: 'nowrap' }}>
                <MapPin size={9} />{label}
              </span>
            )
          })()}
        </div>
      </div>
      {!isMobile && <div style={{ width: 86, flexShrink: 0 }}><Badge type={wine.type} /></div>}
      {!isMobile && (() => {
        const locData = getWineLocationData(wine.id, wineLocations, locations)
        const label = locData.length === 0 ? null : locData.length === 1 ? locData[0].name : `${locData.length} locais`
        return (
          <div style={{ width: 100, flexShrink: 0 }}>
            {label && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 5, background: 'rgba(200,150,62,0.08)', border: '1px solid rgba(200,150,62,0.15)' }}>
                <MapPin size={10} color="#c8963e" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#c8b070', fontWeight: 400, letterSpacing: '0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 68 }}>{label}</span>
              </div>
            )}
          </div>
        )
      })()}
      {!isMobile && <div style={{ width: 52, flexShrink: 0, textAlign: 'center', fontSize: 13, color: '#9a8f82' }}>{wine.alcoholContent ? `${wine.alcoholContent}%` : '—'}</div>}
      {!isMobile && <div style={{ width: 44, flexShrink: 0, textAlign: 'center', fontSize: 13, color: '#9a8f82' }}>{wine.year || '—'}</div>}
      {!isMobile && <div style={{ width: 76, flexShrink: 0 }}><Stars value={wine.personalRating} size={12} /></div>}
      <div style={{ width: isMobile ? 32 : 44, flexShrink: 0, textAlign: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: wine.quantity > 0 ? '#68c880' : '#e87080' }}>{wine.quantity}</span>
      </div>
      {!isMobile && <div style={{ width: 72, flexShrink: 0, textAlign: 'right', fontSize: 13, color: '#c8963e' }}>{fmt(wine.purchasePrice)}</div>}
      {isMobile && <div style={{ flexShrink: 0, textAlign: 'right', fontSize: 12, color: '#c8963e', minWidth: 56 }}>{fmt(wine.purchasePrice)}</div>}
    </div>
  )
}

export function WineListView({ wines, onWineClick, isMobile, wineLocations = [], locations = [] }) {
  const { sortKey, sortDir, handleSort } = useSortable('name')

  const sorted = useMemo(() => {
    const getLocKey = (w) => {
      const names = wineLocations.filter(wl => wl.wine_id === w.id)
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

  const ColHead = ({ label, col, width, align = 'left', style = {} }) => {
    const active = sortKey === col
    const arrow  = active ? (sortDir === 1 ? ' ↑' : ' ↓') : ''
    return (
      <div onClick={() => handleSort(col)}
        style={{ width, flexShrink: 0, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
          textAlign: align, cursor: 'pointer', userSelect: 'none', fontWeight: active ? 700 : 600,
          color: active ? '#c8963e' : '#3a3530', transition: 'color 0.15s', ...style }}>
        {label}{arrow}
      </div>
    )
  }

  return (
    <div style={{ background: '#1e1b16', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14, padding: isMobile ? '7px 14px' : '7px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#161310' }}>
        <div style={{ width: isMobile ? 22 : 26, flexShrink: 0 }} />
        <ColHead label="Vinho"  col="name"           width={undefined} style={{ flex: 1 }} />
        {!isMobile && <ColHead label="Tipo"   col="type"           width={86} />}
        {!isMobile && <ColHead label="Local"  col="location"       width={100} />}
        {!isMobile && <ColHead label="Álcool" col="alcoholContent" width={52} align="center" />}
        {!isMobile && <ColHead label="Ano"    col="year"           width={44} align="center" />}
        {!isMobile && <ColHead label="Rating" col="personalRating" width={76} />}
        <ColHead label="Qtd."  col="quantity"       width={isMobile ? 32 : 44} align="center" />
        <ColHead label="Preço" col="purchasePrice"  width={isMobile ? 56 : 72} align="right" />
      </div>
      {sorted.length === 0
        ? <div style={{ textAlign: 'center', padding: '48px 0', color: '#4a453f' }}><Wine size={32} style={{ marginBottom: 10, opacity: 0.2 }} /><p style={{ fontSize: 13 }}>Nenhum vinho encontrado.</p></div>
        : sorted.map(w => <WineListRow key={w.id} wine={w} onClick={() => onWineClick(w)} isMobile={isMobile} wineLocations={wineLocations} locations={locations} />)}
    </div>
  )
}

export function WineGridView({ wines, onWineClick, wineLocations = [], locations = [] }) {
  const [hoveredPhoto, setHoveredPhoto] = useState(null)
  if (wines.length === 0) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#4a453f' }}><Wine size={40} style={{ marginBottom: 12, opacity: 0.25 }} /><p style={{ fontSize: 14 }}>Nenhum vinho encontrado.</p></div>
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 14 }}>
      {wines.map(w => {
        const c = getTC(w.type)
        return (
          <div key={w.id} onClick={() => onWineClick(w)}
            style={{ background: '#1e1b16', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s, border-color 0.15s', opacity: w.quantity === 0 ? 0.45 : 1 }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(200,150,62,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
            {w.photo
              ? <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <img src={w.photo} alt={w.name}
                    style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block', cursor: 'zoom-in',
                      transform: hoveredPhoto === w.id ? 'scale(1.07)' : 'scale(1)', transition: 'transform 0.2s ease' }}
                    onMouseEnter={() => setHoveredPhoto(w.id)} onMouseLeave={() => setHoveredPhoto(null)} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)', opacity: hoveredPhoto === w.id ? 1 : 0, transition: 'opacity 0.2s ease', pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', bottom: 5, right: 5, background: 'rgba(13,11,9,0.65)', borderRadius: 3, padding: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8963e" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                    </div>
                  </div>
                </div>
              : <div style={{ height: 4, background: c.fg, opacity: 0.6 }} />}
            <div style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Badge type={w.type} />
                <span style={{ fontSize: 12, fontWeight: 500, color: w.quantity > 0 ? '#68c880' : '#e87080' }}>{w.quantity} 🍾</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 400, color: '#e8dece', fontFamily: FONT, letterSpacing: '-0.02em', marginBottom: 2, lineHeight: 1.3 }}>{w.name}</div>
              {(() => {
                const locData = getWineLocationData(w.id, wineLocations, locations)
                if (!locData.length) return null
                const label = locData.length === 1 ? locData[0].name : `${locData.length} locais`
                return (
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 4, background: '#1a1712', color: '#6a5f52', fontSize: 10 }}>
                      <MapPin size={9} />{label}
                    </span>
                  </div>
                )
              })()}
              <div style={{ fontSize: 11, color: '#9a8f82', marginBottom: 10 }}>{[w.region, w.country].filter(Boolean).join(', ')}{w.year ? ` · ${w.year}` : ''}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stars value={w.personalRating} size={12} />
                <span style={{ fontSize: 13, color: '#c8963e' }}>{fmt(w.purchasePrice)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
