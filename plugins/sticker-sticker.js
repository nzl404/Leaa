const fs = require('fs')
const sharp = require('sharp') 

let handler = async (m, { conn, command, usedPrefix }) => {
  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
  
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  
  // Check if the message is one view (viewOnce)
  if (q.viewOnce || (q.msg && q.msg.viewOnce)) {
    throw `❌ *Tidak bisa membuat sticker dari pesan one view!*\n\nKirim gambar/video biasa dengan caption ${usedPrefix + command}\nDurasi video maksimal 10 detik.`
  }
  
  if (/image/.test(mime)) {
    let media = await q.download()

    let processedMedia = await sharp(media)
      .resize(512, 512, { 
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 } 
      })
      .png() 
      .toBuffer()

    let encmedia = await conn.sendImageAsSticker(m.chat, processedMedia, m, { packname: global.packname, author: global.author })
    await fs.unlinkSync(encmedia)
  } else if (/video/.test(mime)) {
    if ((q.msg || q).seconds > 11) return m.reply('Maksimal 10 detik!')
    let media = await q.download()

    let encmedia = await conn.sendVideoAsSticker(m.chat, media, m, { packname: global.packname, author: global.author })
    await fs.unlinkSync(encmedia)
  } else {
    throw `Kirim gambar/video dengan caption ${usedPrefix + command}\nDurasi video 1-10 detik.`
  }
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = /^(stiker|s|sticker)$/i
handler.limit = false
module.exports = handler