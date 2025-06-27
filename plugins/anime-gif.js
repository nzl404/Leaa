let handler = async (m, { conn }) => {
  conn.sendMessage(m.chat, {
    react: {
      text: '🕒',
      key: m.key,
    }
  });
	conn.sendImageAsSticker(m.chat, `https://api.betabotz.org/api/sticker/animegif?apikey=${global.lann}`, m, { packname: "sticker by", author: "Kemii" })
}
handler.help = ['animegif']
handler.tags = ['anime']

handler.command = /^(animegif)$/i
handler.premium = false
handler.register = true
handler.limit = 5
module.exports = handler