import { createClient } from '@supabase/supabase-js'

export const SUPA_URL       = import.meta.env.VITE_SUPA_URL
export const SUPA_KEY       = import.meta.env.VITE_SUPA_KEY
export const supabase       = createClient(SUPA_URL, SUPA_KEY)
export const EDGE_FN_URL    = `${SUPA_URL}/functions/v1/videiras-admin`
export const SHARE_FN_URL   = `${SUPA_URL}/functions/v1/videiras-share`
export const ESTIMATE_FN_URL = `${SUPA_URL}/functions/v1/videiras-estimate`

// ─── STORAGE ──────────────────────────────────────────────────────────────────
export const PHOTO_BUCKET = 'wine-photos'
export const isStorageUrl = (url) => url && !url.startsWith('data:')

export const uploadWinePhoto = async (file, userId) => {
  const path = `${userId}/${crypto.randomUUID()}`
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, { contentType: file.type })
  if (error) throw error
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl
}

export const deleteWinePhoto = async (url) => {
  if (!isStorageUrl(url)) return
  const path = url.split(`/${PHOTO_BUCKET}/`)[1]
  if (path) await supabase.storage.from(PHOTO_BUCKET).remove([decodeURIComponent(path)])
}

// ─── DB MAPPING ───────────────────────────────────────────────────────────────
export const wineFromDb = (r) => ({
  id: r.id, name: r.name, type: r.type, country: r.country, region: r.region,
  year: r.year, purchasePrice: parseFloat(r.purchase_price) || 0,
  marketPrice: r.market_price != null ? parseFloat(r.market_price) : null,
  personalRating: parseFloat(r.personal_rating) || 0,
  vivinoRating: r.vivino_rating != null ? parseFloat(r.vivino_rating) : null,
  quantity: r.quantity, photo: 'photo' in r ? (r.photo || null) : undefined, notes: r.notes || '',
  castas: r.castas || '', alcoholContent: r.alcohol_content != null ? parseFloat(r.alcohol_content) : '',
  producer: r.producer || '', winemaker: r.winemaker || '',
  bottleSize: r.bottle_size || 750,
  location: r.location || '',
  criticRatings: r.critic_ratings || {},
})

export const wineToDb = (w) => ({
  name: w.name, type: w.type, country: w.country, region: w.region, year: w.year || null,
  purchase_price: w.purchasePrice || 0, market_price: w.marketPrice ?? null,
  personal_rating: w.personalRating || 0,
  vivino_rating: w.vivinoRating ?? null, quantity: w.quantity ?? 0,
  photo: w.photo !== undefined ? (w.photo || null) : undefined, notes: w.notes || '',
  castas: w.castas || null, alcohol_content: w.alcoholContent !== '' ? parseFloat((w.alcoholContent + '').replace(',', '.')) : null,
  producer: w.producer || null, winemaker: w.winemaker || null,
  bottle_size: w.bottleSize || 750,
  critic_ratings: w.criticRatings || {},
})

export const entryFromDb = (r) => ({
  id: r.id, wineId: r.wine_id, date: r.date,
  quantity: r.quantity, supplier: r.supplier, price: parseFloat(r.price) || 0,
})

export const entryToDb = (e) => ({
  wine_id: e.wineId, date: e.date, quantity: e.quantity,
  supplier: e.supplier || '', price: e.price || 0,
})

export const consumptionFromDb = (r) => ({
  id: r.id, wineId: r.wine_id, date: r.date, quantity: r.quantity,
  rating: r.rating != null ? parseFloat(r.rating) : 0, notes: r.notes || '',
})

export const consumptionToDb = (c) => ({
  wine_id: c.wineId, date: c.date, quantity: c.quantity,
  rating: c.rating || null, notes: c.notes || '',
})

export const getWineLocationData = (wineId, wineLocations, locations) =>
  wineLocations
    .filter(wl => wl.wine_id === wineId)
    .map(wl => ({ ...wl, name: locations.find(l => l.id === wl.location_id)?.name }))
    .filter(wl => wl.name)

// ─── LOCAL CACHE ──────────────────────────────────────────────────────────────
export const CACHE_KEY = 'videiras_data_v2'
export const loadCache = () => { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') } catch { return null } }
export const saveCache = (d) => { try { localStorage.setItem(CACHE_KEY, JSON.stringify(d)) } catch {} }
export const clearCache = () => { try { localStorage.removeItem(CACHE_KEY) } catch {} }

// ─── WINE META SELECT ─────────────────────────────────────────────────────────
export const WINE_META_SELECT = 'id,name,type,country,region,year,purchase_price,market_price,personal_rating,vivino_rating,quantity,notes,castas,alcohol_content,producer,winemaker,bottle_size,location,critic_ratings'
