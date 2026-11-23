import React, { useState } from 'react'
import { Search, Eye, EyeOff, List, LayoutGrid, Plus, SlidersHorizontal } from 'lucide-react'
import { S, FONT, getTC, chipStyle } from '../utils/constants'
import { bottleLabel } from '../utils/constants'
import Btn from '../components/ui/Btn'
import FilterSelect from '../components/ui/FilterSelect'
import { WineListView, WineGridView, WineMobileList } from '../components/WineCard'

export default function Adega({
  wines, wineLocations, locations,
  search, setSearch,
  filterType, setFilterType,
  filterCountry, setFilterCountry,
  filterRegion, setFilterRegion,
  filterBottleSize, setFilterBottleSize,
  listMode, setListMode,
  showNoStock, setShowNoStock,
  types, setTypes,
  allCountries,
  countriesRegions,
  regionsForFilter,
  addCountry, addRegionToCountry,
  bottleSizesInUse,
  filtered,
  isMobile,
  onWineClick,
  onAddWine,
}) {
  if (isMobile) return <AdegaMobile {...{ wines, wineLocations, locations, search, setSearch, filterType, setFilterType, filterCountry, setFilterCountry, filterRegion, setFilterRegion, filterBottleSize, setFilterBottleSize, showNoStock, setShowNoStock, types, allCountries, countriesRegions, bottleSizesInUse, filtered, onWineClick }} />
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 160, maxWidth: 260 }}>
          <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4a453f' }} />
          <input style={{ ...S.inp, paddingLeft: 30, fontSize: 13 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar…" />
        </div>
        <FilterSelect placeholder="Todos os tipos" value={filterType} onChange={setFilterType} options={types} onAdd={v => setTypes(p => [...p, v])} />
        {!isMobile && <FilterSelect placeholder="Países" value={filterCountry} onChange={v => { setFilterCountry(v); setFilterRegion('') }} options={allCountries} onAdd={addCountry} />}
        {!isMobile && filterCountry && (
          <FilterSelect placeholder="Regiões" value={filterRegion} onChange={setFilterRegion} options={countriesRegions[filterCountry] || []} onAdd={v => addRegionToCountry(filterCountry, v)} />
        )}
        {!isMobile && bottleSizesInUse.length > 1 && (
          <select style={{ ...S.inp, width: 'auto', fontSize: 12, cursor: 'pointer' }} value={filterBottleSize} onChange={e => setFilterBottleSize(e.target.value ? parseInt(e.target.value) : '')}>
            <option value="">Todos os formatos</option>
            {bottleSizesInUse.map(ml => <option key={ml} value={ml}>{bottleLabel(ml)}</option>)}
          </select>
        )}
        <button
          onClick={() => setShowNoStock(p => !p)}
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
        ? <WineListView wines={filtered} onWineClick={onWineClick} isMobile={isMobile} wineLocations={wineLocations} locations={locations} />
        : <WineGridView wines={filtered} onWineClick={onWineClick} wineLocations={wineLocations} locations={locations} />}
    </>
  )
}

const mInp = { ...S.inp, minHeight: 52, fontSize: 17, borderRadius: 14, background: '#1e1b16' }
function AdegaMobile({ wines, wineLocations, locations, search, setSearch, filterType, setFilterType, filterCountry, setFilterCountry, filterRegion, setFilterRegion, filterBottleSize, setFilterBottleSize, showNoStock, setShowNoStock, types, allCountries, countriesRegions, bottleSizesInUse, filtered, onWineClick }) {
  const [showFilters, setShowFilters] = useState(false)
  const inUse = new Set(wines.map(w => w.type))
  const typeChips = [...types.filter(t => inUse.has(t)), ...[...inUse].filter(t => t && !types.includes(t))]
  const activeFilters = [filterCountry, filterRegion, filterBottleSize].filter(Boolean).length
  const onlyStock = !showNoStock
  const bottles = filtered.reduce((s, w) => s + w.quantity, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 16, color: '#9a8f82' }}>{filtered.length} {filtered.length === 1 ? 'referência' : 'referências'} · {bottles} {bottles === 1 ? 'garrafa' : 'garrafas'}</div>

      <div style={{ display: 'flex', gap: 10 }}>
        <label style={{ flex: 1, height: 54, borderRadius: 16, background: '#1e1b16', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', color: '#9a8f82' }}>
          <Search size={22} style={{ flexShrink: 0 }} />
          <input type="search" aria-label="Pesquisar vinhos" value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar vinho, região…"
            style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: '#e8dece', fontSize: 17, fontFamily: FONT }} />
        </label>
        <button onClick={() => setShowFilters(p => !p)} aria-expanded={showFilters} aria-label={`Filtros${activeFilters ? ` (${activeFilters} ativos)` : ''}`}
          style={{ width: 54, height: 54, borderRadius: 16, background: showFilters ? 'rgba(200,150,62,0.14)' : '#1e1b16', border: `1px solid ${showFilters ? 'rgba(200,150,62,0.4)' : 'rgba(255,255,255,0.08)'}`, color: showFilters ? '#c8963e' : '#e8dece', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
          <SlidersHorizontal size={22} />
          {activeFilters > 0 && <span style={{ position: 'absolute', top: 7, right: 7, width: 18, height: 18, borderRadius: 9, background: '#c8963e', color: '#0d0b09', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeFilters}</span>}
        </button>
      </div>

      {showFilters && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 14, borderRadius: 18, background: '#161310', border: '1px solid rgba(255,255,255,0.06)' }}>
          <select aria-label="País" style={mInp} value={filterCountry} onChange={e => { setFilterCountry(e.target.value); setFilterRegion('') }}>
            <option value="">Todos os países</option>
            {allCountries.map(c => <option key={c}>{c}</option>)}
          </select>
          {filterCountry && (
            <select aria-label="Região" style={mInp} value={filterRegion} onChange={e => setFilterRegion(e.target.value)}>
              <option value="">Todas as regiões</option>
              {(countriesRegions[filterCountry] || []).map(r => <option key={r}>{r}</option>)}
            </select>
          )}
          {bottleSizesInUse.length > 1 && (
            <select aria-label="Formato" style={mInp} value={filterBottleSize} onChange={e => setFilterBottleSize(e.target.value ? parseInt(e.target.value) : '')}>
              <option value="">Todos os formatos</option>
              {bottleSizesInUse.map(ml => <option key={ml} value={ml}>{bottleLabel(ml)}</option>)}
            </select>
          )}
          {activeFilters > 0 && (
            <button onClick={() => { setFilterCountry(''); setFilterRegion(''); setFilterBottleSize('') }}
              style={{ height: 48, borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#e8dece', fontFamily: FONT, fontSize: 16, cursor: 'pointer' }}>Limpar filtros</button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -16px', padding: '0 16px', scrollbarWidth: 'none' }}>
        <button onClick={() => setFilterType('')} aria-pressed={!filterType} style={chipStyle(!filterType)}>Todos</button>
        {typeChips.map(t => {
          const on = filterType === t
          return (
            <button key={t} onClick={() => setFilterType(on ? '' : t)} aria-pressed={on} style={chipStyle(on)}>
              <span style={{ width: 10, height: 10, borderRadius: 5, background: on ? '#0d0b09' : getTC(t).fg }} />{t}
            </button>
          )
        })}
      </div>

      <button onClick={() => setShowNoStock(p => !p)} role="switch" aria-checked={onlyStock}
        style={{ alignSelf: 'flex-end', height: 44, padding: 0, border: 'none', background: 'transparent', color: '#e8dece', fontFamily: FONT, fontSize: 16, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
        Só com stock
        <span style={{ width: 50, height: 30, borderRadius: 15, position: 'relative', background: onlyStock ? '#c8963e' : '#3a3530', transition: 'background 0.15s' }}>
          <span style={{ position: 'absolute', top: 3, left: onlyStock ? 23 : 3, width: 24, height: 24, borderRadius: 12, background: '#fff', transition: 'left 0.15s' }} />
        </span>
      </button>

      <WineMobileList wines={filtered} onWineClick={onWineClick} wineLocations={wineLocations} locations={locations} />
    </div>
  )
}
