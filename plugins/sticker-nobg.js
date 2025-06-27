const fs = require('fs')
const axios = require('axios')
const FormData = require('form-data')
const path = require('path')
const { tmpdir } = require('os')

let handler = async (m, { conn, command, usedPrefix }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!/image\/(jpe?g|png)/.test(mime)) {
        throw `Format file tidak didukung! Kirim gambar dengan format JPG/PNG dengan caption ${usedPrefix + command}`
    }
    
    try {
        await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
        
        let media = await q.download()
        if (!media) throw 'Gagal mengunduh media!'

        const form = new FormData()
        form.append('image_file', media, 'image.png')
        form.append('size', 'auto')

        const response = await axios.post('https://api.remove.bg/v1.0/removebg', form, {
            headers: {
                ...form.getHeaders(),
                'X-Api-Key': 'iRQjQWxqA3VWTDjFmdrR11fQ'
            },
            responseType: 'arraybuffer'
        })

        if (response.status !== 200) throw 'Gagal menghapus background'

        const processedFile = path.join(tmpdir(), `nobg_${Date.now()}.png`)
        fs.writeFileSync(processedFile, Buffer.from(response.data))

        let sticker = await conn.sendImageAsSticker(m.chat, processedFile, m, { 
            packname: global.packname, 
            author: global.author 
        })

        if (fs.existsSync(processedFile)) fs.unlinkSync(processedFile)

    } catch (e) {
        console.error('Error:', e)
        m.reply(`❌ Gagal memproses gambar: ${e.message}`)
    }
}

handler.help = ['snobg', 'stickernobg']
handler.tags = ['sticker']
handler.command = /^(s(ticker)?nobg)$/i
handler.limit = false

module.exports = handler