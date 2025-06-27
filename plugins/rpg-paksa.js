let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    let id = m.sender
    let kerja = 'ewe-paksa'
    let cooldown = 7200000 // 2 jam

    let last = user.lastngewe || 0
    let remaining = cooldown - (Date.now() - last)

    if (remaining > 0) {
        return m.reply(`Silahkan tunggu *${clockString(remaining)}* lagi untuk menggunakan *ewe-paksa* kembali`)
    }

    conn.misi = conn.misi || {}
    if (id in conn.misi) {
        return conn.reply(m.chat, `Selesaikan Misi *${conn.misi[id][0]}* terlebih dahulu!`, m)
    }

    let uang = Math.floor(Math.random() * 1000000)
    let exp = Math.floor(Math.random() * 10000)

    // Narasi tahapan
    let tahap = [
        '🤭 Mulai ewe paksa...',
        '👙 Kamu paksa dia buka baju...',
        '🥵💦 sszz Ahhhh.....',
        '🥵 Ahhhh, Sakitttt!! >////< 💦Crotttt...',
        '🥵💦💦 Ahhhhhh 😫'
    ]

    let hasil = `
*—[ Hasil Ewe Paksa ${await conn.getName(m.sender)} ]—*
➤ 💰 Uang = [ ${uang} ]
➤ ✨ Exp = [ ${exp} ]
➤ 😍 Order Selesai = +1
`.trim()

    // Tambah reward ke user
    user.money += uang
    user.exp += exp
    user.lastngewe = Date.now()

    // Simpan status misi
    conn.misi[id] = [
        kerja,
        setTimeout(() => delete conn.misi[id], 26000)
    ]

    // Kirim pesan awal reply ke user
    let { key } = await conn.reply(m.chat, tahap[0], m)

    // Edit pesan bertahap
    for (let i = 1; i < tahap.length; i++) {
        await delay(5000)
        await conn.sendMessage(m.chat, { text: tahap[i], edit: key })
    }

    // Kirim hasil (jangan hapus pesan proses!)
    setTimeout(() => {
        conn.reply(m.chat, hasil, m)
    }, 25000)

    // Jangan kirim notifikasi cooldown karena sudah jelas dikontrol oleh waktu
}

handler.help = ['ewe-paksa']
handler.tags = ['rpg']
handler.command = /^ewe-paksa$/i
handler.register = true
handler.group = true
handler.rpg = true

module.exports = handler

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function clockString(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    let result = []
    if (h) result.push(`${h} jam`)
    if (m) result.push(`${m} menit`)
    if (s) result.push(`${s} detik`)
    return result.length ? result.join(' ') : 'kurang dari 1 detik'
}