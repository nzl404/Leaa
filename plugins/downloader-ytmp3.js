let fetch = require("node-fetch");

let handler = async (m, { conn, text }) => {
    if (!text) throw '*Example:* .ytmp3 https://youtu.be/Xu1wA7CfhQg?si=jEe2GCmMKwzBNegl';

    try {
        // Mengirim reaksi awal
        await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

        // API Betabotz
        const apiUrl = `https://api.betabotz.eu.org/api/download/ytmp3?url=${text}&apikey=${lann}`;

        // Memproses data dari API
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.status || !data.result?.mp3) {
            throw 'Failed to fetch audio. Please try again later.';
        }

        // Cek durasi dari API
        const duration = data.result.duration || 0;
        const maxDuration = 10 * 60; // 10 menit dalam detik
        const maxFileSize = 50 * 1024 * 1024; // 50MB dalam bytes

        // Validasi berdasarkan durasi
        if (duration > maxDuration) {
            await conn.sendMessage(m.chat, {
                text: `❌ Audio terlalu panjang! Durasi maksimal adalah 10 menit.\n\nDurasi audio saat ini: ${Math.floor(duration/60)} menit ${duration % 60} detik`
            }, { quoted: m });
            return;
        }

        const audioData = {
            mp3: data.result.mp3,
            title: data.result.title || 'YouTube Audio',
            thumb: data.result.thumb,
            duration: duration
        };

        // Mengirim file audio
        await conn.sendMessage(m.chat, {
            audio: { url: audioData.mp3 },
            mimetype: 'audio/mpeg',
            fileName: `${audioData.title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: audioData.title,
                    body: `YOUTUBE MP3 • ${Math.floor(duration/60)}:${duration % 60 < 10 ? '0' : ''}${duration % 60}`,
                    description: 'YOUTUBE MP3',
                    mediaType: 2,
                    thumbnail: await (await fetch(audioData.thumb)).buffer(),
                    mediaUrl: text,
                    sourceUrl: text,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

    } catch (e) {
        console.error('Error:', e);
        await conn.sendMessage(m.chat, {
            text: `Terjadi kesalahan: ${e.message || e}`
        }, { quoted: m });
    }
};

handler.help = ['ytmp3 <url>'];
handler.tags = ['downloader'];
handler.command = /^(yta|ytmp3|mp3)$/i;
handler.limit = false;
handler.premium = false;

module.exports = handler;