export const FONT = "'Outfit', system-ui, sans-serif"

export const TYPE_COLORS = {
  Tinto:     { fg: '#e87080', bg: '#2d0a12' },
  Branco:    { fg: '#e0b858', bg: '#2a1e06' },
  Rosé:      { fg: '#e878a8', bg: '#2d0f20' },
  Espumante: { fg: '#78b0d8', bg: '#091d2e' },
  Porto:     { fg: '#c078cc', bg: '#1e0828' },
  Verde:     { fg: '#68c880', bg: '#061e10' },
  Moscatel:  { fg: '#d4a838', bg: '#1e1500' },
  Laranja:   { fg: '#e88050', bg: '#2c0f00' },
}
export const getTC = (t) => TYPE_COLORS[t] || { fg: '#9a8f82', bg: '#1e1b16' }

export const INIT_TYPES = ['Tinto', 'Branco', 'Rosé', 'Espumante', 'Fortificado', 'Sobremesa', 'Vermute', 'Sidra']

export const COUNTRIES_REGIONS = {
  Portugal:        ['Douro', 'Alentejo', 'Dão', 'Vinho Verde', 'Bairrada', 'Beira Interior', 'Lisboa', 'Setúbal', 'Tejo', 'Madeira', 'Trás-os-Montes', 'Beira', 'Bucelas', 'Alcobaça', 'Monção e Melgaço', 'Algarve', 'Península de Setúbal'],
  França:          ['Bordéus', 'Borgonha', 'Champagne', 'Alsácia', 'Vale do Loire', 'Rhône', 'Languedoc', 'Provence', 'Bourgogne', 'Savoie', 'Juliénas', 'Bourgueil', 'Crozes-Hermitage', 'Saint-Tropez'],
  Espanha:         ['Rioja', 'Ribera del Duero', 'Priorat', 'Rías Baixas', 'Penedès', 'Jerez', 'Rueda', 'Ribeira Sacra', 'Bierzo', 'Salamanca'],
  Itália:          ['Piemonte', 'Toscana', 'Véneto', 'Sicília', 'Campânia', 'Pecorino'],
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

export const SUPPLIERS = [
  'Garrafeira Nacional', 'Garrafeira do Carmo', 'Wine with Spirit',
  'Continente', 'El Corte Inglés', 'Quinta (direto)', 'Adega (direto)', 'Outro',
]

export const BOTTLE_SIZES = [
  { ml: 375,   label: '375 ml — Meia Garrafa' },
  { ml: 750,   label: '750 ml — Standard' },
  { ml: 1500,  label: '1,5 L — Magnum' },
  { ml: 3000,  label: '3 L — Double Magnum' },
  { ml: 4500,  label: '4,5 L — Rehoboam' },
  { ml: 6000,  label: '6 L — Imperiale' },
  { ml: 9000,  label: '9 L — Salmanazar' },
  { ml: 12000, label: '12 L — Balthazar' },
  { ml: 15000, label: '15 L — Nabucodonosor' },
]
export const bottleLabel = (ml) => BOTTLE_SIZES.find((b) => b.ml === ml)?.label ?? `${ml} ml`

export const S = {
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

export const PIE_PALETTE = ['#c8963e','#78b0d8','#68c880','#e87080','#c078cc','#e88050','#d4a838','#9a8f82','#e878a8','#68a8d8']
