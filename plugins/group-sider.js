let handler = async (m, { conn, text, args, groupMetadata }) => {
    await conn.sendPresenceUpdate('composing', m.chat)

    const now = Date.now()
    const inactivityThreshold = 86400000 * 7 // 7 hari dalam milidetik

    const sider = []
    
    for (const participant of groupMetadata.participants) {
        if (participant.isAdmin || participant.isSuperAdmin) {
            continue
        }

        const user = global.db.data.users[participant.id]

        if (!user || (now - user.lastseen > inactivityThreshold)) {
            sider.push(participant.id)
        }
    }

    const totalSiders = sider.length
    const totalMembers = groupMetadata.participants.length

    if (!args[0]) {
        return conn.reply(m.chat, `ðŸš© Gunakan perintah dengan opsi:\n1. \`${handler.command} --list\` untuk melihat daftar anggota tidak aktif\n2. \`${handler.command} --kick\` untuk mengeluarkan anggota tidak aktif`, m)
    }

    if (args[0].toLowerCase() === 'list') {
        if (totalSiders === 0) {
            return conn.reply(m.chat, `ðŸš© *Tidak ada anggota yang tidak aktif (sider) di grup ini.*`, m)
        }
        
        const groupName = groupMetadata.subject
        
        const readmore = String.fromCharCode(8206).repeat(4001)

        const pesanUtama = `
Halo semua!

Setelah dilakukan pengecekan, ditemukan ada *${totalSiders} dari ${totalMembers}* anggota di grup *${groupName}* yang terdeteksi tidak aktif selama lebih dari 7 hari.

Sesuai aturan, nama-nama yang ada di daftar *(klik "Baca Selengkapnya" di bawah)* diberikan waktu *24 jam* untuk kembali aktif. Jika tidak, akan dikeluarkan dari grup.

Bagi yang merasa namanya ditag, mohon segera mengirim pesan bebas apa saja agar tidak terdeteksi sebagai sider.

Terima kasih.
        `.trim()

        // 3. Buat daftar anggota yang akan disembunyikan di bawah readmore
        const userList = sider.map((v, i) => `${i + 1}. @${v.split('@')[0]}`).join('\n')

        // 4. Gabungkan semuanya menjadi satu pesan
        const message = `${pesanUtama}\n\n${readmore}\n\n${userList}`

        // 5. Kirim pesan yang sudah diformat
        return conn.sendMessage(m.chat, { 
            text: message, 
            mentions: sider 
        }, { quoted: m })
        
        // --- Integrasi Template Selesai ---
    }

    if (args[0].toLowerCase() === 'kick') {
        if (totalSiders === 0) {
            return conn.reply(m.chat, `ðŸš© *Tidak ada anggota tidak aktif (sider) untuk dikeluarkan.*`, m)
        }

        await conn.reply(m.chat, `ðŸš© Memulai proses untuk mengeluarkan *${totalSiders}* anggota tidak aktif...`, m)

        let kickedCount = 0;
        for (const user of sider) {
            try {
                await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
                kickedCount++;
                await new Promise(resolve => setTimeout(resolve, 500)); 
            } catch (e) {
                console.error(`Gagal mengeluarkan ${user}:`, e)
                await conn.reply(m.chat, `ðŸš« Gagal mengeluarkan @${user.split('@')[0]}`, m, { contextInfo: { mentionedJid: [user] }})
            }
        }

        return conn.reply(m.chat, `ðŸš© Berhasil mengeluarkan *${kickedCount}* dari *${totalSiders}* anggota tidak aktif.`, m)
    }

    return conn.reply(m.chat, `ðŸš© Opsi tidak valid. Gunakan \`--list\` untuk melihat atau \`--kick\` untuk mengeluarkan.`, m)
}

handler.help = ['gcsider']
handler.tags = ['group']
handler.command = /^(sider|gcsider)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

module.exports = handler