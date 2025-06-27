const axios = require('axios');

let handler = async (m, { conn }) => {
    try {
        await m.reply('Sedang mencari informasi turnamen terbaru...');

        const { data } = await axios.get('https://api.nekorinn.my.id/info/infotourney');

        if (!data.status || !data.result || data.result.length === 0) {
            throw new Error('Tidak ada informasi turnamen yang ditemukan atau terjadi kesalahan pada API.');
        }

        const tournaments = data.result;
        const thumbnailUrl = tournaments[0].imageUrl;

        let responseText = `🏆 *INFO TURNAMEN TERBARU* 🏆\n\n`;
        
        tournaments.forEach((tourney, index) => {
            responseText += `*${index + 1}. ${tourney.title}*\n`;
            responseText += `📅 *Diterbitkan:* ${tourney.datePublished}\n`;
            responseText += `📝 *Deskripsi:* ${tourney.description}\n`;
            responseText += `ℹ️ *Info Pendaftaran:* ${tourney.info}\n`;
            responseText += `🔗 *Link Info:* ${tourney.url}\n`;
            if (index < tournaments.length - 1) {
                responseText += `\n--------------------\n\n`;
            }
        });
        
        responseText += `\n\n*Sumber:* infotourney.com\n*API Creator:* ${data.creator}`;

        // --- PERUBAHAN DIMULAI DI SINI ---

        // 1. Definisikan contextInfo dengan judul thumbnail yang baru
        const contextInfo = {
            externalAdReply: {
                title: '🏆 Info Turnamen Akan Datang', // Judul baru sesuai permintaan
                body: 'Klik untuk melihat daftar turnamen MLBB terbaru.',
                thumbnail: await (await conn.getFile(thumbnailUrl)).data,
                sourceUrl: tournaments[0].url, // Link tetap mengarah ke turnamen terbaru
                mediaType: 1,
                renderLargerThumbnail: true
            }
        };

        // 2. Kirim pesan HANYA teks, dengan menyertakan contextInfo (tanpa key 'image')
        await conn.sendMessage(m.chat, {
            text: responseText,
            contextInfo: contextInfo
        }, { quoted: m });

        // --- AKHIR PERUBAHAN ---

    } catch (e) {
        console.error(e);
        m.reply('Gagal mengambil data turnamen. Mohon coba lagi nanti.');
    }
};

handler.help = ['infotourney', 'infoturney'];
handler.tags = ['internet'];
handler.command = /^(infotourney|infoturney)$/i;
handler.limit = true;

module.exports = handler;