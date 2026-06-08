import { supabase } from '../lib/supabase'

export function useLocations() {
  const insertLocation = async (name, userId, setLocations) => {
    const { data } = await supabase
      .from('videiras_locations')
      .insert({ name, user_id: userId })
      .select()
      .single()
    if (data) setLocations(p => [...p, data].sort((a, b) => a.name.localeCompare(b.name, 'pt')))
    return data
  }

  return { insertLocation }
}
