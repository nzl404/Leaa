let handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  const now = Date.now()

  const last = user.lastnambang || 0
  const currentCD = user.lastNambangCD || 180000
  const remaining = currentCD - (now - last)

  if (remaining > 0) {
    return conn.reply(m.chat, `⛏️ Kamu kelelahan...\nIstirahat dulu *${clockString(remaining)}* sebelum bisa menambang lagi.`, m)
  }

  // Hasil tambang
  const coal = Math.floor(Math.random() * 10)
  const emas = Math.floor(Math.random() * 5) * 15768
  const diamond = Math.floor(Math.random() * 10)

  const valueScore = coal + diamond + Math.floor(emas / 10000)

  // Cooldown yang mungkin dipilih (dalam ms)
  const cdOptions = [180000, 300000, 420000, 540000, 600000, 660000, 720000, 780000, 840000, 900000]

  // Kalkulasi index dari score, max 9
  const cdIndex = Math.min(Math.floor(valueScore / 3), cdOptions.length - 1)
  const cooldownMs = cdOptions[cdIndex]

  // Kondisi acak yang terjadi di tambang
  const kondisiTambang = [
    'proses berjalan sangat lancar',
    'menemukan jalur tambang buntu',
    'terjadi longsor kecil, harus mundur',
    'bertemu monster golem batu dan menghindar',
    'batu terlalu keras untuk cepat dipecahkan',
    'menemukan jalur baru yang memutar',
    'alat rusak dan perlu diperbaiki dahulu',
    'tanah licin membuat kamu terpeleset',
    'menunggu giliran menambang karena antrian',
    'lampu helm mati dan harus menunggu bantuan'
  ]
  const pickedReason = kondisiTambang[Math.floor(Math.random() * kondisiTambang.length)]

  // Update user data
  user.lastnambang = now
  user.lastNambangCD = cooldownMs
  user.coal = (user.coal || 0) + coal
  user.emas = (user.emas || 0) + emas
  user.diamond = (user.diamond || 0) + diamond
  user.tiketcoin = (user.tiketcoin || 0) + 1

  const proses = [
    '⛏️ Mencari lokasi tambang...',
    '⛏️ Mulai menggali dalam...',
    '💹 Mengevaluasi hasil tambang...',
    `*—[ Hasil Nambang ${await conn.getName(m.sender)} ]—*
➕ 🪨 Coal: ${coal}
➕ ✨ Emas: ${emas}
➕ 💎 Diamond: ${diamond}

⏳ Cooldown selanjutnya: *${msToMinute(cooldownMs)}* — karena *${pickedReason}*.`
  ]

  const { key } = await conn.reply(m.chat, proses[0], m)

  for (let i = 1; i < proses.length; i++) {
    await delay(5000)
    await conn.sendMessage(m.chat, { text: proses[i], edit: key })
  }
}

handler.help = ['nambang']
handler.tags = ['rpg']
handler.command = /^(nambang)$/i
handler.group = true
handler.register = true
handler.rpg = true
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

function msToMinute(ms) {
  return `${Math.floor(ms / 60000)} menit`
}