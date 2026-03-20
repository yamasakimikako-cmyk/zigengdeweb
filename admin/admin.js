import { supabase } from './supabase.js'

const form = document.getElementById('blockForm')
const logoutBtn = document.getElementById('logoutBtn')

async function ensureSession() {
  const { data } = await supabase.auth.getSession()
  if (!data.session) {
    alert('未登录')
    window.location.href = '/admin/index.html'
  }
}

async function loadBlocks() {
  // 后台列表加载，可留空
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault()

  const type = document.getElementById('type').value
  const slug = document.getElementById('slug').value
  const title = document.getElementById('title').value
  const subtitle = document.getElementById('subtitle').value
  const body = document.getElementById('body').value
  const cover_url = document.getElementById('cover_url').value
  const published = document.getElementById('published').checked

  const { error } = await supabase.from('blocks').insert([
    {
      type,
      slug,
      title,
      subtitle,
      body,
      cover_url,
      published,
    },
  ])

  if (error) {
    alert('发布失败：' + error.message)
  } else {
    alert('发布成功')
    form.reset()
  }
})

logoutBtn?.addEventListener('click', async () => {
  await supabase.auth.signOut()
  window.location.href = '/admin/index.html'
})

ensureSession()