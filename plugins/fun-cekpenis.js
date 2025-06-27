let handler = async (m, { conn, text }) => {
  if (!text) throw 'Ketik namanya dulu, contoh: *.cekkontol Firman*'

  const warna = pickRandom(kontol.warna)
  const status = pickRandom(kontol.status)
  const jembut = pickRandom(kontol.jembut)

  let hasil = `
*CEK KONTOL ${text.toUpperCase()} 🍆*

🎨 Warna   : *${warna}*
🧬 Status  : *${status}*
🌿 Jembut  : *${jembut}*
`.trim()

  conn.reply(m.chat, hasil, m)
}

handler.help = ['cekkontol <nama>']
handler.tags = ['fun']
handler.command = /^cekkontol$/i
handler.limit = true
handler.group = true

module.exports = handler

const kontol = {
  warna: [
    'Ih item', 'Belang wkwk', 'Mulus', 'Putih Mulus',
    'Black Doff', 'Pink wow', 'Item Glossy', 'Coklat Susu'
  ],
  status: [
    'Perjaka', 'Ga perjaka', 'Udah pernah dimasukin',
    'Masih ori', 'Jumbo', 'Sakti Mandraguna'
  ],
  jembut: [
    'Lebat', 'Ada sedikit', 'Gak ada jembut', 'Tipis',
    'Mulus', 'Dicukur rapi', 'Bentuk hati'
  ]
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}