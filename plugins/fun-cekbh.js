let handler = async (m, { conn, args }) => {
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
*CEK BH @${who.split('@')[0]} 👙*

📏 Ukuran : *${size}*  
🎨 Warna  : *${color}*  
📐 Bentuk : *${shape}*
`.trim()

  conn.reply(m.chat, hasil, m, { mentions: [who] })
}

handler.help = ['cekbh <@user>']
handler.tags = ['fun']
handler.command = /^cekbh$/i
handler.group = true
handler.limit = true

module.exports = handler

const data = {
  size: ['30A', '32B', '32C', '32D', '34A', '34B', '34C', '36A', '36B', '36C', '38A', '38B', '38C', '40A', '40B', '40C', '42A', '42B', '42C', '42D'],
  color: ['Merah', 'Biru', 'Hijau', 'Kuning', 'Hitam', 'Putih', 'Oranye', 'Ungu', 'Coklat', 'Abu-abu', 'Merah Muda', 'Biru Muda', 'Hijau Muda', 'Krem', 'Biru Tua', 'Hijau Tua', 'Biru Langit', 'Toska', 'Salmon', 'Emas', 'Perak', 'Magenta', 'Cyan', 'Olive', 'Navy'],
  shape: ['Bikini', 'Hipster', 'Tanga', 'G-string', 'T-brief', 'Shorty', 'Midi', 'Maxi', 'Slip', 'High-leg', 'Cheeky', 'Brazilian', 'Cutaway', 'Full Cup', 'Push-up', 'Balconette', 'Strapless', 'Minimizer', 'Sport Bra']
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}