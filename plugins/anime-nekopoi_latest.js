const axios = require('axios');

let handler = async (m, { conn }) => {
    try {
        await m.reply('Mengambil update terbaru dari Nekopoi...');

        const { data } = await axios.get('https://api.nekorinn.my.id/info/nekopoi-latest');

        if (!data.status || !data.result?.series?.length || !data.result?.episode?.length) {
            throw new Error('Tidak ada update terbaru yang ditemukan atau API sedang bermasalah.');
        }

        const { series, episode } = data.result;
        
        const thumbnailUrl = series[0].cover;

        let responseText = '🔥 *Nekopoi Latest Updates* 🔥\n\n';

        // Bagian 1: Series Ongoing
        responseText += '🎬 *SERIES ONGOING*\n--------------------\n';
        series.forEach((s, index) => {
            responseText += `*${index + 1}. ${s.title}*\n`;
            responseText += `  - *Produser:* ${s.produser || 'N/A'}\n`;
            responseText += `  - *Genre:* ${s.genre || 'N/A'}\n`;
            responseText += `  - *Skor:* ${s.skor || 'N/A'}\n`;
            responseText += `  - *Link:* ${s.url}\n\n`;
        });

        // Bagian 2: Episode Terbaru
        responseText += '🆕 *EPISODE TERBARU*\n--------------------\n';
        episode.forEach((e, index) => {
            responseText += `*${index + 1}. ${e.title}*\n`;
            responseText += `  - *Rilis:* ${e.release || 'N/A'}\n`;
            responseText += `  - *Link:* ${e.url}\n\n`;
        });
        
        responseText += `> © Leaa`;

        const contextInfo = {
            externalAdReply: {
                title: 'Nekopoi Latest Updates',
                body: 'Update terbaru series dan episode.',
                thumbnail: await (await conn.getFile(thumbnailUrl)).data,
                sourceUrl: 'https://nekopoi.care/',
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
        m.reply(`Gagal mengambil data Nekopoi.\n\n*Pesan Error:* ${e.message}`);
    }
};

handler.help = ['nekopoilatest'];
handler.tags = ['anime'];
handler.command = /^(nekolatest|nekopoilatest)$/i;
handler.premium = true;
handler.limit = false;

module.exports = handler;