import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Wine, Plus, Search, BarChart3, LogIn, LogOut,
  Edit2, Trash2, X, Menu, Sparkles, Check,
  LayoutGrid, List, Camera, ImageOff, Eye, EyeOff, ExternalLink,
} from 'lucide-react'

// ─── FONT: Outfit is loaded globally via index.html ───────────────────────────
const FONT = "'Outfit', system-ui, sans-serif"

// ─── ANTHROPIC API KEY ────────────────────────────────────────────────────────
// Substitui pela tua chave em https://console.anthropic.com/
const ANTHROPIC_API_KEY = ''

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
const INIT_TYPES = ['Branco', 'Espumante', 'Madeira', 'Rosé', 'Tinto', 'Verde'];  // Madeira type added from PROVAS

const COUNTRIES_REGIONS = {
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

const SUPPLIERS = [
  'Garrafeira Nacional', 'Garrafeira do Carmo', 'Wine with Spirit',
  'Continente', 'El Corte Inglés', 'Quinta (direto)', 'Adega (direto)', 'Outro',
]

// ─── DATA (ENOTECA + PROVAS — Garrafeira.xlsx) ───────────────────────────────

const INIT_WINES = [
  {id:1, name:'Aleixo Grande Reserva', type:'Tinto', country:'Portugal', region:'Bairrada', year:1996, purchasePrice:50.0, personalRating:0, vivinoRating:4.1, quantity:1, photo:null, notes:''}, // em stock
  {id:2, name:'Aleixo Grande Reserva', type:'Tinto', country:'Portugal', region:'Bairrada', year:1997, purchasePrice:45.0, personalRating:0, vivinoRating:4.1, quantity:1, photo:null, notes:''}, // em stock
  {id:3, name:'Alto Do Milhafre Grande Reserva', type:'Tinto', country:'Portugal', region:'Bairrada', year:2019, purchasePrice:20.0, personalRating:5.0, vivinoRating:null, quantity:1, photo:null, notes:''}, // em stock
  {id:4, name:'Avô Fausto', type:'Tinto', country:'Portugal', region:'Bairrada', year:2022, purchasePrice:25.0, personalRating:0, vivinoRating:4.1, quantity:1, photo:null, notes:''}, // em stock
  {id:5, name:'Beta', type:'Tinto', country:'Portugal', region:'Bairrada', year:2021, purchasePrice:19.0, personalRating:4.0, vivinoRating:4.1, quantity:1, photo:null, notes:''}, // em stock
  {id:6, name:'Blog', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:21.2, personalRating:0, vivinoRating:4.4, quantity:1, photo:null, notes:''}, // em stock
  {id:7, name:'Blog', type:'Tinto', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:21.2, personalRating:4.0, vivinoRating:4.2, quantity:1, photo:null, notes:''}, // em stock
  {id:8, name:'Blog Arinto Curtimenta Parcial', type:'Branco', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:27.5, personalRating:0, vivinoRating:null, quantity:1, photo:null, notes:''}, // em stock
  {id:9, name:'Blog Syrah', type:'Tinto', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:27.5, personalRating:5.0, vivinoRating:null, quantity:1, photo:null, notes:''}, // em stock
  {id:10, name:'Buçaco Reservado', type:'Branco', country:'Portugal', region:'Bairrada', year:2017, purchasePrice:46.9, personalRating:0, vivinoRating:4.6, quantity:1, photo:null, notes:''}, // em stock
  {id:11, name:'Cartuxa Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:33.5, personalRating:0, vivinoRating:4.4, quantity:1, photo:null, notes:''}, // em stock
  {id:12, name:'Casa De Saima Garrafeira Baga', type:'Tinto', country:'Portugal', region:'Bairrada', year:1991, purchasePrice:0.0, personalRating:5.0, vivinoRating:4.3, quantity:1, photo:null, notes:''}, // em stock
  {id:13, name:'Casa De Saima Garrafeira Baga', type:'Tinto', country:'Portugal', region:'Bairrada', year:2015, purchasePrice:55.0, personalRating:5.0, vivinoRating:4.3, quantity:1, photo:null, notes:''}, // em stock
  {id:14, name:'Casa Do Canto Grande Reserva', type:'Tinto', country:'Portugal', region:'Bairrada', year:2015, purchasePrice:26.0, personalRating:5.0, vivinoRating:4.4, quantity:1, photo:null, notes:''}, // em stock
  {id:15, name:'Cave Solar Das Francesas Garrafeira', type:'Tinto', country:'Portugal', region:'Bairrada', year:1968, purchasePrice:0.0, personalRating:4.0, vivinoRating:4.0, quantity:1, photo:null, notes:''}, // em stock
  {id:16, name:'Fronteira Private Selection', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:33.0, personalRating:5.0, vivinoRating:4.3, quantity:1, photo:null, notes:''}, // em stock
  {id:17, name:'Giz Vinhas Velhas', type:'Tinto', country:'Portugal', region:'Bairrada', year:2017, purchasePrice:19.0, personalRating:0, vivinoRating:4.0, quantity:1, photo:null, notes:''}, // em stock
  {id:18, name:'Grande Vadio', type:'Tinto', country:'Portugal', region:'Bairrada', year:2017, purchasePrice:30.0, personalRating:0, vivinoRating:4.2, quantity:1, photo:null, notes:''}, // em stock
  {id:19, name:'Já Te Disse Grande Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:84.9, personalRating:0, vivinoRating:4.5, quantity:1, photo:null, notes:''}, // em stock
  {id:20, name:'Já Te Disse Grande Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2022, purchasePrice:84.9, personalRating:0, vivinoRating:4.5, quantity:1, photo:null, notes:''}, // em stock
  {id:21, name:'Já Te Disse Grande Reserva Petit Verdot', type:'Tinto', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:98.5, personalRating:0, vivinoRating:4.9, quantity:1, photo:null, notes:''}, // em stock
  {id:22, name:'Já Te Disse Rosé', type:'Rosé', country:'Portugal', region:'Alentejo', year:2024, purchasePrice:33.0, personalRating:0, vivinoRating:4.6, quantity:1, photo:null, notes:''}, // em stock
  {id:23, name:'Jca Antes Só', type:'Branco', country:'Portugal', region:'Alentejo', year:2024, purchasePrice:34.0, personalRating:0, vivinoRating:null, quantity:1, photo:null, notes:''}, // em stock
  {id:24, name:'Jca Intratável', type:'Tinto', country:'Portugal', region:'Alentejo', year:2020, purchasePrice:40.0, personalRating:0, vivinoRating:null, quantity:1, photo:null, notes:''}, // em stock
  {id:25, name:'Jca Why Syrah?', type:'Tinto', country:'Portugal', region:'Alentejo', year:2022, purchasePrice:60.0, personalRating:0, vivinoRating:null, quantity:1, photo:null, notes:''}, // em stock
  {id:26, name:'Kompassus Tinto Cão', type:'Tinto', country:'Portugal', region:'Bairrada', year:2015, purchasePrice:28.0, personalRating:0, vivinoRating:null, quantity:1, photo:null, notes:''}, // em stock
  {id:27, name:'Lobo De Vasconcellos Lv Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:20.25, personalRating:0, vivinoRating:4.3, quantity:1, photo:null, notes:''}, // em stock
  {id:28, name:'Lobo De Vasconcellos Vinha Do Norte', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:54.0, personalRating:0, vivinoRating:4.5, quantity:1, photo:null, notes:''}, // em stock
  {id:29, name:'Luís Pato Quinta Do Ribeirinho', type:'Branco', country:'Portugal', region:'Bairrada', year:2021, purchasePrice:45.0, personalRating:0, vivinoRating:4.5, quantity:1, photo:null, notes:''}, // em stock
  {id:30, name:'Luís Pato Quinta Do Ribeirinho Pé De Franco', type:'Tinto', country:'Portugal', region:'Bairrada', year:2015, purchasePrice:150.0, personalRating:0, vivinoRating:4.7, quantity:1, photo:null, notes:''}, // em stock
  {id:31, name:'Luís Pato Rose', type:'Rosé', country:'Portugal', region:'Bairrada', year:2005, purchasePrice:48.5, personalRating:0, vivinoRating:4.1, quantity:1, photo:null, notes:''}, // em stock
  {id:32, name:'Marquês De Marialva Grande Reserva', type:'Tinto', country:'Portugal', region:'Bairrada', year:2013, purchasePrice:23.7, personalRating:4.0, vivinoRating:4.3, quantity:1, photo:null, notes:''}, // em stock
  {id:33, name:'Marquês De Murrieta Reserva', type:'Tinto', country:'Espanha', region:'Rioja', year:2020, purchasePrice:30.0, personalRating:0, vivinoRating:4.1, quantity:1, photo:null, notes:''}, // em stock
  {id:34, name:'Monte Da Bonança Mia Mara Alicante Bouschet', type:'Tinto', country:'Portugal', region:'Alentejo', year:2023, purchasePrice:55.0, personalRating:0, vivinoRating:null, quantity:1, photo:null, notes:''}, // em stock
  {id:35, name:'Monte Da Bonança Mia Mara Antão Vaz', type:'Branco', country:'Portugal', region:'Alentejo', year:2023, purchasePrice:55.0, personalRating:0, vivinoRating:null, quantity:1, photo:null, notes:''}, // em stock
  {id:36, name:'Monte Da Bonança Grande Reserva', type:'Branco', country:'Portugal', region:'Alentejo', year:2023, purchasePrice:18.0, personalRating:0, vivinoRating:null, quantity:1, photo:null, notes:''}, // em stock
  {id:37, name:'Monte Da Bonança Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2020, purchasePrice:15.0, personalRating:4.0, vivinoRating:4.3, quantity:1, photo:null, notes:''}, // em stock
  {id:38, name:'Opta Grande Reserva', type:'Tinto', country:'Portugal', region:'Dão', year:2016, purchasePrice:28.7, personalRating:0, vivinoRating:4.5, quantity:1, photo:null, notes:''}, // em stock
  {id:39, name:'Pacheca Lagar Nº1 Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:53.0, personalRating:0, vivinoRating:4.3, quantity:1, photo:null, notes:''}, // em stock
  {id:40, name:'Pai Chão Grande Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2020, purchasePrice:46.0, personalRating:0, vivinoRating:4.2, quantity:1, photo:null, notes:''}, // em stock
  {id:41, name:'Pai Horácio Grande Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2018, purchasePrice:43.0, personalRating:0, vivinoRating:4.6, quantity:1, photo:null, notes:''}, // em stock
  {id:42, name:'Primado', type:'Tinto', country:'Portugal', region:'Dão', year:2011, purchasePrice:16.5, personalRating:0, vivinoRating:4.0, quantity:1, photo:null, notes:''}, // em stock
  {id:43, name:'Primavera 1944', type:'Tinto', country:'Portugal', region:'Bairrada', year:2019, purchasePrice:30.0, personalRating:0, vivinoRating:null, quantity:1, photo:null, notes:''}, // em stock
  {id:44, name:'Proibido Garrafeira', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:65.0, personalRating:0, vivinoRating:4.7, quantity:1, photo:null, notes:''}, // em stock
  {id:45, name:'Proibido Grande Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2020, purchasePrice:28.0, personalRating:5.0, vivinoRating:4.4, quantity:1, photo:null, notes:''}, // em stock
  {id:46, name:'Quinta Da Curia Clefs D\'Or', type:'Tinto', country:'Portugal', region:'Bairrada', year:2014, purchasePrice:36.0, personalRating:0, vivinoRating:4.3, quantity:1, photo:null, notes:''}, // em stock
  {id:47, name:'Quinta Da Dôna', type:'Tinto', country:'Portugal', region:'Bairrada', year:2020, purchasePrice:22.3, personalRating:0, vivinoRating:4.3, quantity:1, photo:null, notes:''}, // em stock
  {id:48, name:'Quinta Da Gaivosa', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:35.6, personalRating:0, vivinoRating:4.4, quantity:1, photo:null, notes:''}, // em stock
  {id:49, name:'Quinta Da Gândara Grande Reserva', type:'Tinto', country:'Portugal', region:'Dão', year:2017, purchasePrice:23.7, personalRating:0, vivinoRating:null, quantity:1, photo:null, notes:''}, // em stock
  {id:50, name:'Quinta Da Lagoa Velha Singular', type:'Branco', country:'Portugal', region:'Bairrada', year:2020, purchasePrice:12.85, personalRating:0, vivinoRating:null, quantity:1, photo:null, notes:''}, // em stock
  {id:51, name:'Quinta Da Lagoa Velha Singular', type:'Branco', country:'Portugal', region:'Bairrada', year:2021, purchasePrice:12.85, personalRating:5.0, vivinoRating:null, quantity:1, photo:null, notes:''}, // em stock
  {id:52, name:'Quinta De São Bernardo Alecrim', type:'Branco', country:'Portugal', region:'Douro', year:2020, purchasePrice:19.5, personalRating:0, vivinoRating:4.2, quantity:1, photo:null, notes:''}, // em stock
  {id:53, name:'Quinta Do Castanheirinho Escolha Da Família', type:'Tinto', country:'Portugal', region:'Bairrada', year:2020, purchasePrice:0.0, personalRating:0, vivinoRating:4.4, quantity:1, photo:null, notes:''}, // em stock
  {id:54, name:'Quinta Do Mouro', type:'Tinto', country:'Portugal', region:'Alentejo', year:2016, purchasePrice:29.3, personalRating:0, vivinoRating:4.4, quantity:1, photo:null, notes:''}, // em stock
  {id:55, name:'Quinta Do Pessegueiro Plenitude', type:'Tinto', country:'Portugal', region:'Douro', year:2023, purchasePrice:58.0, personalRating:0, vivinoRating:4.6, quantity:1, photo:null, notes:''}, // em stock
  {id:56, name:'Quinta Do Sobreiró De Cima Único', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2015, purchasePrice:48.0, personalRating:5.0, vivinoRating:4.4, quantity:1, photo:null, notes:''}, // em stock
  {id:57, name:'Quinta Dos Abibes Bical', type:'Branco', country:'Portugal', region:'Bairrada', year:2017, purchasePrice:26.95, personalRating:5.0, vivinoRating:4.1, quantity:1, photo:null, notes:''}, // em stock
  {id:58, name:'Quinta Dos Castelares Bicho-Da-Seda', type:'Tinto', country:'Portugal', region:'Douro', year:2018, purchasePrice:90.0, personalRating:5.0, vivinoRating:4.6, quantity:1, photo:null, notes:''}, // em stock
  {id:59, name:'Quinta Dos Termos Reserva Vinha Das Colmeias', type:'Tinto', country:'Portugal', region:'Beira Interior', year:2020, purchasePrice:11.5, personalRating:5.0, vivinoRating:4.3, quantity:1, photo:null, notes:''}, // em stock
  {id:60, name:'Quinta Dos Termos Reserva Vinhas Velhas', type:'Tinto', country:'Portugal', region:'Beira Interior', year:2021, purchasePrice:8.0, personalRating:5.0, vivinoRating:4.1, quantity:1, photo:null, notes:''}, // em stock
  {id:61, name:'Quinta Dos Termos Talhão Da Serra Rufete', type:'Tinto', country:'Portugal', region:'Beira Interior', year:2020, purchasePrice:11.5, personalRating:5.0, vivinoRating:4.1, quantity:2, photo:null, notes:''}, // em stock
  {id:62, name:'Quinta Vale D. Maria Vinhas Velhas', type:'Tinto', country:'Portugal', region:'Douro', year:2020, purchasePrice:45.0, personalRating:5.0, vivinoRating:4.4, quantity:1, photo:null, notes:''}, // em stock
  {id:63, name:'Quintinha Da Francisca Grande Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:40.0, personalRating:0, vivinoRating:4.4, quantity:1, photo:null, notes:''}, // em stock
  {id:64, name:'Regateiro Vinha D\'Anita', type:'Tinto', country:'Portugal', region:'Bairrada', year:2015, purchasePrice:21.0, personalRating:4.0, vivinoRating:4.0, quantity:1, photo:null, notes:''}, // em stock
  {id:65, name:'São Domingos Garrafeira', type:'Tinto', country:'Portugal', region:'Bairrada', year:2016, purchasePrice:16.9, personalRating:4.0, vivinoRating:4.2, quantity:1, photo:null, notes:''}, // em stock
  {id:66, name:'Souvall Baga', type:'Tinto', country:'Portugal', region:'Beira Interior', year:2022, purchasePrice:20.0, personalRating:0, vivinoRating:null, quantity:1, photo:null, notes:''}, // em stock
  {id:67, name:'Vadio', type:'Tinto', country:'Portugal', region:'Bairrada', year:2020, purchasePrice:14.85, personalRating:0, vivinoRating:4.0, quantity:1, photo:null, notes:''}, // em stock
  {id:68, name:'Villa Oliveira Vinha Das Pedras Altas', type:'Tinto', country:'Portugal', region:'Dão', year:2016, purchasePrice:54.5, personalRating:0, vivinoRating:4.4, quantity:1, photo:null, notes:''}, // em stock
  {id:69, name:'Vinhas Improváveis', type:'Tinto', country:'Portugal', region:'Douro', year:2018, purchasePrice:16.0, personalRating:5.0, vivinoRating:4.4, quantity:1, photo:null, notes:''}, // em stock
  {id:70, name:'Vinhas Improváveis', type:'Tinto', country:'Portugal', region:'Douro', year:2020, purchasePrice:20.5, personalRating:5.0, vivinoRating:4.3, quantity:1, photo:null, notes:''}, // em stock
  {id:71, name:'1 Centavo', type:'Tinto', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:4.99, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:72, name:'2160', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:6.95, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:73, name:'Allgo Encruzado Uva Cão', type:'Branco', country:'Portugal', region:'Dão', year:2019, purchasePrice:7.62, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:74, name:'Anel Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2018, purchasePrice:7.85, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:75, name:'Argilla', type:'Branco', country:'Portugal', region:'Alentejo', year:2017, purchasePrice:7.0, personalRating:4.0, vivinoRating:3.6, quantity:0, photo:null, notes:''},
  {id:76, name:'Argilla', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:7.0, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:77, name:'Astronauta Touriga Nacional', type:'Tinto', country:'Portugal', region:'Lisboa', year:2017, purchasePrice:4.65, personalRating:3.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:78, name:'Bella Superior Sauvignon Blanc', type:'Branco', country:'Portugal', region:'Dão', year:2019, purchasePrice:10.0, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:79, name:'Bota Velha', type:'Branco', country:'Portugal', region:'Douro', year:2017, purchasePrice:5.97, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:80, name:'Carlota A Imperatriz', type:'Branco', country:'Portugal', region:'Lisboa', year:2019, purchasePrice:5.97, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:81, name:'Carm Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:10.0, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:82, name:'Casa Da Passarela A Descoberta', type:'Branco', country:'Portugal', region:'Dão', year:2019, purchasePrice:6.0, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:83, name:'Casa D\'Almear Selection', type:'Tinto', country:'Portugal', region:'Bairrada', year:2019, purchasePrice:5.99, personalRating:3.0, vivinoRating:3.6, quantity:0, photo:null, notes:''},
  {id:84, name:'Casa De Santar Vinha Dos Amores', type:'Tinto', country:'Portugal', region:'Dão', year:2014, purchasePrice:20.0, personalRating:5.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:85, name:'Casa Ermelinda Freistas Carménère Reserva', type:'Tinto', country:'Portugal', region:'Setúbal', year:2017, purchasePrice:7.85, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:86, name:'Cedro Do Noval', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:9.9, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:87, name:'Conventual', type:'Branco', country:'Portugal', region:'Alentejo', year:2016, purchasePrice:2.5, personalRating:4.0, vivinoRating:3.4, quantity:0, photo:null, notes:''},
  {id:88, name:'Conventual Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:9.9, personalRating:3.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:89, name:'Dium Syrah', type:'Tinto', country:'Portugal', region:'Alentejo', year:2014, purchasePrice:20.0, personalRating:5.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:90, name:'Dium Touriga Franca', type:'Tinto', country:'Portugal', region:'Alentejo', year:2015, purchasePrice:20.0, personalRating:5.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:91, name:'Domini', type:'Tinto', country:'Portugal', region:'Douro', year:2018, purchasePrice:5.37, personalRating:3.0, vivinoRating:3.5, quantity:0, photo:null, notes:''},
  {id:92, name:'Dsf Grand Noir', type:'Tinto', country:'Portugal', region:'Setúbal', year:2015, purchasePrice:12.0, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:93, name:'Esporão Bico Amarelo', type:'Verde', country:'Portugal', region:'Vinho Verde', year:2019, purchasePrice:3.74, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:94, name:'Filipa Pato 3B Blanc De Blancs', type:'Espumante', country:'Portugal', region:'Bairrada', year:2020, purchasePrice:9.95, personalRating:5.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:95, name:'Filipa Pato Dinâmica Baga', type:'Tinto', country:'Portugal', region:'Bairrada', year:2019, purchasePrice:9.0, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:96, name:'Flor D\' Penalva Colheita Selecionada', type:'Branco', country:'Portugal', region:'Dão', year:2019, purchasePrice:2.69, personalRating:3.0, vivinoRating:3.6, quantity:0, photo:null, notes:''},
  {id:97, name:'Conde D\' Ervideira Alicante Bouschet', type:'Tinto', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:27.0, personalRating:5.0, vivinoRating:4.4, quantity:0, photo:null, notes:''},
  {id:98, name:'Fraga Da Galhofa', type:'Branco', country:'Portugal', region:'Douro', year:2019, purchasePrice:4.45, personalRating:3.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:99, name:'Fraga Da Galhofa', type:'Tinto', country:'Portugal', region:'Douro', year:2018, purchasePrice:4.45, personalRating:4.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:100, name:'Herdade Aldeia De Cima Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:12.15, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:101, name:'Herdade De Grous 23 Barricas', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:24.0, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:102, name:'Herdade De Grous Moon Harvested', type:'Tinto', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:24.0, personalRating:5.0, vivinoRating:4.4, quantity:0, photo:null, notes:''},
  {id:103, name:'Herdade De São Miguel Alicante Bouschet', type:'Tinto', country:'Portugal', region:'Alentejo', year:2015, purchasePrice:9.0, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:104, name:'Herdade De São Miguel Colheita Selecionada', type:'Tinto', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:3.96, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:105, name:'Herdade De São Miguel Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2015, purchasePrice:13.0, personalRating:5.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:106, name:'Herdade Do Freixo Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2016, purchasePrice:13.39, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:107, name:'Hugo Mendes Lisboa Fernão Pires', type:'Branco', country:'Portugal', region:'Lisboa', year:2018, purchasePrice:18.0, personalRating:5.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:108, name:'Identidade Am', type:'Tinto', country:'Portugal', region:'Dão', year:2019, purchasePrice:14.5, personalRating:3.0, vivinoRating:4.4, quantity:0, photo:null, notes:''},
  {id:109, name:'Incendi', type:'Tinto', country:'Portugal', region:'Alentejo', year:2016, purchasePrice:12.0, personalRating:3.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:110, name:'Kompassus Reserva', type:'Tinto', country:'Portugal', region:'Bairrada', year:2016, purchasePrice:9.55, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:111, name:'Luís Pato Vinha Formal', type:'Tinto', country:'Portugal', region:'Bairrada', year:2011, purchasePrice:14.52, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:112, name:'Mob Lote 3', type:'Branco', country:'Portugal', region:'Dão', year:2019, purchasePrice:7.74, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:113, name:'Muros Antigos Escolha', type:'Verde', country:'Portugal', region:'Vinho Verde', year:2019, purchasePrice:3.72, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:114, name:'Oculto', type:'Branco', country:'Portugal', region:'Lisboa', year:2018, purchasePrice:6.0, personalRating:4.0, vivinoRating:3.4, quantity:0, photo:null, notes:''},
  {id:115, name:'Opta Imperatriz Do Dão Alfrocheiro', type:'Tinto', country:'Portugal', region:'Dão', year:2017, purchasePrice:19.1, personalRating:4.0, vivinoRating:4.4, quantity:0, photo:null, notes:''},
  {id:116, name:'Opta Mola', type:'Tinto', country:'Portugal', region:'Setúbal', year:2018, purchasePrice:4.25, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:117, name:'Oxalá Granítico', type:'Branco', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:6.0, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:118, name:'Pacheca Reserva Vinhas Velhas', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:12.0, personalRating:5.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:119, name:'Palácio Dos Távoras Vinhas Velhas', type:'Tinto', country:'Portugal', region:'Douro', year:2015, purchasePrice:19.0, personalRating:5.0, vivinoRating:4.4, quantity:0, photo:null, notes:''},
  {id:120, name:'Papo Amarelo Reserva', type:'Branco', country:'Portugal', region:'Setúbal', year:2017, purchasePrice:2.99, personalRating:4.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:121, name:'Pequenos Rebentos Ancestral', type:'Espumante', country:'Portugal', region:'Vinho Verde', year:2020, purchasePrice:12.16, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:122, name:'Pequenos Rebentos Loureiro', type:'Verde', country:'Portugal', region:'Vinho Verde', year:2020, purchasePrice:4.24, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:123, name:'Pequenos Rebentos O Príncipe E O Bandido', type:'Espumante', country:'Portugal', region:'Vinho Verde', year:2020, purchasePrice:12.12, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:124, name:'Permitido Rabigato', type:'Branco', country:'Portugal', region:'Douro', year:2019, purchasePrice:12.0, personalRating:5.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:125, name:'Pimenta Preta', type:'Tinto', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:3.25, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:126, name:'Pormenor', type:'Tinto', country:'Portugal', region:'Douro', year:2018, purchasePrice:12.97, personalRating:3.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:127, name:'Portalegre', type:'Tinto', country:'Portugal', region:'Alentejo', year:2013, purchasePrice:18.0, personalRating:3.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:128, name:'Post Scriptum', type:'Tinto', country:'Portugal', region:'Douro', year:2018, purchasePrice:10.0, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:129, name:'Proibido Clarete', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:10.0, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:130, name:'Prova Cega', type:'Tinto', country:'Portugal', region:'Douro', year:2018, purchasePrice:7.0, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:131, name:'Quinta Da Lagoa Velha Chardonnay Baga', type:'Branco', country:'Portugal', region:'Bairrada', year:2018, purchasePrice:8.5, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:132, name:'Quinta Da Lagoa Velha Sauvignon Blanc', type:'Branco', country:'Portugal', region:'Bairrada', year:2019, purchasePrice:8.5, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:133, name:'Quinta Da Romaneira Syrah', type:'Tinto', country:'Portugal', region:'Douro', year:2016, purchasePrice:15.76, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:134, name:'Quinta Do Cardo', type:'Branco', country:'Portugal', region:'Beira', year:2019, purchasePrice:6.4, personalRating:3.0, vivinoRating:3.6, quantity:0, photo:null, notes:''},
  {id:135, name:'Quinta Do Cardo', type:'Tinto', country:'Portugal', region:'Beira', year:2017, purchasePrice:6.0, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:136, name:'Quinta Do Gradil Arinto', type:'Branco', country:'Portugal', region:'Lisboa', year:2019, purchasePrice:10.5, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:137, name:'Quinta Do Ortigão Talhão Dos Manos', type:'Tinto', country:'Portugal', region:'Bairrada', year:2016, purchasePrice:11.02, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:138, name:'Quinta Dos Abibes Reserva', type:'Tinto', country:'Portugal', region:'Bairrada', year:2015, purchasePrice:11.5, personalRating:5.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:139, name:'Quinta Dos Abibes Sauvignon Blanc', type:'Branco', country:'Portugal', region:'Bairrada', year:2019, purchasePrice:10.5, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:140, name:'Quinta Dos Aciprestes', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:7.06, personalRating:4.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:141, name:'Quinta Dos Castelares Grande Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:16.78, personalRating:5.0, vivinoRating:4.5, quantity:0, photo:null, notes:''},
  {id:142, name:'Quinta Vale Do Ruivo Vinhas Velhas', type:'Tinto', country:'Portugal', region:'Beira', year:2014, purchasePrice:4.96, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:143, name:'Quinto Elemento Blanc De Noir Trincadeira Preta', type:'Branco', country:'Portugal', region:'Lisboa', year:2017, purchasePrice:16.2, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:144, name:'Quinto Elemento Reserva Cabernet Sauvignon', type:'Tinto', country:'Portugal', region:'Lisboa', year:2015, purchasePrice:19.5, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:145, name:'Ribeiro Santo', type:'Tinto', country:'Portugal', region:'Dão', year:2018, purchasePrice:3.22, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:146, name:'Ribeiro Santo Pinha', type:'Tinto', country:'Portugal', region:'Dão', year:2019, purchasePrice:2.77, personalRating:2.0, vivinoRating:3.6, quantity:0, photo:null, notes:''},
  {id:147, name:'Ribeiro Santo Reserva', type:'Tinto', country:'Portugal', region:'Dão', year:2016, purchasePrice:7.5, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:148, name:'Rôla Vinha Das Marias', type:'Tinto', country:'Portugal', region:'Douro', year:2014, purchasePrice:14.5, personalRating:3.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:149, name:'Rosa Da Mata Fernão Pires', type:'Branco', country:'Portugal', region:'Dão', year:2019, purchasePrice:22.0, personalRating:5.0, vivinoRating:4.4, quantity:0, photo:null, notes:''},
  {id:150, name:'Taboadella Encruzado Reserva', type:'Branco', country:'Portugal', region:'Dão', year:2019, purchasePrice:13.0, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:151, name:'Taboadella Villae', type:'Tinto', country:'Portugal', region:'Dão', year:2018, purchasePrice:7.75, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:152, name:'Valle Da Fonte Reserva Vinhas Velhas', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:9.0, personalRating:3.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:153, name:'Vinha Dos Deuses Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:11.02, personalRating:3.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:154, name:'Vinha Dos Santos', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:6.16, personalRating:4.0, vivinoRating:3.6, quantity:0, photo:null, notes:''},
  {id:155, name:'Violino', type:'Tinto', country:'Portugal', region:'Lisboa', year:2017, purchasePrice:4.35, personalRating:2.0, vivinoRating:3.5, quantity:0, photo:null, notes:''},
  {id:156, name:'Vz', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:16.0, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:157, name:'Zom Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2015, purchasePrice:6.75, personalRating:3.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:158, name:'Terras De Mogadouro', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:6.16, personalRating:4.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:159, name:'Xaino Selection', type:'Tinto', country:'Portugal', region:'Douro', year:2016, purchasePrice:7.85, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:160, name:'Fita Preta', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:8.87, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:161, name:'100 Hectares Superior', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:8.87, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:162, name:'Ovelha Negra Dezasseis', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:12.5, personalRating:3.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:163, name:'Quinta Do Soque Superior', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:8.87, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:164, name:'Amuado', type:'Tinto', country:'Portugal', region:'Lisboa', year:2020, purchasePrice:1.5, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:165, name:'Quinta Da Bacalhôa', type:'Tinto', country:'Portugal', region:'Setúbal', year:2007, purchasePrice:15.0, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:166, name:'Casa Burmester Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:10.11, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:167, name:'Valle Pradinhos Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:10.0, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:168, name:'Vinha Do Jeremias', type:'Tinto', country:'Portugal', region:'Alentejo', year:2015, purchasePrice:22.0, personalRating:5.0, vivinoRating:4.4, quantity:0, photo:null, notes:''},
  {id:169, name:'Conde De Anadia Reserva', type:'Tinto', country:'Portugal', region:'Dão', year:2015, purchasePrice:16.0, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:170, name:'Colinas Reserva', type:'Tinto', country:'Portugal', region:'Bairrada', year:2011, purchasePrice:14.95, personalRating:5.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:171, name:'Casa De Saima Garrafeira', type:'Branco', country:'Portugal', region:'Bairrada', year:2015, purchasePrice:12.0, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:172, name:'Comportillo Crianza', type:'Tinto', country:'Espanha', region:'Rioja', year:2018, purchasePrice:2.7, personalRating:3.0, vivinoRating:3.4, quantity:0, photo:null, notes:''},
  {id:173, name:'Mob Lote 3', type:'Tinto', country:'Portugal', region:'Dão', year:2018, purchasePrice:7.8, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:174, name:'Valle Pradinhos Reserva', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2016, purchasePrice:10.0, personalRating:5.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:175, name:'Cortes De Cima Syrah', type:'Tinto', country:'Portugal', region:'Alentejo', year:2017, purchasePrice:15.0, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:176, name:'Herdade Do Sobroso Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:10.0, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:177, name:'Sátiro (Clandestino)', type:'Tinto', country:'Portugal', region:'Alentejo', year:2017, purchasePrice:12.5, personalRating:5.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:178, name:'Rebelde', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:3.0, personalRating:3.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:179, name:'Palaios Superior Alicante Bouschet', type:'Tinto', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:0.0, personalRating:3.0, vivinoRating:3.6, quantity:0, photo:null, notes:''},
  {id:180, name:'Maçanita Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2018, purchasePrice:15.0, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:181, name:'Valcatrina', type:'Tinto', country:'Portugal', region:'Alentejo', year:2020, purchasePrice:4.0, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:182, name:'Quinta Do Sobreiró De Cima Reserva', type:'Branco', country:'Portugal', region:'Trás-os-Montes', year:2020, purchasePrice:6.5, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:183, name:'Monte Da Caçada Touriga Nacional', type:'Tinto', country:'Portugal', region:'Alentejo', year:2017, purchasePrice:8.0, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:184, name:'Regateiro Reserva', type:'Tinto', country:'Portugal', region:'Bairrada', year:2015, purchasePrice:12.0, personalRating:3.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:185, name:'Colossal Reserva', type:'Tinto', country:'Portugal', region:'Lisboa', year:2018, purchasePrice:4.5, personalRating:3.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:186, name:'Viñademoya', type:'Tinto', country:'Espanha', region:'Bierzo', year:2019, purchasePrice:6.9, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:187, name:'Tempura Colheita', type:'Tinto', country:'Portugal', region:'Dão', year:2019, purchasePrice:8.0, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:188, name:'Semele', type:'Tinto', country:'Espanha', region:'Ribera del Duero', year:2018, purchasePrice:8.5, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:189, name:'Félix Azpilicueta Crianza', type:'Tinto', country:'Espanha', region:'Rioja', year:2017, purchasePrice:7.5, personalRating:4.0, vivinoRating:3.6, quantity:0, photo:null, notes:''},
  {id:190, name:'Fortíssimo', type:'Tinto', country:'Portugal', region:'Alentejo', year:2020, purchasePrice:4.0, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:191, name:'Monte Seis Reis Syrah', type:'Tinto', country:'Portugal', region:'Alentejo', year:2015, purchasePrice:10.0, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:192, name:'Pêra Doce Reserva Magnum', type:'Tinto', country:'Portugal', region:'Alentejo', year:2017, purchasePrice:7.0, personalRating:3.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:193, name:'Trintorum Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2020, purchasePrice:6.0, personalRating:3.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:194, name:'Tempura Reserva', type:'Tinto', country:'Portugal', region:'Dão', year:2018, purchasePrice:10.0, personalRating:3.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:195, name:'Quinta Do Sobreiró De Cima Grande Reserva', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2016, purchasePrice:11.5, personalRating:0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:196, name:'Monte Da Peceguina', type:'Tinto', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:11.25, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:197, name:'Casa Do Canto Reserva', type:'Branco', country:'Portugal', region:'Bairrada', year:2017, purchasePrice:7.85, personalRating:3.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:198, name:'Herdade De São Miguel Pé De Mãe', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:28.0, personalRating:5.0, vivinoRating:4.4, quantity:0, photo:null, notes:''},
  {id:199, name:'Arco D\' Aguieira', type:'Branco', country:'Portugal', region:'Bairrada', year:2017, purchasePrice:13.5, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:200, name:'Adega De Borba Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:10.0, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:201, name:'Duckman Rosa Duck Pet Nat', type:'Branco', country:'Portugal', region:'Bairrada', year:2019, purchasePrice:7.5, personalRating:3.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:202, name:'Luís Pato Vinhas Velhas', type:'Branco', country:'Portugal', region:'Bairrada', year:2020, purchasePrice:7.85, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:203, name:'São Domingos Reserva Arinto', type:'Branco', country:'Portugal', region:'Bairrada', year:2019, purchasePrice:6.3, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:204, name:'Astronauta Sauvignon Blanc', type:'Branco', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:8.1, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:205, name:'Quinta Do Sobreiró De Cima Grande Escolha', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2005, purchasePrice:8.0, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:206, name:'Pequenos Rebentos O Caminho', type:'Verde', country:'Portugal', region:'Monção e Melgaço', year:2020, purchasePrice:15.0, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:207, name:'Dez Tostões', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:12.0, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:208, name:'Conde Moreira Reserva De Família Exclusiva', type:'Branco', country:'Portugal', region:'Douro', year:2019, purchasePrice:9.9, personalRating:5.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:209, name:'Quinta Do Sobreiró De Cima', type:'Rosé', country:'Portugal', region:'Trás-os-Montes', year:2021, purchasePrice:3.9, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:210, name:'Zip', type:'Tinto', country:'Portugal', region:'Douro', year:2018, purchasePrice:4.5, personalRating:4.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:211, name:'Risu Dos Montes', type:'Tinto', country:'Portugal', region:'Douro', year:2020, purchasePrice:11.1, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:212, name:'Cavalo Luso', type:'Branco', country:'Portugal', region:'Tejo', year:2021, purchasePrice:1.7, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:213, name:'Quinta De São Lourenço', type:'Tinto', country:'Portugal', region:'Bairrada', year:2011, purchasePrice:13.0, personalRating:5.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:214, name:'Ponte Morgada', type:'Branco', country:'Portugal', region:'Setúbal', year:2021, purchasePrice:1.8, personalRating:4.0, vivinoRating:3.4, quantity:0, photo:null, notes:''},
  {id:215, name:'Pousada Do Corvo', type:'Branco', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:1.9, personalRating:3.0, vivinoRating:3.5, quantity:0, photo:null, notes:''},
  {id:216, name:'Quinta Nova', type:'Rosé', country:'Portugal', region:'Douro', year:2021, purchasePrice:11.0, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:217, name:'Mascarilha Reserva', type:'Branco', country:'Portugal', region:'Douro', year:2021, purchasePrice:5.0, personalRating:3.0, vivinoRating:3.4, quantity:0, photo:null, notes:''},
  {id:218, name:'Quinta Do Cardo', type:'Branco', country:'Portugal', region:'Beira Interior', year:2011, purchasePrice:2.8, personalRating:4.0, vivinoRating:3.2, quantity:0, photo:null, notes:''},
  {id:219, name:'Casa De Saima Rose', type:'Rosé', country:'Portugal', region:'Bairrada', year:2021, purchasePrice:4.5, personalRating:4.0, vivinoRating:3.5, quantity:0, photo:null, notes:''},
  {id:220, name:'Casa De Saima Vinhas Velhas', type:'Branco', country:'Portugal', region:'Bairrada', year:2021, purchasePrice:6.95, personalRating:5.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:221, name:'Monte Da Ravasqueira Syrah', type:'Tinto', country:'Portugal', region:'Alentejo', year:2020, purchasePrice:5.0, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:222, name:'Pedro Cancela Vinha Da Fidalga Cerceal', type:'Branco', country:'Portugal', region:'Dão', year:2020, purchasePrice:7.3, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:223, name:'Pedro Cancela Vinha Da Fidalga Encruzado', type:'Branco', country:'Portugal', region:'Dão', year:2020, purchasePrice:7.3, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:224, name:'Quinta De Arcossó Reserva', type:'Branco', country:'Portugal', region:'Trás-os-Montes', year:2019, purchasePrice:9.5, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:225, name:'Caprice', type:'Rosé', country:'França', region:'Saint-Tropez', year:2021, purchasePrice:7.95, personalRating:4.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:226, name:'Quinta Dos Termos Reserva Do Patrão', type:'Tinto', country:'Portugal', region:'Beira Interior', year:2017, purchasePrice:11.5, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:227, name:'Quinta Vale D. Maria Rufo', type:'Branco', country:'Portugal', region:'Douro', year:2020, purchasePrice:6.0, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:228, name:'Aveleda Parcela Do Roseiral', type:'Branco', country:'Portugal', region:'Vinho Verde', year:2019, purchasePrice:12.0, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:229, name:'Sauternes', type:'Branco', country:'França', region:'França', year:2019, purchasePrice:14.5, personalRating:2.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:230, name:'Valle Pradinhos Reserva', type:'Branco', country:'Portugal', region:'Trás-os-Montes', year:2021, purchasePrice:16.0, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:231, name:'Aequinoctium Veranum Grande Reserva', type:'Branco', country:'Portugal', region:'Bairrada', year:2018, purchasePrice:23.7, personalRating:3.0, vivinoRating:4.4, quantity:0, photo:null, notes:''},
  {id:232, name:'Estrada Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2018, purchasePrice:6.0, personalRating:3.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:233, name:'Tiago Cabaço Encruzado', type:'Branco', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:10.0, personalRating:3.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:234, name:'Quinta Dos Castelares Reserva', type:'Branco', country:'Portugal', region:'Douro', year:2020, purchasePrice:10.0, personalRating:5.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:235, name:'Matilda Nieves', type:'Tinto', country:'Espanha', region:'Ribeira Sacra', year:2020, purchasePrice:9.25, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:236, name:'Samião Reserva', type:'Tinto', country:'Portugal', region:'Bairrada', year:2017, purchasePrice:7.0, personalRating:3.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:237, name:'Monte Barbo', type:'Tinto', country:'Portugal', region:'Beira Interior', year:2016, purchasePrice:6.5, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:238, name:'Marquês De Marialva Colheita Selecionada', type:'Branco', country:'Portugal', region:'Bairrada', year:2021, purchasePrice:4.0, personalRating:3.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:239, name:'Quinta Dona Doroteia Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:8.0, personalRating:3.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:240, name:'Casa De Saima Vinhas Velhas', type:'Tinto', country:'Portugal', region:'Bairrada', year:2017, purchasePrice:6.95, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:241, name:'Quinta Dos Castelares Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2018, purchasePrice:11.0, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:242, name:'Hugo Mendes Lisboa Castelão', type:'Tinto', country:'Portugal', region:'Lisboa', year:2019, purchasePrice:12.0, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:243, name:'Quinta De São Lourenço', type:'Tinto', country:'Portugal', region:'Bairrada', year:2016, purchasePrice:7.85, personalRating:0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:244, name:'Tiago Cabaço Alicante Bouschet', type:'Tinto', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:11.0, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:245, name:'Montes Claros Garrafeira', type:'Tinto', country:'Portugal', region:'Alentejo', year:2014, purchasePrice:14.5, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:246, name:'Arrepiado Collection', type:'Tinto', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:28.0, personalRating:5.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:247, name:'Arrepiado Velho Tradição', type:'Tinto', country:'Portugal', region:'Alentejo', year:2020, purchasePrice:28.0, personalRating:5.0, vivinoRating:4.4, quantity:0, photo:null, notes:''},
  {id:248, name:'Dium', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:20.0, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:249, name:'Incendi', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:12.0, personalRating:5.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:250, name:'Castelar', type:'Tinto', country:'Portugal', region:'Bairrada', year:2011, purchasePrice:3.5, personalRating:4.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:251, name:'Alicante Bouschet Pingo Doce', type:'Tinto', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:4.0, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:252, name:'Grande Trinca Bolotas', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:14.0, personalRating:3.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:253, name:'Bons Ares', type:'Branco', country:'Portugal', region:'Douro', year:2021, purchasePrice:9.5, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:254, name:'Altitude By Duorum', type:'Tinto', country:'Portugal', region:'Douro', year:2020, purchasePrice:6.5, personalRating:4.0, vivinoRating:3.3, quantity:0, photo:null, notes:''},
  {id:255, name:'Senses Alicante Bouschet', type:'Tinto', country:'Portugal', region:'Alentejo', year:2020, purchasePrice:6.0, personalRating:3.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:256, name:'Perspectiva Grande Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:5.5, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:257, name:'Quinta Vale Santa Luzia Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:10.0, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:258, name:'Proibido Grande Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2018, purchasePrice:25.0, personalRating:5.0, vivinoRating:4.4, quantity:0, photo:null, notes:''},
  {id:259, name:'Senses Petit Verdot', type:'Tinto', country:'Portugal', region:'Alentejo', year:2017, purchasePrice:6.0, personalRating:4.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:260, name:'Terra Montana Reserva', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2019, purchasePrice:5.1, personalRating:5.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:261, name:'Quintas De Borba Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:8.5, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:262, name:'Casa Américo', type:'Tinto', country:'Portugal', region:'Dão', year:2018, purchasePrice:4.0, personalRating:3.0, vivinoRating:3.5, quantity:0, photo:null, notes:''},
  {id:263, name:'Ponte Morgada', type:'Tinto', country:'Portugal', region:'Setúbal', year:2020, purchasePrice:1.8, personalRating:3.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:264, name:'Herdade Do Sobroso Grande Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:30.9, personalRating:5.0, vivinoRating:4.4, quantity:0, photo:null, notes:''},
  {id:265, name:'Quinta D\' Aguieira', type:'Tinto', country:'Portugal', region:'Bairrada', year:2017, purchasePrice:32.5, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:266, name:'Adega Nobre Vinhas Velhas', type:'Tinto', country:'Portugal', region:'Douro', year:2016, purchasePrice:4.15, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:267, name:'Valle Pradinhos Reserva', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2017, purchasePrice:10.0, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:268, name:'Quinta Nova Reserva Terroir Blend', type:'Tinto', country:'Portugal', region:'Douro', year:2020, purchasePrice:14.0, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:269, name:'Quinta Do Soque', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:4.5, personalRating:4.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:270, name:'Quinta De Arcossó Reserva', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2017, purchasePrice:9.5, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:271, name:'Plansel', type:'Tinto', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:4.8, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:272, name:'Monte Dos Perdigões Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2020, purchasePrice:12.5, personalRating:3.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:273, name:'Terra Montana Reserva', type:'Branco', country:'Portugal', region:'Trás-os-Montes', year:2021, purchasePrice:5.1, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:274, name:'Monte Da Ravasqueira Reserva Da Família', type:'Tinto', country:'Portugal', region:'Alentejo', year:2020, purchasePrice:10.0, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:275, name:'100 Hectares Touriga Nacional', type:'Tinto', country:'Portugal', region:'Douro', year:2020, purchasePrice:9.0, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:276, name:'Arco D\' Aguieira', type:'Tinto', country:'Portugal', region:'Bairrada', year:2016, purchasePrice:13.5, personalRating:5.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:277, name:'Vale Do Luar Grande Escolha', type:'Branco', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:11.7, personalRating:5.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:278, name:'Lobo De Vasconcellos Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:20.5, personalRating:5.0, vivinoRating:4.6, quantity:0, photo:null, notes:''},
  {id:279, name:'Quinta Do Sobreiró De Cima Reserva', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2018, purchasePrice:6.5, personalRating:5.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:280, name:'Villa Alvor Moscatel Galego Roxo', type:'Rosé', country:'Portugal', region:'Algarve', year:2020, purchasePrice:12.0, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:281, name:'100 Hectares Touriga Nacional', type:'Tinto', country:'Portugal', region:'Douro', year:2021, purchasePrice:9.0, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:282, name:'Herdade De Grous Moon Harvested', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:24.0, personalRating:5.0, vivinoRating:4.4, quantity:0, photo:null, notes:''},
  {id:283, name:'Herdade De Grous Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2016, purchasePrice:30.0, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:284, name:'Quinta Da Fonte Souto Florão', type:'Branco', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:7.85, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:285, name:'Quinta Da Fonte Souto', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:13.4, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:286, name:'Filipe Palhoça Cabernet Sauvignon', type:'Tinto', country:'Portugal', region:'Lisboa', year:2017, purchasePrice:5.25, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:287, name:'Conde Vimioso Reserva', type:'Tinto', country:'Portugal', region:'Tejo', year:2020, purchasePrice:10.0, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:288, name:'Herdade Dos Grous', type:'Branco', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:10.0, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:289, name:'Quinta Da Fonte Souto Florão', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:7.85, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:290, name:'Quinta Do Sobreiró De Cima Reserva', type:'Branco', country:'Portugal', region:'Trás-os-Montes', year:2021, purchasePrice:6.5, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:291, name:'Dez Tostões', type:'Branco', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:10.85, personalRating:5.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:292, name:'Roquette & Cazes', type:'Tinto', country:'Portugal', region:'Douro', year:2016, purchasePrice:17.5, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:293, name:'Indie Xisto', type:'Tinto', country:'Portugal', region:'Douro', year:2014, purchasePrice:25.0, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:294, name:'Cadão Vinhas Velhas Pm Edition', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:14.0, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:295, name:'Quinta Do Sobreiró De Cima Santa Valha', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2019, purchasePrice:3.0, personalRating:3.0, vivinoRating:3.4, quantity:0, photo:null, notes:''},
  {id:296, name:'Quinta Dos Termos Reserva', type:'Branco', country:'Portugal', region:'Beira Interior', year:2021, purchasePrice:6.9, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:297, name:'Casa Do Canto Grande Reserva', type:'Branco', country:'Portugal', region:'Bairrada', year:2016, purchasePrice:23.6, personalRating:5.0, vivinoRating:4.6, quantity:0, photo:null, notes:''},
  {id:298, name:'Feito De Joa', type:'Branco', country:'Portugal', region:'Trás-os-Montes', year:2020, purchasePrice:26.9, personalRating:5.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:299, name:'Casa De Saima Grande Reserva', type:'Tinto', country:'Portugal', region:'Bairrada', year:2016, purchasePrice:15.9, personalRating:4.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:300, name:'Aveleda Parcela Do Convento', type:'Branco', country:'Portugal', region:'Vinho Verde', year:2019, purchasePrice:20.0, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:301, name:'Quinta Dos Termos Talhão Da Serra Rufete', type:'Tinto', country:'Portugal', region:'Beira Interior', year:2019, purchasePrice:13.85, personalRating:5.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:302, name:'Conde De Cantanhede Reserva Baga Branco', type:'Branco', country:'Portugal', region:'Bairrada', year:2020, purchasePrice:14.75, personalRating:5.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:303, name:'Cadão', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:3.5, personalRating:3.0, vivinoRating:3.5, quantity:0, photo:null, notes:''},
  {id:304, name:'Marquês De Marialva Reserva Baga', type:'Tinto', country:'Portugal', region:'Bairrada', year:2018, purchasePrice:7.7, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:305, name:'Marquês De Marialva Reserva Bical', type:'Branco', country:'Portugal', region:'Bairrada', year:2019, purchasePrice:7.7, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:306, name:'Quinta Dos Termos Reserva Vinhas Velhas', type:'Tinto', country:'Portugal', region:'Beira Interior', year:2019, purchasePrice:9.95, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:307, name:'Quinta Das Corriças Tinta Amarela Reserva', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2019, purchasePrice:9.5, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:308, name:'Casa Das Flores Grande Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2014, purchasePrice:20.0, personalRating:4.0, vivinoRating:4.5, quantity:0, photo:null, notes:''},
  {id:309, name:'Quinta Do Gradil Tannat', type:'Tinto', country:'Portugal', region:'Lisboa', year:2018, purchasePrice:10.0, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:310, name:'Casa Do Canto Reserva', type:'Tinto', country:'Portugal', region:'Bairrada', year:2018, purchasePrice:9.5, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:311, name:'Blandy\'S Madeira Malmsey', type:'Madeira', country:'Portugal', region:'Madeira', year:2016, purchasePrice:11.0, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:312, name:'Quinta Vale D. Maria Vinhas Do Sabor', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:18.0, personalRating:3.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:313, name:'Já Te Disse', type:'Rosé', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:33.0, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:314, name:'Dialectus', type:'Tinto', country:'Portugal', region:'Alentejo', year:2020, purchasePrice:0.0, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:315, name:'Iter', type:'Branco', country:'Portugal', region:'Douro', year:2021, purchasePrice:10.9, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:316, name:'Marquês De Marialva Reserva Arinto', type:'Branco', country:'Portugal', region:'Bairrada', year:2021, purchasePrice:7.7, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:317, name:'Quinta Da Badula Reserva', type:'Branco', country:'Portugal', region:'Lisboa', year:2018, purchasePrice:9.0, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:318, name:'Conde D\' Ervideira Vinho Da Água', type:'Branco', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:14.7, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:319, name:'Quinta Nova Reserva Blanc De Noir', type:'Branco', country:'Portugal', region:'Douro', year:2022, purchasePrice:14.7, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:320, name:'Quinta Da Romaneira Reserva', type:'Branco', country:'Portugal', region:'Douro', year:2021, purchasePrice:11.9, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:321, name:'Arrepiado Velho', type:'Branco', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:8.9, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:322, name:'Ervideira Invisível', type:'Branco', country:'Portugal', region:'Alentejo', year:2022, purchasePrice:10.0, personalRating:4.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:323, name:'Chinado', type:'Branco', country:'Portugal', region:'Alcobaça', year:2021, purchasePrice:13.5, personalRating:4.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:324, name:'Maria Gins Reserva Vinhas Velhas', type:'Branco', country:'Portugal', region:'Trás-os-Montes', year:2021, purchasePrice:7.0, personalRating:4.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:325, name:'Les Darons By Jeff Carrel', type:'Tinto', country:'França', region:'Languedoc', year:2019, purchasePrice:7.5, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:326, name:'Taboadella Alfrocheiro Reserva', type:'Tinto', country:'Portugal', region:'Dão', year:2018, purchasePrice:13.0, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:327, name:'Taboadella Jaen Reserva', type:'Tinto', country:'Portugal', region:'Dão', year:2018, purchasePrice:12.95, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:328, name:'Estima', type:'Branco', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:0.0, personalRating:5.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:329, name:'Dez Tostões', type:'Branco', country:'Portugal', region:'Alentejo', year:2022, purchasePrice:10.85, personalRating:5.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:330, name:'Canto Do Marquês', type:'Branco', country:'Portugal', region:'Tejo', year:2021, purchasePrice:6.0, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:331, name:'Quinta Do Sobreiró De Cima Reserva Magnum', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2019, purchasePrice:17.6, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:332, name:'Quinta Do Sobreiró De Cima Reserva Double Magnum', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2019, purchasePrice:38.5, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:333, name:'Adega Mãe Dory', type:'Branco', country:'Portugal', region:'Lisboa', year:2022, purchasePrice:4.0, personalRating:3.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:334, name:'João Pato Duckman Kite Duck', type:'Branco', country:'Portugal', region:'Bairrada', year:2022, purchasePrice:11.75, personalRating:3.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:335, name:'João Pato Duckman', type:'Branco', country:'Portugal', region:'Bairrada', year:2022, purchasePrice:7.65, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:336, name:'João Pato Duckman Nerd Duck', type:'Tinto', country:'Portugal', region:'Bairrada', year:2021, purchasePrice:11.75, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:337, name:'Aquilo', type:'Branco', country:'Portugal', region:'Alentejo', year:2022, purchasePrice:0.0, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:338, name:'Já Te Disse', type:'Branco', country:'Portugal', region:'Alentejo', year:2020, purchasePrice:39.5, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:339, name:'Quinta Do Salvante Grande Reserva', type:'Branco', country:'Portugal', region:'Trás-os-Montes', year:2019, purchasePrice:16.0, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:340, name:'Herdade Papa Leite C50', type:'Branco', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:10.0, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:341, name:'Pingo Doce Biológico', type:'Branco', country:'Portugal', region:'Beira Interior', year:2022, purchasePrice:4.5, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:342, name:'Vinha Do Rosário Alvarinho', type:'Branco', country:'Portugal', region:'Península de Setúbal', year:2022, purchasePrice:2.99, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:343, name:'Vinha Do Rosário Viosinho', type:'Branco', country:'Portugal', region:'Península de Setúbal', year:2022, purchasePrice:2.99, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:344, name:'Quinta Dos Termos', type:'Tinto', country:'Portugal', region:'Beira Interior', year:2020, purchasePrice:4.5, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:345, name:'Vinhas De Xisto Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2020, purchasePrice:5.0, personalRating:3.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:346, name:'Quinta Dos Castelares Vinhas A Norte', type:'Branco', country:'Portugal', region:'Douro', year:2022, purchasePrice:9.5, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:347, name:'Quinta Do Sobreiró De Cima Reserva', type:'Branco', country:'Portugal', region:'Trás-os-Montes', year:2022, purchasePrice:6.5, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:348, name:'Xisto Ilimitado', type:'Branco', country:'Portugal', region:'Douro', year:2021, purchasePrice:12.5, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:349, name:'Quinta Da Fata Reserva Encruzado', type:'Branco', country:'Portugal', region:'Dão', year:2022, purchasePrice:11.95, personalRating:5.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:350, name:'Ventozelo Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:10.0, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:351, name:'Casa Relvas Sauvignon Blanc', type:'Branco', country:'Portugal', region:'Alentejo', year:2022, purchasePrice:6.1, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:352, name:'Anel By Proibído', type:'Tinto', country:'Portugal', region:'Douro', year:2021, purchasePrice:7.9, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:353, name:'Quinta Do Sobreiró De Cima Gewurztraminer', type:'Branco', country:'Portugal', region:'Trás-os-Montes', year:2021, purchasePrice:8.5, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:354, name:'Herdade Paço Do Conde Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:12.15, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:355, name:'Flôr Do Tua Superior 17', type:'Tinto', country:'Portugal', region:'Douro', year:2020, purchasePrice:15.0, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:356, name:'Quinta De Lemos Dona Louise', type:'Tinto', country:'Portugal', region:'Dão', year:2013, purchasePrice:11.9, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:357, name:'Conde D\' Ervideira Vinho Da Água', type:'Tinto', country:'Portugal', region:'Alentejo', year:2020, purchasePrice:15.9, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:358, name:'Monte Da Peceguina', type:'Tinto', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:12.95, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:359, name:'Luís Pato Vinhas Velhas', type:'Tinto', country:'Portugal', region:'Bairrada', year:2014, purchasePrice:15.3, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:360, name:'Quinta Da Costa Das Aguaneiras', type:'Tinto', country:'Portugal', region:'Douro', year:2018, purchasePrice:21.0, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:361, name:'Vinha Do Torrão Reserva', type:'Tinto', country:'Portugal', region:'Setúbal', year:2021, purchasePrice:4.0, personalRating:3.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:362, name:'Escondido', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:0.0, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:363, name:'Piorro Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2013, purchasePrice:11.5, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:364, name:'Titan Of Douro Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2020, purchasePrice:10.0, personalRating:3.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:365, name:'Oxalá Pet-Nat', type:'Branco', country:'Portugal', region:'Alentejo', year:2023, purchasePrice:0.0, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:366, name:'Quintas De Borba Grande Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2016, purchasePrice:13.0, personalRating:4.0, vivinoRating:4.4, quantity:0, photo:null, notes:''},
  {id:367, name:'Pêra Manca', type:'Branco', country:'Portugal', region:'Alentejo', year:2020, purchasePrice:49.5, personalRating:5.0, vivinoRating:4.5, quantity:0, photo:null, notes:''},
  {id:368, name:'Tapada Do Chaves', type:'Tinto', country:'Portugal', region:'Alentejo', year:2014, purchasePrice:21.0, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:369, name:'Videiras Reserva Particular', type:'Tinto', country:'Portugal', region:'Bairrada', year:2020, purchasePrice:2.5, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:370, name:'Uivo Tinta Francisca', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:17.2, personalRating:3.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:371, name:'Tarefa', type:'Branco', country:'Portugal', region:'Alentejo', year:2020, purchasePrice:11.7, personalRating:5.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:372, name:'Tarefa', type:'Tinto', country:'Portugal', region:'Alentejo', year:2022, purchasePrice:13.0, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:373, name:'Risu Do Isaac', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:16.85, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:374, name:'Quinta Do Rol Grande Reserva Blanc De Blancs', type:'Espumante', country:'Portugal', region:'Lisboa', year:2013, purchasePrice:15.5, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:375, name:'Puro Touriga-Chã', type:'Tinto', country:'Portugal', region:'Douro', year:2020, purchasePrice:15.8, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:376, name:'Monte Da Bonança Reserva', type:'Branco', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:11.0, personalRating:4.0, vivinoRating:4.4, quantity:0, photo:null, notes:''},
  {id:377, name:'Cartuxa Colheita', type:'Branco', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:11.0, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:378, name:'Quinta De Arcossó Grande Reserva', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2016, purchasePrice:16.5, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:379, name:'Cadão', type:'Tinto', country:'Portugal', region:'Douro', year:2020, purchasePrice:3.5, personalRating:3.0, vivinoRating:3.5, quantity:0, photo:null, notes:''},
  {id:380, name:'Granduc Rioja', type:'Tinto', country:'Espanha', region:'Rioja', year:1985, purchasePrice:0.0, personalRating:0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:381, name:'Caves Monte Alto Garrafeira', type:'Tinto', country:'Portugal', region:'Bairrada', year:1980, purchasePrice:0.0, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:382, name:'Quinta Da Fata Encruzado', type:'Branco', country:'Portugal', region:'Dão', year:2022, purchasePrice:8.0, personalRating:5.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:383, name:'Marquês De Marialva Grande Reserva', type:'Branco', country:'Portugal', region:'Bairrada', year:2015, purchasePrice:24.8, personalRating:5.0, vivinoRating:4.4, quantity:0, photo:null, notes:''},
  {id:384, name:'Casa De Saima Reserva', type:'Tinto', country:'Portugal', region:'Bairrada', year:1991, purchasePrice:0.0, personalRating:5.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:385, name:'Quinta Nova Magnum', type:'Tinto', country:'Portugal', region:'Douro', year:2015, purchasePrice:19.0, personalRating:5.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:386, name:'Bajancas Grande Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2020, purchasePrice:13.0, personalRating:4.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:387, name:'Casa Relvas Tinta Miúda', type:'Tinto', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:9.9, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:388, name:'Bella Elegance Pinot Noir', type:'Tinto', country:'Portugal', region:'Dão', year:2021, purchasePrice:15.2, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:389, name:'Casa Relvas Aragonez', type:'Tinto', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:9.9, personalRating:3.0, vivinoRating:3.6, quantity:0, photo:null, notes:''},
  {id:390, name:'Casa Relvas Rabo De Ovelha', type:'Branco', country:'Portugal', region:'Alentejo', year:2023, purchasePrice:7.5, personalRating:3.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:391, name:'Herdade Da Rocha Alicante Bouschet Premium', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:15.0, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:392, name:'Conde D\'Ervideira Reserva', type:'Branco', country:'Portugal', region:'Alentejo', year:2022, purchasePrice:10.0, personalRating:4.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:393, name:'Rvc Doc', type:'Branco', country:'Portugal', region:'Douro', year:2020, purchasePrice:7.35, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:394, name:'Caves São João Reserva', type:'Tinto', country:'Portugal', region:'Bairrada', year:1982, purchasePrice:0.0, personalRating:4.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:395, name:'Dona Berta Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:15.0, personalRating:4.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:396, name:'Pousio Alicante Bouschet', type:'Tinto', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:16.5, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:397, name:'Rvc Reserva', type:'Branco', country:'Portugal', region:'Douro', year:2020, purchasePrice:9.35, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:398, name:'Rvc Reserva Especial', type:'Tinto', country:'Portugal', region:'Douro', year:2014, purchasePrice:27.7, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:399, name:'Vértice Grande Reserva', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2018, purchasePrice:19.5, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:400, name:'Rvc Doc', type:'Tinto', country:'Portugal', region:'Douro', year:2022, purchasePrice:7.35, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:401, name:'Quinta Do Sobreiró De Cima Vinha De Rio Torto', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2012, purchasePrice:16.9, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:402, name:'Quinta Do Sobreiró De Cima Grande Reserva', type:'Branco', country:'Portugal', region:'Trás-os-Montes', year:2022, purchasePrice:11.5, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:403, name:'Nouveau Ciclo', type:'Tinto', country:'Portugal', region:'Alentejo', year:2022, purchasePrice:15.0, personalRating:5.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:404, name:'Deluto', type:'Tinto', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:13.0, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:405, name:'Beyra Reserva Quartz', type:'Branco', country:'Portugal', region:'Beira Interior', year:2022, purchasePrice:6.95, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:406, name:'Chão Da Quinta Signature', type:'Tinto', country:'Portugal', region:'Dão', year:2016, purchasePrice:30.0, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:407, name:'Quinta Do Poço Do Lobo Reserva', type:'Branco', country:'Portugal', region:'Bairrada', year:2019, purchasePrice:15.8, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:408, name:'Casa De Saima Pinot Noir', type:'Tinto', country:'Portugal', region:'Bairrada', year:2019, purchasePrice:9.0, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:409, name:'Beyra Fonte Cal', type:'Branco', country:'Portugal', region:'Beira Interior', year:2021, purchasePrice:9.85, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:410, name:'Marquês De Tomar Superior', type:'Tinto', country:'Portugal', region:'Tejo', year:2021, purchasePrice:7.0, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:411, name:'Marquês De Tomar Superior', type:'Branco', country:'Portugal', region:'Tejo', year:2022, purchasePrice:7.0, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:412, name:'Alma Da Vinha', type:'Branco', country:'Portugal', region:'Douro', year:2022, purchasePrice:3.4, personalRating:3.0, vivinoRating:3.4, quantity:0, photo:null, notes:''},
  {id:413, name:'Marquês De Tomar Reserva', type:'Branco', country:'Portugal', region:'Tejo', year:2022, purchasePrice:8.95, personalRating:4.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:414, name:'Sanguinhal Chardonnay Arinto', type:'Branco', country:'Portugal', region:'Lisboa', year:2021, purchasePrice:7.0, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:415, name:'Grainha Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2022, purchasePrice:13.0, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:416, name:'Quinta Do Sobreiró De Cima Reserva', type:'Branco', country:'Portugal', region:'Trás-os-Montes', year:2023, purchasePrice:6.9, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:417, name:'Rosenhof Pinot Noir', type:'Branco', country:'França', region:'Alsácia', year:2022, purchasePrice:8.0, personalRating:3.0, vivinoRating:3.6, quantity:0, photo:null, notes:''},
  {id:418, name:'Rumo', type:'Branco', country:'Portugal', region:'Alentejo', year:2023, purchasePrice:9.9, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:419, name:'Rumo', type:'Tinto', country:'Portugal', region:'Alentejo', year:2022, purchasePrice:9.9, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:420, name:'Xico Garcia', type:'Tinto', country:'Portugal', region:'Alentejo', year:2022, purchasePrice:6.0, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:421, name:'Cave D\' Augustin Floren Gewurztraminer', type:'Branco', country:'França', region:'Alsácia', year:2021, purchasePrice:8.0, personalRating:3.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:422, name:'Maison Viallet Apremont', type:'Branco', country:'França', region:'Savoie', year:2022, purchasePrice:0.0, personalRating:3.0, vivinoRating:3.0, quantity:0, photo:null, notes:''},
  {id:423, name:'Cadão', type:'Tinto', country:'Portugal', region:'Douro', year:2022, purchasePrice:3.5, personalRating:3.0, vivinoRating:3.5, quantity:0, photo:null, notes:''},
  {id:424, name:'Jca Mal Acompanhado', type:'Tinto', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:0.0, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:425, name:'Videiras Bical E Maria Gomes', type:'Branco', country:'Portugal', region:'Bairrada', year:2023, purchasePrice:2.0, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:426, name:'Rumo Lumina', type:'Branco', country:'Portugal', region:'Alentejo', year:2022, purchasePrice:24.0, personalRating:5.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:427, name:'Milagres', type:'Verde', country:'Portugal', region:'Monção e Melgaço', year:2019, purchasePrice:16.05, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:428, name:'Videiras Baga Vinhas Velhas', type:'Tinto', country:'Portugal', region:'Bairrada', year:2019, purchasePrice:7.0, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:429, name:'Videiras Maria Gomes', type:'Branco', country:'Portugal', region:'Bairrada', year:2023, purchasePrice:2.5, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:430, name:'Henri Ehrhart Réserve Particulière Pinot Gris', type:'Branco', country:'França', region:'Alsácia', year:2022, purchasePrice:9.0, personalRating:3.0, vivinoRating:3.6, quantity:0, photo:null, notes:''},
  {id:431, name:'Campolargo Calda Bordaleza', type:'Tinto', country:'Portugal', region:'Bairrada', year:2019, purchasePrice:28.0, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:432, name:'Monte Da Bonança Special Edition Roupeiro', type:'Branco', country:'Portugal', region:'Alentejo', year:2022, purchasePrice:11.0, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:433, name:'Quinta Dos Castelares Superior', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:10.0, personalRating:4.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:434, name:'Quinta Nova Reserva Touriga Nacional', type:'Tinto', country:'Portugal', region:'Douro', year:2021, purchasePrice:16.0, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:435, name:'Espada Cinta Reserva', type:'Branco', country:'Portugal', region:'Douro', year:2023, purchasePrice:5.0, personalRating:4.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:436, name:'Rosário Viosinho', type:'Branco', country:'Portugal', region:'Setúbal', year:2023, purchasePrice:3.0, personalRating:4.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:437, name:'Rosário Verdelho', type:'Branco', country:'Portugal', region:'Setúbal', year:2023, purchasePrice:3.0, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:438, name:'Quinta Do Carmo', type:'Tinto', country:'Portugal', region:'Alentejo', year:2016, purchasePrice:16.0, personalRating:0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:439, name:'Les Belles Roches Bourgogne Aligoté', type:'Branco', country:'França', region:'Bourgogne', year:2021, purchasePrice:10.0, personalRating:3.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:440, name:'Azulera Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:21.7, personalRating:5.0, vivinoRating:4.6, quantity:0, photo:null, notes:''},
  {id:441, name:'Herdade Do Lousial Curtimenta', type:'Branco', country:'Portugal', region:'Beira Interior', year:2022, purchasePrice:16.0, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:442, name:'Alto Da Lousa Reserva', type:'Branco', country:'Portugal', region:'Beira Interior', year:2020, purchasePrice:9.0, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:443, name:'Ventozelo Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2021, purchasePrice:10.0, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:444, name:'Carvalho Pires Touriga Nacional', type:'Tinto', country:'Portugal', region:'Dão', year:2021, purchasePrice:4.5, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:445, name:'Ribeiro Santo Grande Escolha', type:'Tinto', country:'Portugal', region:'Dão', year:2018, purchasePrice:12.0, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:446, name:'Monsaraz Gold Edition', type:'Tinto', country:'Portugal', region:'Alentejo', year:2017, purchasePrice:16.0, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:447, name:'Espada Cinta Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:5.5, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:448, name:'Carvalho Pires Encruzado Reserva', type:'Branco', country:'Portugal', region:'Dão', year:2023, purchasePrice:4.5, personalRating:4.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:449, name:'Casa De Saima Garrafeira Baga', type:'Tinto', country:'Portugal', region:'Bairrada', year:2016, purchasePrice:50.0, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:450, name:'Vieilles Vignes Juliénas', type:'Tinto', country:'França', region:'Juliénas', year:2023, purchasePrice:8.5, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:451, name:'Quinta De La Rosa', type:'Tinto', country:'Portugal', region:'Douro', year:2020, purchasePrice:11.0, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:452, name:'Toutinegra Moon Harvest', type:'Tinto', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:6.0, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:453, name:'Quinta Do Crasto Reserva Vinhas Velhas', type:'Tinto', country:'Portugal', region:'Douro', year:2021, purchasePrice:28.25, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:454, name:'Esteva Magnum', type:'Tinto', country:'Portugal', region:'Douro', year:2018, purchasePrice:10.0, personalRating:3.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:455, name:'Quinta Do Sobreiró De Cima Reserva Cabernet', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2019, purchasePrice:16.15, personalRating:5.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:456, name:'Les 3 Lys Crozes Hermitage', type:'Tinto', country:'França', region:'Crozes-Hermitage', year:2022, purchasePrice:8.0, personalRating:4.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:457, name:'Estação', type:'Tinto', country:'Portugal', region:'Douro', year:2021, purchasePrice:5.25, personalRating:3.0, vivinoRating:3.3, quantity:0, photo:null, notes:''},
  {id:458, name:'Ardila', type:'Tinto', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:3.95, personalRating:4.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:459, name:'Vinha Do Monte', type:'Tinto', country:'Portugal', region:'Alentejo', year:2022, purchasePrice:3.85, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:460, name:'Casa Das Flores Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2020, purchasePrice:6.0, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:461, name:'La Zorra Original', type:'Tinto', country:'Espanha', region:'Salamanca', year:2020, purchasePrice:15.0, personalRating:4.0, vivinoRating:3.6, quantity:0, photo:null, notes:''},
  {id:462, name:'La Cave D\'Augustin Florent Bourgueil', type:'Tinto', country:'França', region:'Bourgueil', year:2023, purchasePrice:5.5, personalRating:3.0, vivinoRating:3.5, quantity:0, photo:null, notes:''},
  {id:463, name:'Papo Amarelo Grande Escolha', type:'Tinto', country:'Portugal', region:'Setúbal', year:2021, purchasePrice:4.4, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:464, name:'Pga Reserva', type:'Tinto', country:'Portugal', region:'Bairrada', year:2021, purchasePrice:6.8, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:465, name:'Linhas Tortas Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2021, purchasePrice:3.0, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:466, name:'Bunker', type:'Tinto', country:'Portugal', region:'Bairrada', year:2018, purchasePrice:0.0, personalRating:0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:467, name:'Quanta Terra Grande Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2020, purchasePrice:21.0, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:468, name:'Terra Montana Edição Limitada', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2020, purchasePrice:21.7, personalRating:5.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:469, name:'Frenético', type:'Tinto', country:'Portugal', region:'Dão', year:2019, purchasePrice:11.5, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:470, name:'Pipa Rosa 3 Castas', type:'Tinto', country:'Portugal', region:'Beira Interior', year:2022, purchasePrice:3.9, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:471, name:'Ilustre', type:'Tinto', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:9.4, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:472, name:'Quinta Do Banco Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:12.7, personalRating:4.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:473, name:'Quinta Nova', type:'Tinto', country:'Portugal', region:'Douro', year:2022, purchasePrice:10.0, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:474, name:'Manolito', type:'Tinto', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:9.6, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:475, name:'Souvall Grande Reserva', type:'Tinto', country:'Portugal', region:'Beira Interior', year:2021, purchasePrice:9.5, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:476, name:'Titan Of Douro Vale Dos Mil', type:'Tinto', country:'Portugal', region:'Douro', year:2018, purchasePrice:30.0, personalRating:5.0, vivinoRating:4.5, quantity:0, photo:null, notes:''},
  {id:477, name:'Monte Meão Casa Das Máquinas', type:'Tinto', country:'Portugal', region:'Douro', year:2021, purchasePrice:31.0, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:478, name:'Castas Escondidas', type:'Tinto', country:'Portugal', region:'Douro', year:2018, purchasePrice:28.0, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:479, name:'Quinta Dos Castelares Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:14.0, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:480, name:'Barca Do Inferno Reserva', type:'Tinto', country:'Portugal', region:'Lisboa', year:2018, purchasePrice:9.0, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:481, name:'Souvall Seara', type:'Branco', country:'Portugal', region:'Beira Interior', year:2022, purchasePrice:8.6, personalRating:4.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:482, name:'Cem Reis', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:50.0, personalRating:5.0, vivinoRating:4.7, quantity:0, photo:null, notes:''},
  {id:483, name:'Quinta Do Banco Reserva', type:'Branco', country:'Portugal', region:'Douro', year:2022, purchasePrice:12.7, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:484, name:'Dona Maria Grande Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2014, purchasePrice:28.0, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:485, name:'Escondido Magnum', type:'Tinto', country:'Portugal', region:'Alentejo', year:2018, purchasePrice:0.0, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:486, name:'Munda Touriga Nacional', type:'Tinto', country:'Portugal', region:'Dão', year:2015, purchasePrice:23.5, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:487, name:'Principal Grande Reserva', type:'Tinto', country:'Portugal', region:'Bairrada', year:2011, purchasePrice:97.1, personalRating:5.0, vivinoRating:4.5, quantity:0, photo:null, notes:''},
  {id:488, name:'Quinta Da Lagoa Velha Cuvée', type:'Espumante', country:'Portugal', region:'Bairrada', year:2015, purchasePrice:29.5, personalRating:5.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:489, name:'Quinta Dos Termos O Testemunho', type:'Tinto', country:'Portugal', region:'Beira Interior', year:2015, purchasePrice:22.5, personalRating:5.0, vivinoRating:4.4, quantity:0, photo:null, notes:''},
  {id:490, name:'Souvall Villamayor', type:'Branco', country:'Portugal', region:'Beira Interior', year:2022, purchasePrice:8.6, personalRating:0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:491, name:'Todos Reserva', type:'Branco', country:'Portugal', region:'Bairrada', year:2022, purchasePrice:5.95, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:492, name:'Quinta Do Sobreiró De Cima Gewurstraminer Reserva', type:'Branco', country:'Portugal', region:'Trás-os-Montes', year:2021, purchasePrice:15.15, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:493, name:'Valle Pradinhos Reserva', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2018, purchasePrice:10.0, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:494, name:'Ingónito', type:'Tinto', country:'Portugal', region:'Alentejo', year:2020, purchasePrice:90.0, personalRating:0, vivinoRating:4.4, quantity:0, photo:null, notes:''},
  {id:495, name:'Silica Super Reserva Blanc De Noirs', type:'Espumante', country:'Portugal', region:'Bairrada', year:2021, purchasePrice:10.7, personalRating:4.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:496, name:'Primavera Baga Merlot', type:'Tinto', country:'Portugal', region:'Bairrada', year:2019, purchasePrice:5.0, personalRating:3.0, vivinoRating:3.6, quantity:0, photo:null, notes:''},
  {id:497, name:'Pipa Rosa Reserva Siria', type:'Branco', country:'Portugal', region:'Beira Interior', year:2023, purchasePrice:5.0, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:498, name:'Vale De Vila Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2023, purchasePrice:6.8, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:499, name:'Pipa Rosa Reserva Rufete', type:'Tinto', country:'Portugal', region:'Beira Interior', year:2022, purchasePrice:5.0, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:500, name:'Vale De Vila Grande Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2021, purchasePrice:11.0, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:501, name:'Casa Das Flores Grande Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:21.0, personalRating:4.0, vivinoRating:4.4, quantity:0, photo:null, notes:''},
  {id:502, name:'Pacheca Reserva', type:'Branco', country:'Portugal', region:'Douro', year:2022, purchasePrice:11.0, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:503, name:'Rosa Da Mata Alfrocheiro', type:'Tinto', country:'Portugal', region:'Dão', year:2018, purchasePrice:16.5, personalRating:5.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:504, name:'100 Hectares Sousão', type:'Tinto', country:'Portugal', region:'Douro', year:2018, purchasePrice:15.0, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:505, name:'Mainova', type:'Tinto', country:'Portugal', region:'Alentejo', year:2019, purchasePrice:12.5, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:506, name:'Villarielli', type:'Branco', country:'Itália', region:'Pecorino', year:2023, purchasePrice:3.6, personalRating:0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:507, name:'Todos Reserva', type:'Tinto', country:'Portugal', region:'Bairrada', year:2021, purchasePrice:5.95, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:508, name:'Bella Elegance Encruzado', type:'Branco', country:'Portugal', region:'Dão', year:2022, purchasePrice:11.2, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:509, name:'Casa Ermelinda Freitas Bocage', type:'Tinto', country:'Portugal', region:'Setúbal', year:2023, purchasePrice:3.5, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:510, name:'Segredos De São Miguel Grande Escolha', type:'Tinto', country:'Portugal', region:'Alentejo', year:2023, purchasePrice:5.0, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:511, name:'Xutos & Pontapés 88 Magnum', type:'Tinto', country:'Portugal', region:'Alentejo', year:2022, purchasePrice:44.0, personalRating:0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:512, name:'Aleixo Grande Reserva', type:'Branco', country:'Portugal', region:'Bairrada', year:2023, purchasePrice:12.0, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:513, name:'Aleixo Reserva', type:'Tinto', country:'Portugal', region:'Bairrada', year:2020, purchasePrice:9.0, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:514, name:'Luís Pato Vinha Pan', type:'Espumante', country:'Portugal', region:'Bairrada', year:2020, purchasePrice:16.5, personalRating:5.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:515, name:'Vinha Maria Ana', type:'Branco', country:'Portugal', region:'Alentejo', year:2023, purchasePrice:1.8, personalRating:4.0, vivinoRating:3.3, quantity:0, photo:null, notes:''},
  {id:516, name:'Pingo Doce Beira Interior Biológico', type:'Branco', country:'Portugal', region:'Beira Interior', year:2022, purchasePrice:3.0, personalRating:3.0, vivinoRating:3.4, quantity:0, photo:null, notes:''},
  {id:517, name:'Traslascuestas Crianza', type:'Tinto', country:'Espanha', region:'Ribera del Duero', year:2021, purchasePrice:15.0, personalRating:5.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:518, name:'Giz Vinhas Velhas', type:'Tinto', country:'Portugal', region:'Bairrada', year:2015, purchasePrice:23.5, personalRating:5.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:519, name:'Bunker', type:'Tinto', country:'Portugal', region:'Bairrada', year:2021, purchasePrice:0.0, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:520, name:'Quinta Da Fata Encruzado Cru', type:'Branco', country:'Portugal', region:'Dão', year:2021, purchasePrice:12.5, personalRating:5.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:521, name:'Quinta Do Valbom', type:'Tinto', country:'Portugal', region:'Douro', year:2015, purchasePrice:14.6, personalRating:5.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:522, name:'Beta', type:'Branco', country:'Portugal', region:'Bairrada', year:2024, purchasePrice:12.0, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:523, name:'Quinta Da Alorna Arinto Chardonnay Reserva', type:'Branco', country:'Portugal', region:'Tejo', year:2017, purchasePrice:8.0, personalRating:0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:524, name:'Quinta Do Sobreiró De Cima Vergueiro', type:'Rosé', country:'Portugal', region:'Trás-os-Montes', year:2021, purchasePrice:8.5, personalRating:5.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:525, name:'Maria Gins Grande Reserva', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2019, purchasePrice:9.5, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:526, name:'Já Te Disse Alicante Bouschet', type:'Tinto', country:'Portugal', region:'Alentejo', year:2020, purchasePrice:98.5, personalRating:5.0, vivinoRating:4.6, quantity:0, photo:null, notes:''},
  {id:527, name:'Quinta Do Cardo Vinha Do Pombal', type:'Tinto', country:'Portugal', region:'Beira Interior', year:2021, purchasePrice:14.7, personalRating:5.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:528, name:'Menin Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:16.8, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:529, name:'Quinta Dos Termos Colheita', type:'Branco', country:'Portugal', region:'Beira Interior', year:2023, purchasePrice:3.7, personalRating:4.0, vivinoRating:3.6, quantity:0, photo:null, notes:''},
  {id:530, name:'Quinta Da Fata Reserva', type:'Tinto', country:'Portugal', region:'Dão', year:2017, purchasePrice:7.0, personalRating:5.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:531, name:'Bucellas Arinto', type:'Branco', country:'Portugal', region:'Bucelas', year:2023, purchasePrice:5.0, personalRating:3.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:532, name:'Casa De Saima Vinhas Velhas', type:'Branco', country:'Portugal', region:'Bairrada', year:2022, purchasePrice:7.95, personalRating:5.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:533, name:'Pipa Rosa Colheita Rose', type:'Rosé', country:'Portugal', region:'Beira Interior', year:2023, purchasePrice:3.35, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:534, name:'Alto Do Joa', type:'Branco', country:'Portugal', region:'Trás-os-Montes', year:2019, purchasePrice:25.9, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:535, name:'Todos Colheita Rose', type:'Rosé', country:'Portugal', region:'Bairrada', year:2023, purchasePrice:3.9, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:536, name:'Pipa Rosa Colheita Branco', type:'Branco', country:'Portugal', region:'Beira Interior', year:2023, purchasePrice:3.35, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:537, name:'Castelo Do Rei Reserva', type:'Branco', country:'Portugal', region:'Alentejo', year:2024, purchasePrice:2.9, personalRating:2.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:538, name:'Primavera Baga', type:'Tinto', country:'Portugal', region:'Bairrada', year:2020, purchasePrice:9.5, personalRating:3.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:539, name:'Todos Colheita Branco', type:'Branco', country:'Portugal', region:'Bairrada', year:2023, purchasePrice:3.9, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:540, name:'Pousada Do Corvo Reserva', type:'Branco', country:'Portugal', region:'Alentejo', year:2023, purchasePrice:2.6, personalRating:3.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:541, name:'Terra Reserva Encruzado', type:'Branco', country:'Portugal', region:'Dão', year:2024, purchasePrice:6.75, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:542, name:'Vinha Do Rosário Viosinho', type:'Branco', country:'Portugal', region:'Setúbal', year:2024, purchasePrice:2.69, personalRating:4.0, vivinoRating:3.7, quantity:0, photo:null, notes:''},
  {id:543, name:'Júlia Florista Premium', type:'Branco', country:'Portugal', region:'Lisboa', year:2023, purchasePrice:2.99, personalRating:3.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:544, name:'Naco Reserva', type:'Branco', country:'Portugal', region:'Dão', year:2023, purchasePrice:3.99, personalRating:3.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:545, name:'Terra Colheita', type:'Branco', country:'Portugal', region:'Dão', year:2024, purchasePrice:4.5, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:546, name:'Valle Pradinhos Touriga Nacional', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2019, purchasePrice:32.8, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:547, name:'Beta', type:'Tinto', country:'Portugal', region:'Bairrada', year:2020, purchasePrice:12.0, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:548, name:'Casa José Pedro Reserva', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2023, purchasePrice:7.75, personalRating:5.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:549, name:'Aequinoctium Autumnus Grande Reserva', type:'Tinto', country:'Portugal', region:'Bairrada', year:2015, purchasePrice:25.85, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:550, name:'Bom Caminho', type:'Tinto', country:'Portugal', region:'Bairrada', year:2011, purchasePrice:9.0, personalRating:4.0, vivinoRating:3.5, quantity:0, photo:null, notes:''},
  {id:551, name:'Vinha Maria Ana', type:'Tinto', country:'Portugal', region:'Alentejo', year:2024, purchasePrice:2.0, personalRating:4.0, vivinoRating:3.3, quantity:0, photo:null, notes:''},
  {id:552, name:'Grande Rota Reserva', type:'Tinto', country:'Portugal', region:'Dão', year:2020, purchasePrice:18.5, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:553, name:'Bom Juiz Reserva', type:'Tinto', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:7.0, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:554, name:'Quinta De São Bernardo Carlota', type:'Tinto', country:'Portugal', region:'Douro', year:2017, purchasePrice:19.5, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:555, name:'Dona Graça Grande Reserva Vinhas Velhas', type:'Tinto', country:'Portugal', region:'Douro', year:2019, purchasePrice:21.0, personalRating:4.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:556, name:'Flor Do Tua Grande Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2021, purchasePrice:13.5, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:557, name:'Vinhas Improváveis Intro', type:'Tinto', country:'Portugal', region:'Douro', year:2023, purchasePrice:8.5, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:558, name:'Quinta De São Bernardo Grande Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2013, purchasePrice:37.6, personalRating:5.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:559, name:'Quinta Do Encontro White Blend', type:'Branco', country:'Portugal', region:'Bairrada', year:2023, purchasePrice:5.5, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:560, name:'Romano Cunha', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2013, purchasePrice:35.0, personalRating:5.0, vivinoRating:4.5, quantity:0, photo:null, notes:''},
  {id:561, name:'Casa Da Esteira Vinhas Velhas', type:'Branco', country:'Portugal', region:'Douro', year:2019, purchasePrice:17.0, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:562, name:'A Púcara', type:'Tinto', country:'Portugal', region:'Dão', year:2023, purchasePrice:7.0, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:563, name:'Alto Do Joa', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2016, purchasePrice:25.0, personalRating:5.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:564, name:'Lobo De Vasconcellos Vinha Do Norte Matriz', type:'Tinto', country:'Portugal', region:'Douro', year:2020, purchasePrice:28.0, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:565, name:'Quinta Da Oliveirinha Grande Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2021, purchasePrice:22.2, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:566, name:'Quinta Da Romaneira Dona Clara', type:'Tinto', country:'Portugal', region:'Douro', year:2018, purchasePrice:17.5, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:567, name:'Quinta De São Bernardo Reserva De Família', type:'Tinto', country:'Portugal', region:'Douro', year:2015, purchasePrice:75.0, personalRating:5.0, vivinoRating:4.7, quantity:0, photo:null, notes:''},
  {id:568, name:'Casa De Saima Baga Tonel 10', type:'Tinto', country:'Portugal', region:'Bairrada', year:2020, purchasePrice:8.0, personalRating:4.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:569, name:'Convento Da Tomina', type:'Tinto', country:'Portugal', region:'Alentejo', year:2022, purchasePrice:11.5, personalRating:4.0, vivinoRating:4.2, quantity:0, photo:null, notes:''},
  {id:570, name:'Vale Do Rocim', type:'Branco', country:'Portugal', region:'Alentejo', year:2024, purchasePrice:8.4, personalRating:4.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:571, name:'Silica Super Reserva Blanc De Noirs', type:'Espumante', country:'Portugal', region:'Bairrada', year:2015, purchasePrice:11.85, personalRating:4.0, vivinoRating:3.8, quantity:0, photo:null, notes:''},
  {id:572, name:'Casa De Saima Baga Tonel 10', type:'Tinto', country:'Portugal', region:'Bairrada', year:2021, purchasePrice:8.0, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:573, name:'Quinta De Carvalhiços Touriga Nacional', type:'Tinto', country:'Portugal', region:'Dão', year:2022, purchasePrice:9.85, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:574, name:'Quinta Da Alameda De Santar Parcelas', type:'Tinto', country:'Portugal', region:'Dão', year:2017, purchasePrice:10.2, personalRating:4.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:575, name:'Vale De Vila Grande Reserva', type:'Tinto', country:'Portugal', region:'Douro', year:2022, purchasePrice:12.0, personalRating:5.0, vivinoRating:4.3, quantity:0, photo:null, notes:''},
  {id:576, name:'Quinta Do Sobreiró De Cima Grande Reserva', type:'Tinto', country:'Portugal', region:'Trás-os-Montes', year:2018, purchasePrice:11.5, personalRating:5.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:577, name:'Quinta Dos Aciprestes', type:'Tinto', country:'Portugal', region:'Douro', year:2022, purchasePrice:9.5, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:578, name:'Ea Syrah', type:'Tinto', country:'Portugal', region:'Alentejo', year:2024, purchasePrice:5.0, personalRating:0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
  {id:579, name:'Vadio', type:'Branco', country:'Portugal', region:'Bairrada', year:2022, purchasePrice:14.85, personalRating:4.0, vivinoRating:3.9, quantity:0, photo:null, notes:''},
  {id:580, name:'In Monte', type:'Tinto', country:'Portugal', region:'Alentejo', year:2021, purchasePrice:0.0, personalRating:4.0, vivinoRating:null, quantity:0, photo:null, notes:''},
  {id:581, name:'São Domingos Grande Escolha', type:'Tinto', country:'Portugal', region:'Bairrada', year:2015, purchasePrice:10.15, personalRating:4.0, vivinoRating:4.1, quantity:0, photo:null, notes:''},
  {id:582, name:'Vinha De Santa Maria Reserva Especial', type:'Tinto', country:'Portugal', region:'Dão', year:2017, purchasePrice:16.0, personalRating:5.0, vivinoRating:4.0, quantity:0, photo:null, notes:''},
]

const INIT_ENTRIES = []

const INIT_CONSUMPTIONS = [
  {id:1, wineId:71, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:2, wineId:72, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:3, wineId:73, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:4, wineId:74, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:5, wineId:75, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:6, wineId:76, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:7, wineId:77, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:8, wineId:78, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:9, wineId:79, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:10, wineId:80, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:11, wineId:81, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:12, wineId:82, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:13, wineId:83, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:14, wineId:84, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:15, wineId:85, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:16, wineId:86, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:17, wineId:87, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:18, wineId:88, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:19, wineId:89, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:20, wineId:90, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:21, wineId:91, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:22, wineId:92, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:23, wineId:93, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:24, wineId:94, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:25, wineId:95, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:26, wineId:96, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:27, wineId:97, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:28, wineId:98, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:29, wineId:99, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:30, wineId:100, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:31, wineId:101, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:32, wineId:102, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:33, wineId:103, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:34, wineId:104, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:35, wineId:105, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:36, wineId:106, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:37, wineId:107, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:38, wineId:108, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:39, wineId:109, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:40, wineId:110, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:41, wineId:111, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:42, wineId:32, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:43, wineId:112, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:44, wineId:113, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:45, wineId:114, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:46, wineId:115, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:47, wineId:116, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:48, wineId:117, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:49, wineId:118, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:50, wineId:119, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:51, wineId:120, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:52, wineId:121, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:53, wineId:122, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:54, wineId:123, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:55, wineId:124, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:56, wineId:125, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:57, wineId:126, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:58, wineId:127, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:59, wineId:128, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:60, wineId:129, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:61, wineId:130, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:62, wineId:131, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:63, wineId:132, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:64, wineId:133, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:65, wineId:134, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:66, wineId:135, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:67, wineId:136, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:68, wineId:137, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:69, wineId:138, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:70, wineId:139, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:71, wineId:140, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:72, wineId:141, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:73, wineId:142, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:74, wineId:143, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:75, wineId:144, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:76, wineId:145, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:77, wineId:146, date:'2024-01-01', quantity:1, rating:2.0, notes:''},
  {id:78, wineId:147, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:79, wineId:148, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:80, wineId:149, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:81, wineId:150, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:82, wineId:151, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:83, wineId:152, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:84, wineId:153, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:85, wineId:154, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:86, wineId:155, date:'2024-01-01', quantity:1, rating:2.0, notes:''},
  {id:87, wineId:156, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:88, wineId:157, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:89, wineId:158, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:90, wineId:159, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:91, wineId:160, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:92, wineId:161, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:93, wineId:162, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:94, wineId:163, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:95, wineId:164, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:96, wineId:165, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:97, wineId:166, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:98, wineId:167, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:99, wineId:168, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:100, wineId:64, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:101, wineId:169, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:102, wineId:170, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:103, wineId:171, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:104, wineId:172, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:105, wineId:173, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:106, wineId:174, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:107, wineId:175, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:108, wineId:176, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:109, wineId:177, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:110, wineId:178, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:111, wineId:179, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:112, wineId:180, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:113, wineId:181, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:114, wineId:182, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:115, wineId:183, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:116, wineId:184, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:117, wineId:185, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:118, wineId:186, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:119, wineId:187, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:120, wineId:188, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:121, wineId:189, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:122, wineId:190, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:123, wineId:191, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:124, wineId:192, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:125, wineId:193, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:126, wineId:194, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:127, wineId:195, date:'2024-01-01', quantity:1, rating:0, notes:''},
  {id:128, wineId:196, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:129, wineId:197, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:130, wineId:198, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:131, wineId:199, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:132, wineId:200, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:133, wineId:201, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:134, wineId:202, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:135, wineId:203, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:136, wineId:204, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:137, wineId:205, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:138, wineId:206, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:139, wineId:207, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:140, wineId:208, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:141, wineId:209, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:142, wineId:210, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:143, wineId:211, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:144, wineId:212, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:145, wineId:213, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:146, wineId:214, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:147, wineId:215, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:148, wineId:216, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:149, wineId:14, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:150, wineId:217, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:151, wineId:218, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:152, wineId:219, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:153, wineId:220, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:154, wineId:221, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:155, wineId:222, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:156, wineId:223, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:157, wineId:224, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:158, wineId:225, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:159, wineId:226, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:160, wineId:227, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:161, wineId:228, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:162, wineId:229, date:'2024-01-01', quantity:1, rating:2.0, notes:''},
  {id:163, wineId:230, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:164, wineId:231, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:165, wineId:232, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:166, wineId:233, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:167, wineId:234, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:168, wineId:235, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:169, wineId:236, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:170, wineId:237, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:171, wineId:238, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:172, wineId:239, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:173, wineId:240, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:174, wineId:241, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:175, wineId:242, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:176, wineId:243, date:'2024-01-01', quantity:1, rating:0, notes:''},
  {id:177, wineId:244, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:178, wineId:245, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:179, wineId:246, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:180, wineId:247, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:181, wineId:248, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:182, wineId:249, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:183, wineId:250, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:184, wineId:251, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:185, wineId:252, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:186, wineId:253, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:187, wineId:254, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:188, wineId:255, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:189, wineId:256, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:190, wineId:257, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:191, wineId:258, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:192, wineId:259, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:193, wineId:260, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:194, wineId:261, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:195, wineId:262, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:196, wineId:263, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:197, wineId:264, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:198, wineId:265, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:199, wineId:266, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:200, wineId:267, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:201, wineId:268, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:202, wineId:269, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:203, wineId:270, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:204, wineId:271, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:205, wineId:272, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:206, wineId:273, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:207, wineId:274, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:208, wineId:275, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:209, wineId:276, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:210, wineId:277, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:211, wineId:278, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:212, wineId:279, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:213, wineId:260, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:214, wineId:280, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:215, wineId:281, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:216, wineId:282, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:217, wineId:283, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:218, wineId:284, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:219, wineId:285, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:220, wineId:286, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:221, wineId:287, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:222, wineId:288, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:223, wineId:289, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:224, wineId:290, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:225, wineId:291, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:226, wineId:292, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:227, wineId:293, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:228, wineId:294, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:229, wineId:295, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:230, wineId:296, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:231, wineId:297, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:232, wineId:298, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:233, wineId:299, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:234, wineId:300, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:235, wineId:301, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:236, wineId:302, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:237, wineId:303, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:238, wineId:304, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:239, wineId:305, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:240, wineId:306, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:241, wineId:307, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:242, wineId:308, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:243, wineId:309, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:244, wineId:310, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:245, wineId:311, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:246, wineId:312, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:247, wineId:313, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:248, wineId:314, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:249, wineId:315, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:250, wineId:316, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:251, wineId:97, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:252, wineId:317, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:253, wineId:318, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:254, wineId:319, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:255, wineId:320, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:256, wineId:321, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:257, wineId:322, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:258, wineId:323, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:259, wineId:324, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:260, wineId:325, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:261, wineId:326, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:262, wineId:327, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:263, wineId:328, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:264, wineId:329, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:265, wineId:330, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:266, wineId:331, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:267, wineId:332, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:268, wineId:333, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:269, wineId:334, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:270, wineId:335, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:271, wineId:336, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:272, wineId:337, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:273, wineId:338, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:274, wineId:339, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:275, wineId:340, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:276, wineId:37, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:277, wineId:341, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:278, wineId:342, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:279, wineId:343, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:280, wineId:344, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:281, wineId:345, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:282, wineId:346, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:283, wineId:347, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:284, wineId:348, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:285, wineId:349, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:286, wineId:350, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:287, wineId:351, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:288, wineId:352, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:289, wineId:353, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:290, wineId:354, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:291, wineId:355, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:292, wineId:356, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:293, wineId:357, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:294, wineId:358, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:295, wineId:359, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:296, wineId:360, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:297, wineId:182, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:298, wineId:361, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:299, wineId:362, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:300, wineId:363, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:301, wineId:364, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:302, wineId:365, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:303, wineId:366, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:304, wineId:367, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:305, wineId:368, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:306, wineId:369, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:307, wineId:370, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:308, wineId:371, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:309, wineId:372, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:310, wineId:373, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:311, wineId:374, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:312, wineId:375, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:313, wineId:376, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:314, wineId:377, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:315, wineId:378, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:316, wineId:379, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:317, wineId:380, date:'2024-01-01', quantity:1, rating:0, notes:''},
  {id:318, wineId:381, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:319, wineId:382, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:320, wineId:383, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:321, wineId:384, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:322, wineId:273, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:323, wineId:385, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:324, wineId:386, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:325, wineId:387, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:326, wineId:388, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:327, wineId:389, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:328, wineId:390, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:329, wineId:391, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:330, wineId:392, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:331, wineId:393, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:332, wineId:394, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:333, wineId:395, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:334, wineId:396, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:335, wineId:397, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:336, wineId:398, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:337, wineId:399, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:338, wineId:400, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:339, wineId:401, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:340, wineId:402, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:341, wineId:403, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:342, wineId:404, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:343, wineId:405, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:344, wineId:406, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:345, wineId:407, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:346, wineId:408, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:347, wineId:409, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:348, wineId:410, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:349, wineId:411, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:350, wineId:412, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:351, wineId:413, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:352, wineId:414, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:353, wineId:415, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:354, wineId:416, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:355, wineId:417, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:356, wineId:418, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:357, wineId:419, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:358, wineId:420, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:359, wineId:421, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:360, wineId:422, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:361, wineId:423, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:362, wineId:424, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:363, wineId:425, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:364, wineId:426, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:365, wineId:427, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:366, wineId:428, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:367, wineId:429, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:368, wineId:430, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:369, wineId:431, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:370, wineId:432, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:371, wineId:433, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:372, wineId:434, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:373, wineId:435, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:374, wineId:436, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:375, wineId:437, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:376, wineId:137, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:377, wineId:438, date:'2024-01-01', quantity:1, rating:0, notes:''},
  {id:378, wineId:439, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:379, wineId:440, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:380, wineId:441, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:381, wineId:442, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:382, wineId:443, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:383, wineId:444, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:384, wineId:445, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:385, wineId:446, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:386, wineId:447, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:387, wineId:448, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:388, wineId:449, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:389, wineId:450, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:390, wineId:451, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:391, wineId:452, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:392, wineId:60, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:393, wineId:453, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:394, wineId:454, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:395, wineId:455, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:396, wineId:456, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:397, wineId:457, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:398, wineId:458, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:399, wineId:459, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:400, wineId:460, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:401, wineId:461, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:402, wineId:462, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:403, wineId:463, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:404, wineId:464, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:405, wineId:3, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:406, wineId:465, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:407, wineId:466, date:'2024-01-01', quantity:1, rating:0, notes:''},
  {id:408, wineId:467, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:409, wineId:468, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:410, wineId:469, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:411, wineId:470, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:412, wineId:471, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:413, wineId:472, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:414, wineId:473, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:415, wineId:474, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:416, wineId:475, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:417, wineId:476, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:418, wineId:477, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:419, wineId:478, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:420, wineId:479, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:421, wineId:480, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:422, wineId:481, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:423, wineId:482, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:424, wineId:483, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:425, wineId:484, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:426, wineId:485, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:427, wineId:338, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:428, wineId:486, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:429, wineId:487, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:430, wineId:488, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:431, wineId:489, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:432, wineId:490, date:'2024-01-01', quantity:1, rating:0, notes:''},
  {id:433, wineId:491, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:434, wineId:492, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:435, wineId:493, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:436, wineId:380, date:'2024-01-01', quantity:1, rating:0, notes:''},
  {id:437, wineId:463, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:438, wineId:494, date:'2024-01-01', quantity:1, rating:0, notes:''},
  {id:439, wineId:495, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:440, wineId:496, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:441, wineId:497, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:442, wineId:498, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:443, wineId:499, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:444, wineId:500, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:445, wineId:501, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:446, wineId:502, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:447, wineId:503, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:448, wineId:418, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:449, wineId:504, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:450, wineId:167, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:451, wineId:505, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:452, wineId:506, date:'2024-01-01', quantity:1, rating:0, notes:''},
  {id:453, wineId:507, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:454, wineId:508, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:455, wineId:509, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:456, wineId:510, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:457, wineId:511, date:'2024-01-01', quantity:1, rating:0, notes:''},
  {id:458, wineId:512, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:459, wineId:513, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:460, wineId:514, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:461, wineId:407, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:462, wineId:515, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:463, wineId:516, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:464, wineId:517, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:465, wineId:518, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:466, wineId:519, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:467, wineId:520, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:468, wineId:521, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:469, wineId:522, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:470, wineId:523, date:'2024-01-01', quantity:1, rating:0, notes:''},
  {id:471, wineId:524, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:472, wineId:525, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:473, wineId:526, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:474, wineId:527, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:475, wineId:528, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:476, wineId:529, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:477, wineId:530, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:478, wineId:531, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:479, wineId:532, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:480, wineId:533, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:481, wineId:534, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:482, wineId:535, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:483, wineId:536, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:484, wineId:537, date:'2024-01-01', quantity:1, rating:2.0, notes:''},
  {id:485, wineId:538, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:486, wineId:539, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:487, wineId:540, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:488, wineId:541, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:489, wineId:369, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:490, wineId:542, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:491, wineId:543, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:492, wineId:544, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:493, wineId:545, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:494, wineId:546, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:495, wineId:547, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:496, wineId:548, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:497, wineId:549, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:498, wineId:550, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:499, wineId:551, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:500, wineId:463, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:501, wineId:552, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:502, wineId:553, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:503, wineId:551, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:504, wineId:554, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:505, wineId:555, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:506, wineId:556, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:507, wineId:557, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:508, wineId:558, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:509, wineId:559, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:510, wineId:529, date:'2024-01-01', quantity:1, rating:3.0, notes:''},
  {id:511, wineId:182, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:512, wineId:560, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:513, wineId:548, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:514, wineId:561, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:515, wineId:562, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:516, wineId:563, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:517, wineId:564, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:518, wineId:565, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:519, wineId:566, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:520, wineId:567, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:521, wineId:568, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:522, wineId:569, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:523, wineId:570, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:524, wineId:141, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:525, wineId:571, date:'2024-01-01', quantity:2, rating:4.0, notes:''},
  {id:526, wineId:572, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:527, wineId:573, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:528, wineId:574, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:529, wineId:575, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:530, wineId:576, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
  {id:531, wineId:577, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:532, wineId:578, date:'2024-01-01', quantity:1, rating:0, notes:''},
  {id:533, wineId:579, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:534, wineId:580, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:535, wineId:581, date:'2024-01-01', quantity:1, rating:4.0, notes:''},
  {id:536, wineId:582, date:'2024-01-01', quantity:1, rating:5.0, notes:''},
]
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

function ModalShell({ onClose, children, isMobile }) {
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)',
        display: 'flex', zIndex: 100, backdropFilter: 'blur(4px)',
        ...(isMobile
          ? { alignItems: 'flex-end', justifyContent: 'stretch' }
          : { alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 16px' })
      }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1e1b16', border: '1px solid rgba(255,255,255,0.1)',
          fontFamily: FONT, overflowY: 'auto',
          ...(isMobile
            ? { width: '100%', maxHeight: '92vh', borderRadius: '16px 16px 0 0', padding: '20px 20px 32px' }
            : { borderRadius: 14, padding: '28px 28px 24px', width: '100%', maxWidth: 560, margin: 'auto 0' })
        }}>
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
                  onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(false); onPartialMatch(w) }}
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
  const [vivinoStatus, setVivinoStatus] = useState('idle') // 'idle' | 'ok' | 'error' | 'nokey'
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
    if (!ANTHROPIC_API_KEY) { setVivinoStatus('nokey'); return }
    setLoadingV(true); setVivinoStatus('idle')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001', max_tokens: 60,
          messages: [{ role: 'user', content: `Vivino community rating (scale 1.0–5.0) for the wine "${f.name}"${f.year ? ` ${f.year}` : ''}. Reply ONLY with valid JSON, no markdown: {"rating":X.X}` }],
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const txt  = (data.content?.[0]?.text || '').replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(txt)
      if (parsed.rating && parsed.rating >= 1 && parsed.rating <= 5) {
        set('vivinoRating', parsed.rating.toFixed(1))
        setVivinoStatus('ok')
      } else {
        setVivinoStatus('error')
      }
    } catch (_) {
      setVivinoStatus('error')
    }
    setLoadingV(false)
    setTimeout(() => setVivinoStatus('idle'), 3000)
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
              onPartialMatch={(w) => setF((p) => ({ ...p, name: w.name, type: w.type, country: w.country, region: w.region, year: '', purchasePrice: '', personalRating: 0, vivinoRating: '', notes: '' }))}
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
              style={{
                background: vivinoStatus === 'ok' ? 'rgba(104,200,128,0.15)' : vivinoStatus === 'error' || vivinoStatus === 'nokey' ? 'rgba(232,112,128,0.15)' : 'rgba(200,150,62,0.15)',
                border: `1px solid ${vivinoStatus === 'ok' ? 'rgba(104,200,128,0.35)' : vivinoStatus === 'error' || vivinoStatus === 'nokey' ? 'rgba(232,112,128,0.35)' : 'rgba(200,150,62,0.3)'}`,
                borderRadius: 6,
                color: vivinoStatus === 'ok' ? '#68c880' : vivinoStatus === 'error' || vivinoStatus === 'nokey' ? '#e87080' : '#c8963e',
                cursor: loadingV || !f.name ? 'not-allowed' : 'pointer',
                padding: '0 10px', opacity: !f.name ? 0.4 : 1,
                display: 'flex', alignItems: 'center', transition: 'all 0.2s', minWidth: 36, justifyContent: 'center',
              }}
              title={!ANTHROPIC_API_KEY ? 'Define ANTHROPIC_API_KEY no topo do App.jsx' : 'Estimar rating via IA'}>
              {loadingV ? <span style={{ fontSize: 13 }}>…</span> : vivinoStatus === 'ok' ? <Check size={14} /> : vivinoStatus === 'error' ? <X size={14} /> : <Sparkles size={14} />}
            </button>
            {f.name && (
              <a
                href={`https://www.vivino.com/search/wines?q=${encodeURIComponent([f.name, f.year].filter(Boolean).join(' '))}`}
                target="_blank"
                rel="noopener noreferrer"
                title={`Pesquisar "${f.name}${f.year ? ` ${f.year}` : ''}" no Vivino`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#6a6058', textDecoration: 'none', transition: 'all 0.15s', minWidth: 36 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#e8dece' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#6a6058' }}
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
          {vivinoStatus === 'nokey' && (
            <p style={{ margin: '5px 0 0', fontSize: 11, color: '#e87080', lineHeight: 1.4 }}>
              Define <code style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 4px', borderRadius: 3 }}>ANTHROPIC_API_KEY</code> no topo do <code style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 4px', borderRadius: 3 }}>App.jsx</code>
            </p>
          )}
          {vivinoStatus === 'error' && (
            <p style={{ margin: '5px 0 0', fontSize: 11, color: '#e87080' }}>Não foi possível estimar. Tenta de novo ou introduz manualmente.</p>
          )}
          {vivinoStatus === 'ok' && (
            <p style={{ margin: '5px 0 0', fontSize: 11, color: '#68c880' }}>Rating estimado com sucesso.</p>
          )}
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
function EntryForm({ wine, suppliers, setSuppliers, onSave, onClose }) {
  const [f, setF] = useState({ date: new Date().toISOString().slice(0, 10), quantity: 1, supplier: suppliers?.[0] ?? SUPPLIERS[0], price: fmtNum(wine?.purchasePrice) })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const list = suppliers ?? SUPPLIERS
  return (
    <>
      <ModalHeader title="Registar Entrada" subtitle={`${wine.name} · ${wine.year}`} onClose={onClose} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div><label style={S.lbl}>Data</label><input style={S.inp} type="date" value={f.date} onChange={(e) => set('date', e.target.value)} /></div>
        <div><label style={S.lbl}>Quantidade</label><input style={S.inp} type="number" min={1} value={f.quantity} onChange={(e) => set('quantity', e.target.value)} /></div>
      </div>
      <div style={S.field}>
        <label style={S.lbl}>Fornecedor</label>
        <FilterSelect
          placeholder="Seleccionar fornecedor"
          value={f.supplier}
          onChange={(v) => set('supplier', v)}
          options={list}
          onAdd={(v) => { setSuppliers?.((p) => [...p, v]); set('supplier', v) }}
        />
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
function WineDetail({ wine, entries, consumptions, onClose, onEntry, onConsumption, onEdit, onDelete, onDeleteEntry, onDeleteConsumption }) {
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: '#c8963e' }}>{fmt(e.price)}/un</div>
                    <div style={{ fontSize: 11, color: '#9a8f82' }}>{fmt(e.price * e.quantity)} total</div>
                  </div>
                  {onDeleteEntry && (
                    <button onClick={() => { if (window.confirm(`Cancelar esta entrada de ${e.quantity} ${e.quantity === 1 ? 'garrafa' : 'garrafas'}? O stock será revertido.`)) onDeleteEntry(e) }}
                      style={{ background: 'none', border: 'none', color: '#3a3530', cursor: 'pointer', padding: '4px 6px', display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                      onMouseEnter={(ev) => { ev.currentTarget.style.color = '#e87080'; ev.currentTarget.style.background = 'rgba(232,112,128,0.1)' }}
                      onMouseLeave={(ev) => { ev.currentTarget.style.color = '#3a3530'; ev.currentTarget.style.background = 'none' }}>
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
          {wConsumed.length === 0 ? <p style={{ color: '#4a453f', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Sem consumos registados.</p>
            : wConsumed.map((c) => (
              <div key={c.id} style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, color: '#e8dece', fontWeight: 500 }}>{c.quantity} {c.quantity === 1 ? 'garrafa' : 'garrafas'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Stars value={c.rating} size={12} />
                    <span style={{ fontSize: 11, color: '#9a8f82' }}>{c.date}</span>
                    {onDeleteConsumption && (
                      <button onClick={() => { if (window.confirm(`Cancelar este consumo de ${c.quantity} ${c.quantity === 1 ? 'garrafa' : 'garrafas'}? O stock será reposto.`)) onDeleteConsumption(c) }}
                        style={{ background: 'none', border: 'none', color: '#3a3530', cursor: 'pointer', padding: '4px 6px', display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#e87080'; e.currentTarget.style.background = 'rgba(232,112,128,0.1)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#3a3530'; e.currentTarget.style.background = 'none' }}>
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
function WineListRow({ wine, onClick, isMobile }) {
  return (
    <div onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14, padding: isMobile ? '10px 14px' : '9px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.12s', opacity: wine.quantity === 0 ? 0.45 : 1 }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
      <WineThumb photo={wine.photo} type={wine.type} size={isMobile ? 22 : 26} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 400, color: '#e8dece', fontFamily: FONT, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wine.name}</div>
        <div style={{ fontSize: 11, color: '#9a8f82', marginTop: 1 }}>
          {isMobile
            ? <>{[wine.region, wine.country].filter(Boolean).join(', ')}{wine.year ? ` · ${wine.year}` : ''}</>
            : [wine.region, wine.country].filter(Boolean).join(', ')}
        </div>
      </div>
      {!isMobile && <div style={{ width: 86, flexShrink: 0 }}><Badge type={wine.type} /></div>}
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

function WineListView({ wines, onWineClick, isMobile }) {
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState(1)

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => -d)
    else { setSortKey(key); setSortDir(1) }
  }

  const sorted = useMemo(() => {
    return [...wines].sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'string') return av.localeCompare(bv, 'pt') * sortDir
      return (av - bv) * sortDir
    })
  }, [wines, sortKey, sortDir])

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
        {!isMobile && <ColHead label="Ano"    col="year"           width={44} align="center" />}
        {!isMobile && <ColHead label="Rating" col="personalRating" width={76} />}
        <ColHead label="Qtd."  col="quantity"       width={isMobile ? 32 : 44} align="center" />
        <ColHead label="Preço" col="purchasePrice"  width={isMobile ? 56 : 72} align="right" />
      </div>
      {sorted.length === 0
        ? <div style={{ textAlign: 'center', padding: '48px 0', color: '#4a453f' }}><Wine size={32} style={{ marginBottom: 10, opacity: 0.2 }} /><p style={{ fontSize: 13 }}>Nenhum vinho encontrado.</p></div>
        : sorted.map((w) => <WineListRow key={w.id} wine={w} onClick={() => onWineClick(w)} isMobile={isMobile} />)}
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
function Dashboard({ wines, entries, consumptions, isMobile }) {
  const inStock       = wines.filter(w => w.quantity > 0)
  const totalBottles  = wines.reduce((s, w) => s + w.quantity, 0)
  const totalValue    = inStock.reduce((s, w) => s + totalV(w), 0)
  const totalConsumed = consumptions.reduce((s, c) => s + c.quantity, 0)

  // "Garrafas por tipo" — só em stock
  const byTypeStock = inStock.reduce((acc, w) => {
    if (!acc[w.type]) acc[w.type] = { bottles: 0 }
    acc[w.type].bottles += w.quantity
    return acc
  }, {})
  const maxBottles = Math.max(...Object.values(byTypeStock).map(v => v.bottles), 1)

  // "Por país" em stock
  const byCountryStock = inStock.reduce((acc, w) => {
    if (!acc[w.country]) acc[w.country] = { count: 0 }
    acc[w.country].count++
    return acc
  }, {})

  // "Por país" total (todas as referências)
  const byCountryAll = wines.reduce((acc, w) => {
    if (!acc[w.country]) acc[w.country] = { count: 0 }
    acc[w.country].count++
    return acc
  }, {})

  const topWines = [...inStock].sort((a, b) => totalV(b) - totalV(a)).slice(0, 5)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 40 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { l: 'Referências em stock', v: inStock.length,      c: '#e8dece' },
          { l: 'Garrafas em stock',    v: totalBottles,         c: '#e8dece' },
          { l: 'Valor Total',          v: fmt(totalValue),      c: '#c8963e' },
          { l: 'Consumidas',           v: totalConsumed,        c: '#9a8f82' },
        ].map(({ l, v, c }) => (
          <div key={l} style={{ ...S.stat, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{l}</div>
            <div style={{ fontSize: 26, fontWeight: 300, color: c, fontFamily: FONT, letterSpacing: '-0.03em' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Garrafas por tipo + Por país em stock */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ ...S.stat, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Garrafas em stock por tipo</h3>
          {Object.entries(byTypeStock).sort((a, b) => b[1].bottles - a[1].bottles).map(([type, d]) => {
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
          <h3 style={{ margin: '0 0 16px', fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Por país — em stock</h3>
          <PieChart
            total={inStock.length}
            data={Object.entries(byCountryStock).sort((a, b) => b[1].count - a[1].count).map(([label, d]) => ({ label, value: d.count }))}
          />
        </div>
      </div>

      {/* Por país total */}
      <div style={{ ...S.stat, padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Por país — todas as referências ({wines.length})</h3>
        <PieChart
          total={wines.length}
          data={Object.entries(byCountryAll).sort((a, b) => b[1].count - a[1].count).map(([label, d]) => ({ label, value: d.count }))}
        />
      </div>

      {/* Top 5 */}
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
  const [suppliers,        setSuppliers]        = useState(SUPPLIERS)
  const [countriesRegions, setCountriesRegions] = useState(COUNTRIES_REGIONS)

  const [view,           setView]           = useState('dashboard')
  const [search,         setSearch]         = useState('')
  const [filterType,     setFilterType]     = useState('')
  const [filterCountry,  setFilterCountry]  = useState('')
  const [filterRegion,   setFilterRegion]   = useState('')
  const [listMode,       setListMode]       = useState('list')
  const [sidebarOpen,    setSidebarOpen]    = useState(true)
  const [isMobile,       setIsMobile]       = useState(false)
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
    const h = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
      else setSidebarOpen(true)
    }
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

  const deleteEntry = (entry) => {
    setEntries((p) => p.filter((e) => e.id !== entry.id))
    setWines((p) => p.map((w) => w.id !== entry.wineId ? w : { ...w, quantity: Math.max(0, w.quantity - entry.quantity) }))
  }

  const deleteConsumption = (consumption) => {
    setConsumptions((p) => p.filter((c) => c.id !== consumption.id))
    setWines((p) => p.map((w) => w.id !== consumption.wineId ? w : { ...w, quantity: w.quantity + consumption.quantity }))
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

      {/* SIDEBAR (desktop only) */}
      {sidebarOpen && !isMobile && (
        <div style={{ width: 216, flexShrink: 0, background: '#161310', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          <div style={{ padding: '0 20px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.25)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Wine size={15} color="#c8963e" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 200, color: '#e8dece', fontFamily: FONT, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Videiras</div>
              <div style={{ fontSize: 9, color: '#4a453f', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 400, marginTop: 1 }}>cellar collection</div>
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
        {/* header */}
        <div style={{ padding: `0 ${isMobile ? 16 : 24}px`, borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#161310', display: 'flex', alignItems: 'center', gap: 12, height: 48, flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>
          {!isMobile && (
            <button onClick={() => setSidebarOpen((p) => !p)} style={{ background: 'none', border: 'none', color: '#6a6058', cursor: 'pointer', padding: 4, display: 'flex' }}>
              <Menu size={17} />
            </button>
          )}
          {isMobile && (
            <div style={{ width: 24, height: 24, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.25)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wine size={12} color="#c8963e" />
            </div>
          )}
          <h1 style={{ margin: 0, fontSize: 12, fontWeight: 400, color: '#6a6058', fontFamily: FONT, letterSpacing: '0.12em', textTransform: 'uppercase', flex: 1 }}>
            {{ dashboard: 'Dashboard', adega: 'Adega', entradas: 'Entradas', consumos: 'Consumos' }[view]}
          </h1>
          {view === 'adega' && (
            <Btn variant="gold" onClick={() => setModal('addWine')}><Plus size={13} />{!isMobile && 'Vinho'}</Btn>
          )}
        </div>

        {/* content */}
        <div style={{ flex: 1, padding: isMobile ? 16 : 24, overflowY: 'auto', paddingBottom: isMobile ? 80 : 24 }}>
          {view === 'dashboard' && <Dashboard wines={wines} entries={entries} consumptions={consumptions} isMobile={isMobile} />}

          {view === 'adega' && (
            <>
              {/* filtros — toolbar dentro do conteúdo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 160, maxWidth: 260 }}>
                  <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4a453f' }} />
                  <input style={{ ...S.inp, paddingLeft: 30, fontSize: 13 }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar…" />
                </div>
                <FilterSelect placeholder="Todos os tipos" value={filterType} onChange={setFilterType} options={types} onAdd={(v) => setTypes((p) => [...p, v])} />
                {!isMobile && <FilterSelect placeholder="Países" value={filterCountry} onChange={(v) => { setFilterCountry(v); setFilterRegion('') }} options={allCountries} onAdd={addCountry} />}
                {!isMobile && filterCountry && (
                  <FilterSelect placeholder="Regiões" value={filterRegion} onChange={setFilterRegion} options={countriesRegions[filterCountry] || []} onAdd={(v) => addRegionToCountry(filterCountry, v)} />
                )}
                <button
                  onClick={() => setShowNoStock((p) => !p)}
                  title={showNoStock ? 'Ocultar sem stock' : 'Mostrar sem stock'}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: 11, fontFamily: FONT,
                    background: showNoStock ? 'transparent' : 'rgba(200,150,62,0.1)',
                    color: showNoStock ? '#4a453f' : '#c8963e', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                  {showNoStock ? <Eye size={12} /> : <EyeOff size={12} />}
                  {!isMobile ? (showNoStock ? ' Com stock' : ' Só stock') : ''}
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
                ? <WineListView wines={filtered} onWineClick={(w) => { setActiveWine(w); setModal('detail') }} isMobile={isMobile} />
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
                      <button onClick={() => { if (window.confirm(`Cancelar entrada de ${e.quantity} ${e.quantity === 1 ? 'garrafa' : 'garrafas'} de "${w?.name}"? O stock será revertido.`)) deleteEntry(e) }}
                        title="Cancelar entrada"
                        style={{ background: 'none', border: 'none', color: '#3a3530', cursor: 'pointer', padding: '4px 6px', flexShrink: 0, display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                        onMouseEnter={(e2) => { e2.currentTarget.style.color = '#e87080'; e2.currentTarget.style.background = 'rgba(232,112,128,0.1)' }}
                        onMouseLeave={(e2) => { e2.currentTarget.style.color = '#3a3530'; e2.currentTarget.style.background = 'none' }}>
                        <Trash2 size={13} />
                      </button>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <Stars value={c.rating} size={12} />
                        <button onClick={() => { if (window.confirm(`Cancelar consumo de ${c.quantity} ${c.quantity === 1 ? 'garrafa' : 'garrafas'} de "${w?.name}"? O stock será reposto.`)) deleteConsumption(c) }}
                          title="Cancelar consumo"
                          style={{ background: 'none', border: 'none', color: '#3a3530', cursor: 'pointer', padding: '4px 6px', flexShrink: 0, display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#e87080'; e.currentTarget.style.background = 'rgba(232,112,128,0.1)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#3a3530'; e.currentTarget.style.background = 'none' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM NAV (mobile) */}
      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 56, background: '#161310', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', zIndex: 20 }}>
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setView(n.id)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s',
              color: view === n.id ? '#c8963e' : '#3a3530', fontFamily: FONT,
            }}>
              {n.icon}
              <span style={{ fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: view === n.id ? 500 : 300 }}>{n.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* MODALS */}
      {modal && (
        <ModalShell onClose={closeModal} isMobile={isMobile}>
          {modal === 'addWine'     && <WineForm types={types} setTypes={setTypes} countriesRegions={countriesRegions} setCountriesRegions={setCountriesRegions} allWines={wines} onExactMatch={(w) => { setActiveWine(w); setModal('entry') }} onSave={addWine} onClose={closeModal} />}
          {modal === 'editWine'    && liveWine && <WineForm wine={liveWine} types={types} setTypes={setTypes} countriesRegions={countriesRegions} setCountriesRegions={setCountriesRegions} onSave={editWine} onClose={closeModal} />}
          {modal === 'detail'      && liveWine && <WineDetail wine={liveWine} entries={entries} consumptions={consumptions} onClose={closeModal} onEntry={() => setModal('entry')} onConsumption={() => setModal('consumption')} onEdit={() => setModal('editWine')} onDelete={() => deleteWine(liveWine.id)} onDeleteEntry={deleteEntry} onDeleteConsumption={deleteConsumption} />}
          {modal === 'entry'       && liveWine && <EntryForm wine={liveWine} suppliers={suppliers} setSuppliers={setSuppliers} onSave={addEntry} onClose={closeModal} />}
          {modal === 'consumption' && liveWine && <ConsumptionForm wine={liveWine} onSave={addConsumption} onClose={closeModal} />}
        </ModalShell>
      )}
    </div>
  )
}