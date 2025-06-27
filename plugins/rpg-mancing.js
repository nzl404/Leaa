let handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  const now = Date.now()
  const cooldown = 180000 // 3 menit
  const timeDiff = now - (user.lastmancing || 0)
  const remainingTime = cooldown - timeDiff

  if ((user.fishingrod || 0) <= 0) {
    return conn.reply(m.chat, '[❗] Kamu tidak punya alat pancing. Bikin dulu di *craft*! 🎣', m)
  }

  if (timeDiff < cooldown) {
    return conn.reply(m.chat, `Kamu baru saja mancing, tunggu *${formatTime(remainingTime)}* sebelum mancing lagi.`, m)
  }

  // Proses mancing (diedit bertahap)
  const proses = [
    'Pergi mancing 🎣...',
    'Menunggu sampai ikan makan umpan...',
    'Umpan dimakan ikan!! Kamu tarik pancingnya!!'
  ]

  // Kirim pesan awal reply ke command
  const { key } = await conn.reply(m.chat, proses[0], m)

  for (let i = 1; i < proses.length; i++) {
    await delay(5000)
    await conn.sendMessage(m.chat, { text: proses[i], edit: key })
  }

  // Generate hasil
  let ikan = Math.floor(Math.random() * 30)
  let lele = Math.floor(Math.random() * 15)
  let nila = Math.floor(Math.random() * 10)
  let bawal = Math.floor(Math.random() * 10)
  let udang = Math.floor(Math.random() * 39)
  let paus = Math.floor(Math.random() * 2)
  let kepiting = Math.floor(Math.random() * 27)

  let totalCatch = nila + bawal + ikan + lele + udang + kepiting + paus

  const hasil = `
•  *Hasil Mancing:*

◦  🐟 Ikan nila: ${nila}
◦  🐡 Bawal: ${bawal}
◦  🐟 Lele: ${lele}
◦  🐟 Ikan: ${ikan}
◦  🦐 Udang: ${udang}
◦  🐋 Paus: ${paus}
◦  🦀 Kepiting: ${kepiting}
`.trim()

  const imageUrl = 'https://api.betabotz.eu.org/api/tools/get-upload?id=f/arit56zv.jpg'

  // Kirim hasil sebagai pesan baru (reply ke command)
  await delay(3000)
  await conn.sendFile(m.chat, imageUrl, 'hasil_mancing.jpg', hasil, m)

  // Update data user
  user.nila = (user.nila || 0) + nila
  user.bawal = (user.bawal || 0) + bawal
  user.lele = (user.lele || 0) + lele
  user.ikan = (user.ikan || 0) + ikan
  user.udang = (user.udang || 0) + udang
  user.paus = (user.paus || 0) + paus
  user.kepiting = (user.kepiting || 0) + kepiting
  user.totalPancingan = (user.totalPancingan || 0) + totalCatch
  user.fishingrod -= 1
  user.lastmancing = now
}

handler.help = ['mancing']
handler.tags = ['rpg']
handler.command = /^(mancing|memancing)$/i
handler.group = true
handler.rpg = true

module.exports = handler

function delay(ms) {
  return new Promise(res => setTimeout(res, ms))
}

function formatTime(ms) {
  let seconds = Math.floor(ms / 1000)
  let minutes = Math.floor(seconds / 60)
  let hours = Math.floor(minutes / 60)
  seconds %= 60
  minutes %= 60
  hours %= 24
  return [hours, minutes, seconds].map(v => v.toString().padStart(2, '0')).join(':')
}