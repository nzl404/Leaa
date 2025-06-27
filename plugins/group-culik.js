// Plugin by Marshaaa
let handler = async (m, { conn, participants, usedPrefix, command }) => {
    try {
        const allUsers = Object.keys(global.db.data.users);
        if (!allUsers || allUsers.length < 1) {
            return m.reply('Database pengguna bot masih kosong, belum ada target yang bisa diculik.');
        }

        const currentParticipants = participants.map(p => p.id);
        
        const potentialTargets = allUsers.filter(jid => 
            !currentParticipants.includes(jid) && 
            jid.endsWith('@s.whatsapp.net') &&   
            !jid.startsWith('212') 
        );

        if (potentialTargets.length === 0) {
            return m.reply('Gagal menemukan target! Semua pengguna di database bot sepertinya sudah ada di grup ini.');
        }

        await conn.sendMessage(m.chat, { react: { text: '🎯', key: m.key } });

        const randomJid = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
        const randomUserTag = `@${randomJid.split('@')[0]}`;

        try {
            const [exists] = await conn.onWhatsApp(randomJid);
            if (!exists) {
                await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
                return m.reply(`Gagal! Target ${randomUserTag} tidak terdaftar di WhatsApp.`);
            }

            const response = await conn.groupParticipantsUpdate(m.chat, [randomJid], "add");
            const status = response[0].status;

            if (status === '200') {
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
                m.reply(`🔪 Misi berhasil! ${randomUserTag} telah diculik ke dalam grup.`);
            } else if (status === '403' || status === '408' || status === '409') {
                const inviteCode = await conn.groupInviteCode(m.chat);
                const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

                // --- PERUBAHAN DI SINI ---
                // Pesan yang dikirim ke target sekarang HANYA link undangan.
                await conn.sendMessage(randomJid, { text: inviteLink });
                
                await conn.sendMessage(m.chat, { react: { text: '📩', key: m.key } });
            } else {
                throw new Error(`Status tidak terduga dari WhatsApp: ${status}`);
            }

        } catch (error) {
            console.error(error);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply(`Operasi penculikan terhadap ${randomUserTag} gagal total. Target mungkin terlalu kuat atau terjadi kesalahan teknis.`);
        }

    } catch (e) {
        console.error(e);
        m.reply('Gagal menjalankan misi. Terjadi kesalahan pada sistem.');
    }
};

handler.help = ['addrandom', 'culik'];
handler.tags = ['group'];
handler.command = /^(addrandom|culik)$/i;

handler.admin = true;
handler.group = true;
handler.botAdmin = true;

module.exports = handler;