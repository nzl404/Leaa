const { createCanvas, loadImage } = require('canvas')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    let atas = '', bawah = ''
    if (text.includes('|')) {
        [atas, bawah] = text.split`|`
    } else {
        bawah = text
    }

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (q.message?.viewOnceMessage) {
        throw `❌ Tidak bisa memproses media sekali lihat!`
    }

    if (!mime) throw `Balas gambar dengan perintah\n\n${usedPrefix + command} *<teks>*\natau\n${usedPrefix + command} *<teks atas>|<teks bawah>*`
    if (!/image\/(jpe?g|png)/.test(mime)) throw `_*Mime ${mime} tidak didukung!*_`

    let img = await q.download()

    try {
        const memeBuffer = await createMeme(img, atas, bawah)

        conn.sendImageAsSticker(m.chat, memeBuffer, m, { packname: global.packname, author: global.author })
    } catch (e) {
        console.log(e)
        throw `❌ Error saat membuat meme: ${e.message}`
    }
}

/**
 * Membuat meme dari gambar dan teks
 * @param {Buffer} imageBuffer - Buffer gambar
 * @param {string} topText - Teks atas
 * @param {string} bottomText - Teks bawah
 * @returns {Promise<Buffer>} - Buffer gambar meme
 */
async function createMeme(imageBuffer, topText, bottomText) {
    const image = await loadImage(imageBuffer)

    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    const fontSize = Math.floor(canvas.width / 12)
    ctx.font = `bold ${fontSize}px Impact`
    ctx.textAlign = 'center'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = Math.floor(fontSize / 6)
    ctx.fillStyle = 'white'

    const drawText = (text, position) => {
        const maxWidth = canvas.width * 0.9
        let lines = []
        let words = text.split(' ')
        let line = ''

        for (let word of words) {
            let testLine = line ? line + ' ' + word : word
            let metrics = ctx.measureText(testLine)
            if (metrics.width > maxWidth && line !== '') {
                lines.push(line)
                line = word
            } else {
                line = testLine
            }
        }
        if (line) lines.push(line)

        lines.forEach((line, index) => {
            let lineY
            if (position === 'top') {
                const topOffset = canvas.height * 0.05
                lineY = topOffset + (index * fontSize * 1.2)
            } else {
                const bottomSpacing = canvas.height * 0.1 // Naik ke 10% dari bawah
                lineY = canvas.height - bottomSpacing - (lines.length - 1 - index) * fontSize * 1.2
            }

            ctx.lineWidth = Math.floor(fontSize / 5)
            ctx.strokeText(line, canvas.width / 2, lineY)
            ctx.fillText(line, canvas.width / 2, lineY)
        })
    }

    if (topText) drawText(topText.toUpperCase(), 'top')
    if (bottomText) drawText(bottomText.toUpperCase(), 'bottom')

    return canvas.toBuffer('image/png')
}

handler.help = ['stickermeme <teks>|<teks>']
handler.tags = ['sticker']
handler.command = /^(s(tic?ker)?me(me)?)$/i

handler.limit = false

module.exports = handler