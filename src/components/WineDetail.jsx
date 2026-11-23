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
const statCard = { background: '#161310', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 14 }
const statLbl = { fontSize: 13, color: '#9a8f82', marginBottom: 4 }
const card = { background: '#161310', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '14px 16px' }
const plural = (n) => `${n} ${n === 1 ? 'garrafa' : 'garrafas'}`

export default function WineDetail({ wine, entries, consumptions, onClose, onEntry, onConsumption, onEdit, onDeleteEntry, onDeleteConsumption, onEditEntry, onEditConsumption, session, wineLocations = [], locations = [], critics = [], isMobile }) {
  const [tab, setTab]           = useState('info')
  const [lightbox, setLightbox] = useState(false)
  const [sharing, setSharing]   = useState(false)

  const wEntries  = entries.filter(e => e.wineId === wine.id).sort((a, b) => b.date.localeCompare(a.date))
  const wConsumed = consumptions.filter(c => c.wineId === wine.id).sort((a, b) => b.date.localeCompare(a.date))
  const locData   = getWineLocationData(wine.id, wineLocations, locations)
  const cr        = wine.criticRatings || {}
  const rated     = critics.filter(c => cr[c.abbrev] != null)
  const tabSt = (t) => ({ height: 46, borderRadius: 12, border: 'none', fontFamily: FONT, fontSize: 15, cursor: 'pointer', fontWeight: tab === t ? 600 : 500,
    background: tab === t ? '#2e2920' : 'transparent', color: tab === t ? '#e8dece' : '#9a8f82' })

  const thumb = <WineThumb photo={wine.photo} type={wine.type} size={92} onClick={wine.photo ? () => setLightbox(true) : undefined} />
  const shareBtn = <button onClick={() => setSharing(true)} aria-label="Partilhar" style={circleBtn}><Share2 size={20} /></button>
  const editBtn = <button onClick={onEdit} aria-label="Editar vinho" style={circleBtn}><Edit2 size={20} /></button>
  const titleBlock = (
    <div style={{ flex: 1, minWidth: 0, paddingTop: isMobile ? 0 : 4 }}>
      <div style={{ marginBottom: 8 }}><Badge type={wine.type} /></div>
      <h2 style={{ margin: 0, fontSize: isMobile ? 26 : 28, fontWeight: 400, color: '#e8dece', fontFamily: FONT, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{wine.name}</h2>
      <p style={{ margin: '6px 0 0', fontSize: isMobile ? 16 : 17, color: '#9a8f82' }}>{[wine.region, wine.country].filter(Boolean).join(', ')}{wine.year ? ` · ${wine.year}` : ''}</p>
    </div>
  )

  return (
    <>
      {lightbox && <PhotoLightbox src={wine.photo} onClose={() => setLightbox(false)} />}
      {sharing && <ShareModal wine={wine} session={session} onClose={() => setSharing(false)} />}

      {isMobile ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
            <button onClick={onClose} aria-label="Voltar" style={circleBtn}><ChevronLeft size={24} /></button>
            <div style={{ display: 'flex', gap: 10 }}>{shareBtn}{editBtn}</div>
          </div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 16 }}>{thumb}{titleBlock}</div>
        </>
      ) : (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 16 }}>
          {thumb}{titleBlock}
          <div style={{ display: 'flex', gap: 10 }}>{shareBtn}{editBtn}<button onClick={onClose} aria-label="Fechar" style={circleBtn}><X size={22} /></button></div>
        </div>
      )}

      {locData.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {locData.map(ld => (
            <span key={ld.location_id} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 14px', borderRadius: 20, background: 'rgba(200,150,62,0.10)', border: '1px solid rgba(200,150,62,0.3)', color: '#c8963e', fontSize: 15, fontWeight: 500 }}>
              <MapPin size={16} />{ld.name} · {ld.quantity}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 3 : 5}, 1fr)`, gap: 10, marginBottom: 12 }}>
        <div style={statCard}><div style={statLbl}>Em adega</div><span style={{ fontSize: 32, fontWeight: 300, color: wine.quantity > 0 ? '#e8dece' : '#e87080', fontFamily: FONT, lineHeight: 1.1 }}>{wine.quantity}</span></div>
        <div style={statCard}><div style={statLbl}>Preço</div><span style={{ fontSize: 20, fontWeight: 300, color: '#e8dece', fontFamily: FONT }}>{fmt(wine.purchasePrice)}</span></div>
        <div style={statCard}><div style={statLbl}>Valor</div><span style={{ fontSize: 20, fontWeight: 300, color: '#c8963e', fontFamily: FONT }}>{fmt(totalV(wine))}</span></div>
        {!isMobile && <div style={statCard}><div style={statLbl}>Vivino</div><span style={{ fontSize: 20, fontWeight: 300, color: '#e8dece', fontFamily: FONT }}>{wine.vivinoRating ? `★ ${wine.vivinoRating}` : '—'}</span></div>}
        {!isMobile && <div style={statCard}><div style={statLbl}>Pessoal</div><Stars value={wine.personalRating} size={18} /></div>}
      </div>

      {isMobile && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[{ l: 'Vivino', v: wine.vivinoRating }, { l: 'Pessoal', v: wine.personalRating }].map(({ l, v }) => (
            <div key={l} style={statCard}>
              <div style={{ ...statLbl, marginBottom: 6 }}>{l}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Stars value={v} size={20} /><span style={{ fontSize: 16, color: '#e8dece' }}>{v || '—'}</span></div>
            </div>
          ))}
        </div>
      )}

      {rated.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#9a8f82', marginBottom: 10 }}>Pontuações de críticos</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 8 }}>
            {rated.map(c => {
              const score = cr[c.abbrev]
              const col = score >= 95 ? '#c8963e' : score >= 90 ? '#e8dece' : '#9a8f82'
              return (
                <div key={c.abbrev} title={c.name} style={{ ...statCard, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#9a8f82', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{c.abbrev}</div>
                  <div style={{ fontSize: 26, fontWeight: 300, color: col, lineHeight: 1, fontFamily: FONT, marginBottom: 4 }}>{score}</div>
                  <div style={{ fontSize: 11, color: '#9a8f82' }}>{c.name}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {wine.notes && <div style={{ background: 'rgba(200,150,62,0.07)', border: '1px solid rgba(200,150,62,0.15)', borderRadius: 16, padding: '12px 14px', marginBottom: 16, fontSize: 16, color: '#c8a050', lineHeight: 1.55 }}>{wine.notes}</div>}

      <div role="tablist" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, padding: 4, background: '#161310', borderRadius: 16, marginBottom: 14 }}>
        <button role="tab" aria-selected={tab === 'info'}    style={tabSt('info')}    onClick={() => setTab('info')}>{isMobile ? 'Info' : 'Informação'}</button>
        <button role="tab" aria-selected={tab === 'entries'} style={tabSt('entries')} onClick={() => setTab('entries')}>Entradas {wEntries.length}</button>
        <button role="tab" aria-selected={tab === 'consum'}  style={tabSt('consum')}  onClick={() => setTab('consum')}>Consumos {wConsumed.length}</button>
      </div>

      {tab === 'info' && (
        <div style={{ fontSize: 16, color: '#9a8f82', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', columnGap: 32 }}>
          {[['Tipo', wine.type], ['País', wine.country], ['Região', wine.region || '—'], ['Ano', wine.year || '—'],
            ...(wine.producer ? [['Produtor', wine.producer]] : []),
            ...(wine.winemaker ? [['Enólogo', wine.winemaker]] : []),
            ...(wine.castas ? [['Castas', wine.castas]] : []),
            ...(wine.alcoholContent !== '' && wine.alcoholContent != null ? [['Teor Alcoólico', `${wine.alcoholContent}%`]] : []),
            ['Formato', bottleLabel(wine.bottleSize || 750)],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ flexShrink: 0 }}>{k}</span><span style={{ color: '#e8dece', textAlign: 'right' }}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'entries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {wEntries.length === 0
            ? <p style={{ color: '#9a8f82', fontSize: 16, textAlign: 'center', padding: '16px 0' }}>Sem entradas registadas.</p>
            : wEntries.map(e => (
              <div key={e.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 16, color: '#e8dece', fontWeight: 500 }}>{plural(e.quantity)} · {e.supplier}</div>
                  <div style={{ fontSize: 14, color: '#9a8f82', marginTop: 2 }}>{e.date} · {fmt(e.price)}/un</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {onEditEntry && <RowBtn label="Editar entrada" onClick={() => onEditEntry(e)}><Edit2 size={18} /></RowBtn>}
                  {onDeleteEntry && <RowBtn danger label="Cancelar entrada" onClick={() => { if (window.confirm(`Cancelar esta entrada de ${plural(e.quantity)}? O stock será revertido.`)) onDeleteEntry(e) }}><Trash2 size={18} /></RowBtn>}
                </div>
              </div>
            ))}
        </div>
      )}

      {tab === 'consum' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {wConsumed.length === 0
            ? <p style={{ color: '#9a8f82', fontSize: 16, textAlign: 'center', padding: '16px 0' }}>Sem consumos registados.</p>
            : wConsumed.map(c => (
              <div key={c.id} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 16, color: '#e8dece', fontWeight: 500 }}>{plural(c.quantity)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}><Stars value={c.rating} size={15} /><span style={{ fontSize: 14, color: '#9a8f82' }}>{c.date}</span></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {onEditConsumption && <RowBtn label="Editar consumo" onClick={() => onEditConsumption(c)}><Edit2 size={18} /></RowBtn>}
                    {onDeleteConsumption && <RowBtn danger label="Cancelar consumo" onClick={() => { if (window.confirm(`Cancelar este consumo de ${plural(c.quantity)}? O stock será reposto.`)) onDeleteConsumption(c) }}><Trash2 size={18} /></RowBtn>}
                  </div>
                </div>
                {c.notes && <div style={{ fontSize: 15, color: '#9a8f82', marginTop: 8 }}>{c.notes}</div>}
              </div>
            ))}
        </div>
      )}

      <div className="vt-actions" style={{ display: 'flex', gap: 10 }}>
        <Btn variant="gold" onClick={onConsumption} style={{ flex: 1 }}><LogOut size={20} />Consumir</Btn>
        <Btn variant="ghost" onClick={onEntry} style={{ flex: 1, color: '#c8963e', border: '1.5px solid rgba(200,150,62,0.5)' }}><LogIn size={20} />Entrada</Btn>
      </div>
    </>
  )
}
