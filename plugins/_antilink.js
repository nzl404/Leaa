let handler = m => m

// Regex untuk mendeteksi link grup WhatsApp
const linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i

handler.before = async function (m, { conn, user, isBotAdmin, isAdmin }) {
  // Abaikan jika pesan dari bot, dari chat pribadi, atau bukan dari grup
  if ((m.isBaileys && m.fromMe) || m.fromMe || !m.isGroup) return true

  const chat = global.db.data.chats[m.chat]
  const isGroupLink = linkRegex.exec(m.text)

  // Periksa apakah fitur anti-link aktif dan ada link grup di pesan
  if (chat.antiLink && isGroupLink) {
    // Kirim pesan peringatan awal dan simpan hasilnya
    const sentMsg = await conn.sendMessage(m.chat, {
        text: `*「 ANTI LINK 」*\n\nTerdeteksi @${m.sender.split('@')[0]} telah mengirim link grup!\n\nMaaf, Anda akan dikeluarkan dari grup ini. Selamat tinggal!`,
        mentions: [m.sender]
    })

    // Pengecualian untuk Admin: edit pesan, jangan ditendang
    if (isAdmin) {
        // Tunggu sebentar untuk efek dramatis (opsional)
        await new Promise(resolve => setTimeout(resolve, 1000)) 
        
        // Edit pesan yang sudah dikirim sebelumnya
        return conn.sendMessage(m.chat, {
            text: `*「 ANTI LINK 」*\n\nTenang, Anda adalah Admin. Anda tidak akan dikeluarkan.`,
            edit: sentMsg.key
        })
    }

    // Pengecualian jika Bot bukan Admin
    if (!isBotAdmin) {
        return m.reply('*「 ANTI LINK 」*\n\nBot bukan admin, bagaimana bisa mengeluarkan orang? _-')
    }

    // Pengecualian untuk link grup itu sendiri
    const linkGC = ('https://chat.whatsapp.com/' + await conn.groupInviteCode(m.chat))
    const isLinkconnGc = new RegExp(linkGC, 'i')
    const isgclink = isLinkconnGc.test(m.text)

    if (isgclink) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        return conn.sendMessage(m.chat, {
            text: `*「 ANTI LINK 」*\n\nPerintah ditolak, bot tidak akan mengeluarkanmu.\nKarena itu adalah link grup ini sendiri.`,
            edit: sentMsg.key
        })
    }
    
    // Tunggu sebentar sebelum menendang agar user sempat membaca pesan
    await new Promise(resolve => setTimeout(resolve, 2000)) 

    // Hapus pesan yang berisi link
    await conn.sendMessage(m.chat, { delete: m.key })
    
    // Keluarkan pengguna dari grup
    await conn.groupParticipantsUpdate(m.chat, [m.sender], "remove")
  }
  
  return true
}

module.exports = handler