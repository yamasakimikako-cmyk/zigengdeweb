import { supabase } from './supabase.js';

async function testConnection() {
  const { data, error } = await supabase
    .from('content_blocks')
    .select('*')
    .limit(5);

  console.log('data:', data);
  console.log('error:', error);

  if (error) {
    document.body.innerHTML = `<pre style="padding:20px;">连接失败：${error.message}</pre>`;
    return;
  }

  document.body.innerHTML = `
    <div style="padding:20px;font-family:Arial;">
      <h1>Supabase 连接成功</h1>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    </div>
  `;
}

testConnection();