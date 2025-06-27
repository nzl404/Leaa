const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) {
            throw new Error(`Silakan masukkan URL Nekopoi.\n\n*Contoh:* \n${usedPrefix + command} https://nekopoi.care/hentai/dekichau-made-kon/`);
        }
        if (!text.includes('nekopoi.care')) {
            throw new Error('URL yang Anda masukkan tidak valid. Harap gunakan URL dari nekopoi.care');
        }

        await m.reply('Mengambil detail dari URL...');

        const encodedUrl = encodeURIComponent(text);
        
        const { data } = await axios.get(`https://api.nekorinn.my.id/info/nekopoi-detail?url=${encodedUrl}`);

        if (!data.status || !data.result?.metadata) {
            throw new Error(data.message || 'Gagal mengambil detail dari URL tersebut.');
        }

        const { metadata, episode } = data.result;
        
        let responseText = `✨ *${metadata.judul}*\n\n`;
        
        responseText += `*Judul Jepang:* ${metadata.japanese || 'N/A'}\n`;
        responseText += `*Skor:* ⭐️ ${metadata.skor || 'N/A'}\n`;
        responseText += `*Produser:* 🏢 ${metadata.produser || 'N/A'}\n`;
        responseText += `*Status:* 📊 ${metadata.status || 'N/A'}\n`;
        responseText += `*Tayang:* 🗓️ ${metadata.tayang || 'N/A'}\n`;
        responseText += `*Durasi:* ⏱️ ${metadata.durasi || 'N/A'}\n`;
        responseText += `*Genre:* 🏷️ ${metadata.genres || 'N/A'}\n\n`;
        
        responseText += `*Sinopsis:*\n${metadata.sinopsis || 'Tidak ada sinopsis.'}\n\n`;

        if (episode && episode.length > 0) {
            responseText += `📼 *Daftar Episode:*\n--------------------\n`;
            episode.forEach((ep, index) => {
                responseText += `*${index + 1}. ${ep.title}*\n`;
                responseText += `  - Rilis: ${ep.release}\n`;
                responseText += `  - Link: ${ep.url}\n\n`;
            });
        }
        
        responseText += `> © Leaa`;

        const contextInfo = {
            externalAdReply: {
                title: metadata.judul,
                body: metadata.sinopsis ? metadata.sinopsis.substring(0, 100) + '...' : 'Klik untuk melihat detail',
                thumbnail: await (await conn.getFile(metadata.cover)).data,
                sourceUrl: text,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        };
        
        await conn.sendMessage(m.chat, {
            text: responseText,
            contextInfo: contextInfo
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply(`Terjadi kesalahan:\n${e.message}`);
    }
};

handler.help = ['nekopoidetail <url>'];
handler.tags = ['anime'];
handler.command = /^(nekodetail|nekopoidetail)$/i;
handler.premium = true;
handler.limit = false;

module.exports = handler;