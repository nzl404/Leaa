let handler = async (m, { conn, text }) => {
  if (!text) throw '*Ketik namanya dulu, contoh: .cekmemek Sari*'

  const warna = pickRandom(memek.warna)
  const lubang = pickRandom(memek.lubang)
  const jembut = pickRandom(memek.jembut)

  let hasil = `
*CEK MEMEK ${text.toUpperCase()} 🔞*

👅 Warna   : *${warna}*
🕳️ Lubang  : *${lubang}*
🌿 Jembut  : *${jembut}*
`.trim()

  conn.reply(m.chat, hasil, m)
}

handler.help = ['cekmemek <nama>']
handler.tags = ['fun']
handler.command = /^cekmemek$/i
handler.group = true
handler.limit = true

module.exports = handler

const memek = {
  warna: [
    'Ih item', 'Belang wkwk', 'Mulus banget', 'Putih Mulus',
    'Black Doff', 'Pink Wow', 'Item Glossy', 'Kecoklatan Lembut'
  ],
  lubang: [
    'Perawan', 'Ga perawan', 'Udah pernah dimasukin',
    'Masih rapet', 'Tembem', 'Longgar dikit', 'Sering dipake'
  ],
  jembut: [
    'Lebat', 'Ada sedikit', 'Gak ada jembut', 'Tipis',
    'Mulus', 'Dicukur rapi', 'Keriting halus'
  ]
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}