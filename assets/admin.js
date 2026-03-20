import { supabase } from './supabase.js'

const authPanel = document.getElementById('authPanel')
const editorPanel = document.getElementById('editorPanel')
const listPanel = document.getElementById('listPanel')

const loginForm = document.getElementById('loginForm')
const blockForm = document.getElementById('blockForm')

const refreshBtn = document.getElementById('refreshBtn')
const resetBtn = document.getElementById('resetBtn')
const logoutBtn = document.getElementById('logoutBtn')

const blockList = document.getElementById('blockList')

const blockIdInput = document.getElementById('blockId')
const slugInput = document.getElementById('slug')
const titleInput = document.getElementById('title')
const subtitleInput = document.getElementById('subtitle')
const sortOrderInput = document.getElementById('sortOrder')
const isPublishedInput = document.getElementById('isPublished')
const bodyInput = document.getElementById('body')
const coverUrlInput = document.getElementById('coverUrl')

function showLoggedIn() {
  authPanel?.classList.add('hidden')
  editorPanel?.classList.remove('hidden')
  listPanel?.classList.remove('hidden')
}

function showLoggedOut() {
  authPanel?.classList.remove('hidden')
  editorPanel?.classList.add('hidden')
  listPanel?.classList.add('hidden')
}

function clearForm() {
  blockIdInput.value = ''
  slugInput.value = ''
  titleInput.value = ''
  subtitleInput.value = ''
  sortOrderInput.value = '0'
  isPublishedInput.checked = true
  bodyInput.value = ''
  coverUrlInput.value = ''
}

async function ensureSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) {
    showLoggedOut()
    return false
  }
  showLoggedIn()
  return true
}

async function loadBlocks() {
  blockList.innerHTML = '加载中...'

  const { data, error } = await supabase
    .from('content_blocks')
    .select('id, slug, title, subtitle, cover_url, sort_order, is_published')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    blockList.innerHTML = `加载失败：${error.message}`
    return
  }

  if (!data || data.length === 0) {
    blockList.innerHTML = '暂无模块'
    return
  }

  blockList.innerHTML = data
    .map((item) => {
      const slug = item.slug ?? ''
      const title = item.title ?? '未命名'
      const sortOrder = item.sort_order ?? 0
      const published = item.is_published ? '已发布' : '未发布'
      return `<div class="admin-card">
        <div class="admin-card-top">
          <div>
            <strong>${title}</strong>
            <div class="admin-meta">slug: ${slug} · 排序 ${sortOrder} · ${published}</div>
          </div>
          <div class="admin-card-actions">
            <button type="button" data-edit-id="${item.id}">编辑</button>
          </div>
        </div>
      </div>`
    })
    .join('')
}

async function loadBlockToForm(id) {
  const { data, error } = await supabase
    .from('content_blocks')
    .select('id, slug, title, subtitle, cover_url, sort_order, is_published, body')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) {
    alert('获取模块失败')
    return
  }

  showLoggedIn()
  blockIdInput.value = data.id ?? ''
  slugInput.value = data.slug ?? ''
  titleInput.value = data.title ?? ''
  subtitleInput.value = data.subtitle ?? ''
  sortOrderInput.value = String(data.sort_order ?? 0)
  isPublishedInput.checked = !!data.is_published
  bodyInput.value = data.body ?? ''
  coverUrlInput.value = data.cover_url ?? ''
}

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    alert(error.message)
    return
  }

  showLoggedIn()
  await loadBlocks()
})

logoutBtn?.addEventListener('click', async () => {
  await supabase.auth.signOut()
  clearForm()
  showLoggedOut()
})

refreshBtn?.addEventListener('click', async () => {
  await loadBlocks()
})

resetBtn?.addEventListener('click', () => {
  clearForm()
})

blockForm?.addEventListener('submit', async (e) => {
  e.preventDefault()

  const row = {
    slug: slugInput.value,
    title: titleInput.value,
    subtitle: subtitleInput.value,
    body: bodyInput.value,
    cover_url: coverUrlInput.value,
    sort_order: parseInt(sortOrderInput.value, 10) || 0,
    is_published: !!isPublishedInput.checked,
  }

  const id = blockIdInput.value

  let result
  if (id) {
    result = await supabase.from('content_blocks').update(row).eq('id', id)
  } else {
    result = await supabase.from('content_blocks').insert([row])
  }

  if (result.error) {
    alert(`保存失败：${result.error.message}`)
    return
  }

  alert('保存成功')
  clearForm()
  await loadBlocks()
})

blockList?.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-edit-id]')
  if (!btn) return
  const id = btn.getAttribute('data-edit-id')
  if (id) await loadBlockToForm(id)
})

ensureSession().then((ok) => {
  if (ok) loadBlocks()
})
