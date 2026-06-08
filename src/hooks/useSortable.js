import { useState } from 'react'

export function useSortable(defaultKey, defaultDir = 1) {
  const [sortKey, setSortKey] = useState(defaultKey)
  const [sortDir, setSortDir] = useState(defaultDir)

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => -d)
    else { setSortKey(key); setSortDir(1) }
  }

  return { sortKey, sortDir, handleSort }
}
