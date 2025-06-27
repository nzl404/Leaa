var fetch = require("node-fetch");

var handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        throw `Masukkan URL!\n\nContoh:\n${usedPrefix + command} https://www.facebook.com/share/r/19FhFrquUQ/`;
    }

    const url = args[0];

    // Validasi URL
    if (!/^https?:\/\/(www\.)?facebook\.com\/.+/i.test(url)) {
        throw `URL tidak valid! Pastikan URL berasal dari Facebook.\n\nContoh:\n${usedPrefix + command} https://www.facebook.com/share/r/19FhFrquUQ/`;
    }

    try {
        // Memberikan notifikasi reaksi "loading"
        await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

        // Memanggil API FB Downloader
        const response = await fetch(`https://api.betabotz.eu.org/api/download/fbdown?url=${encodeURIComponent(url)}&apikey=${lann}`);
        const result = await response.json();

        // Validasi hasil API
        if (result.status && result.result?.length > 0) {
            // Prioritize HD resolution if available
            const video = result.result.find(item => item.resolution.includes('720p'));
            const videoUrl = video ? video._url : result.result[0]._url;  // Use 360p if 720p is not available

            await conn.sendFile(m.chat, videoUrl, 'video.mp4', '', m);
        } else {
            throw `Gagal mendapatkan video dari URL. Pastikan URL video dapat diunduh dan bukan dari konten pribadi.`;
        }
    } catch (e) {
        console.error(e);

        // Pesan error dengan detail
        let errorMsg = `Terjadi kesalahan pada sistem. Mohon coba lagi beberapa saat atau pastikan URL yang Anda masukkan benar.`;
        if (e?.message && e.message.includes('fetch')) {
            errorMsg = `Gagal mengakses server API. Periksa koneksi internet Anda atau hubungi pengelola bot.`;
        }

        conn.reply(m.chat, `_*${errorMsg}*_`, m);
    }
};

handler.help = ['facebook'].map(v => v + ' <url>');
handler.command = /^(fb|facebook|facebookdl|fbdl|fbdown|dlfb)$/i;
handler.tags = ['downloader'];
handler.limit = false;
handler.private = false;

module.exports = handler;