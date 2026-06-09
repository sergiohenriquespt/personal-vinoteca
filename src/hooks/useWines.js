import { supabase, wineFromDb, wineToDb, deleteWinePhoto, WINE_META_SELECT } from '../lib/supabase'

export function useWines({ session, wines, setWines, wineLocations, setWineLocations, closeModal }) {
  const addWine = async (d, onDone) => {
    const { data, error } = await supabase
      .from('videiras_wines')
      .insert({ ...wineToDb(d), user_id: session.user.id })
      .select(WINE_META_SELECT)
      .single()
    if (error) { alert('Erro ao guardar vinho: ' + error.message); return }
    if (data) {
      const wine = { ...wineFromDb(data), photo: d.photo ?? null }
      setWines(p => [...p, wine])
      const validRows = (d.locationRows || []).filter(r => r.locationId && r.quantity > 0)
      if (validRows.length > 0) {
        const { data: wlData } = await supabase
          .from('videiras_wine_locations')
          .insert(validRows.map(r => ({ wine_id: data.id, location_id: r.locationId, quantity: r.quantity })))
          .select()
        if (wlData) setWineLocations(p => [...p, ...wlData])
      }
      if (onDone) { onDone(wine); return }
    }
    closeModal()
  }

  const editWine = async (d, activeWineId) => {
    const currentPhoto = wines.find(w => w.id === activeWineId)?.photo
    const { data, error } = await supabase
      .from('videiras_wines')
      .update(wineToDb(d))
      .eq('id', activeWineId)
      .select(WINE_META_SELECT)
      .single()
    if (error) { alert('Erro ao guardar vinho: ' + error.message); return }
    if (data) {
      setWines(p => p.map(w => w.id === activeWineId
        ? { ...wineFromDb(data), photo: d.photo !== undefined ? (d.photo || null) : currentPhoto }
        : w))
      await supabase.from('videiras_wine_locations').delete().eq('wine_id', activeWineId)
      const validRows = (d.locationRows || []).filter(r => r.locationId && r.quantity > 0)
      if (validRows.length > 0) {
        const { data: wlData } = await supabase
          .from('videiras_wine_locations')
          .insert(validRows.map(r => ({ wine_id: activeWineId, location_id: r.locationId, quantity: r.quantity })))
          .select()
        setWineLocations(p => [...p.filter(wl => wl.wine_id !== activeWineId), ...(wlData || [])])
      } else {
        setWineLocations(p => p.filter(wl => wl.wine_id !== activeWineId))
      }
    }
    closeModal()
  }

  const deleteWine = async (id) => {
    const wine = wines.find(w => w.id === id)
    if (wine?.photo) await deleteWinePhoto(wine.photo)
    await Promise.all([
      supabase.from('videiras_wine_locations').delete().eq('wine_id', id),
      supabase.from('videiras_wines').delete().eq('id', id),
    ])
    setWineLocations(p => p.filter(wl => wl.wine_id !== id))
    setWines(p => p.filter(w => w.id !== id))
    closeModal()
  }

  return { addWine, editWine, deleteWine }
}
