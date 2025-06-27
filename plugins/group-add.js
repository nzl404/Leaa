let handler = async (m, { conn, text, participants, usedPrefix, command }) => {
    if (!text) {
        await conn.sendMessage(m.chat, { react: { text: '❓', key: m.key } });
        throw `_Masukan nomor!_\nContoh:\n\n${usedPrefix + command} ${global.owner[0]}`;
    }

    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

    const numbers = text.split(',')
        .map(v => v.replace(/[^0-9]/g, ''))
        .filter(v => v.length > 4 && v.length < 20);

    if (numbers.length === 0) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return m.reply('Tidak ada nomor valid yang ditemukan.');
    }

    const _participants = participants.map(user => user.id);
    const successAdds = [];
    const successInvites = [];
    const failedProcessing = [];

    // Ambil info grup yang dibutuhkan untuk pesan teks
    const groupMetadata = await conn.groupMetadata(m.chat);
    const groupName = groupMetadata.subject;
    const groupCode = await conn.groupInviteCode(m.chat);
    const inviteLink = `https://chat.whatsapp.com/${groupCode}`;

    // Buat template pesan teks undangan
    const inviteTextMessage = `Hai! Anda diundang untuk bergabung ke grup *${groupName}*.\n\nSilakan bergabung melalui link berikut:\n${inviteLink}`;

    for (const number of numbers) {
        const jid = number + '@s.whatsapp.net';

        if (_participants.includes(jid)) {
            failedProcessing.push(`${number} (Sudah di grup)`);
            continue;
        }

        try {
            const [exists] = await conn.onWhatsApp(jid);
            if (!exists) {
                failedProcessing.push(`${number} (Tidak terdaftar)`);
                continue;
            }

            try {
                // Coba tambah langsung
                const res = await conn.groupParticipantsUpdate(m.chat, [jid], "add");
                if (res[0].status !== '200') throw new Error(`Status Gagal: ${res[0].status}`);
                successAdds.push(number);

            } catch (e) {
                // --- FALLBACK PALING STABIL: KIRIM PESAN TEKS BIASA ---
                console.log(`Gagal 'add' untuk ${number}. Mengirim invite via teks biasa. Error: ${e.message}`);
                try {
                    await conn.sendMessage(jid, { text: inviteTextMessage });
                    successInvites.push(number);
                } catch (inviteError) {
                    console.error(`Gagal mengirim pesan invite ke ${number}:`, inviteError);
                    failedProcessing.push(`${number} (Gagal Kirim Invite)`);
                }
            }

        } catch (error) {
            console.error(`Error fatal pada proses ${number}:`, error.message || error);
            failedProcessing.push(`${number} (Error Proses)`);
        }
    }

    // Laporan Hasil
    let reportMessages = [];
    if (successInvites.length > 0) {
        reportMessages.push(`📩 Berhasil mengirim link undangan ke: ${successInvites.join(', ')}`);
    }
    if (failedProcessing.length > 0) {
        reportMessages.push(`❌ Gagal diproses: ${failedProcessing.join(', ')}`);
    }

    const hasAnySuccess = successAdds.length > 0 || successInvites.length > 0;
    await conn.sendMessage(m.chat, { react: { text: hasAnySuccess ? '✅' : '❌', key: m.key } });

    if (reportMessages.length > 0) {
        await m.reply(reportMessages.join('\n\n'));
    }
};

handler.help = ['add', '+'].map(v => v + ' nomor,nomor');
handler.tags = ['group'];
handler.command = /^(add|\+)$/i;
handler.admin = true;
handler.group = true;
handler.botAdmin = true;
handler.fail = null;

module.exports = handler;