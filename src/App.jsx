import React, { useState, useMemo, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  Wine, Plus, Search, BarChart3, LogIn, LogOut,
  Edit2, Trash2, X, Menu, Sparkles, Check,
  LayoutGrid, List, Camera, ImageOff, Eye, EyeOff, ExternalLink,
  ShieldCheck, Users, UserCheck, UserX, Settings, KeyRound,
  FileText, Download, FileSpreadsheet, TrendingUp,
} from 'lucide-react'

// ─── FONT: Outfit is loaded globally via index.html ───────────────────────────
const FONT = "'Outfit', system-ui, sans-serif"

// ─── ANTHROPIC API KEY ────────────────────────────────────────────────────────
// Substitui pela tua chave em https://console.anthropic.com/
const ANTHROPIC_API_KEY = ''

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const SUPA_URL = 'https://cqgpgryldmzogfygpybl.supabase.co'
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZ3BncnlsZG16b2dmeWdweWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MDMwMjksImV4cCI6MjA4ODI3OTAyOX0.MjkBexUvuAAU7sYcRs3uPaJh52jdMG723aqeDVuoe9w'
const supabase = createClient(SUPA_URL, SUPA_KEY)
const EDGE_FN_URL = `${SUPA_URL}/functions/v1/videiras-admin`

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
const fmtN   = (n, dec = 2) => n == null ? '—' : new Intl.NumberFormat('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n)
const fmtInt = (n) => n == null ? '—' : new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n)
const fmt    = (n) => n != null ? fmtN(n) + ' €' : '—'
const fmtNum = (n) => n != null ? fmtN(Number(n)) : ''
// PDF: sem separador de milhares para evitar problemas de rendering
const pdfN   = (n, dec = 2) => n == null ? '—' : n.toFixed(dec).replace('.', ',')
const pdfInt = (n) => n == null ? '—' : String(Math.round(n))
const pdfFmt = (n) => n != null ? pdfN(n) + ' €' : '—'
const totalV = (w) => (w.purchasePrice || 0) * (w.quantity || 0)
const nextId = (arr) => Math.max(0, ...arr.map((x) => x.id)) + 1

const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

// ─── DB MAPPING ───────────────────────────────────────────────────────────────
const wineFromDb = (r) => ({
  id: r.id, name: r.name, type: r.type, country: r.country, region: r.region,
  year: r.year, purchasePrice: parseFloat(r.purchase_price) || 0,
  personalRating: parseFloat(r.personal_rating) || 0,
  vivinoRating: r.vivino_rating != null ? parseFloat(r.vivino_rating) : null,
  quantity: r.quantity, photo: r.photo || null, notes: r.notes || '',
})
const wineToDb = (w) => ({
  name: w.name, type: w.type, country: w.country, region: w.region, year: w.year || null,
  purchase_price: w.purchasePrice || 0, personal_rating: w.personalRating || 0,
  vivino_rating: w.vivinoRating ?? null, quantity: w.quantity ?? 0,
  photo: w.photo || null, notes: w.notes || '',
})
const entryFromDb = (r) => ({
  id: r.id, wineId: r.wine_id, date: r.date,
  quantity: r.quantity, supplier: r.supplier, price: parseFloat(r.price) || 0,
})
const entryToDb = (e) => ({
  wine_id: e.wineId, date: e.date, quantity: e.quantity,
  supplier: e.supplier || '', price: e.price || 0,
})
const consumptionFromDb = (r) => ({
  id: r.id, wineId: r.wine_id, date: r.date, quantity: r.quantity,
  rating: r.rating != null ? parseFloat(r.rating) : 0, notes: r.notes || '',
})
const consumptionToDb = (c) => ({
  wine_id: c.wineId, date: c.date, quantity: c.quantity,
  rating: c.rating || null, notes: c.notes || '',
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

function WineThumb({ photo, type, size = 40, onClick }) {
  const c = getTC(type)
  if (photo) return (
    <img src={photo} alt="" onClick={onClick}
      style={{ width: size, height: size * 1.5, objectFit: 'cover', borderRadius: 4, display: 'block', flexShrink: 0,
        cursor: onClick ? 'zoom-in' : 'default', transition: 'opacity 0.15s' }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.opacity = '0.82' }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.opacity = '1' }}
    />
  )
  return (
    <div style={{ width: size, height: size * 1.5, borderRadius: 4, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Wine size={size * 0.45} color={c.fg} style={{ opacity: 0.45 }} />
    </div>
  )
}

function PhotoLightbox({ src: imgSrc, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div onClick={(e) => { e.stopPropagation(); onClose() }} style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'zoom-out',
    }}>
      <img src={imgSrc} alt="" onClick={e => e.stopPropagation()} style={{
        maxWidth: '90vw', maxHeight: '90vh',
        objectFit: 'contain', borderRadius: 8,
        boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
        cursor: 'default',
      }} />
      <button onClick={(e) => { e.stopPropagation(); onClose() }} style={{
        position: 'absolute', top: 20, right: 20,
        background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
        width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#e8dece', cursor: 'pointer',
      }}><X size={16} /></button>
    </div>
  )
}

function QuoteOverlay({ quote, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  if (!quote) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, cursor: 'pointer',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        maxWidth: 480, width: '100%', background: '#161310',
        border: '1px solid rgba(200,150,62,0.25)', borderRadius: 16,
        padding: '40px 36px', textAlign: 'center', cursor: 'default',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>
        <div style={{ fontSize: 28, color: 'rgba(200,150,62,0.3)', fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: 16 }}>"</div>
        <p style={{ fontSize: 16, fontWeight: 300, color: '#e8dece', fontFamily: FONT, lineHeight: 1.65, margin: '0 0 20px', letterSpacing: '0.01em' }}>
          {quote.quote}
        </p>
        {quote.author && (
          <p style={{ fontSize: 12, color: '#6a5f52', fontStyle: 'italic', margin: '0 0 28px' }}>— {quote.author}</p>
        )}
        <button onClick={onClose} style={{
          padding: '9px 28px', borderRadius: 7, border: '1px solid rgba(200,150,62,0.3)',
          background: 'rgba(200,150,62,0.08)', color: '#c8963e', cursor: 'pointer',
          fontFamily: FONT, fontSize: 12, fontWeight: 500, transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,150,62,0.16)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,150,62,0.08)' }}>
          Continuar
        </button>
      </div>
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
function EntryForm({ wine, entry, suppliers, setSuppliers, entries, onSave, onClose }) {
  const [f, setF] = useState(entry
    ? { date: entry.date, quantity: entry.quantity, supplier: entry.supplier || '', price: fmtNum(entry.price) }
    : { date: new Date().toISOString().slice(0, 10), quantity: 1, supplier: suppliers?.[0] ?? SUPPLIERS[0], price: fmtNum(wine?.purchasePrice) })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const list = suppliers ?? SUPPLIERS
  return (
    <>
      <ModalHeader title={entry ? "Editar Entrada" : "Registar Entrada"} subtitle={`${wine.name} · ${wine.year}`} onClose={onClose} />
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
          onAdd={async (v) => {
              await supabase.from('videiras_suppliers').insert({ name: v })
              setSuppliers?.((p) => [...p, v].sort((a, b) => a.localeCompare(b, 'pt')))
              set('supplier', v)
            }}
          onRemove={async (v) => {
            const hasMovements = (entries || []).some(e => e.supplier === v)
            if (hasMovements) { alert(`"${v}" tem entradas associadas e não pode ser eliminado.`); return }
            await supabase.from('videiras_suppliers').delete().eq('name', v)
            setSuppliers?.((p) => p.filter(s => s !== v))
            set('supplier', list.find(s => s !== v) || '')
          }}
        />
      </div>
      <div style={S.field}><label style={S.lbl}>Preço por Garrafa (€)</label><input style={S.inp} value={f.price} onChange={(e) => set('price', e.target.value)} placeholder="0,00" /></div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="gold" onClick={() => { if (f.quantity >= 1) onSave({ ...f, quantity: parseInt(f.quantity), price: parseFloat((f.price + '').replace(',', '.')) || 0 }) }}><LogIn size={14} />{entry ? 'Guardar' : 'Registar Entrada'}</Btn>
      </div>
    </>
  )
}

// ─── CONSUMPTION FORM ─────────────────────────────────────────────────────────
function ConsumptionForm({ wine, consumption, onSave, onClose }) {
  const [f, setF] = useState(consumption
    ? { date: consumption.date, quantity: consumption.quantity, rating: consumption.rating || 0, notes: consumption.notes || '' }
    : { date: new Date().toISOString().slice(0, 10), quantity: 1, rating: wine?.personalRating || 0, notes: '' })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  // When editing, the original quantity is already deducted from stock — add it back for the max
  const maxQty = consumption ? wine.quantity + consumption.quantity : wine.quantity
  return (
    <>
      <ModalHeader title={consumption ? "Editar Consumo" : "Registar Consumo"} subtitle={`${wine.name} · ${wine.year} · ${maxQty} disponíveis`} onClose={onClose} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div><label style={S.lbl}>Data</label><input style={S.inp} type="date" value={f.date} onChange={(e) => set('date', e.target.value)} /></div>
        <div><label style={S.lbl}>Quantidade (máx. {maxQty})</label><input style={S.inp} type="number" min={1} max={maxQty} value={f.quantity} onChange={(e) => set('quantity', e.target.value)} /></div>
      </div>
      <div style={S.field}><label style={S.lbl}>Classificação Pessoal</label><div style={{ padding: '8px 0' }}><Stars value={f.rating} onChange={(v) => set('rating', v)} size={22} /></div></div>
      <div style={S.field}><label style={S.lbl}>Observações</label><textarea style={{ ...S.inp, minHeight: 72, resize: 'vertical' }} value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Ocasião, maridagem, notas de prova…" /></div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="gold" onClick={() => { if (f.quantity >= 1 && f.quantity <= maxQty) onSave({ ...f, quantity: parseInt(f.quantity) }) }}><LogOut size={14} />{consumption ? 'Guardar' : 'Registar Consumo'}</Btn>
      </div>
    </>
  )
}

// ─── WINE DETAIL ──────────────────────────────────────────────────────────────
function WineDetail({ wine, entries, consumptions, onClose, onEntry, onConsumption, onEdit, onDelete, onDeleteEntry, onDeleteConsumption, onEditEntry, onEditConsumption }) {
  const [tab, setTab] = useState('info')
  const [lightbox, setLightbox] = useState(false)
  const wEntries  = entries.filter((e) => e.wineId === wine.id).sort((a, b) => b.date.localeCompare(a.date))
  const wConsumed = consumptions.filter((c) => c.wineId === wine.id).sort((a, b) => b.date.localeCompare(a.date))
  const tabSt = (t) => ({ padding: '8px 14px', fontSize: 13, cursor: 'pointer', border: 'none', background: 'none',
    color: tab === t ? '#e8dece' : '#9a8f82', fontFamily: FONT, fontWeight: tab === t ? 500 : 400,
    borderBottom: tab === t ? '2px solid #c8963e' : '2px solid transparent', transition: 'color 0.15s' })
  return (
    <>
      {lightbox && <PhotoLightbox src={wine.photo} onClose={() => setLightbox(false)} />}
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
                  {onEditEntry && (
                    <button onClick={() => onEditEntry(e)}
                      style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                      onMouseEnter={(ev) => { ev.currentTarget.style.color = '#c8963e'; ev.currentTarget.style.background = 'rgba(200,150,62,0.1)' }}
                      onMouseLeave={(ev) => { ev.currentTarget.style.color = '#6a5f52'; ev.currentTarget.style.background = 'none' }}>
                      <Edit2 size={13} />
                    </button>
                  )}
                  {onDeleteEntry && (
                    <button onClick={() => { if (window.confirm(`Cancelar esta entrada de ${e.quantity} ${e.quantity === 1 ? 'garrafa' : 'garrafas'}? O stock será revertido.`)) onDeleteEntry(e) }}
                      style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                      onMouseEnter={(ev) => { ev.currentTarget.style.color = '#e87080'; ev.currentTarget.style.background = 'rgba(232,112,128,0.1)' }}
                      onMouseLeave={(ev) => { ev.currentTarget.style.color = '#6a5f52'; ev.currentTarget.style.background = 'none' }}>
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
                    {onEditConsumption && (
                      <button onClick={() => onEditConsumption(c)}
                        style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#c8963e'; e.currentTarget.style.background = 'rgba(200,150,62,0.1)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#6a5f52'; e.currentTarget.style.background = 'none' }}>
                        <Edit2 size={13} />
                      </button>
                    )}
                    {onDeleteConsumption && (
                      <button onClick={() => { if (window.confirm(`Cancelar este consumo de ${c.quantity} ${c.quantity === 1 ? 'garrafa' : 'garrafas'}? O stock será reposto.`)) onDeleteConsumption(c) }}
                        style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#e87080'; e.currentTarget.style.background = 'rgba(232,112,128,0.1)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#6a5f52'; e.currentTarget.style.background = 'none' }}>
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
function FilterSelect({ placeholder, value, onChange, options, onAdd, onRemove }) {
  const [adding, setAdding] = useState(false)
  const [newVal, setNewVal] = useState('')
  const confirmAdd = () => {
    const v = newVal.trim()
    if (v && !options.includes(v)) onAdd(v)
    setNewVal(''); setAdding(false)
  }
  const handleRemove = () => {
    if (!value) return
    if (!window.confirm(`Eliminar "${value}" da lista?`)) return
    onRemove(value)
    onChange('')
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
      {onRemove && value && (
        <button onClick={handleRemove} title={`Eliminar "${value}"`}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, color: '#3a3530', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', transition: 'color 0.15s, border-color 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#e87080'; e.currentTarget.style.borderColor = 'rgba(232,112,128,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#3a3530'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
          <Trash2 size={11} />
        </button>
      )}
    </div>
  )
}

// ─── WINE LIST VIEW ───────────────────────────────────────────────────────────
function WineListRow({ wine, onClick, isMobile }) {
  const [lightbox, setLightbox] = React.useState(false)
  return (
    <div onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14, padding: isMobile ? '10px 14px' : '9px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.12s', opacity: wine.quantity === 0 ? 0.45 : 1 }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
      {lightbox && <PhotoLightbox src={wine.photo} onClose={(e) => { setLightbox(false) }} />}
      <WineThumb photo={wine.photo} type={wine.type} size={isMobile ? 22 : 26} onClick={wine.photo ? (e) => { e.stopPropagation(); setLightbox(true) } : undefined} />
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



// ─── CHANGE PASSWORD SCREEN ───────────────────────────────────────────────────
function ChangePasswordScreen({ profile, onDone }) {
  const [pwd,     setPwd]     = useState('')
  const [pwd2,    setPwd2]    = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (pwd.length < 6) return setError('A password deve ter pelo menos 6 caracteres.')
    if (pwd !== pwd2) return setError('As passwords não coincidem.')
    setLoading(true); setError('')
    const { error: pwErr } = await supabase.auth.updateUser({ password: pwd })
    if (pwErr) { setError(pwErr.message); setLoading(false); return }
    // Clear must_change_password flag
    await supabase.from('videiras_profiles').update({ must_change_password: false }).eq('id', profile.id)
    onDone()
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0b09', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 48, height: 48, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <KeyRound size={20} color="#c8963e" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 300, color: '#e8dece', marginBottom: 6 }}>Define a tua password</div>
          <div style={{ fontSize: 13, color: '#4a453f' }}>Por segurança, define uma nova password para a tua conta.</div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Nova password</div>
            <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} required
              style={{ ...S.inp, fontSize: 14 }} placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Confirmar password</div>
            <input type="password" value={pwd2} onChange={e => setPwd2(e.target.value)} required
              style={{ ...S.inp, fontSize: 14 }} placeholder="Repetir password" />
          </div>
          {error && <div style={{ fontSize: 12, color: '#e87080', padding: '8px 12px', background: 'rgba(232,112,128,0.08)', borderRadius: 6, border: '1px solid rgba(232,112,128,0.2)' }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ marginTop: 8, background: '#c8963e', color: '#0d0b09', border: 'none', borderRadius: 6, padding: '12px', fontSize: 13, fontWeight: 500, fontFamily: FONT, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'A guardar…' : 'Guardar password'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email ou password incorrectos.')
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0b09', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 48, height: 48, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Wine size={22} color="#c8963e" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 200, color: '#e8dece', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Videiras</div>
          <div style={{ fontSize: 10, color: '#3a3530', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>Cellar Collection</div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Email</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ ...S.inp, fontSize: 14 }} placeholder="o.teu@email.pt" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Password</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ ...S.inp, fontSize: 14 }} placeholder="••••••" />
          </div>
          {error && <div style={{ fontSize: 12, color: '#e87080', padding: '8px 12px', background: 'rgba(232,112,128,0.08)', borderRadius: 6, border: '1px solid rgba(232,112,128,0.2)' }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ marginTop: 8, background: '#c8963e', color: '#0d0b09', border: 'none', borderRadius: 6, padding: '12px', fontSize: 13, fontWeight: 500, fontFamily: FONT, letterSpacing: '0.05em', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s' }}>
            {loading ? 'A entrar…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminPanel({ session }) {
  const [users,       setUsers]       = useState([])
  const [loadingU,    setLoadingU]    = useState(true)
  const [tab,         setTab]         = useState('create')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName,  setInviteName]  = useState('')
  const [inviting,    setInviting]    = useState(false)
  const [createEmail, setCreateEmail] = useState('')
  const [createName,  setCreateName]  = useState('')
  const [createPwd,   setCreatePwd]   = useState('')
  const [creating,    setCreating]    = useState(false)
  const [msg,         setMsg]         = useState('')
  const [backingUp,    setBackingUp]    = useState(false)
  const [quotes,       setQuotes]       = useState([])
  const [quotesLoaded, setQuotesLoaded] = useState(false)
  const [qTab,         setQTab]         = useState('list')
  const [newQuote,     setNewQuote]     = useState({ quote: '', author: '', category: 'geral' })
  const [savingQ,      setSavingQ]      = useState(false)
  const [importing,    setImporting]    = useState(false)
  const [importMsg,    setImportMsg]    = useState('')
  const [importPreview, setImportPreview] = useState(null)


  const adminFetch = async (action, method = 'GET', body = null) => {
    const { data: { session: s } } = await supabase.auth.getSession()
    const opts = {
      method,
      headers: { 'Authorization': `Bearer ${s.access_token}`, 'Content-Type': 'application/json' },
    }
    if (body) opts.body = JSON.stringify(body)
    const r = await fetch(`${EDGE_FN_URL}?action=${action}`, opts)
    return r.json()
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (createPwd.length < 6) return setMsg('Erro: A password deve ter pelo menos 6 caracteres.')
    setCreating(true); setMsg('')
    const data = await adminFetch('create', 'POST', { email: createEmail, name: createName, password: createPwd })
    if (data.ok) { setMsg(`Utilizador ${createEmail} criado!`); setCreateEmail(''); setCreateName(''); setCreatePwd(''); loadUsers() }
    else setMsg(`Erro: ${data.error}`)
    setCreating(false)
  }

  const loadUsers = async () => {
    setLoadingU(true)
    const data = await adminFetch('list')
    if (data.users) setUsers(data.users)
    setLoadingU(false)
  }

  useEffect(() => { loadUsers(); loadQuotes() }, [])

  const loadQuotes = async () => {
    const { data } = await supabase.from('videiras_quotes').select('*').order('created_at', { ascending: false })
    if (data) { setQuotes(data); setQuotesLoaded(true) }
  }

  const saveQuote = async () => {
    if (!newQuote.quote.trim()) return
    setSavingQ(true)
    const { data } = await supabase.from('videiras_quotes').insert({ ...newQuote, active: true }).select().single()
    if (data) { setQuotes(p => [data, ...p]); setNewQuote({ quote: '', author: '', category: 'geral' }) }
    setSavingQ(false)
  }

  const toggleQuote = async (q) => {
    await supabase.from('videiras_quotes').update({ active: !q.active }).eq('id', q.id)
    setQuotes(p => p.map(x => x.id === q.id ? { ...x, active: !x.active } : x))
  }

  const deleteQuote = async (q) => {
    if (!window.confirm('Eliminar esta frase?')) return
    await supabase.from('videiras_quotes').delete().eq('id', q.id)
    setQuotes(p => p.filter(x => x.id !== q.id))
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviting(true); setMsg('')
    const data = await adminFetch('invite', 'POST', { email: inviteEmail, name: inviteName })
    if (data.ok) { setMsg(`Convite enviado para ${inviteEmail}!`); setInviteEmail(''); setInviteName(''); loadUsers() }
    else setMsg(`Erro: ${data.error}`)
    setInviting(false)
  }

  const toggleActive = async (u) => {
    await adminFetch('set-active', 'POST', { userId: u.id, active: !u.active })
    loadUsers()
  }

  const toggleRole = async (u) => {
    await adminFetch('set-role', 'POST', { userId: u.id, role: u.role === 'admin' ? 'user' : 'admin' })
    loadUsers()
  }

  const handleImportFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!data.version || !Array.isArray(data.wines)) {
          setImportMsg('Erro: ficheiro inválido ou não é um backup Videiras.')
          setImportPreview(null)
          return
        }
        setImportPreview(data)
        setImportMsg('')
      } catch {
        setImportMsg('Erro: não foi possível ler o ficheiro JSON.')
        setImportPreview(null)
      }
    }
    reader.readAsText(file)
    // reset input so same file can be selected again
    e.target.value = ''
  }

  const handleImport = async () => {
    if (!importPreview) return
    setImporting(true); setImportMsg('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user.id

      // Wines — upsert by id, replace user_id with current user
      if (importPreview.wines?.length) {
        const wines = importPreview.wines.map(w => ({ ...w, user_id: uid }))
        const { error } = await supabase.from('videiras_wines').upsert(wines, { onConflict: 'id' })
        if (error) throw new Error('Vinhos: ' + error.message)
      }

      // Consumptions — upsert by id
      if (importPreview.consumptions?.length) {
        const cons = importPreview.consumptions.map(c => ({ ...c, user_id: uid }))
        const { error } = await supabase.from('videiras_consumptions').upsert(cons, { onConflict: 'id' })
        if (error) throw new Error('Consumos: ' + error.message)
      }

      // Entries — upsert by id
      if (importPreview.entries?.length) {
        const entries = importPreview.entries.map(e => ({ ...e, user_id: uid }))
        const { error } = await supabase.from('videiras_entries').upsert(entries, { onConflict: 'id' })
        if (error) throw new Error('Entradas: ' + error.message)
      }

      // Suppliers — upsert by name (ignore id)
      if (importPreview.suppliers?.length) {
        const sups = importPreview.suppliers.map(s => ({ name: s.name, user_id: uid }))
        const { error } = await supabase.from('videiras_suppliers').upsert(sups, { onConflict: 'user_id,name', ignoreDuplicates: true })
        if (error) throw new Error('Fornecedores: ' + error.message)
      }

      const total = (importPreview.wines?.length||0) + (importPreview.consumptions?.length||0) + (importPreview.entries?.length||0) + (importPreview.suppliers?.length||0)
      setImportMsg(`✓ Importação concluída — ${total} registos processados. Faz refresh para ver as alterações.`)
      setImportPreview(null)
    } catch (err) {
      setImportMsg('Erro: ' + err.message)
    }
    setImporting(false)
  }

  const handleBackup = async () => {
    setBackingUp(true)
    try {
      const [wRes, cRes, eRes, sRes] = await Promise.all([
        supabase.from('videiras_wines').select('*').order('name'),
        supabase.from('videiras_consumptions').select('*').order('date', { ascending: false }),
        supabase.from('videiras_entries').select('*').order('date', { ascending: false }),
        supabase.from('videiras_suppliers').select('*').order('name'),
      ])
      const backup = {
        version: 1,
        exported_at: new Date().toISOString(),
        wines:        wRes.data || [],
        consumptions: cRes.data || [],
        entries:      eRes.data || [],
        suppliers:    sRes.data || [],
      }
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `videiras-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Erro ao exportar backup: ' + err.message)
    }
    setBackingUp(false)
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', paddingBottom: 40 }}>

      {/* Create / Invite form */}
      <div style={{ ...S.stat, padding: 24, marginBottom: 20 }}>
        {/* Tab toggle */}
        <div style={{ display: 'flex', gap: 1, marginBottom: 20, background: '#0d0b09', borderRadius: 7, padding: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
          {[['create', 'Criar utilizador'], ['invite', 'Convidar por email']].map(([t, label]) => (
            <button key={t} onClick={() => { setTab(t); setMsg('') }} style={{
              flex: 1, padding: '7px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', fontFamily: FONT,
              fontSize: 11, fontWeight: 400, letterSpacing: '0.04em', transition: 'all 0.15s',
              background: tab === t ? '#1e1b16' : 'transparent',
              color: tab === t ? '#c8963e' : '#4a453f',
            }}>{label}</button>
          ))}
        </div>

        {tab === 'create' && (
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>Nome</div>
                <input value={createName} onChange={e => setCreateName(e.target.value)}
                  style={{ ...S.inp, fontSize: 13 }} placeholder="Nome do utilizador" />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>Email *</div>
                <input type="email" required value={createEmail} onChange={e => setCreateEmail(e.target.value)}
                  style={{ ...S.inp, fontSize: 13 }} placeholder="email@exemplo.pt" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>Password temporária *</div>
              <input type="password" required value={createPwd} onChange={e => setCreatePwd(e.target.value)}
                style={{ ...S.inp, fontSize: 13 }} placeholder="Mínimo 6 caracteres" />
              <div style={{ fontSize: 11, color: '#3a3530', marginTop: 5 }}>O utilizador será obrigado a alterar no primeiro login.</div>
            </div>
            {msg && <div style={{ fontSize: 12, color: msg.startsWith('Erro') ? '#e87080' : '#68c880', padding: '8px 12px', background: msg.startsWith('Erro') ? 'rgba(232,112,128,0.08)' : 'rgba(104,200,128,0.08)', borderRadius: 5 }}>{msg}</div>}
            <button type="submit" disabled={creating}
              style={{ alignSelf: 'flex-start', background: '#c8963e', color: '#0d0b09', border: 'none', borderRadius: 5, padding: '9px 20px', fontSize: 12, fontWeight: 500, fontFamily: FONT, cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
              {creating ? 'A criar…' : <><UserCheck size={13} /> Criar utilizador</>}
            </button>
          </form>
        )}

        {tab === 'invite' && (
          <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>Nome</div>
                <input value={inviteName} onChange={e => setInviteName(e.target.value)}
                  style={{ ...S.inp, fontSize: 13 }} placeholder="Nome do utilizador" />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>Email *</div>
                <input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  style={{ ...S.inp, fontSize: 13 }} placeholder="email@exemplo.pt" />
              </div>
            </div>
            {msg && <div style={{ fontSize: 12, color: msg.startsWith('Erro') ? '#e87080' : '#68c880', padding: '8px 12px', background: msg.startsWith('Erro') ? 'rgba(232,112,128,0.08)' : 'rgba(104,200,128,0.08)', borderRadius: 5 }}>{msg}</div>}
            <button type="submit" disabled={inviting}
              style={{ alignSelf: 'flex-start', background: 'none', color: '#c8963e', border: '1px solid rgba(200,150,62,0.3)', borderRadius: 5, padding: '9px 20px', fontSize: 12, fontWeight: 400, fontFamily: FONT, cursor: inviting ? 'not-allowed' : 'pointer', opacity: inviting ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
              {inviting ? 'A enviar…' : <><Plus size={13} /> Enviar convite</>}
            </button>
          </form>
        )}
      </div>

      {/* Backup */}
      <div style={{ ...S.stat, padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 13, color: '#e8dece', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Download size={14} color="#c8963e" /> Cópia de segurança
          </div>
          <div style={{ fontSize: 11, color: '#4a453f', lineHeight: 1.5 }}>
            Exporta todos os dados (vinhos, consumos, entradas, fornecedores) para um ficheiro JSON.
          </div>
        </div>
        <button onClick={handleBackup} disabled={backingUp} style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 6,
          border: '1px solid rgba(200,150,62,0.3)', background: 'rgba(200,150,62,0.08)',
          color: '#c8963e', cursor: backingUp ? 'not-allowed' : 'pointer',
          fontFamily: FONT, fontSize: 12, fontWeight: 500, flexShrink: 0,
          opacity: backingUp ? 0.6 : 1, transition: 'all 0.15s',
        }}>
          <Download size={13} /> {backingUp ? 'A exportar…' : 'Exportar backup'}
        </button>
      </div>

      {/* Importar backup */}
      <div style={{ ...S.stat, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <FileText size={14} color="#c8963e" />
          <span style={{ fontSize: 13, color: '#e8dece' }}>Importar backup</span>
        </div>
        <div style={{ fontSize: 11, color: '#4a453f', lineHeight: 1.6, marginBottom: 14 }}>
          Selecciona um ficheiro <code style={{ color: '#6a5f52', background: '#0d0b09', padding: '1px 5px', borderRadius: 3 }}>.json</code> exportado anteriormente.
          Os dados existentes são actualizados; os novos são adicionados. Nada é eliminado.
        </div>

        {/* File picker */}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: '#9a8f82',
          cursor: 'pointer', fontFamily: FONT, fontSize: 12, transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,150,62,0.3)'; e.currentTarget.style.color = '#c8963e' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#9a8f82' }}>
          <FileText size={13} /> Escolher ficheiro…
          <input type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
        </label>

        {/* Preview */}
        {importPreview && (
          <div style={{ marginTop: 16, padding: 14, background: '#0d0b09', borderRadius: 6, border: '1px solid rgba(200,150,62,0.2)' }}>
            <div style={{ fontSize: 11, color: '#c8963e', marginBottom: 10, fontWeight: 500 }}>
              Backup de {importPreview.exported_at ? new Date(importPreview.exported_at).toLocaleString('pt-PT') : '—'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 14 }}>
              {[
                ['Vinhos',      importPreview.wines?.length       || 0],
                ['Consumos',    importPreview.consumptions?.length || 0],
                ['Entradas',    importPreview.entries?.length      || 0],
                ['Fornecedores',importPreview.suppliers?.length    || 0],
              ].map(([label, count]) => (
                <div key={label} style={{ fontSize: 11, color: '#6a5f52' }}>
                  <span style={{ color: '#e8dece', fontWeight: 500 }}>{count}</span> {label.toLowerCase()}
                </div>
              ))}
            </div>
            <button onClick={handleImport} disabled={importing}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 6,
                border: '1px solid rgba(200,150,62,0.3)', background: 'rgba(200,150,62,0.1)',
                color: '#c8963e', cursor: importing ? 'not-allowed' : 'pointer',
                fontFamily: FONT, fontSize: 12, fontWeight: 500,
                opacity: importing ? 0.6 : 1, transition: 'all 0.15s' }}>
              <Download size={13} style={{ transform: 'rotate(180deg)' }} />
              {importing ? 'A importar…' : 'Confirmar importação'}
            </button>
          </div>
        )}

        {importMsg && (
          <div style={{ marginTop: 12, fontSize: 12,
            color: importMsg.startsWith('✓') ? '#68c880' : '#e87080',
            padding: '8px 12px', borderRadius: 5,
            background: importMsg.startsWith('✓') ? 'rgba(104,200,128,0.08)' : 'rgba(232,112,128,0.08)',
          }}>{importMsg}</div>
        )}
      </div>

      {/* Frases */}
      <div style={{ ...S.stat, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
            Frases · {quotes.filter(q => q.active).length} activas
          </h3>
          <div style={{ display: 'flex', gap: 1, background: '#0d0b09', borderRadius: 6, padding: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
            {[['list','Lista'],['add','Nova frase']].map(([t,l]) => (
              <button key={t} onClick={() => setQTab(t)} style={{
                padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
                fontFamily: FONT, fontSize: 11,
                background: qTab === t ? 'rgba(200,150,62,0.12)' : 'transparent',
                color: qTab === t ? '#c8963e' : '#4a453f', transition: 'all 0.15s',
              }}>{l}</button>
            ))}
          </div>
        </div>

        {qTab === 'add' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <textarea value={newQuote.quote} onChange={e => setNewQuote(p => ({...p, quote: e.target.value}))}
              placeholder="Escreve a frase aqui…"
              style={{ ...S.inp, minHeight: 80, resize: 'vertical', fontSize: 13 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input value={newQuote.author} onChange={e => setNewQuote(p => ({...p, author: e.target.value}))}
                placeholder="Autor (opcional)" style={{ ...S.inp, fontSize: 12 }} />
              <select value={newQuote.category} onChange={e => setNewQuote(p => ({...p, category: e.target.value}))}
                style={{ ...S.inp, fontSize: 12, cursor: 'pointer' }}>
                {['geral','consumo','entrada','tinto','branco','rosé','espumante'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Btn variant="gold" onClick={saveQuote} disabled={savingQ || !newQuote.quote.trim()}>
                {savingQ ? 'A guardar…' : 'Guardar frase'}
              </Btn>
            </div>
          </div>
        )}

        {qTab === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
            {!quotesLoaded && <p style={{ color: '#4a453f', fontSize: 12, textAlign: 'center' }}>A carregar…</p>}
            {quotesLoaded && quotes.length === 0 && <p style={{ color: '#4a453f', fontSize: 12, textAlign: 'center' }}>Nenhuma frase ainda.</p>}
            {quotes.map(q => (
              <div key={q.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 7, background: q.active ? 'rgba(255,255,255,0.02)' : 'transparent', border: '1px solid rgba(255,255,255,0.04)', opacity: q.active ? 1 : 0.45 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 3px', fontSize: 12, color: '#e8dece', lineHeight: 1.5 }}>"{q.quote}"</p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {q.author && <span style={{ fontSize: 11, color: '#6a5f52', fontStyle: 'italic' }}>— {q.author}</span>}
                    <span style={{ fontSize: 10, color: '#4a453f', background: '#0d0b09', padding: '1px 6px', borderRadius: 3 }}>{q.category}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => toggleQuote(q)} title={q.active ? 'Desactivar' : 'Activar'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: 4,
                      color: q.active ? '#68c880' : '#4a453f', fontSize: 11, fontFamily: FONT, transition: 'all 0.15s' }}>
                    {q.active ? '●' : '○'}
                  </button>
                  <button onClick={() => deleteQuote(q)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: 4, color: '#3a3530', transition: 'all 0.15s', display: 'flex' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#e87080'; e.currentTarget.style.background = 'rgba(232,112,128,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#3a3530'; e.currentTarget.style.background = 'none' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Users list */}
      <div style={{ ...S.stat, padding: 24 }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={14} /> Utilizadores ({users.length})
        </h3>
        {loadingU
          ? <div style={{ fontSize: 13, color: '#3a3530', padding: '20px 0', textAlign: 'center' }}>A carregar…</div>
          : users.map(u => {
            const isSelf = u.id === session?.user?.id
            return (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: u.active ? '#e8dece' : '#3a3530', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {u.name || '—'}
                    {isSelf && <span style={{ fontSize: 9, background: 'rgba(200,150,62,0.15)', color: '#c8963e', padding: '2px 6px', borderRadius: 3, letterSpacing: '0.08em' }}>TU</span>}
                    {u.role === 'admin' && <span style={{ fontSize: 9, background: 'rgba(104,200,128,0.12)', color: '#68c880', padding: '2px 6px', borderRadius: 3, letterSpacing: '0.08em' }}>ADMIN</span>}
                    {!u.active && <span style={{ fontSize: 9, background: 'rgba(232,112,128,0.12)', color: '#e87080', padding: '2px 6px', borderRadius: 3, letterSpacing: '0.08em' }}>INACTIVO</span>}
                    {u.must_change_password && <span style={{ fontSize: 9, background: 'rgba(200,150,62,0.12)', color: '#c8963e', padding: '2px 6px', borderRadius: 3, letterSpacing: '0.08em' }}>1º LOGIN</span>}
                  </div>
                  <div style={{ fontSize: 11, color: '#4a453f', marginTop: 2 }}>{u.email}</div>
                </div>
                {!isSelf && (
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => toggleRole(u)} title={u.role === 'admin' ? 'Remover admin' : 'Tornar admin'}
                      style={{ padding: '5px 10px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: u.role === 'admin' ? '#68c880' : '#4a453f', cursor: 'pointer', fontSize: 11, fontFamily: FONT, transition: 'all 0.15s' }}>
                      {u.role === 'admin' ? 'Admin ✓' : 'Admin'}
                    </button>
                    <button onClick={() => toggleActive(u)} title={u.active ? 'Desactivar' : 'Activar'}
                      style={{ padding: '5px 10px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: u.active ? '#e87080' : '#68c880', cursor: 'pointer', fontSize: 11, fontFamily: FONT, transition: 'all 0.15s' }}>
                      {u.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                )}
              </div>
            )
          })
        }
      </div>
    </div>
  )
}


// ─── RELATÓRIOS ───────────────────────────────────────────────────────────────
function RelatoriosPanel({ wines, consumptions, entries, isMobile }) {
  const [activeReport, setActiveReport] = React.useState('stock')

  const REPORTS = [
    { id: 'stock',    label: 'Stock da Adega',        icon: <TrendingUp size={13} /> },
    { id: 'catalogo', label: 'Catálogo Completo',      icon: <FileText size={13} /> },
  ]

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 40 }}>
      {/* Report selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {REPORTS.map(r => (
            <button key={r.id} onClick={() => setActiveReport(r.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              borderRadius: 6, border: `1px solid ${activeReport === r.id ? 'rgba(200,150,62,0.4)' : 'rgba(255,255,255,0.07)'}`,
              background: activeReport === r.id ? 'rgba(200,150,62,0.1)' : 'transparent',
              color: activeReport === r.id ? '#c8963e' : '#4a453f', cursor: 'pointer',
              fontFamily: FONT, fontSize: 12, transition: 'all 0.15s',
            }}>
              {r.icon} {r.label}
            </button>
          ))}
      </div>

      {activeReport === 'stock'    && <StockReport    wines={wines} consumptions={consumptions} isMobile={isMobile} />}
      {activeReport === 'catalogo' && <CatalogoReport wines={wines} consumptions={consumptions} isMobile={isMobile} />}
    </div>
  )
}

// ─── PDF HELPERS ──────────────────────────────────────────────────────────────
const pdfFooter = (doc, W, margin) => {
  // Footer bar + separator + centered text (page numbers added in post-pass)
  doc.setFillColor(22, 19, 16); doc.rect(0, 283, W, 14, 'F')
  doc.setDrawColor(50, 44, 38); doc.setLineWidth(0.2); doc.line(margin, 283.5, W - margin, 283.5)
  doc.setFontSize(6); doc.setTextColor(60, 52, 48)
  doc.text('Videiras · Cellar Collection · gerado em ' + new Date().toLocaleString('pt-PT'), W/2, 289.5, { align: 'center' })
}
const pdfAddPageNumbers = (doc, W, margin) => {
  // Post-pass: now all pages exist, so getNumberOfPages() is correct
  const total = doc.internal.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    doc.setFontSize(6); doc.setTextColor(100, 90, 75)
    doc.text('Pág. ' + p + ' / ' + total, W - margin, 289.5, { align: 'right' })
  }
}
const pdfDrawHeader = (doc, W, margin, title) => {
  doc.setFillColor(13, 11, 9); doc.rect(0, 0, W, 297, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13)
  doc.setTextColor(232, 222, 206); doc.setCharSpace(2)
  doc.text('VIDEIRAS', margin, 20)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7)
  doc.setTextColor(90, 80, 65); doc.setCharSpace(1.5)
  doc.text('CELLAR COLLECTION', margin, 25.5); doc.setCharSpace(0)
  doc.setFontSize(7.5); doc.setTextColor(200, 150, 62)
  doc.text(title, W - margin, 20, { align: 'right' })
  doc.setFontSize(7); doc.setTextColor(90, 80, 65)
  doc.text(new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }), W - margin, 25.5, { align: 'right' })
  doc.setDrawColor(200, 150, 62); doc.setLineWidth(0.2)
  doc.line(margin, 29, W - margin, 29)
}
const pdfAutoTableOptions = (margin) => ({
  styles: { font: 'helvetica', fontSize: 7.5, cellPadding: 3, fillColor: [13, 11, 9], textColor: [180, 165, 145], lineColor: [35, 30, 24], lineWidth: 0.2 },
  headStyles: { fillColor: [22, 19, 16], textColor: [200, 150, 62], fontSize: 6.5, fontStyle: 'bold', halign: 'left', cellPadding: { top: 4, bottom: 4, left: 3, right: 3 } },
  footStyles: { fillColor: [22, 19, 16], textColor: [200, 150, 62], fontStyle: 'bold', fontSize: 7.5 },
  alternateRowStyles: { fillColor: [18, 15, 12] },
  columnStyles: {
    0: { cellWidth: 52 }, 1: { cellWidth: 18 }, 2: { cellWidth: 36 },
    3: { cellWidth: 12, halign: 'center' }, 4: { cellWidth: 10, halign: 'center' },
    5: { cellWidth: 22, halign: 'right' }, 6: { cellWidth: 22, halign: 'right' },
  },
  margin: { left: margin, right: margin },
})

// ─── STOCK REPORT ─────────────────────────────────────────────────────────────
function StockReport({ wines, isMobile }) {
  const inStock = wines.filter(w => w.quantity > 0).sort((a, b) => a.name.localeCompare(b.name, 'pt'))
  const totalBottles = inStock.reduce((s, w) => s + w.quantity, 0)
  const totalValue   = inStock.reduce((s, w) => s + w.purchasePrice * w.quantity, 0)
  const totalRefs    = inStock.length
  const byType = inStock.reduce((acc, w) => {
    if (!acc[w.type]) acc[w.type] = { bottles: 0, value: 0, refs: 0 }
    acc[w.type].bottles += w.quantity; acc[w.type].value += w.purchasePrice * w.quantity; acc[w.type].refs++
    return acc
  }, {})

  const exportXLS = () => {
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
    s.onload = () => {
      const rows = [['Stock da Adega — ' + new Date().toLocaleDateString('pt-PT')],[],
        ['Nome','Tipo','País','Região','Ano','Qtd','Preço Unit. (€)','Valor Total (€)'],
        ...inStock.map(w => [w.name,w.type,w.country,w.region,w.year||'—',w.quantity,Number(w.purchasePrice.toFixed(2)),Number((w.purchasePrice*w.quantity).toFixed(2))]),
        [],['TOTAL','','','','',totalBottles,'',Number(totalValue.toFixed(2))]]
      const ws = window.XLSX.utils.aoa_to_sheet(rows)
      ws['!cols'] = [{wch:40},{wch:12},{wch:12},{wch:18},{wch:6},{wch:6},{wch:16},{wch:16}]
      ws['!merges'] = [{s:{r:0,c:0},e:{r:0,c:7}}]
      const wb = window.XLSX.utils.book_new(); window.XLSX.utils.book_append_sheet(wb,ws,'Stock')
      window.XLSX.writeFile(wb, `videiras-stock-${new Date().toISOString().slice(0,10)}.xlsx`)
    }; document.head.appendChild(s)
  }

  const exportPDF = () => {
    const s1 = document.createElement('script'); s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    s1.onload = () => {
      const s2 = document.createElement('script'); s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
      s2.onload = () => {
        const { jsPDF } = window.jspdf
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        const W = 210, margin = 18
        pdfDrawHeader(doc, W, margin, 'RELATÓRIO DE STOCK')
        // KPIs
        const kpis = [{label:'REFERÊNCIAS',value:pdfInt(totalRefs)},{label:'GARRAFAS',value:pdfInt(totalBottles)},{label:'VALOR TOTAL',value:pdfFmt(totalValue)}]
        const kpiW = (W - margin*2 - 8) / 3
        kpis.forEach((k, i) => {
          const x = margin + i * (kpiW + 4)
          doc.setFillColor(22,19,16); doc.setDrawColor(50,44,38); doc.setLineWidth(0.3)
          doc.roundedRect(x, 33, kpiW, 16, 2, 2, 'FD')
          doc.setFontSize(6); doc.setTextColor(100,90,75); doc.text(k.label, x+kpiW/2, 38.5, {align:'center'})
          doc.setFontSize(10); doc.setTextColor(232,222,206); doc.setFont('helvetica','bold')
          doc.text(k.value, x+kpiW/2, 44.5, {align:'center'}); doc.setFont('helvetica','normal')
        })
        // Por tipo
        let yy = 55; doc.setFontSize(6.5); doc.setTextColor(200,150,62); doc.text('POR TIPO', margin, yy); yy += 4
        Object.entries(byType).sort((a,b) => b[1].bottles - a[1].bottles).forEach(([type, d]) => {
          doc.setFillColor(22,19,16); doc.roundedRect(margin, yy, W-margin*2, 6.5, 1, 1, 'F')
          doc.setTextColor(200,180,150); doc.setFontSize(7); doc.text(type, margin+4, yy+4.3)
          doc.setTextColor(150,140,120); doc.text(pdfInt(d.refs)+' ref · '+pdfInt(d.bottles)+' garrafas', margin+45, yy+4.3)
          doc.setTextColor(200,150,62); doc.text(pdfFmt(d.value), W-margin-4, yy+4.3, {align:'right'}); yy += 8
        })
        doc.autoTable({
          ...pdfAutoTableOptions(margin), startY: yy + 4,
          head: [['Nome','Tipo','País / Região','Ano','Qtd','Preço','Total']],
          body: inStock.map(w => [w.name,w.type,[w.region,w.country].filter(Boolean).join(' · '),w.year||'—',w.quantity,w.purchasePrice>0?pdfFmt(w.purchasePrice):'—',(w.purchasePrice*w.quantity)>0?pdfFmt(w.purchasePrice*w.quantity):'—']),
          foot: [['','','','',pdfInt(totalBottles),'',pdfFmt(totalValue)]],
          willDrawPage: (data) => { if (data.pageNumber > 1) { doc.setFillColor(13,11,9); doc.rect(0,0,W,297,'F') } },
          didDrawPage: () => pdfFooter(doc, W, margin),
        })
        pdfAddPageNumbers(doc, W, margin)
        doc.save(`videiras-stock-${new Date().toISOString().slice(0,10)}.pdf`)
      }; document.head.appendChild(s2)
    }; document.head.appendChild(s1)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 400, color: '#e8dece' }}>Stock da Adega</div>
          <div style={{ fontSize: 11, color: '#4a453f', marginTop: 2 }}>{new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportXLS} style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:6,border:'1px solid rgba(255,255,255,0.08)',background:'none',color:'#6a9f6a',cursor:'pointer',fontFamily:FONT,fontSize:11,transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(106,159,106,0.1)';e.currentTarget.style.borderColor='rgba(106,159,106,0.3)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}><Download size={12}/> XLS</button>
          <button onClick={exportPDF} style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:6,border:'1px solid rgba(255,255,255,0.08)',background:'none',color:'#c8963e',cursor:'pointer',fontFamily:FONT,fontSize:11,transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(200,150,62,0.1)';e.currentTarget.style.borderColor='rgba(200,150,62,0.3)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}><Download size={12}/> PDF</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {[{label:'Referências',value:fmtInt(totalRefs),color:'#e8dece'},{label:'Garrafas',value:fmtInt(totalBottles),color:'#e8dece'},{label:'Valor total',value:fmt(totalValue),color:'#c8963e'}].map(k => (
          <div key={k.label} style={{ ...S.stat, padding: isMobile ? '14px 12px' : '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#4a453f', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 300, color: k.color, fontFamily: FONT }}>{k.value}</div>
          </div>
        ))}
      </div>
      <div style={{ ...S.stat, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 14 }}>Por tipo</div>
        {Object.entries(byType).sort((a,b) => b[1].bottles - a[1].bottles).map(([type, d]) => {
          const pct = Math.round((d.bottles / totalBottles) * 100)
          const tc = TYPE_COLORS[type] || { fg: '#9a8f82', bg: '#1a1814' }
          return (
            <div key={type} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: tc.fg, background: tc.bg, padding: '2px 8px', borderRadius: 3, letterSpacing: '0.06em' }}>{type.toUpperCase()}</span>
                  <span style={{ fontSize: 11, color: '#6a5f52' }}>{fmtInt(d.refs)} ref · {fmtInt(d.bottles)} gar.</span>
                </div>
                <span style={{ fontSize: 12, color: '#c8963e' }}>{fmt(d.value)}</span>
              </div>
              <div style={{ height: 3, background: '#1a1814', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: tc.fg, opacity: 0.6, borderRadius: 2, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ ...S.stat, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Nome','Tipo',!isMobile&&'País / Região',!isMobile&&'Ano','Qtd',!isMobile&&'Preço','Total'].filter(Boolean).map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: h==='Qtd'||h==='Preço'||h==='Total'?'right':'left', fontSize: 9, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inStock.map((w, i) => (
                <tr key={w.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i%2===1?'rgba(255,255,255,0.01)':'transparent' }}>
                  <td style={{ padding: '9px 12px', color: '#e8dece', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</td>
                  <td style={{ padding: '9px 12px' }}><Badge type={w.type} /></td>
                  {!isMobile && <td style={{ padding: '9px 12px', color: '#6a5f52', fontSize: 11 }}>{[w.region, w.country].filter(Boolean).join(' · ')}</td>}
                  {!isMobile && <td style={{ padding: '9px 12px', color: '#6a5f52', textAlign: 'center' }}>{w.year || '—'}</td>}
                  <td style={{ padding: '9px 12px', color: '#e8dece', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{w.quantity}</td>
                  {!isMobile && <td style={{ padding: '9px 12px', color: '#6a5f52', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{w.purchasePrice > 0 ? fmt(w.purchasePrice) : '—'}</td>}
                  <td style={{ padding: '9px 12px', color: '#c8963e', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{(w.purchasePrice*w.quantity) > 0 ? fmt(w.purchasePrice*w.quantity) : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <td colSpan={isMobile?2:4} style={{ padding: '10px 12px', fontSize: 9, color: '#4a453f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</td>
                <td style={{ padding: '10px 12px', color: '#e8dece', textAlign: 'right', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{fmtInt(totalBottles)}</td>
                {!isMobile && <td></td>}
                <td style={{ padding: '10px 12px', color: '#c8963e', textAlign: 'right', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{fmt(totalValue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── CATÁLOGO COMPLETO ────────────────────────────────────────────────────────
function CatalogoReport({ wines, isMobile }) {
  const allWines = [...wines].sort((a, b) => a.name.localeCompare(b.name, 'pt'))
  const totalBottles = allWines.reduce((s, w) => s + w.quantity, 0)
  const totalValue   = allWines.reduce((s, w) => s + w.purchasePrice * w.quantity, 0)
  const totalRefs    = allWines.length
  const byType = allWines.reduce((acc, w) => {
    if (!acc[w.type]) acc[w.type] = { bottles: 0, value: 0, refs: 0 }
    acc[w.type].bottles += w.quantity; acc[w.type].value += w.purchasePrice * w.quantity; acc[w.type].refs++
    return acc
  }, {})
  const maxTypeBottles = Math.max(...Object.values(byType).map(d => d.bottles), 1)

  const exportXLS = () => {
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
    s.onload = () => {
      const rows = [['Catálogo Completo — ' + new Date().toLocaleDateString('pt-PT')],[],
        ['Nome','Tipo','País','Região','Ano','Qtd','Preço Unit. (€)','Valor Total (€)'],
        ...allWines.map(w => [w.name,w.type,w.country,w.region,w.year||'—',w.quantity,Number(w.purchasePrice.toFixed(2)),Number((w.purchasePrice*w.quantity).toFixed(2))]),
        [],['TOTAL','','','','',totalBottles,'',Number(totalValue.toFixed(2))]]
      const ws = window.XLSX.utils.aoa_to_sheet(rows)
      ws['!cols'] = [{wch:40},{wch:12},{wch:12},{wch:18},{wch:6},{wch:6},{wch:16},{wch:16}]
      ws['!merges'] = [{s:{r:0,c:0},e:{r:0,c:7}}]
      const wb = window.XLSX.utils.book_new(); window.XLSX.utils.book_append_sheet(wb,ws,'Catálogo')
      window.XLSX.writeFile(wb, `videiras-catalogo-${new Date().toISOString().slice(0,10)}.xlsx`)
    }; document.head.appendChild(s)
  }

  const exportPDF = () => {
    const s1 = document.createElement('script'); s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    s1.onload = () => {
      const s2 = document.createElement('script'); s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
      s2.onload = () => {
        const { jsPDF } = window.jspdf
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        const W = 210, margin = 18
        pdfDrawHeader(doc, W, margin, 'CATÁLOGO COMPLETO')
        const kpis = [{label:'REFERÊNCIAS',value:pdfInt(totalRefs)},{label:'GARRAFAS',value:pdfInt(totalBottles)},{label:'VALOR TOTAL',value:pdfFmt(totalValue)}]
        const kpiW = (W - margin*2 - 8) / 3
        kpis.forEach((k, i) => {
          const x = margin + i * (kpiW + 4)
          doc.setFillColor(22,19,16); doc.setDrawColor(50,44,38); doc.setLineWidth(0.3)
          doc.roundedRect(x, 33, kpiW, 16, 2, 2, 'FD')
          doc.setFontSize(6); doc.setTextColor(100,90,75); doc.text(k.label, x+kpiW/2, 38.5, {align:'center'})
          doc.setFontSize(10); doc.setTextColor(232,222,206); doc.setFont('helvetica','bold')
          doc.text(k.value, x+kpiW/2, 44.5, {align:'center'}); doc.setFont('helvetica','normal')
        })
        let yy = 55; doc.setFontSize(6.5); doc.setTextColor(200,150,62); doc.text('POR TIPO', margin, yy); yy += 4
        Object.entries(byType).sort((a,b) => b[1].bottles - a[1].bottles).forEach(([type, d]) => {
          doc.setFillColor(22,19,16); doc.roundedRect(margin, yy, W-margin*2, 6.5, 1, 1, 'F')
          doc.setTextColor(200,180,150); doc.setFontSize(7); doc.text(type, margin+4, yy+4.3)
          doc.setTextColor(150,140,120); doc.text(pdfInt(d.refs)+' ref · '+pdfInt(d.bottles)+' garrafas', margin+45, yy+4.3)
          doc.setTextColor(200,150,62); doc.text(pdfFmt(d.value), W-margin-4, yy+4.3, {align:'right'}); yy += 8
        })
        doc.autoTable({
          ...pdfAutoTableOptions(margin), startY: yy + 4,
          head: [['Nome','Tipo','País / Região','Ano','Qtd','Preço','Total']],
          body: allWines.map(w => [w.name,w.type,[w.region,w.country].filter(Boolean).join(' · '),w.year||'—',w.quantity>0?w.quantity:'—',w.purchasePrice>0?pdfFmt(w.purchasePrice):'—',(w.purchasePrice*w.quantity)>0?pdfFmt(w.purchasePrice*w.quantity):'—']),
          foot: [['','','','',pdfInt(totalBottles),'',pdfFmt(totalValue)]],
          willDrawPage: (data) => { if (data.pageNumber > 1) { doc.setFillColor(13,11,9); doc.rect(0,0,W,297,'F') } },
          didDrawPage: () => pdfFooter(doc, W, margin),
        })
        pdfAddPageNumbers(doc, W, margin)
        doc.save(`videiras-catalogo-${new Date().toISOString().slice(0,10)}.pdf`)
      }; document.head.appendChild(s2)
    }; document.head.appendChild(s1)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 400, color: '#e8dece' }}>Catálogo Completo</div>
          <div style={{ fontSize: 11, color: '#4a453f', marginTop: 2 }}>{new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportXLS} style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:6,border:'1px solid rgba(255,255,255,0.08)',background:'none',color:'#6a9f6a',cursor:'pointer',fontFamily:FONT,fontSize:11,transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(106,159,106,0.1)';e.currentTarget.style.borderColor='rgba(106,159,106,0.3)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}><Download size={12}/> XLS</button>
          <button onClick={exportPDF} style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:6,border:'1px solid rgba(255,255,255,0.08)',background:'none',color:'#c8963e',cursor:'pointer',fontFamily:FONT,fontSize:11,transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(200,150,62,0.1)';e.currentTarget.style.borderColor='rgba(200,150,62,0.3)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}><Download size={12}/> PDF</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {[{label:'Referências',value:fmtInt(totalRefs),color:'#e8dece'},{label:'Garrafas',value:fmtInt(totalBottles),color:'#e8dece'},{label:'Valor total',value:fmt(totalValue),color:'#c8963e'}].map(k => (
          <div key={k.label} style={{ ...S.stat, padding: isMobile ? '14px 12px' : '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#4a453f', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 300, color: k.color, fontFamily: FONT }}>{k.value}</div>
          </div>
        ))}
      </div>
      <div style={{ ...S.stat, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 14 }}>Por tipo</div>
        {Object.entries(byType).sort((a,b) => b[1].bottles - a[1].bottles).map(([type, d]) => {
          const pct = Math.round((d.bottles / maxTypeBottles) * 100)
          const tc = TYPE_COLORS[type] || { fg: '#9a8f82', bg: '#1a1814' }
          return (
            <div key={type} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: tc.fg, background: tc.bg, padding: '2px 8px', borderRadius: 3, letterSpacing: '0.06em' }}>{type.toUpperCase()}</span>
                  <span style={{ fontSize: 11, color: '#6a5f52' }}>{fmtInt(d.refs)} ref · {fmtInt(d.bottles)} gar.</span>
                </div>
                <span style={{ fontSize: 12, color: '#c8963e' }}>{fmt(d.value)}</span>
              </div>
              <div style={{ height: 3, background: '#1a1814', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: tc.fg, opacity: 0.6, borderRadius: 2, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ ...S.stat, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Nome','Tipo',!isMobile&&'País / Região',!isMobile&&'Ano','Qtd',!isMobile&&'Preço','Total'].filter(Boolean).map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: h==='Qtd'||h==='Preço'||h==='Total'?'right':'left', fontSize: 9, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allWines.map((w, i) => (
                <tr key={w.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i%2===1?'rgba(255,255,255,0.01)':'transparent', opacity: w.quantity===0?0.45:1 }}>
                  <td style={{ padding: '9px 12px', color: '#e8dece', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</td>
                  <td style={{ padding: '9px 12px' }}><Badge type={w.type} /></td>
                  {!isMobile && <td style={{ padding: '9px 12px', color: '#6a5f52', fontSize: 11 }}>{[w.region, w.country].filter(Boolean).join(' · ')}</td>}
                  {!isMobile && <td style={{ padding: '9px 12px', color: '#6a5f52', textAlign: 'center' }}>{w.year || '—'}</td>}
                  <td style={{ padding: '9px 12px', color: '#e8dece', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{w.quantity > 0 ? w.quantity : '—'}</td>
                  {!isMobile && <td style={{ padding: '9px 12px', color: '#6a5f52', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{w.purchasePrice > 0 ? fmt(w.purchasePrice) : '—'}</td>}
                  <td style={{ padding: '9px 12px', color: '#c8963e', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{(w.purchasePrice*w.quantity) > 0 ? fmt(w.purchasePrice*w.quantity) : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <td colSpan={isMobile?2:4} style={{ padding: '10px 12px', fontSize: 9, color: '#4a453f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</td>
                <td style={{ padding: '10px 12px', color: '#e8dece', textAlign: 'right', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{fmtInt(totalBottles)}</td>
                {!isMobile && <td></td>}
                <td style={{ padding: '10px 12px', color: '#c8963e', textAlign: 'right', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{fmt(totalValue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
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

  // Consumos por região
  const byRegion = consumptions.reduce((acc, c) => {
    const w = wines.find(x => x.id === c.wineId)
    if (!w) return acc
    const key = w.region || w.country || 'Desconhecida'
    if (!acc[key]) acc[key] = { count: 0, bottles: 0, avgRating: 0, ratings: [] }
    acc[key].count++
    acc[key].bottles += c.quantity
    if (c.rating) acc[key].ratings.push(c.rating)
    return acc
  }, {})
  // compute avgRating
  Object.values(byRegion).forEach(d => {
    d.avgRating = d.ratings.length ? (d.ratings.reduce((s, r) => s + r, 0) / d.ratings.length) : 0
  })
  const topRegions = Object.entries(byRegion)
    .sort((a, b) => b[1].bottles - a[1].bottles)
    .slice(0, 8)
  const maxRegionBottles = topRegions.length ? topRegions[0][1].bottles : 1

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 40 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { l: 'Referências em stock', v: fmtInt(inStock.length),      c: '#e8dece' },
          { l: 'Garrafas em stock',    v: fmtInt(totalBottles),         c: '#e8dece' },
          { l: 'Valor Total',          v: fmt(totalValue),      c: '#c8963e' },
          { l: 'Consumidas',           v: fmtInt(totalConsumed),        c: '#9a8f82' },
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

      {/* Consumos por região */}
      <div style={{ ...S.stat, padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Mais consumidos por região</h3>
        {topRegions.length === 0
          ? <p style={{ fontSize: 13, color: '#3a3530' }}>Sem consumos registados.</p>
          : topRegions.map(([region, d]) => (
            <div key={region} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: '#e8dece', fontWeight: 400 }}>{region}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  {d.avgRating > 0 && (
                    <span style={{ fontSize: 11, color: '#c8963e' }}>{'★'.repeat(Math.round(d.avgRating))} {d.avgRating.toFixed(1)}</span>
                  )}
                  <span style={{ fontSize: 12, color: '#9a8f82', minWidth: 60, textAlign: 'right' }}>{fmtInt(d.bottles)} {d.bottles === 1 ? 'garrafa' : 'garrafas'}</span>
                </div>
              </div>
              <div style={{ height: 3, background: '#26221c', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(d.bottles / maxRegionBottles) * 100}%`, background: '#c8963e', opacity: 0.5, borderRadius: 2, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          ))
        }
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
  const [wines,            setWines]            = useState([])
  const [entries,          setEntries]          = useState([])
  const [consumptions,     setConsumptions]     = useState([])
  const [session,          setSession]          = useState(null)
  const [profile,          setProfile]          = useState(null)
  const [authLoading,      setAuthLoading]      = useState(true)
  const [loading,          setLoading]          = useState(true)
  const [types,            setTypes]            = useState(INIT_TYPES)
  const [suppliers,        setSuppliers]        = useState([])
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
  const [activeEntry,    setActiveEntry]    = useState(null)
  const [activeCons,     setActiveCons]     = useState(null)
  const [quotes,         setQuotes]         = useState([])
  const [activeQuote,    setActiveQuote]    = useState(null)
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

  // ── AUTENTICAÇÃO ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loadProfile = async (userId) => {
      const { data } = await supabase.from('videiras_profiles').select('*').eq('id', userId).single()
      setProfile(data || null)
    }
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s?.user) loadProfile(s.user.id)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_OUT') {
        setSession(null); setProfile(null)
        setWines([]); setEntries([]); setConsumptions([])
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setSession(s)
        if (s?.user) loadProfile(s.user.id)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── CARREGAR DADOS DO SUPABASE ────────────────────────────────────────────
  useEffect(() => {
    if (!session) return
    if (wines.length > 0) return  // já carregado — não recarregar no token refresh
    const load = async () => {
      setLoading(true)
      try {
        const [wRes, eRes, cRes, sRes, qRes] = await Promise.all([
          supabase.from('videiras_wines').select('*').order('name'),
          supabase.from('videiras_entries').select('*').order('date', { ascending: false }),
          supabase.from('videiras_consumptions').select('*').order('date', { ascending: false }),
          supabase.from('videiras_suppliers').select('name').order('name'),
        ])
        if (wRes.error) console.error('wines:', wRes.error)
        if (eRes.error) console.error('entries:', eRes.error)
        if (cRes.error) console.error('consumptions:', cRes.error)
        if (wRes.data) setWines(wRes.data.map(wineFromDb))
        if (eRes.data) setEntries(eRes.data.map(entryFromDb))
        if (cRes.data) setConsumptions(cRes.data.map(consumptionFromDb))
        if (sRes.data && sRes.data.length > 0) setSuppliers(sRes.data.map(r => r.name))
        else setSuppliers([...SUPPLIERS].sort((a, b) => a.localeCompare(b, 'pt')))
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [session])

  const closeModal = () => { setModal(null); setActiveWine(null); setActiveEntry(null); setActiveCons(null) }

  const showRandomQuote = (context) => {
    if (!quotes.length) return
    // Try to match category: type of wine or action (consumo/entrada)
    const candidates = quotes.filter(q =>
      q.category === context ||
      q.category === 'geral'
    )
    const pool = candidates.length ? candidates : quotes
    setActiveQuote(pool[Math.floor(Math.random() * pool.length)])
  }

  const addWine = async (d) => {
    const { data } = await supabase.from('videiras_wines').insert({ ...wineToDb(d), user_id: session.user.id }).select().single()
    if (data) setWines((p) => [...p, wineFromDb(data)])
    closeModal()
  }

  const editWine = async (d) => {
    const { data } = await supabase.from('videiras_wines').update(wineToDb(d)).eq('id', activeWine.id).select().single()
    if (data) setWines((p) => p.map((w) => w.id === activeWine.id ? wineFromDb(data) : w))
    closeModal()
  }

  const deleteWine = async (id) => {
    await supabase.from('videiras_wines').delete().eq('id', id)
    setWines((p) => p.filter((w) => w.id !== id))
    closeModal()
  }

  const addEntry = async (d) => {
    const wine = wines.find(w => w.id === activeWine.id)
    const newQty = (wine?.quantity || 0) + d.quantity
    const [eRes, wRes] = await Promise.all([
      supabase.from('videiras_entries').insert({ ...entryToDb({ ...d, wineId: activeWine.id }), user_id: session.user.id }).select().single(),
      supabase.from('videiras_wines').update({ quantity: newQty, purchase_price: d.price || wine?.purchasePrice || 0 }).eq('id', activeWine.id).select().single(),
    ])
    if (eRes.data) setEntries((p) => [...p, entryFromDb(eRes.data)])
    if (wRes.data) setWines((p) => p.map((w) => w.id !== activeWine.id ? w : wineFromDb(wRes.data)))
    closeModal()
    showRandomQuote('entrada')
  }

  const addConsumption = async (d) => {
    const wine = wines.find(w => w.id === activeWine.id)
    const newQty = (wine?.quantity || 0) - d.quantity
    const updates = { quantity: newQty, ...(d.rating ? { personal_rating: d.rating } : {}) }
    const [cRes, wRes] = await Promise.all([
      supabase.from('videiras_consumptions').insert({ ...consumptionToDb({ ...d, wineId: activeWine.id }), user_id: session.user.id }).select().single(),
      supabase.from('videiras_wines').update(updates).eq('id', activeWine.id).select().single(),
    ])
    if (cRes.data) setConsumptions((p) => [...p, consumptionFromDb(cRes.data)])
    if (wRes.data) setWines((p) => p.map((w) => w.id !== activeWine.id ? w : wineFromDb(wRes.data)))
    closeModal()
    const wineType = wine?.type?.toLowerCase()
    showRandomQuote(['tinto','branco','rosé','espumante'].includes(wineType) ? wineType : 'consumo')
  }

  const deleteEntry = async (entry) => {
    const wine = wines.find(w => w.id === entry.wineId)
    const newQty = Math.max(0, (wine?.quantity || 0) - entry.quantity)
    await supabase.from('videiras_entries').delete().eq('id', entry.id)
    const { data } = await supabase.from('videiras_wines').update({ quantity: newQty }).eq('id', entry.wineId).select().single()
    setEntries((p) => p.filter((e) => e.id !== entry.id))
    if (data) setWines((p) => p.map((w) => w.id !== entry.wineId ? w : wineFromDb(data)))
  }

  const deleteConsumption = async (consumption) => {
    const wine = wines.find(w => w.id === consumption.wineId)
    const newQty = (wine?.quantity || 0) + consumption.quantity
    await supabase.from('videiras_consumptions').delete().eq('id', consumption.id)
    const { data } = await supabase.from('videiras_wines').update({ quantity: newQty }).eq('id', consumption.wineId).select().single()
    setConsumptions((p) => p.filter((c) => c.id !== consumption.id))
    if (data) setWines((p) => p.map((w) => w.id !== consumption.wineId ? w : wineFromDb(data)))
  }

  const editEntry = async (originalEntry, d) => {
    const wine = wines.find(w => w.id === originalEntry.wineId)
    const qtyDiff = d.quantity - originalEntry.quantity
    const newQty  = (wine?.quantity || 0) + qtyDiff
    const [eRes, wRes] = await Promise.all([
      supabase.from('videiras_entries').update(entryToDb({ ...d, wineId: originalEntry.wineId })).eq('id', originalEntry.id).select().single(),
      supabase.from('videiras_wines').update({ quantity: newQty, purchase_price: d.price || wine?.purchasePrice || 0 }).eq('id', originalEntry.wineId).select().single(),
    ])
    if (eRes.data) setEntries(p => p.map(e => e.id === originalEntry.id ? entryFromDb(eRes.data) : e))
    if (wRes.data) setWines(p => p.map(w => w.id !== originalEntry.wineId ? w : wineFromDb(wRes.data)))
    closeModal()
  }

  const editConsumption = async (originalCons, d) => {
    const wine = wines.find(w => w.id === originalCons.wineId)
    const qtyDiff = originalCons.quantity - d.quantity
    const newQty  = (wine?.quantity || 0) + qtyDiff
    const updates = { quantity: newQty, ...(d.rating ? { personal_rating: d.rating } : {}) }
    const [cRes, wRes] = await Promise.all([
      supabase.from('videiras_consumptions').update(consumptionToDb({ ...d, wineId: originalCons.wineId })).eq('id', originalCons.id).select().single(),
      supabase.from('videiras_wines').update(updates).eq('id', originalCons.wineId).select().single(),
    ])
    if (cRes.data) setConsumptions(p => p.map(c => c.id === originalCons.id ? consumptionFromDb(cRes.data) : c))
    if (wRes.data) setWines(p => p.map(w => w.id !== originalCons.wineId ? w : wineFromDb(wRes.data)))
    closeModal()
  }

  const filtered = useMemo(() => wines.filter((w) => {
    const q = search.toLowerCase()
    const ms = !q || [w.name, w.country, w.region].some((f) => f?.toLowerCase().includes(q))
    const stock = showNoStock || w.quantity > 0
    return ms && stock && (!filterType || w.type === filterType) && (!filterCountry || w.country === filterCountry) && (!filterRegion || w.region === filterRegion)
  }), [wines, search, filterType, filterCountry, filterRegion, showNoStock])

  const liveWine = activeWine ? wines.find((w) => w.id === activeWine.id) || activeWine : null

  const isAdmin = profile?.role === 'admin'
  const handleLogout = async () => { await supabase.auth.signOut() }

  const NAV = [
    { id: 'dashboard', icon: <BarChart3 size={15} />, label: 'Dashboard' },
    { id: 'adega',     icon: <Wine size={15} />,      label: 'Adega' },
    { id: 'entradas',  icon: <LogIn size={15} />,     label: 'Entradas' },
    { id: 'consumos',  icon: <LogOut size={15} />,    label: 'Consumos' },
    { id: 'relatorios', icon: <FileText size={15} />, label: 'Relatórios' },
    ...(isAdmin ? [{ id: 'admin', icon: <ShieldCheck size={15} />, label: 'Admin' }] : []),
  ]

  if (authLoading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0b09', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, fontFamily: FONT }}>
      <div style={{ width: 40, height: 40, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wine size={20} color="#c8963e" /></div>
      <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.2em', textTransform: 'uppercase' }}>A verificar sessão…</div>
    </div>
  )

  if (!session) return <LoginScreen />

  if (profile?.must_change_password) return <ChangePasswordScreen profile={profile} onDone={() => setProfile(p => ({ ...p, must_change_password: false }))} />

  if (profile && !profile.active) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0b09', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: FONT }}>
      <UserX size={32} color="#e87080" />
      <div style={{ fontSize: 15, color: '#e8dece' }}>Conta inactiva</div>
      <div style={{ fontSize: 13, color: '#4a453f' }}>Contacta o administrador.</div>
      <button onClick={handleLogout} style={{ marginTop: 8, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#6a5f52', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontFamily: FONT, fontSize: 12 }}>Sair</button>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0b09', color: '#e8dece', fontFamily: FONT }}>
      {loading && (
        <div style={{ position: 'fixed', inset: 0, background: '#0d0b09', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 200, gap: 16 }}>
          <div style={{ width: 40, height: 40, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wine size={20} color="#c8963e" />
          </div>
          <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.2em', textTransform: 'uppercase' }}>A carregar adega…</div>
        </div>
      )}

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

          <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: 11, color: '#3a3530', lineHeight: 1.8, fontWeight: 300, marginBottom: 10 }}>
              <div>{fmtInt(wines.length)} referências</div>
              <div>{fmtInt(wines.reduce((s, w) => s + w.quantity, 0))} garrafas</div>
            </div>
            <div style={{ fontSize: 11, color: '#4a453f', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.email}</div>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#4a453f', cursor: 'pointer', fontSize: 11, fontFamily: FONT, padding: 0, transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e87080'}
              onMouseLeave={e => e.currentTarget.style.color = '#4a453f'}>
              <KeyRound size={11} /> Terminar sessão
            </button>
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
            {{ dashboard: 'Dashboard', adega: 'Adega', entradas: 'Entradas', consumos: 'Consumos', relatorios: 'Relatórios', admin: 'Admin' }[view]}
          </h1>
          {view === 'adega' && (
            <Btn variant="gold" onClick={() => setModal('addWine')}><Plus size={13} />{!isMobile && 'Vinho'}</Btn>
          )}
        </div>

        {/* content */}
        <div style={{ flex: 1, padding: isMobile ? 16 : 24, overflowY: 'auto', paddingBottom: isMobile ? 72 : 24 }}>
          {view === 'dashboard' && <Dashboard wines={wines} entries={entries} consumptions={consumptions} isMobile={isMobile} />}
          {view === 'relatorios' && <RelatoriosPanel wines={wines} consumptions={consumptions} entries={entries} isMobile={isMobile} />}
          {view === 'admin' && isAdmin && <AdminPanel session={session} />}

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
                      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                        <button onClick={() => { if (w) { setActiveWine(w); setActiveEntry(e); setModal('editEntry') } }}
                          title="Editar entrada"
                          style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                          onMouseEnter={(e2) => { e2.currentTarget.style.color = '#c8963e'; e2.currentTarget.style.background = 'rgba(200,150,62,0.1)' }}
                          onMouseLeave={(e2) => { e2.currentTarget.style.color = '#6a5f52'; e2.currentTarget.style.background = 'none' }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => { if (window.confirm(`Cancelar entrada de ${e.quantity} ${e.quantity === 1 ? 'garrafa' : 'garrafas'} de "${w?.name}"? O stock será revertido.`)) deleteEntry(e) }}
                          title="Cancelar entrada"
                          style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', flexShrink: 0, display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                          onMouseEnter={(e2) => { e2.currentTarget.style.color = '#e87080'; e2.currentTarget.style.background = 'rgba(232,112,128,0.1)' }}
                          onMouseLeave={(e2) => { e2.currentTarget.style.color = '#6a5f52'; e2.currentTarget.style.background = 'none' }}>
                          <Trash2 size={13} />
                        </button>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <Stars value={c.rating} size={12} />
                        <button onClick={() => { if (w) { setActiveWine(w); setActiveCons(c); setModal('editCons') } }}
                          title="Editar consumo"
                          style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', flexShrink: 0, display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#c8963e'; e.currentTarget.style.background = 'rgba(200,150,62,0.1)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#6a5f52'; e.currentTarget.style.background = 'none' }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => { if (window.confirm(`Cancelar consumo de ${c.quantity} ${c.quantity === 1 ? 'garrafa' : 'garrafas'} de "${w?.name}"? O stock será reposto.`)) deleteConsumption(c) }}
                          title="Cancelar consumo"
                          style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', flexShrink: 0, display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#e87080'; e.currentTarget.style.background = 'rgba(232,112,128,0.1)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#6a5f52'; e.currentTarget.style.background = 'none' }}>
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
          {NAV.map((n) => {
            const active = view === n.id
            return (
              <button key={n.id} onClick={() => setView(n.id)} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s',
                color: active ? '#c8963e' : '#3a3530', fontFamily: FONT, padding: '4px 1px', minWidth: 0,
              }}>
                <div style={{
                  padding: active ? '2px 8px' : '2px 4px', borderRadius: 10,
                  background: active ? 'rgba(200,150,62,0.12)' : 'transparent',
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {React.cloneElement(n.icon, { size: 14 })}
                </div>
                {active && (
                  <span style={{ fontSize: 7.5, letterSpacing: '0.03em', textTransform: 'uppercase', fontWeight: 600, lineHeight: 1 }}>
                    {n.label}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {activeQuote && <QuoteOverlay quote={activeQuote} onClose={() => setActiveQuote(null)} />}

      {/* MODALS */}
      {modal && (
        <ModalShell onClose={closeModal} isMobile={isMobile}>
          {modal === 'addWine'     && <WineForm types={types} setTypes={setTypes} countriesRegions={countriesRegions} setCountriesRegions={setCountriesRegions} allWines={wines} onExactMatch={(w) => { setActiveWine(w); setModal('entry') }} onSave={addWine} onClose={closeModal} />}
          {modal === 'editWine'    && liveWine && <WineForm wine={liveWine} types={types} setTypes={setTypes} countriesRegions={countriesRegions} setCountriesRegions={setCountriesRegions} onSave={editWine} onClose={closeModal} />}
          {modal === 'detail'      && liveWine && <WineDetail wine={liveWine} entries={entries} consumptions={consumptions} onClose={closeModal} onEntry={() => setModal('entry')} onConsumption={() => setModal('consumption')} onEdit={() => setModal('editWine')} onDelete={() => deleteWine(liveWine.id)} onDeleteEntry={deleteEntry} onDeleteConsumption={deleteConsumption} onEditEntry={(e) => { setActiveEntry(e); setModal('editEntry') }} onEditConsumption={(c) => { setActiveCons(c); setModal('editCons') }} />}
          {modal === 'entry'       && liveWine && <EntryForm wine={liveWine} suppliers={suppliers} setSuppliers={setSuppliers} entries={entries} onSave={addEntry} onClose={closeModal} />}
          {modal === 'editEntry'    && liveWine && activeEntry && <EntryForm wine={liveWine} entry={activeEntry} suppliers={suppliers} setSuppliers={setSuppliers} entries={entries} onSave={(d) => editEntry(activeEntry, d)} onClose={closeModal} />}
          {modal === 'consumption' && liveWine && <ConsumptionForm wine={liveWine} onSave={addConsumption} onClose={closeModal} />}
          {modal === 'editCons'    && liveWine && activeCons   && <ConsumptionForm wine={liveWine} consumption={activeCons} onSave={(d) => editConsumption(activeCons, d)} onClose={closeModal} />}
        </ModalShell>
      )}
    </div>
  )
}