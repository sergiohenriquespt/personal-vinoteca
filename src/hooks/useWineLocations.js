import { supabase } from '../lib/supabase'

export function useWineLocations() {
  const upsertWineLocation = async (wineId, locationId, quantity, wineLocations, setWineLocations) => {
    const existing = wineLocations.find(wl => wl.wine_id === wineId && wl.location_id === locationId)
    if (existing) {
      const { data } = await supabase
        .from('videiras_wine_locations')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select()
        .single()
      if (data) setWineLocations(p => p.map(wl => wl.id === existing.id ? data : wl))
    } else {
      const { data } = await supabase
        .from('videiras_wine_locations')
        .insert({ wine_id: wineId, location_id: locationId, quantity })
        .select()
        .single()
      if (data) setWineLocations(p => [...p, data])
    }
  }

  const decrementWineLocation = async (wineId, locationId, quantity, wineLocations, setWineLocations) => {
    const existing = wineLocations.find(wl => wl.wine_id === wineId && wl.location_id === locationId)
    if (!existing) return
    const newLocQty = existing.quantity - quantity
    if (newLocQty <= 0) {
      await supabase.from('videiras_wine_locations').delete().eq('id', existing.id)
      setWineLocations(p => p.filter(wl => wl.id !== existing.id))
    } else {
      const { data } = await supabase
        .from('videiras_wine_locations')
        .update({ quantity: newLocQty })
        .eq('id', existing.id)
        .select()
        .single()
      if (data) setWineLocations(p => p.map(wl => wl.id === existing.id ? data : wl))
    }
  }

  return { upsertWineLocation, decrementWineLocation }
}
