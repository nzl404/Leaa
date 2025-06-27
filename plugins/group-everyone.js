let handler = m => m

handler.before = async function(m) {
    if (!m.isGroup) return
    try {
        let body = (m.text || m.caption || '').trim()
        const metadata = await conn.groupMetadata(m.chat)
        const participant = metadata.participants.find(v => v.id === m.sender)
        const isAdmins = participant && participant.admin !== null
        
        // Cek jika pesan mengandung @everyone atau @all dan pengirim adalah admin
        if (!/(@everyone|@all)/i.test(body) || !isAdmins) return
        
        // Siapkan data untuk mention
        const participants = metadata.participants.map(v => v.id)
        
        // Tentukan teks dan tipe mention berdasarkan trigger
        let newText = body
        let groupSubject = ""
        
        if (body.includes("@everyone")) {
            newText = body.replace(/@everyone/gi, '@' + m.chat)
            groupSubject = "everyone"
        } else if (body.includes("@all")) {
            newText = body.replace(/@all/gi, '@' + m.chat)
            groupSubject = "all"
        }
        
        // Siapkan opsi pesan
        const msgOptions = {
            text: newText,
            contextInfo: {
                mentionedJid: participants,
                groupMentions: [{
                    groupSubject: groupSubject,
                    groupJid: m.chat
                }]
            }
        }
        
        // Kirim pesan
        await conn.sendMessage(m.chat, msgOptions)
        
    } catch(e) {
        console.error(e)
    }
}

module.exports = handler