import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://videiras.pt',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(v: unknown): v is string {
  return typeof v === 'string' && EMAIL_RE.test(v) && v.length <= 254
}

function isValidName(v: unknown): v is string {
  return typeof v === 'string' && v.length <= 100
}

function isValidUUID(v: unknown): v is string {
  return typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
}

// verify_jwt: false — auth manual via service_role para poder verificar perfil admin
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Não autenticado' }, 401)

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token)
  if (userErr || !user) return json({ error: 'Token inválido' }, 401)

  const { data: profile } = await supabaseAdmin
    .from('videiras_profiles')
    .select('role, active')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin' || !profile.active)
    return json({ error: 'Acesso negado' }, 403)

  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  // LIST
  if (req.method === 'GET' && action === 'list') {
    const { data, error } = await supabaseAdmin
      .from('videiras_profiles')
      .select('id, email, name, role, active, must_change_password, created_at')
      .order('created_at')
    if (error) return json({ error: error.message }, 500)
    return json({ users: data })
  }

  const body = await req.json().catch(() => ({}))

  // CREATE USER
  if (req.method === 'POST' && action === 'create') {
    const { email, name, password } = body
    if (!isValidEmail(email)) return json({ error: 'Email inválido' }, 400)
    if (typeof password !== 'string' || password.length < 8)
      return json({ error: 'Password deve ter pelo menos 8 caracteres' }, 400)
    if (!isValidName(name)) return json({ error: 'Nome inválido ou demasiado longo' }, 400)

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name || '' },
    })
    if (error) return json({ error: error.message }, 500)

    if (data.user) {
      await supabaseAdmin.from('videiras_profiles').insert({
        id: data.user.id,
        email,
        name: name || '',
        role: 'user',
        active: true,
        must_change_password: true,
      })
    }
    return json({ ok: true, userId: data.user?.id })
  }

  // INVITE
  if (req.method === 'POST' && action === 'invite') {
    const { email, name } = body
    if (!isValidEmail(email)) return json({ error: 'Email inválido' }, 400)
    if (name !== undefined && !isValidName(name)) return json({ error: 'Nome inválido ou demasiado longo' }, 400)

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { name: name || '' },
      redirectTo: `${Deno.env.get('APP_URL') ?? ''}/`,
    })
    if (error) return json({ error: error.message }, 500)

    if (data.user) {
      await supabaseAdmin.from('videiras_profiles').insert({
        id: data.user.id,
        email,
        name: name || '',
        role: 'user',
        active: true,
        must_change_password: true,
      }).onConflict('id').merge()
    }
    return json({ ok: true, userId: data.user?.id })
  }

  // SET ACTIVE
  if (req.method === 'POST' && action === 'set-active') {
    const { userId, active } = body
    if (!isValidUUID(userId)) return json({ error: 'userId inválido' }, 400)
    if (typeof active !== 'boolean') return json({ error: 'active deve ser boolean' }, 400)
    if (userId === user.id) return json({ error: 'Não podes desactivar a tua conta' }, 400)
    const { error } = await supabaseAdmin.from('videiras_profiles').update({ active }).eq('id', userId)
    if (error) return json({ error: error.message }, 500)
    return json({ ok: true })
  }

  // SET ROLE
  if (req.method === 'POST' && action === 'set-role') {
    const { userId, role } = body
    if (!isValidUUID(userId)) return json({ error: 'userId inválido' }, 400)
    if (!['admin', 'user'].includes(role)) return json({ error: 'Role inválido' }, 400)
    if (userId === user.id) return json({ error: 'Não podes alterar o teu role' }, 400)
    const { error } = await supabaseAdmin.from('videiras_profiles').update({ role }).eq('id', userId)
    if (error) return json({ error: error.message }, 500)
    return json({ ok: true })
  }

  // DELETE USER
  if (req.method === 'POST' && action === 'delete-user') {
    const { userId } = body
    if (!isValidUUID(userId)) return json({ error: 'userId inválido' }, 400)
    if (userId === user.id) return json({ error: 'Não podes eliminar a tua própria conta' }, 400)

    // Remove data do utilizador
    await supabaseAdmin.from('videiras_consumptions').delete().eq('user_id', userId)
    await supabaseAdmin.from('videiras_entries').delete().eq('user_id', userId)
    await supabaseAdmin.from('videiras_wines').delete().eq('user_id', userId)
    await supabaseAdmin.from('videiras_suppliers').delete().eq('user_id', userId)
    await supabaseAdmin.from('videiras_profiles').delete().eq('id', userId)

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) return json({ error: error.message }, 500)
    return json({ ok: true })
  }

  return json({ error: 'Acção não reconhecida' }, 400)
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
