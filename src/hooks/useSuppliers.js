import { supabase } from '../lib/supabase'

export function useSuppliers() {
  const addSupplier = async (name, userId, setSuppliers) => {
    await supabase.from('videiras_suppliers').insert({ name, user_id: userId })
    setSuppliers(p => [...p, name].sort((a, b) => a.localeCompare(b, 'pt')))
  }

  const removeSupplier = async (name, entries, setSuppliers) => {
    const hasMovements = (entries || []).some(e => e.supplier === name)
    if (hasMovements) {
      alert(`"${name}" tem entradas associadas e não pode ser eliminado.`)
      return false
    }
    await supabase.from('videiras_suppliers').delete().eq('name', name)
    setSuppliers(p => p.filter(s => s !== name))
    return true
  }

  return { addSupplier, removeSupplier }
}
