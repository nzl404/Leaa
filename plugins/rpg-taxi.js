let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  let __timers = (new Date - user.lasttaxi)
  let _timers = (3600000 - __timers)
  let timers = clockString(_timers)
  let name = await conn.getName(m.sender)
  let id = m.sender
  let kerja = 'taxi'

  conn.misi = conn.misi || {}
  if (id in conn.misi) {
    return conn.reply(m.chat, `Selesaikan orderan taxi kamu *${conn.misi[id][0]}* terlebih dahulu!`, m)
  }

  if (__timers < 3600000) {
    return conn.reply(m.chat, `Kamu kecapean, istirahat dulu selama *${timers}* sebelum bisa mengantar penumpang lagi.`, m)
  }

  // Random hasil
  let uang = Math.floor(Math.random() * 1000000)
  let exp = Math.floor(Math.random() * 10000)
  let order = user.taxi

  // Tahapan narasi taxi
  let proses = [
    '🔍 Mencari orderan buat kamu...',
    `
🚶⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛⬜⬜⬜⬛⬜⬜⬜⬛⬛
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
🏘️🏘️🏘️🏘️🌳  🌳 🏘️       🚕

✔️ Mendapatkan orderan...`,
    `
🚶⬛⬛⬛⬛⬛🚐⬛⬛⬛🚓🚚
🚖⬜⬜⬜⬛⬜⬜⬜🚓⬛🚑
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🚙
🏘️🏘️🏢️🌳  🌳 🏘️  🏘️🏡

🚖 Mengantar ke tujuan...`,
    `
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🚓
⬛⬜🚗⬜⬜⬛⬜🚐⬜⬜⬛🚙🚚🚑
⬛⬛⬛⬛🚒⬛⬛⬛⬛⬛⬛🚚
🏘️🏘️🏘️🏘️🌳  🌳 🏘️

🚖 Selesai mengantar pelanggan...`,
    `
➕ 💹 Menerima gaji...`,
    `
*—[ Hasil Taxi ${name} ]—*
➕ 💰 Uang: ${uang}
➕ ✨ Exp: ${exp}
➕ 🚕 Order Selesai: +1
📥 Total Order Sebelumnya: ${order}`
  ]

  // Simpan status misi
  conn.misi[id] = [
    kerja,
    setTimeout(() => delete conn.misi[id], 30000)
  ]

  // Kirim pesan awal sebagai reply
  let { key } = await conn.reply(m.chat, proses[0], m)

  // Edit pesan bertahap
  for (let i = 1; i < proses.length; i++) {
    await delay(5000)
    await conn.sendMessage(m.chat, { text: proses[i], edit: key })
  }

  // Update data user
  user.money += uang
  user.exp += exp
  user.taxi += 1
  user.lasttaxi = new Date * 1
}

handler.help = ['taxi']
handler.tags = ['rpg']
handler.command = /^(taxi)$/i
handler.register = true
handler.group = true
handler.rpg = true
module.exports = handler

function delay(ms) {
  return new Promise(res => setTimeout(res, ms))
}

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}