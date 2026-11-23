import React, { useState } from 'react'
import { Edit2, Trash2, X, LogIn, LogOut, Share2, MapPin, ChevronLeft } from 'lucide-react'
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
import RowBtn from './ui/RowBtn'

const circleBtn = { width: 48, height: 48, borderRadius: 24, background: '#2a261f', border: '1px solid rgba(255,255,255,0.08)', color: '#e8dece', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }

export default function WineDetail({ wine, entries, consumptions, onClose, onEntry, onConsumption, onEdit, onDelete, onDeleteEntry, onDeleteConsumption, onEditEntry, onEditConsumption, session, wineLocations = [], locations = [], critics = [], isMobile: m }) {
  const [tab, setTab]         = useState('info')
  const [lightbox, setLightbox] = useState(false)
  const [sharing, setSharing]   = useState(false)

  const wEntries  = entries.filter(e => e.wineId === wine.id).sort((a, b) => b.date.localeCompare(a.date))
  const wConsumed = consumptions.filter(c => c.wineId === wine.id).sort((a, b) => b.date.localeCompare(a.date))
  const tabSt = (t) => m
    ? { height: 46, borderRadius: 12, border: 'none', fontFamily: FONT, fontSize: 15, cursor: 'pointer', fontWeight: tab === t ? 600 : 500,
        background: tab === t ? '#2e2920' : 'transparent', color: tab === t ? '#e8dece' : '#9a8f82' }
    : { padding: '8px 14px', fontSize: 13, cursor: 'pointer', border: 'none', background: 'none',
        color: tab === t ? '#e8dece' : '#9a8f82', fontFamily: FONT, fontWeight: tab === t ? 500 : 400,
        borderBottom: tab === t ? '2px solid #c8963e' : '2px solid transparent', transition: 'color 0.15s' }
  const statLbl = { fontSize: m ? 13 : 10, color: '#9a8f82', textTransform: m ? 'none' : 'uppercase', letterSpacing: m ? 0 : '0.08em', marginBottom: 4 }
  const card = m ? { ...S.card, background: '#161310', borderRadius: 16, padding: '14px 16px' } : S.card
  const plural = (n) => `${n} ${n === 1 ? 'garrafa' : 'garrafas'}`
  const ic = m ? 18 : 13

  return (
    <>
      {lightbox && <PhotoLightbox src={wine.photo} onClose={() => setLightbox(false)} />}
      {sharing && <ShareModal wine={wine} session={session} onClose={() => setSharing(false)} />}

      {m ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
            <button onClick={onClose} aria-label="Voltar" style={circleBtn}><ChevronLeft size={24} /></button>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setSharing(true)} aria-label="Partilhar" style={circleBtn}><Share2 size={20} /></button>
              <button onClick={onEdit} aria-label="Editar vinho" style={circleBtn}><Edit2 size={20} /></button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 16 }}>
            <WineThumb photo={wine.photo} type={wine.type} size={92} onClick={wine.photo ? () => setLightbox(true) : undefined} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: 8 }}><Badge type={wine.type} /></div>
              <h2 style={{ margin: 0, fontSize: 26, fontWeight: 400, color: '#e8dece', fontFamily: FONT, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{wine.name}</h2>
              <p style={{ margin: '6px 0 0', fontSize: 16, color: '#9a8f82' }}>{[wine.region, wine.country].filter(Boolean).join(', ')}{wine.year ? ` · ${wine.year}` : ''}</p>
            </div>
          </div>
        </>
      ) : (
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
      )}

      {(() => {
        const locData = getWineLocationData(wine.id, wineLocations, locations)
        if (!locData.length) return null
        if (m) return (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {locData.map(ld => (
              <span key={ld.location_id} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 14px', borderRadius: 20, background: 'rgba(200,150,62,0.10)', border: '1px solid rgba(200,150,62,0.3)', color: '#c8963e', fontSize: 15, fontWeight: 500 }}>
                <MapPin size={16} />{ld.name} · {ld.quantity}
              </span>
            ))}
          </div>
        )
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: m ? 10 : 8, marginBottom: m ? 12 : 16 }}>
        {[
          { l: 'Em Adega',      v: <span style={{ fontSize: m ? 32 : 22, fontWeight: 300, color: wine.quantity > 0 ? '#e8dece' : '#e87080', fontFamily: FONT, lineHeight: 1.1 }}>{wine.quantity}</span> },
          { l: m ? 'Preço' : 'Preço/Garrafa', v: <span style={{ fontSize: m ? 20 : 18, fontWeight: 300, color: '#e8dece', fontFamily: FONT }}>{fmt(wine.purchasePrice)}</span> },
          { l: m ? 'Valor' : 'Valor Total',   v: <span style={{ fontSize: m ? 20 : 18, fontWeight: 300, color: '#c8963e', fontFamily: FONT }}>{fmt(totalV(wine))}</span> },
        ].map(({ l, v }) => (
          <div key={l} style={m ? { ...S.stat, background: '#161310', borderRadius: 16, padding: 14 } : S.stat}><div style={statLbl}>{l}</div>{v}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[{ l: 'Vivino', v: wine.vivinoRating }, { l: m ? 'Pessoal' : 'Classificação Pessoal', v: wine.personalRating }].map(({ l, v }) => (
          <div key={l} style={m ? { ...S.stat, background: '#161310', borderRadius: 16, padding: 14 } : S.stat}>
            <div style={{ ...statLbl, marginBottom: 6 }}>{l}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Stars value={v} size={m ? 20 : 15} /><span style={{ fontSize: m ? 16 : 13, color: '#e8dece' }}>{v || '—'}</span></div>
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
              <div style={{ fontSize: m ? 13 : 10, color: m ? '#9a8f82' : '#6a5f52', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Pontuações de Críticos</div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${m ? 88 : 72}px, 1fr))`, gap: 8 }}>
                {rated.map(c => {
                  const score = cr[c.abbrev]
                  const col = score >= 95 ? '#c8963e' : score >= 90 ? '#e8dece' : '#6a5f52'
                  return (
                    <div key={c.abbrev} title={c.name} style={{ background: '#161310', border: '0.5px solid #2a2520', borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: m ? 12 : 9, color: m ? '#9a8f82' : '#6a5f52', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{c.abbrev}</div>
                      <div style={{ fontSize: m ? 26 : 22, fontWeight: 300, color: col, lineHeight: 1, fontFamily: FONT, marginBottom: 4 }}>{score}</div>
                      <div style={{ fontSize: m ? 11 : 8, color: m ? '#9a8f82' : '#3a3530', letterSpacing: '0.02em' }}>{c.name}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )
      })()}

      {wine.notes && <div style={{ background: 'rgba(200,150,62,0.07)', border: '1px solid rgba(200,150,62,0.15)', borderRadius: m ? 16 : 8, padding: '12px 14px', marginBottom: 16, fontSize: m ? 16 : 13, color: '#c8a050', lineHeight: 1.55 }}>{wine.notes}</div>}

      {!m && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          <Btn variant="gold"  onClick={onEntry}       style={{ flex: 1, justifyContent: 'center' }}><LogIn  size={13} />Entrada</Btn>
          <Btn variant="ghost" onClick={onConsumption} style={{ flex: 1, justifyContent: 'center' }}><LogOut size={13} />Consumo</Btn>
        </div>
      )}

      <div role="tablist" style={m
        ? { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, padding: 4, background: '#161310', borderRadius: 16, marginBottom: 14 }
        : { borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 14 }}>
        <button role="tab" aria-selected={tab === 'info'}    style={tabSt('info')}    onClick={() => setTab('info')}>{m ? 'Info' : 'Informação'}</button>
        <button role="tab" aria-selected={tab === 'entries'} style={tabSt('entries')} onClick={() => setTab('entries')}>Entradas {m ? wEntries.length : `(${wEntries.length})`}</button>
        <button role="tab" aria-selected={tab === 'consum'}  style={tabSt('consum')}  onClick={() => setTab('consum')}>Consumos {m ? wConsumed.length : `(${wConsumed.length})`}</button>
      </div>

      {tab === 'info' && (
        <div style={{ fontSize: m ? 16 : 13, color: '#9a8f82' }}>
          {[['Tipo', wine.type], ['País', wine.country], ['Região', wine.region || '—'], ['Ano', wine.year || '—'],
            ...(wine.producer ? [['Produtor', wine.producer]] : []),
            ...(wine.winemaker ? [['Enólogo', wine.winemaker]] : []),
            ...(wine.castas ? [['Castas', wine.castas]] : []),
            ...(wine.alcoholContent !== '' && wine.alcoholContent != null ? [['Teor Alcoólico', `${wine.alcoholContent}%`]] : []),
            ['Formato', bottleLabel(wine.bottleSize || 750)],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: m ? '13px 0' : '6px 0', borderBottom: `1px solid rgba(255,255,255,${m ? 0.06 : 0.04})` }}>
              <span style={{ flexShrink: 0 }}>{k}</span><span style={{ color: '#e8dece', textAlign: 'right' }}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'entries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: m ? 8 : 6 }}>
          {wEntries.length === 0
            ? <p style={{ color: m ? '#9a8f82' : '#4a453f', fontSize: m ? 16 : 13, textAlign: 'center', padding: '16px 0' }}>Sem entradas registadas.</p>
            : wEntries.map(e => (
              <div key={e.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: m ? 16 : 13, color: '#e8dece', fontWeight: 500 }}>{plural(e.quantity)} · {e.supplier}</div>
                  <div style={{ fontSize: m ? 14 : 11, color: '#9a8f82', marginTop: 2 }}>{e.date}{m ? ` · ${fmt(e.price)}/un` : ''}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: m ? 6 : 10, flexShrink: 0 }}>
                  {!m && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, color: '#c8963e' }}>{fmt(e.price)}/un</div>
                      <div style={{ fontSize: 11, color: '#9a8f82' }}>{fmt(e.price * e.quantity)} total</div>
                    </div>
                  )}
                  {onEditEntry && <RowBtn m={m} label="Editar entrada" onClick={() => onEditEntry(e)}><Edit2 size={ic} /></RowBtn>}
                  {onDeleteEntry && <RowBtn m={m} danger label="Cancelar entrada" onClick={() => { if (window.confirm(`Cancelar esta entrada de ${plural(e.quantity)}? O stock será revertido.`)) onDeleteEntry(e) }}><Trash2 size={ic} /></RowBtn>}
                </div>
              </div>
            ))}
        </div>
      )}

      {tab === 'consum' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: m ? 8 : 6 }}>
          {wConsumed.length === 0
            ? <p style={{ color: m ? '#9a8f82' : '#4a453f', fontSize: m ? 16 : 13, textAlign: 'center', padding: '16px 0' }}>Sem consumos registados.</p>
            : wConsumed.map(c => (
              <div key={c.id} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  {m ? (
                    <div>
                      <div style={{ fontSize: 16, color: '#e8dece', fontWeight: 500 }}>{plural(c.quantity)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}><Stars value={c.rating} size={15} /><span style={{ fontSize: 14, color: '#9a8f82' }}>{c.date}</span></div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: '#e8dece', fontWeight: 500 }}>{plural(c.quantity)}</div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: m ? 6 : 8, flexShrink: 0 }}>
                    {!m && <><Stars value={c.rating} size={12} /><span style={{ fontSize: 11, color: '#9a8f82' }}>{c.date}</span></>}
                    {onEditConsumption && <RowBtn m={m} label="Editar consumo" onClick={() => onEditConsumption(c)}><Edit2 size={ic} /></RowBtn>}
                    {onDeleteConsumption && <RowBtn m={m} danger label="Cancelar consumo" onClick={() => { if (window.confirm(`Cancelar este consumo de ${plural(c.quantity)}? O stock será reposto.`)) onDeleteConsumption(c) }}><Trash2 size={ic} /></RowBtn>}
                  </div>
                </div>
                {c.notes && <div style={{ fontSize: m ? 15 : 12, color: '#9a8f82', marginTop: m ? 8 : 4 }}>{c.notes}</div>}
              </div>
            ))}
        </div>
      )}

      {m && (
        <div className="vt-actions" style={{ display: 'flex', gap: 10 }}>
          <Btn variant="gold" onClick={onConsumption}><LogOut size={20} />Consumir</Btn>
          <Btn variant="ghost" onClick={onEntry} style={{ color: '#c8963e', border: '1.5px solid rgba(200,150,62,0.5)' }}><LogIn size={20} />Entrada</Btn>
        </div>
      )}
    </>
  )
}
