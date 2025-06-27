let handler = async (m, { teks, conn, isOwner, isAdmin, args }) => {
    if (!(isAdmin || isOwner)) {
        global.dfail('admin', m, conn)
        throw false
    }
    let ownerGroup = m.chat.split`-`[0] + "@s.whatsapp.net";
    
    // Handle quoted message
    if(m.quoted){
        // Check if quoted message is from bot
        if(m.quoted.sender === conn.user.jid) {
            return m.reply('Aneh lu mau kick Bot pake Bot *-_-*');
        }
        // Check if quoted message is from owner
        if(m.quoted.sender === ownerGroup) {
            return m.reply('Mana bisa gue kick owner bjir');
        }
        let usr = m.quoted.sender;
        await conn.groupParticipantsUpdate(m.chat, [usr], "remove");
        return m.reply(`✅ Berhasil mengeluarkan @${usr.split('@')[0]}`, null, { mentions: [usr] });
    }

    // Handle mentioned users
    if (!m.mentionedJid[0]) throw `tag yang mau dikick`;
    
    // Filter out owner and bot from mentioned users
    let users = m.mentionedJid.filter(u => {
        if (u === conn.user.jid) {
            m.reply('Aneh lu mau kick Bot pake Bot *-_-*');
            return false;
        }
        if (u === ownerGroup) {
            m.reply('Mana bisa gue kick owner bjir');
            return false;
        }
        return true;
    });

    // Kick filtered users
    for (let user of users) {
        if (user.endsWith("@s.whatsapp.net")) {
            try {
                await conn.groupParticipantsUpdate(m.chat, [user], "remove");
                m.reply(`✅ Berhasil mengeluarkan @${user.split('@')[0]}`, null, { mentions: [user] });
            } catch (error) {
                m.reply(`❌ Gagal mengeluarkan @${user.split('@')[0]}`, null, { mentions: [user] });
                console.error(error);
            }
        }
    }
};

handler.help = ['kick @user']
handler.tags = ['group']
handler.command = /^(kic?k|remove|tendang|\-)$/i

handler.group = true
handler.botAdmin = true

module.exports = handler