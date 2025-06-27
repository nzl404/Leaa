let fetch = require('node-fetch')

let handler = async (m, { conn, command }) => {
    let buffer = await fetch(`https://files.catbox.moe/2rqz9h.jpg`).then(res => res.buffer())
    conn.sendFile(m.chat, buffer, 'hasil.jpg', `*Jika telah melakukan pembayaran silahkan kirimkan bukti pembayaran ke WhatsApp Owner.*\n\n> ketik .creator`, m)
}

handler.help = ['payment', 'donate']
handler.command = ['donasi', 'payment', 'donate']
handler.tags = ['main']
module.exports = handler