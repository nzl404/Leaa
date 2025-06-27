let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  let opponent = m.mentionedJid[0]

  if (!opponent || !global.db.data.users[opponent]) {
    return conn.reply(m.chat, '• *Contoh:* .bertarung @user', m)
  }

  // Tambahkan reaksi
  await conn.sendMessage(m.chat, {
    react: {
      text: '🕒',
      key: m.key,
    }
  })

  let alasanKalahList = [
    'bodoh gitu doang aja kalah, kamu didenda!',
    'lemah lu kontol, kamu didenda!',
    'jangan berantem kalo cupu dek, kamu didenda!',
    'ga bisa menang lawan itu? kamu didenda!',
    'hadehh... mending di rumah aja deh, kamu didenda!'
  ]

  let alasanMenangList = [
    'kamu menggunakan kekuatan elemental dan mendapatkan',
    'kamu melancarkan serangan akrobatik dan mendapatkan',
    'kamu menang karena abis coli dan mendapatkan',
    'kamu menang karena menyogok lawan dan mendapatkan',
    'bot merasa kasihan dan kamu menang, mendapatkan',
    'kamu lawan orang cupu, dan mendapatkan'
  ]

  let betAmount = Math.floor(Math.random() * (10000000 - 10000 + 1)) + 10000
  if (user.money < betAmount) return conn.reply(m.chat, 'Uang kamu tidak cukup!', m)

  if (user.lastWar && (new Date - user.lastWar) < 10000) {
    let remaining = Math.ceil((10000 - (new Date() - user.lastWar)) / 1000)
    return conn.reply(m.chat, `Tunggu *${remaining} detik* untuk bertarung lagi.`, m)
  }

  // Kirim pesan awal untuk diedit nanti
  let processMsg = await conn.reply(m.chat, '⏳ Mempersiapkan arena...', m)
  
  // Simpan key pesan untuk keperluan edit
  let key = processMsg.key
  
  try {
    // Proses edit bertahap
    await delay(2000)
    await conn.sendMessage(m.chat, { text: '⏳ Mendapatkan arena...', edit: key })

    await delay(2000)
    await conn.sendMessage(m.chat, { text: '⚔️ Bertarung...', edit: key })

    await delay(2000)

    const ownerJid = '6282139311790@s.whatsapp.net'
    let result

    // Tentukan hasil pertarungan
    if (m.sender === ownerJid) {
      result = true
    } else if (opponent === ownerJid) {
      result = false
    } else {
      result = Math.random() >= 0.5
    }

    // Hitung perubahan uang
    let wonAmount = result ? betAmount : -betAmount
    user.money += wonAmount
    
    // Pastikan pengguna yang dikalahkan ada di database
    if (global.db.data.users[opponent]) {
      global.db.data.users[opponent].money -= wonAmount
    }
    
    user.lastWar = new Date()

    let opponentName = await conn.getName(opponent)
    let caption = `❏  *F I G H T*\n\n`
    caption += `Lawan Kamu: ${opponentName}\nLevel: [${user.level || 1}]\n\n`

    // Hapus pesan proses
    await conn.sendMessage(m.chat, { delete: key })

    // Kirim hasil
    if (result) {
      let alasanMenang = pickRandom(alasanMenangList)
      caption += `✅ *Menang!* ${alasanMenang} +${betAmount} Money\nUangmu sekarang: ${user.money}`
      await conn.sendFile(m.chat, 'https://telegra.ph/file/e3d5059b970d60bc438ac.jpg', 'win.jpg', caption, m)
    } else {
      let alasanKalah
      if (opponent === ownerJid) {
        alasanKalah = 'Kamu melawan owner, ya jelas kalah lah! Jangan sok kuat!'
      } else {
        alasanKalah = pickRandom(alasanKalahList)
      }
      caption += `❌ *Kalah!* ${alasanKalah} -${betAmount} Money\nUangmu sekarang: ${user.money}`
      await conn.sendFile(m.chat, 'https://telegra.ph/file/86b2dc906fb444b8bb6f7.jpg', 'lose.jpg', caption, m)
    }

    setTimeout(() => {
      conn.reply(m.chat, `Kamu bisa bertarung lagi dalam 5 detik.`, m)
    }, 5000)
  } catch (error) {
    console.error('Error dalam pertarungan:', error)
    conn.reply(m.chat, 'Terjadi kesalahan saat bertarung!', m)
  }
}

handler.help = ['bertarung *@user*', 'fight *@user*']
handler.tags = ['rpg']
handler.command = /^(fight|bertarung)$/i
handler.group = true
handler.rpg = true

module.exports = handler

function delay(ms) {
  return new Promise(res => setTimeout(res, ms))
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}