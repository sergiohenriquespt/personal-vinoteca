import React, { useState } from 'react'
import { Edit2, Trash2, X, LogIn, LogOut, Share2, MapPin } from 'lucide-react'
import { getWineLocationData } from '../lib/supabase'
import { FONT, S } from '../utils/constants'
import { fmt, totalV } from '../utils/format'
import { bottleLabel } from '../utils/constants'
import Btn from './ui/Btn'
import Stars from './ui/Stars'
import Badge from './ui/Badge'
import WineThumb from './ui/WineThumb'
import PhotoLightbox from './PhotoLightbox'
import ShareModal from './ShareModal'

export default function WineDetail({ wine, entries, consumptions, onClose, onEntry, onConsumption, onEdit, onDelete, onDeleteEntry, onDeleteConsumption, onEditEntry, onEditConsumption, session, wineLocations = [], locations = [], critics = [] }) {
  const [tab, setTab]         = useState('info')
  const [lightbox, setLightbox] = useState(false)
  const [sharing, setSharing]   = useState(false)

  const wEntries  = entries.filter(e => e.wineId === wine.id).sort((a, b) => b.date.localeCompare(a.date))
  const wConsumed = consumptions.filter(c => c.wineId === wine.id).sort((a, b) => b.date.localeCompare(a.date))
  const tabSt = (t) => ({
    padding: '8px 14px', fontSize: 13, cursor: 'pointer', border: 'none', background: 'none',
    color: tab === t ? '#e8dece' : '#9a8f82', fontFamily: FONT, fontWeight: tab === t ? 500 : 400,
    borderBottom: tab === t ? '2px solid #c8963e' : '2px solid transparent', transition: 'color 0.15s',
  })

  return (
    <>
      {lightbox && <PhotoLightbox src={wine.photo} onClose={() => setLightbox(false)} />}
      {sharing && <ShareModal wine={wine} session={session} onClose={() => setSharing(false)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, flex: 1, minWidth: 0 }}>
          <WineThumb photo={wine.photo} type={wine.type} size={44} onClick={wine.photo ? () => setLightbox(true) : undefined} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 6 }}><Badge type={wine.type} /></div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 300, color: '#e8dece', fontFamily: FONT, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{wine.name}</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9a8f82' }}>{[wine.region, wine.country].filter(Boolean).join(', ')}{wine.year ? ` · ${wine.year}` : ''}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 8 }}>
          <button onClick={() => setSharing(true)} title="Partilhar" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 6, color: '#9a8f82', cursor: 'pointer', padding: '6px 8px' }}><Share2 size={14} /></button>
          <button onClick={onEdit}   style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 6, color: '#9a8f82', cursor: 'pointer', padding: '6px 8px' }}><Edit2 size={14} /></button>
          <button onClick={onDelete} style={{ background: 'rgba(192,48,74,0.1)',    border: 'none', borderRadius: 6, color: '#e87080', cursor: 'pointer', padding: '6px 8px' }}><Trash2 size={14} /></button>
          <button onClick={onClose}  style={{ background: 'none', border: 'none', color: '#9a8f82', cursor: 'pointer', padding: '6px 8px' }}><X size={16} /></button>
        </div>
      </div>

      {(() => {
        const locData = getWineLocationData(wine.id, wineLocations, locations)
        if (!locData.length) return null
        return (
          <div style={{ marginBottom: 14 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px 5px 9px', borderRadius: 20, background: 'rgba(200,150,62,0.10)', border: '1px solid rgba(200,150,62,0.30)', boxShadow: '0 0 0 3px rgba(200,150,62,0.04)', color: '#c8963e', fontSize: 13, fontFamily: FONT, fontWeight: 500, flexWrap: 'wrap' }}>
              <MapPin size={13} color="#c8963e" style={{ flexShrink: 0 }} />
              {locData.map((ld, i) => (
                <React.Fragment key={ld.location_id}>
                  {i > 0 && <span style={{ color: 'rgba(200,150,62,0.5)', margin: '0 2px' }}>·</span>}
                  {ld.name} ({ld.quantity})
                </React.Fragment>
              ))}
            </span>
          </div>
        )
      })()}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { l: 'Em Adega',      v: <span style={{ fontSize: 22, fontWeight: 300, color: wine.quantity > 0 ? '#e8dece' : '#e87080', fontFamily: FONT }}>{wine.quantity}</span> },
          { l: 'Preço/Garrafa', v: <span style={{ fontSize: 18, fontWeight: 300, color: '#e8dece', fontFamily: FONT }}>{fmt(wine.purchasePrice)}</span> },
          { l: 'Valor Total',   v: <span style={{ fontSize: 18, fontWeight: 300, color: '#c8963e', fontFamily: FONT }}>{fmt(totalV(wine))}</span> },
        ].map(({ l, v }) => (
          <div key={l} style={S.stat}><div style={{ fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{l}</div>{v}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[{ l: 'Vivino', v: wine.vivinoRating }, { l: 'Classificação Pessoal', v: wine.personalRating }].map(({ l, v }) => (
          <div key={l} style={S.stat}>
            <div style={{ fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{l}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Stars value={v} size={15} /><span style={{ fontSize: 13, color: '#e8dece' }}>{v || '—'}</span></div>
          </div>
        ))}
      </div>

      {(() => {
        const cr = wine.criticRatings || {}
        const rated = critics.filter(c => cr[c.abbrev] != null)
        if (!rated.length) return null
        return (
          <>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 0 14px' }} />
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: '#6a5f52', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Pontuações de Críticos</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8 }}>
                {rated.map(c => {
                  const score = cr[c.abbrev]
                  const col = score >= 95 ? '#c8963e' : score >= 90 ? '#e8dece' : '#6a5f52'
                  return (
                    <div key={c.abbrev} style={{ background: '#161310', border: '0.5px solid #2a2520', borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: '#6a5f52', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{c.abbrev}</div>
                      <div style={{ fontSize: 22, fontWeight: 300, color: col, lineHeight: 1, fontFamily: FONT, marginBottom: 4 }}>{score}</div>
                      <div style={{ fontSize: 8, color: '#3a3530', letterSpacing: '0.02em' }}>{c.name}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )
      })()}

      {wine.notes && <div style={{ background: 'rgba(200,150,62,0.07)', border: '1px solid rgba(200,150,62,0.15)', borderRadius: 8, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#c8a050', lineHeight: 1.55 }}>{wine.notes}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <Btn variant="gold"  onClick={onEntry}       style={{ flex: 1, justifyContent: 'center' }}><LogIn  size={13} />Entrada</Btn>
        <Btn variant="ghost" onClick={onConsumption} style={{ flex: 1, justifyContent: 'center' }}><LogOut size={13} />Consumo</Btn>
      </div>

      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 14 }}>
        <button style={tabSt('info')}    onClick={() => setTab('info')}>Informação</button>
        <button style={tabSt('entries')} onClick={() => setTab('entries')}>Entradas ({wEntries.length})</button>
        <button style={tabSt('consum')}  onClick={() => setTab('consum')}>Consumos ({wConsumed.length})</button>
      </div>

      {tab === 'info' && (
        <div style={{ fontSize: 13, color: '#9a8f82' }}>
          {[['Tipo', wine.type], ['País', wine.country], ['Região', wine.region || '—'], ['Ano', wine.year || '—'],
            ...(wine.producer ? [['Produtor', wine.producer]] : []),
            ...(wine.winemaker ? [['Enólogo', wine.winemaker]] : []),
            ...(wine.castas ? [['Castas', wine.castas]] : []),
            ...(wine.alcoholContent !== '' && wine.alcoholContent != null ? [['Teor Alcoólico', `${wine.alcoholContent}%`]] : []),
            ['Formato', bottleLabel(wine.bottleSize || 750)],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span>{k}</span><span style={{ color: '#e8dece' }}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'entries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {wEntries.length === 0
            ? <p style={{ color: '#4a453f', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Sem entradas registadas.</p>
            : wEntries.map(e => (
              <div key={e.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#e8dece', fontWeight: 500 }}>{e.quantity} {e.quantity === 1 ? 'garrafa' : 'garrafas'} · {e.supplier}</div>
                  <div style={{ fontSize: 11, color: '#9a8f82', marginTop: 2 }}>{e.date}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: '#c8963e' }}>{fmt(e.price)}/un</div>
                    <div style={{ fontSize: 11, color: '#9a8f82' }}>{fmt(e.price * e.quantity)} total</div>
                  </div>
                  {onEditEntry && (
                    <button onClick={() => onEditEntry(e)}
                      style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                      onMouseEnter={ev => { ev.currentTarget.style.color = '#c8963e'; ev.currentTarget.style.background = 'rgba(200,150,62,0.1)' }}
                      onMouseLeave={ev => { ev.currentTarget.style.color = '#6a5f52'; ev.currentTarget.style.background = 'none' }}>
                      <Edit2 size={13} />
                    </button>
                  )}
                  {onDeleteEntry && (
                    <button onClick={() => { if (window.confirm(`Cancelar esta entrada de ${e.quantity} ${e.quantity === 1 ? 'garrafa' : 'garrafas'}? O stock será revertido.`)) onDeleteEntry(e) }}
                      style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                      onMouseEnter={ev => { ev.currentTarget.style.color = '#e87080'; ev.currentTarget.style.background = 'rgba(232,112,128,0.1)' }}
                      onMouseLeave={ev => { ev.currentTarget.style.color = '#6a5f52'; ev.currentTarget.style.background = 'none' }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {tab === 'consum' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {wConsumed.length === 0
            ? <p style={{ color: '#4a453f', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Sem consumos registados.</p>
            : wConsumed.map(c => (
              <div key={c.id} style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, color: '#e8dece', fontWeight: 500 }}>{c.quantity} {c.quantity === 1 ? 'garrafa' : 'garrafas'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Stars value={c.rating} size={12} />
                    <span style={{ fontSize: 11, color: '#9a8f82' }}>{c.date}</span>
                    {onEditConsumption && (
                      <button onClick={() => onEditConsumption(c)}
                        style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#c8963e'; e.currentTarget.style.background = 'rgba(200,150,62,0.1)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#6a5f52'; e.currentTarget.style.background = 'none' }}>
                        <Edit2 size={13} />
                      </button>
                    )}
                    {onDeleteConsumption && (
                      <button onClick={() => { if (window.confirm(`Cancelar este consumo de ${c.quantity} ${c.quantity === 1 ? 'garrafa' : 'garrafas'}? O stock será reposto.`)) onDeleteConsumption(c) }}
                        style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#e87080'; e.currentTarget.style.background = 'rgba(232,112,128,0.1)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#6a5f52'; e.currentTarget.style.background = 'none' }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                {c.notes && <div style={{ fontSize: 12, color: '#9a8f82', marginTop: 4 }}>{c.notes}</div>}
              </div>
            ))}
        </div>
      )}
    </>
  )
}
