import React from 'react'
import { Search, Eye, EyeOff, List, LayoutGrid, Plus } from 'lucide-react'
import { S, FONT } from '../utils/constants'
import { bottleLabel } from '../utils/constants'
import Btn from '../components/ui/Btn'
import FilterSelect from '../components/ui/FilterSelect'
import { WineListView, WineGridView } from '../components/WineCard'

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
