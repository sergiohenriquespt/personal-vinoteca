import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Wine, Plus, Search, BarChart3, LogIn, LogOut,
  Edit2, Trash2, X, Menu, Sparkles, Check,
  LayoutGrid, List, Camera, ImageOff, Eye, EyeOff,
} from 'lucide-react'

// ─── FONT: Outfit is loaded globally via index.html ───────────────────────────
const FONT = "'Outfit', system-ui, sans-serif"

// ─── TYPE COLORS ──────────────────────────────────────────────────────────────
const TYPE_COLORS = {
  Tinto:     { fg: '#e87080', bg: '#2d0a12' },
  Branco:    { fg: '#e0b858', bg: '#2a1e06' },
  Rosé:      { fg: '#e878a8', bg: '#2d0f20' },
  Espumante: { fg: '#78b0d8', bg: '#091d2e' },
  Porto:     { fg: '#c078cc', bg: '#1e0828' },
  Verde:     { fg: '#68c880', bg: '#061e10' },
  Moscatel:  { fg: '#d4a838', bg: '#1e1500' },
  Laranja:   { fg: '#e88050', bg: '#2c0f00' },
}
const getTC = (t) => TYPE_COLORS[t] || { fg: '#9a8f82', bg: '#1e1b16' }

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const INIT_TYPES = ['Tinto', 'Branco', 'Rosé', 'Espumante', 'Moscatel', 'Porto', 'Verde', 'Laranja']

const COUNTRIES_REGIONS = {
  Portugal:        ['Douro', 'Alentejo', 'Dão', 'Vinho Verde', 'Bairrada', 'Beira Interior', 'Lisboa', 'Setúbal', 'Tejo', 'Madeira', 'Trás-os-Montes'],
  França:          ['Bordéus', 'Borgonha', 'Champagne', 'Alsácia', 'Vale do Loire', 'Rhône', 'Languedoc', 'Provence'],
  Espanha:         ['Rioja', 'Ribera del Duero', 'Priorat', 'Rías Baixas', 'Penedès', 'Jerez', 'Rueda'],
  Itália:          ['Piemonte', 'Toscana', 'Véneto', 'Sicília', 'Campânia'],
  Alemanha:        ['Mosel', 'Rheingau', 'Pfalz', 'Baden'],
  Argentina:       ['Mendoza', 'Salta', 'Patagónia'],
  Chile:           ['Maipo', 'Colchagua', 'Casablanca'],
  EUA:             ['Napa Valley', 'Sonoma', 'Willamette Valley'],
  Austrália:       ['Barossa Valley', 'McLaren Vale', 'Yarra Valley'],
  Áustria:         ['Wachau', 'Kamptal', 'Burgenland'],
  'África do Sul': ['Stellenbosch', 'Franschhoek', 'Swartland'],
  Eslovénia:       ['Primorska', 'Posavje'],
  Outro:           [],
}

const SUPPLIERS = [
  'Garrafeira Nacional', 'Garrafeira do Carmo', 'Wine with Spirit',
  'Continente', 'El Corte Inglés', 'Quinta (direto)', 'Adega (direto)', 'Outro',
]

// ─── DATA (importado de Garrafeira.xlsx — folha ENOTECA) ─────────────────────
const INIT_WINES = [
  { id:1,  name:'Aleixo Grande Reserva',                          type:'Tinto',  country:'Portugal', region:'Bairrada',       year:1996, purchasePrice:50.0,   personalRating:0,   vivinoRating:4.1,  quantity:1, photo:null, notes:'' },
  { id:2,  name:'Aleixo Grande Reserva',                          type:'Tinto',  country:'Portugal', region:'Bairrada',       year:1997, purchasePrice:45.0,   personalRating:0,   vivinoRating:4.1,  quantity:1, photo:null, notes:'' },
  { id:3,  name:'Alto do Milhafre Grande Reserva',                type:'Tinto',  country:'Portugal', region:'Bairrada',       year:2019, purchasePrice:20.0,   personalRating:5.0, vivinoRating:null, quantity:1, photo:null, notes:'' },
  { id:4,  name:'Avô Fausto',                                     type:'Tinto',  country:'Portugal', region:'Bairrada',       year:2022, purchasePrice:25.0,   personalRating:0,   vivinoRating:4.1,  quantity:1, photo:null, notes:'' },
  { id:5,  name:'Beta',                                           type:'Tinto',  country:'Portugal', region:'Bairrada',       year:2021, purchasePrice:19.0,   personalRating:4.0, vivinoRating:4.1,  quantity:1, photo:null, notes:'' },
  { id:6,  name:'Blog',                                           type:'Tinto',  country:'Portugal', region:'Alentejo',       year:2018, purchasePrice:21.2,   personalRating:0,   vivinoRating:4.4,  quantity:1, photo:null, notes:'' },
  { id:7,  name:'Blog',                                           type:'Tinto',  country:'Portugal', region:'Alentejo',       year:2019, purchasePrice:21.2,   personalRating:4.0, vivinoRating:4.2,  quantity:1, photo:null, notes:'' },
  { id:8,  name:'Blog Arinto Curtimenta Parcial',                 type:'Branco', country:'Portugal', region:'Alentejo',       year:2021, purchasePrice:27.5,   personalRating:0,   vivinoRating:null, quantity:1, photo:null, notes:'' },
  { id:9,  name:'Blog Syrah',                                     type:'Tinto',  country:'Portugal', region:'Alentejo',       year:2019, purchasePrice:27.5,   personalRating:5.0, vivinoRating:null, quantity:1, photo:null, notes:'' },
  { id:10, name:'Buçaco Reservado',                               type:'Branco', country:'Portugal', region:'Bairrada',       year:2017, purchasePrice:46.9,   personalRating:0,   vivinoRating:4.6,  quantity:1, photo:null, notes:'' },
  { id:11, name:'Cartuxa Reserva',                                type:'Tinto',  country:'Portugal', region:'Alentejo',       year:2019, purchasePrice:33.5,   personalRating:0,   vivinoRating:4.4,  quantity:1, photo:null, notes:'' },
  { id:12, name:'Casa de Saima Garrafeira Baga',                  type:'Tinto',  country:'Portugal', region:'Bairrada',       year:1991, purchasePrice:0.0,    personalRating:5.0, vivinoRating:4.3,  quantity:1, photo:null, notes:'' },
  { id:13, name:'Casa de Saima Garrafeira Baga',                  type:'Tinto',  country:'Portugal', region:'Bairrada',       year:2015, purchasePrice:55.0,   personalRating:5.0, vivinoRating:4.3,  quantity:1, photo:null, notes:'' },
  { id:14, name:'Casa do Canto Grande Reserva',                   type:'Tinto',  country:'Portugal', region:'Bairrada',       year:2015, purchasePrice:26.0,   personalRating:5.0, vivinoRating:4.4,  quantity:1, photo:null, notes:'' },
  { id:15, name:'Casa José Pedro Reserva',                        type:'Tinto',  country:'Portugal', region:'Trás-os-Montes', year:2023, purchasePrice:7.75,   personalRating:5.0, vivinoRating:4.0,  quantity:1, photo:null, notes:'' },
  { id:16, name:'Cave Solar das Francesas Garrafeira',            type:'Tinto',  country:'Portugal', region:'Bairrada',       year:1968, purchasePrice:0.0,    personalRating:4.0, vivinoRating:4.0,  quantity:1, photo:null, notes:'' },
  { id:17, name:'Fronteira Private Selection',                    type:'Tinto',  country:'Portugal', region:'Douro',          year:2017, purchasePrice:33.0,   personalRating:5.0, vivinoRating:4.3,  quantity:1, photo:null, notes:'' },
  { id:18, name:'Giz Vinhas Velhas',                              type:'Tinto',  country:'Portugal', region:'Bairrada',       year:2017, purchasePrice:19.0,   personalRating:0,   vivinoRating:4.0,  quantity:1, photo:null, notes:'' },
  { id:19, name:'Grande Vadio',                                   type:'Tinto',  country:'Portugal', region:'Bairrada',       year:2017, purchasePrice:30.0,   personalRating:0,   vivinoRating:4.2,  quantity:1, photo:null, notes:'' },
  { id:20, name:'Já Te Disse Grande Reserva',                     type:'Tinto',  country:'Portugal', region:'Alentejo',       year:2021, purchasePrice:84.9,   personalRating:0,   vivinoRating:4.5,  quantity:1, photo:null, notes:'' },
  { id:21, name:'Já Te Disse Grande Reserva',                     type:'Tinto',  country:'Portugal', region:'Alentejo',       year:2022, purchasePrice:84.9,   personalRating:0,   vivinoRating:4.5,  quantity:1, photo:null, notes:'' },
  { id:22, name:'Já Te Disse Grande Reserva Petit Verdot',        type:'Tinto',  country:'Portugal', region:'Alentejo',       year:2021, purchasePrice:98.5,   personalRating:0,   vivinoRating:4.9,  quantity:1, photo:null, notes:'' },
  { id:23, name:'Já Te Disse Rosé',                               type:'Rosé',   country:'Portugal', region:'Alentejo',       year:2024, purchasePrice:33.0,   personalRating:0,   vivinoRating:4.6,  quantity:1, photo:null, notes:'' },
  { id:24, name:'JCA Antes Só',                                   type:'Branco', country:'Portugal', region:'Alentejo',       year:2024, purchasePrice:34.0,   personalRating:0,   vivinoRating:null, quantity:1, photo:null, notes:'' },
  { id:25, name:'JCA Intratável',                                 type:'Tinto',  country:'Portugal', region:'Alentejo',       year:2020, purchasePrice:40.0,   personalRating:0,   vivinoRating:null, quantity:1, photo:null, notes:'' },
  { id:26, name:'JCA Why Syrah?',                                 type:'Tinto',  country:'Portugal', region:'Alentejo',       year:2022, purchasePrice:60.0,   personalRating:0,   vivinoRating:null, quantity:1, photo:null, notes:'' },
  { id:27, name:'Kompassus Tinto Cão',                            type:'Tinto',  country:'Portugal', region:'Bairrada',       year:2015, purchasePrice:28.0,   personalRating:0,   vivinoRating:null, quantity:1, photo:null, notes:'' },
  { id:28, name:'Lobo de Vasconcellos LV Reserva',                type:'Tinto',  country:'Portugal', region:'Alentejo',       year:2021, purchasePrice:20.25,  personalRating:0,   vivinoRating:4.3,  quantity:1, photo:null, notes:'' },
  { id:29, name:'Lobo de Vasconcellos Vinha do Norte',            type:'Tinto',  country:'Portugal', region:'Douro',          year:2019, purchasePrice:54.0,   personalRating:0,   vivinoRating:4.5,  quantity:1, photo:null, notes:'' },
  { id:30, name:'Luís Pato Quinta do Ribeirinho',                 type:'Branco', country:'Portugal', region:'Bairrada',       year:2021, purchasePrice:45.0,   personalRating:0,   vivinoRating:4.5,  quantity:1, photo:null, notes:'' },
  { id:31, name:'Luís Pato Quinta do Ribeirinho Pé de Franco',    type:'Tinto',  country:'Portugal', region:'Bairrada',       year:2015, purchasePrice:150.0,  personalRating:0,   vivinoRating:4.7,  quantity:1, photo:null, notes:'' },
  { id:32, name:'Luís Pato Rosé',                                 type:'Rosé',   country:'Portugal', region:'Bairrada',       year:2005, purchasePrice:48.5,   personalRating:0,   vivinoRating:4.1,  quantity:1, photo:null, notes:'' },
  { id:33, name:'Marquês de Marialva Grande Reserva',             type:'Tinto',  country:'Portugal', region:'Bairrada',       year:2013, purchasePrice:23.7,   personalRating:4.0, vivinoRating:4.3,  quantity:1, photo:null, notes:'' },
  { id:34, name:'Monte da Bonança Mia Mara Alicante Bouschet',    type:'Tinto',  country:'Portugal', region:'Alentejo',       year:2023, purchasePrice:55.0,   personalRating:0,   vivinoRating:null, quantity:1, photo:null, notes:'' },
  { id:35, name:'Monte da Bonança Mia Mara Antão Vaz',            type:'Branco', country:'Portugal', region:'Alentejo',       year:2023, purchasePrice:55.0,   personalRating:0,   vivinoRating:null, quantity:1, photo:null, notes:'' },
  { id:36, name:'Monte da Bonança Grande Reserva',                type:'Branco', country:'Portugal', region:'Alentejo',       year:2023, purchasePrice:18.0,   personalRating:0,   vivinoRating:null, quantity:1, photo:null, notes:'' },
  { id:37, name:'Monte da Bonança Reserva',                       type:'Tinto',  country:'Portugal', region:'Alentejo',       year:2020, purchasePrice:15.0,   personalRating:4.0, vivinoRating:4.3,  quantity:1, photo:null, notes:'' },
  { id:38, name:'Opta Grande Reserva',                            type:'Tinto',  country:'Portugal', region:'Dão',            year:2016, purchasePrice:28.7,   personalRating:0,   vivinoRating:4.5,  quantity:1, photo:null, notes:'' },
  { id:39, name:'Pacheca Lagar Nº1 Reserva',                      type:'Tinto',  country:'Portugal', region:'Douro',          year:2017, purchasePrice:53.0,   personalRating:0,   vivinoRating:4.3,  quantity:1, photo:null, notes:'' },
  { id:40, name:'Pai Chão Grande Reserva',                        type:'Tinto',  country:'Portugal', region:'Alentejo',       year:2020, purchasePrice:46.0,   personalRating:0,   vivinoRating:4.2,  quantity:1, photo:null, notes:'' },
  { id:41, name:'Pai Horácio Grande Reserva',                     type:'Tinto',  country:'Portugal', region:'Douro',          year:2018, purchasePrice:43.0,   personalRating:0,   vivinoRating:4.6,  quantity:1, photo:null, notes:'' },
  { id:42, name:'Primado',                                        type:'Tinto',  country:'Portugal', region:'Dão',            year:2011, purchasePrice:16.5,   personalRating:0,   vivinoRating:4.0,  quantity:1, photo:null, notes:'' },
  { id:43, name:'Primavera 1944',                                 type:'Tinto',  country:'Portugal', region:'Bairrada',       year:2019, purchasePrice:30.0,   personalRating:0,   vivinoRating:null, quantity:1, photo:null, notes:'' },
  { id:44, name:'Proibido Garrafeira',                            type:'Tinto',  country:'Portugal', region:'Douro',          year:2017, purchasePrice:65.0,   personalRating:0,   vivinoRating:4.7,  quantity:1, photo:null, notes:'' },
  { id:45, name:'Proibido Grande Reserva',                        type:'Tinto',  country:'Portugal', region:'Douro',          year:2020, purchasePrice:28.0,   personalRating:5.0, vivinoRating:4.4,  quantity:1, photo:null, notes:'' },
  { id:46, name:"Quinta da Curia Clefs d'Or",                     type:'Tinto',  country:'Portugal', region:'Bairrada',       year:2014, purchasePrice:36.0,   personalRating:0,   vivinoRating:4.3,  quantity:1, photo:null, notes:'' },
  { id:47, name:'Quinta da Dôna',                                 type:'Tinto',  country:'Portugal', region:'Bairrada',       year:2020, purchasePrice:22.3,   personalRating:0,   vivinoRating:4.3,  quantity:1, photo:null, notes:'' },
  { id:48, name:'Quinta da Gaivosa',                              type:'Tinto',  country:'Portugal', region:'Douro',          year:2019, purchasePrice:35.6,   personalRating:0,   vivinoRating:4.4,  quantity:1, photo:null, notes:'' },
  { id:49, name:'Quinta da Gândara Grande Reserva',               type:'Tinto',  country:'Portugal', region:'Dão',            year:2017, purchasePrice:23.7,   personalRating:0,   vivinoRating:null, quantity:1, photo:null, notes:'' },
  { id:50, name:'Quinta da Lagoa Velha Singular',                 type:'Branco', country:'Portugal', region:'Bairrada',       year:2020, purchasePrice:12.85,  personalRating:0,   vivinoRating:null, quantity:1, photo:null, notes:'' },
  { id:51, name:'Quinta da Lagoa Velha Singular',                 type:'Branco', country:'Portugal', region:'Bairrada',       year:2021, purchasePrice:12.85,  personalRating:5.0, vivinoRating:null, quantity:1, photo:null, notes:'' },
  { id:52, name:'Quinta de São Bernardo Alecrim',                 type:'Branco', country:'Portugal', region:'Douro',          year:2020, purchasePrice:19.5,   personalRating:0,   vivinoRating:4.2,  quantity:1, photo:null, notes:'' },
  { id:53, name:'Quinta do Castanheirinho Escolha da Família',    type:'Tinto',  country:'Portugal', region:'Bairrada',       year:2020, purchasePrice:0.0,    personalRating:0,   vivinoRating:4.4,  quantity:1, photo:null, notes:'' },
  { id:54, name:'Quinta do Mouro',                                type:'Tinto',  country:'Portugal', region:'Alentejo',       year:2016, purchasePrice:29.3,   personalRating:0,   vivinoRating:4.4,  quantity:1, photo:null, notes:'' },
  { id:55, name:'Quinta do Pessegueiro Plenitude',                type:'Tinto',  country:'Portugal', region:'Douro',          year:2023, purchasePrice:58.0,   personalRating:0,   vivinoRating:4.6,  quantity:1, photo:null, notes:'' },
  { id:56, name:'Quinta do Sobreiró de Cima Único',               type:'Tinto',  country:'Portugal', region:'Trás-os-Montes', year:2015, purchasePrice:48.0,   personalRating:5.0, vivinoRating:4.4,  quantity:1, photo:null, notes:'' },
  { id:57, name:'Quinta dos Abibes Bical',                        type:'Branco', country:'Portugal', region:'Bairrada',       year:2017, purchasePrice:26.95,  personalRating:5.0, vivinoRating:4.1,  quantity:1, photo:null, notes:'' },
  { id:58, name:'Quinta dos Castelares Bicho-da-Seda',            type:'Tinto',  country:'Portugal', region:'Douro',          year:2018, purchasePrice:90.0,   personalRating:5.0, vivinoRating:4.6,  quantity:1, photo:null, notes:'' },
  { id:59, name:'Quinta dos Termos Reserva Vinha das Colmeias',   type:'Tinto',  country:'Portugal', region:'Beira Interior', year:2020, purchasePrice:11.5,   personalRating:5.0, vivinoRating:4.3,  quantity:1, photo:null, notes:'' },
  { id:60, name:'Quinta dos Termos Reserva Vinhas Velhas',        type:'Tinto',  country:'Portugal', region:'Beira Interior', year:2021, purchasePrice:8.0,    personalRating:5.0, vivinoRating:4.1,  quantity:1, photo:null, notes:'' },
  { id:61, name:'Quinta dos Termos Talhão da Serra Rufete',       type:'Tinto',  country:'Portugal', region:'Beira Interior', year:2020, purchasePrice:11.5,   personalRating:5.0, vivinoRating:4.1,  quantity:2, photo:null, notes:'' },
  { id:62, name:'Quinta Vale D. Maria Vinhas Velhas',             type:'Tinto',  country:'Portugal', region:'Douro',          year:2020, purchasePrice:45.0,   personalRating:5.0, vivinoRating:4.4,  quantity:1, photo:null, notes:'' },
  { id:63, name:'Quintinha da Francisca Grande Reserva',          type:'Tinto',  country:'Portugal', region:'Douro',          year:2019, purchasePrice:40.0,   personalRating:0,   vivinoRating:4.4,  quantity:1, photo:null, notes:'' },
  { id:64, name:"Regateiro Vinha d'Anita",                        type:'Tinto',  country:'Portugal', region:'Bairrada',       year:2015, purchasePrice:21.0,   personalRating:4.0, vivinoRating:4.0,  quantity:1, photo:null, notes:'' },
  { id:65, name:'São Domingos Garrafeira',                        type:'Tinto',  country:'Portugal', region:'Bairrada',       year:2016, purchasePrice:16.9,   personalRating:4.0, vivinoRating:4.2,  quantity:1, photo:null, notes:'' },
  { id:66, name:'Souvall Baga',                                   type:'Tinto',  country:'Portugal', region:'Beira Interior', year:2022, purchasePrice:20.0,   personalRating:0,   vivinoRating:null, quantity:1, photo:null, notes:'' },
  { id:67, name:'Vadio',                                          type:'Tinto',  country:'Portugal', region:'Bairrada',       year:2020, purchasePrice:14.85,  personalRating:0,   vivinoRating:4.0,  quantity:1, photo:null, notes:'' },
  { id:68, name:'Villa Oliveira Vinha das Pedras Altas',          type:'Tinto',  country:'Portugal', region:'Dão',            year:2016, purchasePrice:54.5,   personalRating:0,   vivinoRating:4.4,  quantity:1, photo:null, notes:'' },
  { id:69, name:'Vinhas Improváveis',                             type:'Tinto',  country:'Portugal', region:'Douro',          year:2018, purchasePrice:16.0,   personalRating:5.0, vivinoRating:4.4,  quantity:1, photo:null, notes:'' },
  { id:70, name:'Vinhas Improváveis',                             type:'Tinto',  country:'Portugal', region:'Douro',          year:2020, purchasePrice:20.5,   personalRating:5.0, vivinoRating:4.3,  quantity:1, photo:null, notes:'' },
]

const INIT_ENTRIES      = []
const INIT_CONSUMPTIONS = []

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt    = (n) => n != null ? n.toFixed(2).replace('.', ',') + ' €' : '—'
const fmtNum = (n) => n != null ? Number(n).toFixed(2).replace('.', ',') : ''
const totalV = (w) => (w.purchasePrice || 0) * (w.quantity || 0)
const nextId = (arr) => Math.max(0, ...arr.map((x) => x.id)) + 1

const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload  = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const S = {
  inp: {
    width: '100%', background: '#0d0b09', border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 6, color: '#e8dece', padding: '8px 12px', fontSize: 14,
    outline: 'none', boxSizing: 'border-box', fontFamily: FONT,
  },
  lbl: {
    fontSize: 10, color: '#9a8f82', letterSpacing: '0.08em',
    textTransform: 'uppercase', marginBottom: 5, display: 'block', fontWeight: 500,
  },
  field: { marginBottom: 14 },
  card:  { background: '#1e1b16', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px' },
  stat:  { background: '#1e1b16', borderRadius: 8,  border: '1px solid rgba(255,255,255,0.06)', padding: '12px 14px' },
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Stars({ value = 0, onChange, size = 14 }) {
  const [hov, setHov] = useState(null)
  const v = hov ?? value
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s}
          style={{ fontSize: size, cursor: onChange ? 'pointer' : 'default', lineHeight: 1,
            color: v >= s ? '#d4a843' : '#2e2a24', opacity: v >= s - 0.5 && v < s ? 0.5 : 1, transition: 'color 0.1s' }}
          onMouseEnter={() => onChange && setHov(s)}
          onMouseLeave={() => onChange && setHov(null)}
          onClick={() => onChange && onChange(s)}>★</span>
      ))}
    </div>
  )
}

function Badge({ type }) {
  const c = getTC(type)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px',
      borderRadius: 4, background: c.bg, color: c.fg, fontSize: 10, fontWeight: 600,
      letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: FONT }}>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: c.fg, flexShrink: 0 }} />
      {type}
    </span>
  )
}

function Btn({ children, onClick, variant = 'default', style = {}, disabled = false }) {
  const base = {
    padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 400,
    cursor: disabled ? 'not-allowed' : 'pointer', border: 'none',
    transition: 'background 0.15s, opacity 0.15s',
    display: 'inline-flex', alignItems: 'center', gap: 6,
    opacity: disabled ? 0.45 : 1, fontFamily: FONT,
  }
  const variants = {
    default: { background: 'rgba(255,255,255,0.07)', color: '#e8dece' },
    gold:    { background: '#c8963e', color: '#0d0b09' },
    ghost:   { background: 'transparent', color: '#9a8f82', border: '1px solid rgba(255,255,255,0.08)' },
    danger:  { background: 'rgba(192,48,74,0.15)', color: '#e87080' },
  }
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>{children}</button>
}

function WineThumb({ photo, type, size = 40 }) {
  const c = getTC(type)
  if (photo) return <img src={photo} alt="" style={{ width: size, height: size * 1.5, objectFit: 'cover', borderRadius: 4, display: 'block', flexShrink: 0 }} />
  return (
    <div style={{ width: size, height: size * 1.5, borderRadius: 4, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Wine size={size * 0.45} color={c.fg} style={{ opacity: 0.45 }} />
    </div>
  )
}

function ModalShell({ onClose, children }) {
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', display: 'flex',
        alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto',
        padding: '40px 16px', zIndex: 100, backdropFilter: 'blur(4px)' }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ background: '#1e1b16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
          padding: '28px 28px 24px', width: '100%', maxWidth: 560, margin: 'auto 0', fontFamily: FONT }}>
        {children}
      </div>
    </div>
  )
}

function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 300, color: '#e8dece', fontFamily: FONT, letterSpacing: '-0.01em' }}>{title}</h2>
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9a8f82' }}>{subtitle}</p>}
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9a8f82', cursor: 'pointer', padding: 4 }}>
        <X size={18} />
      </button>
    </div>
  )
}

// ─── PHOTO UPLOAD ─────────────────────────────────────────────────────────────
function PhotoUpload({ value, onChange }) {
  const ref = useRef()
  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    onChange(await readFileAsBase64(file))
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
        <Btn variant="ghost" onClick={() => ref.current?.click()}>
          <Camera size={13} />{value ? 'Alterar foto' : 'Adicionar foto'}
        </Btn>
        {value && <Btn variant="danger" onClick={() => onChange(null)} style={{ padding: '4px 10px', fontSize: 12 }}><ImageOff size={12} />Remover</Btn>}
      </div>
    </div>
  )
}

// ─── WINE NAME AUTOCOMPLETE ───────────────────────────────────────────────────
function WineNameAutocomplete({ value, onChange, allWines, onExactMatch, onPartialMatch }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  const q = value.trim().toLowerCase()
  const suggestions = q.length >= 2
    ? allWines.filter((w) => w.name.toLowerCase().includes(q)).slice(0, 8)
    : []

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        style={S.inp}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => { if (suggestions.length) setOpen(true) }}
        placeholder="Ex: Quinta da Gaivosa"
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, marginTop: 4,
          background: '#1e1b16', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
          <div style={{ padding: '6px 12px 4px', fontSize: 10, color: '#4a453f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Vinhos existentes — clica para dar entrada
          </div>
          {suggestions.map((w) => (
            <div key={w.id}
              onMouseDown={(e) => { e.preventDefault(); setOpen(false); onExactMatch(w) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                cursor: 'pointer', transition: 'background 0.1s', borderTop: '1px solid rgba(255,255,255,0.04)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <WineThumb photo={w.photo} type={w.type} size={18} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#e8dece', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</div>
                <div style={{ fontSize: 11, color: '#9a8f82' }}>{w.year} · {w.region}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <Badge type={w.type} />
                  <div style={{ fontSize: 10, color: w.quantity > 0 ? '#68c880' : '#e87080', marginTop: 2 }}>
                    {w.quantity > 0 ? `${w.quantity} em stock` : 'sem stock'}
                  </div>
                </div>
                <button
                  onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(false); onPartialMatch(w.name) }}
                  title="Criar novo vintage com este nome"
                  style={{ padding: '4px 8px', borderRadius: 5, border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)', color: '#6a6058', fontSize: 10,
                    cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  + vintage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── WINE FORM ────────────────────────────────────────────────────────────────
function WineForm({ wine, types, setTypes, countriesRegions, setCountriesRegions, allWines, onExactMatch, onSave, onClose }) {
  const blank = { name: '', type: 'Tinto', country: 'Portugal', region: '', year: new Date().getFullYear(), purchasePrice: '', personalRating: 0, vivinoRating: '', quantity: 0, photo: null, notes: '' }
  const [f, setF] = useState(wine ? { ...wine, purchasePrice: fmtNum(wine.purchasePrice), vivinoRating: fmtNum(wine.vivinoRating) } : blank)
  const [loadingV,   setLoadingV]   = useState(false)
  const [newType,    setNewType]    = useState('')
  const [addingType, setAddingType] = useState(false)

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const regions = (countriesRegions || COUNTRIES_REGIONS)[f.country] || []
  const allCountriesForm = Object.keys(countriesRegions || COUNTRIES_REGIONS)

  const addCountryForm = (name) => {
    setCountriesRegions?.((p) => ({ ...p, [name]: [] }))
    set('country', name); set('region', '')
  }
  const addRegionForm = (region) => {
    setCountriesRegions?.((p) => ({ ...p, [f.country]: [...(p[f.country] || []), region] }))
    set('region', region)
  }

  const fetchVivino = async () => {
    if (!f.name) return
    setLoadingV(true)
    try {
      const res  = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 100,
          messages: [{ role: 'user', content: `Vivino community rating (1.0–5.0) for "${f.name}"${f.year ? ` ${f.year}` : ''}. JSON only: {"rating":X.X}` }] }) })
      const data = await res.json()
      const parsed = JSON.parse((data.content?.[0]?.text || '').replace(/```json|```/g, '').trim())
      if (parsed.rating) set('vivinoRating', parsed.rating.toFixed(1))
    } catch (_) {}
    setLoadingV(false)
  }

  const handleSave = () => {
    if (!f.name.trim()) return
    onSave({ ...f, purchasePrice: parseFloat((f.purchasePrice + '').replace(',', '.')) || 0,
      vivinoRating: parseFloat((f.vivinoRating + '').replace(',', '.')) || null,
      year: parseInt(f.year) || null, personalRating: f.personalRating || 0,
      quantity: wine ? f.quantity : parseInt(f.quantity) || 0 })
  }

  const confirmNewType = () => {
    const t = newType.trim()
    if (!t || types.includes(t)) return
    setTypes((p) => [...p, t]); set('type', t); setNewType(''); setAddingType(false)
  }

  return (
    <>
      <ModalHeader title={wine ? 'Editar Vinho' : 'Novo Vinho'} onClose={onClose} />

      <div style={S.field}><label style={S.lbl}>Fotografia</label><PhotoUpload value={f.photo} onChange={(v) => set('photo', v)} /></div>

      <div style={S.field}>
        <label style={S.lbl}>Nome *</label>
        {!wine && allWines
          ? <WineNameAutocomplete
              value={f.name}
              onChange={(v) => set('name', v)}
              allWines={allWines}
              currentYear={f.year}
              onExactMatch={onExactMatch}
              onPartialMatch={(name) => { set('name', name); set('year', '') }}
            />
          : <input style={S.inp} value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: Quinta da Gaivosa" />
        }
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={S.lbl}>Tipo</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <select style={{ ...S.inp, cursor: 'pointer', flex: 1 }} value={f.type} onChange={(e) => set('type', e.target.value)}>
              {types.map((t) => <option key={t}>{t}</option>)}
            </select>
            {!addingType
              ? <button onClick={() => setAddingType(true)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#9a8f82', cursor: 'pointer', padding: '0 10px', fontSize: 18 }}>+</button>
              : <div style={{ display: 'flex', gap: 4 }}>
                  <input style={{ ...S.inp, width: 84, padding: 8 }} value={newType} onChange={(e) => setNewType(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirmNewType()} placeholder="Tipo" autoFocus />
                  <button onClick={confirmNewType} style={{ background: 'rgba(200,150,62,0.2)', border: 'none', borderRadius: 6, color: '#c8963e', cursor: 'pointer', padding: '0 8px' }}><Check size={14} /></button>
                </div>}
          </div>
        </div>
        <div>
          <label style={S.lbl}>Ano</label>
          <input style={S.inp} type="number" value={f.year} onChange={(e) => set('year', e.target.value)} min={1900} max={2100} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={S.lbl}>País</label>
          <FilterSelect
            placeholder="Seleccionar país"
            value={f.country}
            onChange={(v) => { set('country', v); set('region', '') }}
            options={allCountriesForm}
            onAdd={addCountryForm}
          />
        </div>
        <div>
          <label style={S.lbl}>Região</label>
          <FilterSelect
            placeholder={regions.length ? 'Seleccionar região' : 'Livre'}
            value={f.region}
            onChange={(v) => set('region', v)}
            options={regions}
            onAdd={addRegionForm}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={S.lbl}>Preço de Compra (€)</label>
          <input style={S.inp} value={f.purchasePrice} onChange={(e) => set('purchasePrice', e.target.value)} placeholder="0,00" />
        </div>
        {!wine && <div><label style={S.lbl}>Quantidade Inicial</label><input style={S.inp} type="number" value={f.quantity} onChange={(e) => set('quantity', e.target.value)} min={0} /></div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={S.lbl}>Classificação Pessoal</label>
          <div style={{ padding: '8px 0' }}><Stars value={f.personalRating} onChange={(v) => set('personalRating', v)} size={22} /></div>
        </div>
        <div>
          <label style={S.lbl}>Rating Vivino</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input style={{ ...S.inp, flex: 1 }} value={f.vivinoRating} onChange={(e) => set('vivinoRating', e.target.value)} placeholder="0.0" />
            <button onClick={fetchVivino} disabled={loadingV || !f.name}
              style={{ background: 'rgba(200,150,62,0.15)', border: '1px solid rgba(200,150,62,0.3)', borderRadius: 6, color: '#c8963e', cursor: 'pointer', padding: '0 10px', opacity: loadingV || !f.name ? 0.4 : 1, display: 'flex', alignItems: 'center' }} title="Estimar via IA">
              {loadingV ? '…' : <Sparkles size={14} />}
            </button>
          </div>
        </div>
      </div>

      <div style={S.field}>
        <label style={S.lbl}>Notas</label>
        <textarea style={{ ...S.inp, minHeight: 64, resize: 'vertical' }} value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Notas de prova, potencial de guarda…" />
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="gold"  onClick={handleSave}><Check size={14} />{wine ? 'Guardar' : 'Adicionar Vinho'}</Btn>
      </div>
    </>
  )
}

// ─── ENTRY FORM ───────────────────────────────────────────────────────────────
function EntryForm({ wine, onSave, onClose }) {
  const [f, setF] = useState({ date: new Date().toISOString().slice(0, 10), quantity: 1, supplier: SUPPLIERS[0], price: fmtNum(wine?.purchasePrice) })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  return (
    <>
      <ModalHeader title="Registar Entrada" subtitle={`${wine.name} · ${wine.year}`} onClose={onClose} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div><label style={S.lbl}>Data</label><input style={S.inp} type="date" value={f.date} onChange={(e) => set('date', e.target.value)} /></div>
        <div><label style={S.lbl}>Quantidade</label><input style={S.inp} type="number" min={1} value={f.quantity} onChange={(e) => set('quantity', e.target.value)} /></div>
      </div>
      <div style={S.field}><label style={S.lbl}>Fornecedor</label>
        <select style={{ ...S.inp, cursor: 'pointer' }} value={f.supplier} onChange={(e) => set('supplier', e.target.value)}>
          {SUPPLIERS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={S.field}><label style={S.lbl}>Preço por Garrafa (€)</label><input style={S.inp} value={f.price} onChange={(e) => set('price', e.target.value)} placeholder="0,00" /></div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="gold" onClick={() => { if (f.quantity >= 1) onSave({ ...f, quantity: parseInt(f.quantity), price: parseFloat((f.price + '').replace(',', '.')) || 0 }) }}><LogIn size={14} />Registar Entrada</Btn>
      </div>
    </>
  )
}

// ─── CONSUMPTION FORM ─────────────────────────────────────────────────────────
function ConsumptionForm({ wine, onSave, onClose }) {
  const [f, setF] = useState({ date: new Date().toISOString().slice(0, 10), quantity: 1, rating: wine?.personalRating || 0, notes: '' })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  return (
    <>
      <ModalHeader title="Registar Consumo" subtitle={`${wine.name} · ${wine.year} · ${wine.quantity} restantes`} onClose={onClose} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div><label style={S.lbl}>Data</label><input style={S.inp} type="date" value={f.date} onChange={(e) => set('date', e.target.value)} /></div>
        <div><label style={S.lbl}>Quantidade (máx. {wine.quantity})</label><input style={S.inp} type="number" min={1} max={wine.quantity} value={f.quantity} onChange={(e) => set('quantity', e.target.value)} /></div>
      </div>
      <div style={S.field}><label style={S.lbl}>Classificação Pessoal</label><div style={{ padding: '8px 0' }}><Stars value={f.rating} onChange={(v) => set('rating', v)} size={22} /></div></div>
      <div style={S.field}><label style={S.lbl}>Observações</label><textarea style={{ ...S.inp, minHeight: 72, resize: 'vertical' }} value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Ocasião, maridagem, notas de prova…" /></div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="gold" onClick={() => { if (f.quantity >= 1 && f.quantity <= wine.quantity) onSave({ ...f, quantity: parseInt(f.quantity) }) }}><LogOut size={14} />Registar Consumo</Btn>
      </div>
    </>
  )
}

// ─── WINE DETAIL ──────────────────────────────────────────────────────────────
function WineDetail({ wine, entries, consumptions, onClose, onEntry, onConsumption, onEdit, onDelete }) {
  const [tab, setTab] = useState('info')
  const wEntries  = entries.filter((e) => e.wineId === wine.id).sort((a, b) => b.date.localeCompare(a.date))
  const wConsumed = consumptions.filter((c) => c.wineId === wine.id).sort((a, b) => b.date.localeCompare(a.date))
  const tabSt = (t) => ({ padding: '8px 14px', fontSize: 13, cursor: 'pointer', border: 'none', background: 'none',
    color: tab === t ? '#e8dece' : '#9a8f82', fontFamily: FONT, fontWeight: tab === t ? 500 : 400,
    borderBottom: tab === t ? '2px solid #c8963e' : '2px solid transparent', transition: 'color 0.15s' })
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, flex: 1, minWidth: 0 }}>
          <WineThumb photo={wine.photo} type={wine.type} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 6 }}><Badge type={wine.type} /></div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 300, color: '#e8dece', fontFamily: FONT, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{wine.name}</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9a8f82' }}>{[wine.region, wine.country].filter(Boolean).join(', ')}{wine.year ? ` · ${wine.year}` : ''}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 8 }}>
          <button onClick={onEdit}   style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 6, color: '#9a8f82', cursor: 'pointer', padding: '6px 8px' }}><Edit2 size={14} /></button>
          <button onClick={onDelete} style={{ background: 'rgba(192,48,74,0.1)',    border: 'none', borderRadius: 6, color: '#e87080', cursor: 'pointer', padding: '6px 8px' }}><Trash2 size={14} /></button>
          <button onClick={onClose}  style={{ background: 'none', border: 'none', color: '#9a8f82', cursor: 'pointer', padding: '6px 8px' }}><X size={16} /></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
        {[{ l: 'Em Adega', v: <span style={{ fontSize: 22, fontWeight: 300, color: wine.quantity > 0 ? '#e8dece' : '#e87080', fontFamily: FONT }}>{wine.quantity}</span> },
          { l: 'Valor Total', v: <span style={{ fontSize: 18, fontWeight: 300, color: '#c8963e', fontFamily: FONT }}>{fmt(totalV(wine))}</span> },
          { l: 'Preço/Garrafa', v: <span style={{ fontSize: 18, fontWeight: 300, color: '#e8dece', fontFamily: FONT }}>{fmt(wine.purchasePrice)}</span> }
        ].map(({ l, v }) => (<div key={l} style={S.stat}><div style={{ fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{l}</div>{v}</div>))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[{ l: 'Classificação Pessoal', v: wine.personalRating }, { l: 'Vivino', v: wine.vivinoRating }].map(({ l, v }) => (
          <div key={l} style={S.stat}><div style={{ fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{l}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Stars value={v} size={15} /><span style={{ fontSize: 13, color: '#e8dece' }}>{v || '—'}</span></div>
          </div>
        ))}
      </div>

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
          {[['Tipo', wine.type], ['País', wine.country], ['Região', wine.region || '—'], ['Ano', wine.year || '—']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span>{k}</span><span style={{ color: '#e8dece' }}>{v}</span>
            </div>
          ))}
        </div>
      )}
      {tab === 'entries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {wEntries.length === 0 ? <p style={{ color: '#4a453f', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Sem entradas registadas.</p>
            : wEntries.map((e) => (
              <div key={e.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontSize: 13, color: '#e8dece', fontWeight: 500 }}>{e.quantity} {e.quantity === 1 ? 'garrafa' : 'garrafas'} · {e.supplier}</div>
                  <div style={{ fontSize: 11, color: '#9a8f82', marginTop: 2 }}>{e.date}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: 13, color: '#c8963e' }}>{fmt(e.price)}/un</div><div style={{ fontSize: 11, color: '#9a8f82' }}>{fmt(e.price * e.quantity)} total</div></div>
              </div>
            ))}
        </div>
      )}
      {tab === 'consum' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {wConsumed.length === 0 ? <p style={{ color: '#4a453f', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Sem consumos registados.</p>
            : wConsumed.map((c) => (
              <div key={c.id} style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, color: '#e8dece', fontWeight: 500 }}>{c.quantity} {c.quantity === 1 ? 'garrafa' : 'garrafas'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Stars value={c.rating} size={12} /><span style={{ fontSize: 11, color: '#9a8f82' }}>{c.date}</span></div>
                </div>
                {c.notes && <div style={{ fontSize: 12, color: '#9a8f82', marginTop: 4 }}>{c.notes}</div>}
              </div>
            ))}
        </div>
      )}
    </>
  )
}

// ─── PIE CHART (SVG, sem dependências) ───────────────────────────────────────
const PIE_PALETTE = ['#c8963e','#78b0d8','#68c880','#e87080','#c078cc','#e88050','#d4a838','#9a8f82','#e878a8','#68a8d8']

function PieChart({ data, total }) {
  if (!data.length || total === 0) return null
  const cx = 90, cy = 90, R = 72, r = 46
  let ang = -Math.PI / 2

  // single-slice: arc path breaks at 360°, use circles instead
  if (data.length === 1) {
    const color = PIE_PALETTE[0]
    return (
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <svg viewBox="0 0 180 180" style={{ width: 150, flexShrink: 0 }}>
          <circle cx={cx} cy={cy} r={R} fill={color} opacity={0.82} />
          <circle cx={cx} cy={cy} r={r - 2} fill="#1e1b16" />
          <text x={cx} y={cy - 5} textAnchor="middle" fill="#e8dece" fontSize="20" fontWeight="300" fontFamily="Outfit,sans-serif">{total}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="#9a8f82" fontSize="8.5" fontFamily="Outfit,sans-serif" letterSpacing="0.1">REF.</text>
        </svg>
        <div style={{ flex: 1, minWidth: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0, opacity: 0.82 }} />
            <span style={{ fontSize: 12, color: '#e8dece', flex: 1 }}>{data[0].label}</span>
            <span style={{ fontSize: 11, color: '#9a8f82' }}>{data[0].value}</span>
            <span style={{ fontSize: 10, color: '#4a453f', minWidth: 28, textAlign: 'right' }}>100%</span>
          </div>
        </div>
      </div>
    )
  }

  const slices = data.map((d, i) => {
    const sweep = (d.value / total) * 2 * Math.PI
    const end = ang + sweep
    const cos1 = Math.cos(ang), sin1 = Math.sin(ang)
    const cos2 = Math.cos(end), sin2 = Math.sin(end)
    const large = sweep > Math.PI ? 1 : 0
    const path = [
      `M ${cx + r * cos1} ${cy + r * sin1}`,
      `L ${cx + R * cos1} ${cy + R * sin1}`,
      `A ${R} ${R} 0 ${large} 1 ${cx + R * cos2} ${cy + R * sin2}`,
      `L ${cx + r * cos2} ${cy + r * sin2}`,
      `A ${r} ${r} 0 ${large} 0 ${cx + r * cos1} ${cy + r * sin1} Z`,
    ].join(' ')
    ang = end
    return { ...d, path, color: PIE_PALETTE[i % PIE_PALETTE.length], pct: Math.round((d.value / total) * 100) }
  })
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg viewBox="0 0 180 180" style={{ width: 150, flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} opacity={0.82}>
            <title>{s.label}: {s.value} ({s.pct}%)</title>
          </path>
        ))}
        <circle cx={cx} cy={cy} r={r - 2} fill="#1e1b16" />
        <text x={cx} y={cy - 5} textAnchor="middle" fill="#e8dece" fontSize="20" fontWeight="300" fontFamily="Outfit,sans-serif">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#9a8f82" fontSize="8.5" fontFamily="Outfit,sans-serif" letterSpacing="0.1">REF.</text>
      </svg>
      <div style={{ flex: 1, minWidth: 100 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0, opacity: 0.82 }} />
            <span style={{ fontSize: 12, color: '#e8dece', flex: 1 }}>{s.label}</span>
            <span style={{ fontSize: 11, color: '#9a8f82' }}>{s.value}</span>
            <span style={{ fontSize: 10, color: '#4a453f', minWidth: 28, textAlign: 'right' }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── FILTER SELECT WITH INLINE ADD ────────────────────────────────────────────
function FilterSelect({ placeholder, value, onChange, options, onAdd }) {
  const [adding, setAdding] = useState(false)
  const [newVal, setNewVal] = useState('')
  const confirmAdd = () => {
    const v = newVal.trim()
    if (v && !options.includes(v)) onAdd(v)
    setNewVal(''); setAdding(false)
  }
  if (adding) return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <input
        style={{ ...S.inp, width: 110, padding: '6px 8px', fontSize: 12 }}
        value={newVal} onChange={(e) => setNewVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') setAdding(false) }}
        placeholder="Novo…" autoFocus
      />
      <button onClick={confirmAdd} style={{ background: 'rgba(200,150,62,0.2)', border: 'none', borderRadius: 5, color: '#c8963e', cursor: 'pointer', padding: '5px 7px', display: 'flex' }}><Check size={12} /></button>
      <button onClick={() => setAdding(false)} style={{ background: 'none', border: 'none', color: '#6a6058', cursor: 'pointer', padding: '5px 4px', display: 'flex' }}><X size={12} /></button>
    </div>
  )
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      <select style={{ ...S.inp, width: 'auto', fontSize: 12, cursor: 'pointer', paddingRight: 24 }} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <button onClick={() => setAdding(true)} title={`Adicionar a ${placeholder}`}
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 5, color: '#6a6058', cursor: 'pointer', padding: '4px 7px', fontSize: 15, lineHeight: 1, display: 'flex', alignItems: 'center' }}>+</button>
    </div>
  )
}

// ─── WINE LIST VIEW ───────────────────────────────────────────────────────────
function WineListRow({ wine, onClick }) {
  return (
    <div onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.12s', opacity: wine.quantity === 0 ? 0.45 : 1 }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
      <WineThumb photo={wine.photo} type={wine.type} size={26} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 400, color: '#e8dece', fontFamily: FONT, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wine.name}</div>
        <div style={{ fontSize: 11, color: '#9a8f82', marginTop: 1 }}>{[wine.region, wine.country].filter(Boolean).join(', ')}</div>
      </div>
      <div style={{ width: 86, flexShrink: 0 }}><Badge type={wine.type} /></div>
      <div style={{ width: 44, flexShrink: 0, textAlign: 'center', fontSize: 13, color: '#9a8f82' }}>{wine.year || '—'}</div>
      <div style={{ width: 76, flexShrink: 0 }}><Stars value={wine.personalRating} size={12} /></div>
      <div style={{ width: 44, flexShrink: 0, textAlign: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: wine.quantity > 0 ? '#68c880' : '#e87080' }}>{wine.quantity}</span>
      </div>
      <div style={{ width: 72, flexShrink: 0, textAlign: 'right', fontSize: 13, color: '#c8963e' }}>{fmt(wine.purchasePrice)}</div>
    </div>
  )
}

function WineListView({ wines, onWineClick }) {
  return (
    <div style={{ background: '#1e1b16', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '7px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#161310' }}>
        <div style={{ width: 26, flexShrink: 0 }} />
        <div style={{ flex: 1, fontSize: 10, color: '#3a3530', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Vinho</div>
        <div style={{ width: 86, flexShrink: 0, fontSize: 10, color: '#3a3530', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tipo</div>
        <div style={{ width: 44, flexShrink: 0, fontSize: 10, color: '#3a3530', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>Ano</div>
        <div style={{ width: 76, flexShrink: 0, fontSize: 10, color: '#3a3530', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rating</div>
        <div style={{ width: 44, flexShrink: 0, fontSize: 10, color: '#3a3530', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>Qtd.</div>
        <div style={{ width: 72, flexShrink: 0, fontSize: 10, color: '#3a3530', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Preço</div>
      </div>
      {wines.length === 0
        ? <div style={{ textAlign: 'center', padding: '48px 0', color: '#4a453f' }}><Wine size={32} style={{ marginBottom: 10, opacity: 0.2 }} /><p style={{ fontSize: 13 }}>Nenhum vinho encontrado.</p></div>
        : wines.map((w) => <WineListRow key={w.id} wine={w} onClick={() => onWineClick(w)} />)}
    </div>
  )
}

// ─── WINE GRID VIEW ───────────────────────────────────────────────────────────
function WineGridView({ wines, onWineClick }) {
  if (wines.length === 0) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#4a453f' }}><Wine size={40} style={{ marginBottom: 12, opacity: 0.25 }} /><p style={{ fontSize: 14 }}>Nenhum vinho encontrado.</p></div>
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 14 }}>
      {wines.map((w) => {
        const c = getTC(w.type)
        return (
          <div key={w.id} onClick={() => onWineClick(w)}
            style={{ background: '#1e1b16', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s, border-color 0.15s', opacity: w.quantity === 0 ? 0.45 : 1 }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(200,150,62,0.25)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
            {w.photo ? <img src={w.photo} alt={w.name} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
              : <div style={{ height: 4, background: c.fg, opacity: 0.6 }} />}
            <div style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Badge type={w.type} />
                <span style={{ fontSize: 12, fontWeight: 500, color: w.quantity > 0 ? '#68c880' : '#e87080' }}>{w.quantity} 🍾</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 400, color: '#e8dece', fontFamily: FONT, letterSpacing: '-0.02em', marginBottom: 2, lineHeight: 1.3 }}>{w.name}</div>
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

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ wines, entries, consumptions }) {
  const totalBottles  = wines.reduce((s, w) => s + w.quantity, 0)
  const totalValue    = wines.reduce((s, w) => s + totalV(w), 0)
  const totalConsumed = consumptions.reduce((s, c) => s + c.quantity, 0)

  const byType = wines.reduce((acc, w) => {
    if (!acc[w.type]) acc[w.type] = { count: 0, bottles: 0, value: 0 }
    acc[w.type].count++; acc[w.type].bottles += w.quantity; acc[w.type].value += totalV(w)
    return acc
  }, {})

  const byCountry = wines.reduce((acc, w) => {
    if (!acc[w.country]) acc[w.country] = { count: 0, bottles: 0 }
    acc[w.country].count++; acc[w.country].bottles += w.quantity
    return acc
  }, {})

  const topWines   = [...wines].sort((a, b) => totalV(b) - totalV(a)).slice(0, 5)
  const maxBottles = Math.max(...Object.values(byType).map((v) => v.bottles), 1)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 28 }}>
        {[{ l: 'Referências', v: wines.length, c: '#e8dece' }, { l: 'Garrafas', v: totalBottles, c: '#e8dece' },
          { l: 'Valor Total', v: fmt(totalValue), c: '#c8963e' }, { l: 'Consumidas', v: totalConsumed, c: '#9a8f82' }
        ].map(({ l, v, c }) => (
          <div key={l} style={{ ...S.stat, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{l}</div>
            <div style={{ fontSize: 26, fontWeight: 300, color: c, fontFamily: FONT, letterSpacing: '-0.03em' }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ ...S.stat, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Garrafas por tipo</h3>
          {Object.entries(byType).sort((a, b) => b[1].bottles - a[1].bottles).map(([type, d]) => {
            const c = getTC(type)
            return (
              <div key={type} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: c.fg }}>{type}</span>
                  <span style={{ fontSize: 12, color: '#9a8f82' }}>{d.bottles} gar.</span>
                </div>
                <div style={{ height: 3, background: '#26221c', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(d.bottles / maxBottles) * 100}%`, background: c.fg, opacity: 0.6, borderRadius: 2 }} />
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ ...S.stat, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Por país</h3>
          <PieChart
            total={wines.length}
            data={Object.entries(byCountry).sort((a, b) => b[1].count - a[1].count).map(([label, d]) => ({ label, value: d.count }))}
          />
        </div>
      </div>

      <div style={{ ...S.stat, padding: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Top 5 por valor em adega</h3>
        {topWines.map((w, i) => (
          <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: 12, color: '#3a3530', fontWeight: 600, minWidth: 20, fontFamily: FONT }}>#{i + 1}</span>
            <WineThumb photo={w.photo} type={w.type} size={20} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: '#e8dece', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: FONT }}>{w.name}</div>
              <div style={{ fontSize: 11, color: '#9a8f82' }}>{w.quantity} × {fmt(w.purchasePrice)}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#c8963e', fontFamily: FONT }}>{fmt(totalV(w))}</div>
              <Badge type={w.type} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [wines,            setWines]            = useState(INIT_WINES)
  const [entries,          setEntries]          = useState(INIT_ENTRIES)
  const [consumptions,     setConsumptions]     = useState(INIT_CONSUMPTIONS)
  const [types,            setTypes]            = useState(INIT_TYPES)
  const [countriesRegions, setCountriesRegions] = useState(COUNTRIES_REGIONS)

  const [view,           setView]           = useState('dashboard')
  const [search,         setSearch]         = useState('')
  const [filterType,     setFilterType]     = useState('')
  const [filterCountry,  setFilterCountry]  = useState('')
  const [filterRegion,   setFilterRegion]   = useState('')
  const [listMode,       setListMode]       = useState('list')
  const [sidebarOpen,    setSidebarOpen]    = useState(true)
  const [modal,          setModal]          = useState(null)
  const [activeWine,     setActiveWine]     = useState(null)
  const [searchEntradas, setSearchEntradas] = useState('')
  const [searchConsumos, setSearchConsumos] = useState('')
  const [showNoStock,    setShowNoStock]    = useState(() => {
    try { return localStorage.getItem('videiras_showNoStock') !== 'false' } catch { return true }
  })

  // persist showNoStock
  useEffect(() => {
    try { localStorage.setItem('videiras_showNoStock', String(showNoStock)) } catch {}
  }, [showNoStock])

  // derived lists for filters
  const allCountries = useMemo(() => Object.keys(countriesRegions), [countriesRegions])
  const regionsForFilter = useMemo(() => filterCountry ? (countriesRegions[filterCountry] || []) : [], [countriesRegions, filterCountry])

  const addCountry = (name) => setCountriesRegions((p) => ({ ...p, [name]: [] }))
  const addRegionToCountry = (country, region) => setCountriesRegions((p) => ({ ...p, [country]: [...(p[country] || []), region] }))

  useEffect(() => {
    const h = () => setSidebarOpen(window.innerWidth >= 768)
    window.addEventListener('resize', h); h()
    return () => window.removeEventListener('resize', h)
  }, [])

  const closeModal = () => { setModal(null); setActiveWine(null) }

  const addWine    = (d) => { setWines((p) => [...p, { ...d, id: nextId(p) }]); closeModal() }
  const editWine   = (d) => { setWines((p) => p.map((w) => w.id === activeWine.id ? { ...w, ...d } : w)); closeModal() }
  const deleteWine = (id) => { setWines((p) => p.filter((w) => w.id !== id)); closeModal() }

  const addEntry = (d) => {
    setEntries((p) => [...p, { ...d, id: nextId(p), wineId: activeWine.id }])
    setWines((p) => p.map((w) => w.id !== activeWine.id ? w : { ...w, quantity: w.quantity + d.quantity, purchasePrice: d.price || w.purchasePrice }))
    closeModal()
  }

  const addConsumption = (d) => {
    setConsumptions((p) => [...p, { ...d, id: nextId(p), wineId: activeWine.id }])
    setWines((p) => p.map((w) => w.id !== activeWine.id ? w : { ...w, quantity: w.quantity - d.quantity, ...(d.rating ? { personalRating: d.rating } : {}) }))
    closeModal()
  }

  const filtered = useMemo(() => wines.filter((w) => {
    const q = search.toLowerCase()
    const ms = !q || [w.name, w.country, w.region].some((f) => f?.toLowerCase().includes(q))
    const stock = showNoStock || w.quantity > 0
    return ms && stock && (!filterType || w.type === filterType) && (!filterCountry || w.country === filterCountry) && (!filterRegion || w.region === filterRegion)
  }), [wines, search, filterType, filterCountry, filterRegion, showNoStock])

  const liveWine = activeWine ? wines.find((w) => w.id === activeWine.id) || activeWine : null

  const NAV = [
    { id: 'dashboard', icon: <BarChart3 size={15} />, label: 'Dashboard' },
    { id: 'adega',     icon: <Wine size={15} />,      label: 'Adega' },
    { id: 'entradas',  icon: <LogIn size={15} />,     label: 'Entradas' },
    { id: 'consumos',  icon: <LogOut size={15} />,    label: 'Consumos' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0b09', color: '#e8dece', fontFamily: FONT }}>

      {/* SIDEBAR */}
      {sidebarOpen && (
        <div style={{ width: 216, flexShrink: 0, background: '#161310', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          <div style={{ padding: '0 20px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.25)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Wine size={15} color="#c8963e" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 200, color: '#e8dece', fontFamily: FONT, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Videiras</div>
              <div style={{ fontSize: 9, color: '#4a453f', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 400, marginTop: 1 }}>coleção pessoal</div>
            </div>
          </div>

          <nav style={{ flex: 1 }}>
            {NAV.map((n) => (
              <button key={n.id} onClick={() => setView(n.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 20px',
                background: view === n.id ? 'rgba(200,150,62,0.08)' : 'none',
                borderLeft: view === n.id ? '2px solid #c8963e' : '2px solid transparent',
                color: view === n.id ? '#c8963e' : '#6a6058',
                border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: view === n.id ? 400 : 300,
                fontFamily: FONT, letterSpacing: '0.02em', transition: 'all 0.15s', textAlign: 'left',
              }}>{n.icon}{n.label}</button>
            ))}
          </nav>

          <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 11, color: '#3a3530', lineHeight: 1.8, fontWeight: 300 }}>
            <div>{wines.length} referências</div>
            <div>{wines.reduce((s, w) => s + w.quantity, 0)} garrafas</div>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* header — altura fixa igual em todas as vistas */}
        <div style={{ padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#161310', display: 'flex', alignItems: 'center', gap: 12, height: 48, flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => setSidebarOpen((p) => !p)} style={{ background: 'none', border: 'none', color: '#6a6058', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <Menu size={17} />
          </button>
          <h1 style={{ margin: 0, fontSize: 12, fontWeight: 400, color: '#6a6058', fontFamily: FONT, letterSpacing: '0.12em', textTransform: 'uppercase', flex: 1 }}>
            {{ dashboard: 'Dashboard', adega: 'Adega', entradas: 'Entradas', consumos: 'Consumos' }[view]}
          </h1>
          {view === 'adega' && (
            <Btn variant="gold" onClick={() => setModal('addWine')}><Plus size={13} />Vinho</Btn>
          )}
        </div>

        {/* content */}
        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {view === 'dashboard' && <Dashboard wines={wines} entries={entries} consumptions={consumptions} />}

          {view === 'adega' && (
            <>
              {/* filtros — toolbar dentro do conteúdo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 160, maxWidth: 260 }}>
                  <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4a453f' }} />
                  <input style={{ ...S.inp, paddingLeft: 30, fontSize: 13 }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar…" />
                </div>
                <FilterSelect placeholder="Todos os tipos" value={filterType} onChange={setFilterType} options={types} onAdd={(v) => setTypes((p) => [...p, v])} />
                <FilterSelect placeholder="Todos os países" value={filterCountry} onChange={(v) => { setFilterCountry(v); setFilterRegion('') }} options={allCountries} onAdd={addCountry} />
                {filterCountry && (
                  <FilterSelect placeholder="Todas as regiões" value={filterRegion} onChange={setFilterRegion} options={countriesRegions[filterCountry] || []} onAdd={(v) => addRegionToCountry(filterCountry, v)} />
                )}
                <button
                  onClick={() => setShowNoStock((p) => !p)}
                  title={showNoStock ? 'Ocultar sem stock' : 'Mostrar sem stock'}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: 11, fontFamily: FONT,
                    background: showNoStock ? 'transparent' : 'rgba(200,150,62,0.1)',
                    color: showNoStock ? '#4a453f' : '#c8963e', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                  {showNoStock ? <Eye size={12} /> : <EyeOff size={12} />}
                  {showNoStock ? 'Com stock' : 'Só com stock'}
                </button>
                <div style={{ marginLeft: 'auto', display: 'flex', background: '#0d0b09', borderRadius: 6, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                  {[{ m: 'list', I: List }, { m: 'grid', I: LayoutGrid }].map(({ m, I }) => (
                    <button key={m} onClick={() => setListMode(m)}
                      style={{ padding: '6px 9px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                        background: listMode === m ? 'rgba(200,150,62,0.12)' : 'transparent',
                        color: listMode === m ? '#c8963e' : '#3a3530', transition: 'all 0.15s' }}>
                      <I size={13} />
                    </button>
                  ))}
                </div>
              </div>
              {listMode === 'list'
                ? <WineListView wines={filtered} onWineClick={(w) => { setActiveWine(w); setModal('detail') }} />
                : <WineGridView wines={filtered} onWineClick={(w) => { setActiveWine(w); setModal('detail') }} />}
            </>
          )}

          {view === 'entradas' && (
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a453f' }} />
                <input style={{ ...S.inp, paddingLeft: 34 }} value={searchEntradas} onChange={(e) => setSearchEntradas(e.target.value)} placeholder="Pesquisar por vinho ou fornecedor…" />
              </div>
              {(() => {
                const q = searchEntradas.toLowerCase()
                const filtered = [...entries]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .filter((e) => {
                    const w = wines.find((x) => x.id === e.wineId)
                    return !q || w?.name.toLowerCase().includes(q) || e.supplier.toLowerCase().includes(q) || e.date.includes(q)
                  })
                if (filtered.length === 0) return <p style={{ textAlign: 'center', color: '#4a453f', paddingTop: 40, fontSize: 13 }}>{searchEntradas ? 'Nenhum resultado.' : 'Sem entradas registadas.'}</p>
                return filtered.map((e) => {
                  const w = wines.find((x) => x.id === e.wineId)
                  return (
                    <div key={e.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, background: 'rgba(104,200,128,0.1)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><LogIn size={13} color="#68c880" /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: '#e8dece', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w?.name || '(removido)'}</div>
                        <div style={{ fontSize: 11, color: '#9a8f82' }}>{e.supplier} · {e.date}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#68c880' }}>+{e.quantity} gar.</div>
                        <div style={{ fontSize: 11, color: '#9a8f82' }}>{fmt(e.price)}/un</div>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}

          {view === 'consumos' && (
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a453f' }} />
                <input style={{ ...S.inp, paddingLeft: 34 }} value={searchConsumos} onChange={(e) => setSearchConsumos(e.target.value)} placeholder="Pesquisar por vinho ou observações…" />
              </div>
              {(() => {
                const q = searchConsumos.toLowerCase()
                const filtered = [...consumptions]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .filter((c) => {
                    const w = wines.find((x) => x.id === c.wineId)
                    return !q || w?.name.toLowerCase().includes(q) || c.notes?.toLowerCase().includes(q) || c.date.includes(q)
                  })
                if (filtered.length === 0) return <p style={{ textAlign: 'center', color: '#4a453f', paddingTop: 40, fontSize: 13 }}>{searchConsumos ? 'Nenhum resultado.' : 'Sem consumos registados.'}</p>
                return filtered.map((c) => {
                  const w = wines.find((x) => x.id === c.wineId)
                  return (
                    <div key={c.id} style={{ ...S.card, display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, background: 'rgba(200,150,62,0.1)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><LogOut size={13} color="#c8963e" /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: '#e8dece', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w?.name || '(removido)'}</div>
                        <div style={{ fontSize: 11, color: '#9a8f82', marginBottom: c.notes ? 4 : 0 }}>{c.date} · {c.quantity} {c.quantity === 1 ? 'garrafa' : 'garrafas'}</div>
                        {c.notes && <div style={{ fontSize: 12, color: '#7a6f62', fontStyle: 'italic' }}>{c.notes}</div>}
                      </div>
                      <div style={{ flexShrink: 0 }}><Stars value={c.rating} size={12} /></div>
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {modal && (
        <ModalShell onClose={closeModal}>
          {modal === 'addWine'     && <WineForm types={types} setTypes={setTypes} countriesRegions={countriesRegions} setCountriesRegions={setCountriesRegions} allWines={wines} onExactMatch={(w) => { setActiveWine(w); setModal('entry') }} onSave={addWine} onClose={closeModal} />}
          {modal === 'editWine'    && liveWine && <WineForm wine={liveWine} types={types} setTypes={setTypes} countriesRegions={countriesRegions} setCountriesRegions={setCountriesRegions} onSave={editWine} onClose={closeModal} />}
          {modal === 'detail'      && liveWine && <WineDetail wine={liveWine} entries={entries} consumptions={consumptions} onClose={closeModal} onEntry={() => setModal('entry')} onConsumption={() => setModal('consumption')} onEdit={() => setModal('editWine')} onDelete={() => deleteWine(liveWine.id)} />}
          {modal === 'entry'       && liveWine && <EntryForm       wine={liveWine} onSave={addEntry}       onClose={closeModal} />}
          {modal === 'consumption' && liveWine && <ConsumptionForm wine={liveWine} onSave={addConsumption} onClose={closeModal} />}
        </ModalShell>
      )}
    </div>
  )
}