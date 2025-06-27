let handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  const lastNgaji = user.lastngaji || 0
  const cooldown = 300000 // 5 menit
  const now = Date.now()
  const remaining = cooldown - (now - lastNgaji)

  if (remaining > 0) {
    return conn.reply(m.chat, `Sepertinya kamu kecapekan. Silakan istirahat dulu selama *${clockString(remaining)}* sebelum mengaji lagi.`, m)
  }

  const name = await conn.getName(m.sender)

  // Random reward
  const expGain = Math.floor(Math.random() * 10) * 20000
  const moneyGain = Math.floor(Math.random() * 5) * 15729

  // Tahapan proses ngaji
  const proses = [
    'Mencari guru ngaji di kampung...',
    'Ketemu Ustadz Ramli yang sedang santai di langgar...',
    'Salam dan minta diajarkan mengaji...',
    'Ustadz tersenyum dan memulai pelajaran...',
    'Belajar makhraj huruf dan tajwid dasar...',
    'Mengetahui bahwa qalqalah itu dipantulkan saat mati...',
    'Mengulang-ulang surat pendek dengan tartil...',
    'Mendapat pujian dari ustadz karena pengucapanmu bagus...',
    'Mengaji selesai. Ustadz memberi sedikit uang jajan dan mendoakanmu...',
    `*—[ Hasil Ngaji ${name} ]—*\n➕💹 Uang jajan: ${moneyGain}\n➕✨ Exp: ${expGain}\n➖🤬 Dimarahin: -1`
  ]

  // Kirim pesan awal reply ke perintah user
  let { key } = await conn.reply(m.chat, proses[0], m)

  // Jalankan tahapan edit bertahap
  for (let i = 1; i < proses.length; i++) {
    await delay(5000)
    await conn.sendMessage(m.chat, { text: proses[i], edit: key })
  }

  // Update data user
  user.lastngaji = now
  user.exp += expGain
  user.money += moneyGain
  user.warn = Math.max(0, (user.warn || 0) - 1)
}

handler.help = ['mengaji', 'ngaji']
handler.tags = ['rpg']
handler.command = /^(mengajikeliling|mengaji|ngaji|ustad|ustadz|ustaz)$/i
handler.register = true
handler.rpg = true
handler.group = true

module.exports = handler

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}