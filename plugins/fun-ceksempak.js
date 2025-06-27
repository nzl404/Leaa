let handler = async (m, { conn, args, text }) => {
  let who
  if (m.isGroup) {
    who = m.mentionedJid && m.mentionedJid.length ? m.mentionedJid[0]
        : m.quoted ? m.quoted.sender
        : args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        : false
  } else {
    who = m.chat
  }

  if (!who) throw 'Tag atau reply orangnya dulu!'

  const size = pickRandom(data.size)
  const color = pickRandom(data.color)
  const shape = pickRandom(data.shape)

  let hasil = `
*CEK SEMPAK @${who.split('@')[0]} 🩲*

📏 Ukuran : *${size}*
🎨 Warna  : *${color}*
📐 Bentuk : *${shape}*
`.trim()

  conn.reply(m.chat, hasil, m, { mentions: [who] })
}

handler.help = ['ceksempak <@user>']
handler.tags = ['fun']
handler.command = /^ceksempak$/i
handler.group = true
handler.limit = true

module.exports = handler

const data = {
  size: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL', '6XL', '7XL', '8XL', '9XL', '10XL', '11XL', '12XL', '13XL', '14XL', '15XL', '16XL'],
  color: ['Merah', 'Biru', 'Hijau', 'Kuning', 'Hitam', 'Putih', 'Oranye', 'Ungu', 'Coklat', 'Abu-abu', 'Merah Muda', 'Biru Muda', 'Hijau Muda', 'Krem', 'Biru Tua', 'Hijau Tua', 'Biru Langit', 'Toska', 'Salmon', 'Emas', 'Perak', 'Magenta', 'Cyan', 'Olive', 'Navy'],
  shape: ['Boxer', 'Brief', 'Trunk', 'Thong', 'Jockstrap', 'Bikini', 'Hipster', 'Boyshort', 'Tanga', 'G-string', 'T-brief', 'Mini Boxer', 'Shorty', 'Midi', 'Maxi', 'Slip', 'High-leg', 'Cheeky', 'Brazilian', 'Cutaway', 'Sport Brief']
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}