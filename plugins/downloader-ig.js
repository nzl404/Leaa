const fetch = require("node-fetch");

// Helper untuk jeda waktu antar pengiriman media
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        throw `Masukkan URL Instagram!\n\n*Contoh:*\n${usedPrefix + command} https://www.instagram.com/p/C8h502Iysop/`;
    }

    let url = args[0];
    
    // Memberikan feedback awal
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        let success = false;

        // --- Router Cerdas untuk Tipe Link ---
        
        // 1. Jika ini adalah link STORY
        if (url.includes('/stories/')) {
            const match = url.match(/\/stories\/([^\/]+)/);
            if (!match) throw 'Username tidak dapat ditemukan dari URL Story.';
            
            const username = match[1];
            m.reply(`Mengambil semua story dari *${username}*...`);

            // API untuk Story tetap menggunakan Nekorinn karena Betabotz tidak menanganinya
            const storyApiUrl = `https://api.nekorinn.my.id/downloader/instagram-story?username=${username}`;
            const res = await fetch(storyApiUrl);
            const data = await res.json();

            if (!data.status || !data.result || data.result.stories.length === 0) {
                throw 'Gagal mengambil story atau tidak ada story yang tersedia untuk pengguna ini.';
            }

            const stories = data.result.stories;
            m.reply(`Ditemukan *${stories.length}* story. Mengirim...`);

            for (const story of stories) {
                await conn.sendFile(m.chat, story.download, '', '', m);
                await sleep(1000); // Jeda 1 detik
            }
            success = true;

        // 2. Jika ini adalah link POST atau REEL
        } else if (url.includes('/p/') || url.includes('/reel/')) {
            
            // --- Percobaan 1: API Utama (Betabotz) ---
            try {
                console.log('Mencoba API utama: Betabotz...');
                const primaryApiUrl = `https://api.betabotz.eu.org/api/download/igdowloader?url=${encodeURIComponent(url)}&apikey=${global.lann}`;
                const res = await fetch(primaryApiUrl);
                const data = await res.json();

                if (data.status && data.message && data.message.length > 0) {
                    const mediaList = data.message;
                    for (const media of mediaList) {
                        // API Betabotz tidak menyediakan caption, jadi dikirim tanpa caption
                        await conn.sendFile(m.chat, media._url, '', '', m);
                        await sleep(1000);
                    }
                    success = true;
                } else {
                    // Jika status tidak sukses, lempar error untuk ditangkap & lanjut ke fallback
                    throw new Error('API Utama (Betabotz) gagal, mencoba API alternatif.');
                }

            } catch (e) {
                // Tampilkan error kegagalan API utama hanya di console
                console.error(e);
                
                // --- Percobaan 2: API Alternatif (Nekorinn) ---
                try {
                    console.log('Mencoba API alternatif: Nekorinn...');
                    const fallbackApiUrl = `https://api.nekorinn.my.id/downloader/instagram?url=${encodeURIComponent(url)}`;
                    const res = await fetch(fallbackApiUrl);
                    const data = await res.json();

                    if (data.status && data.result && data.result.downloadUrl.length > 0) {
                        let caption = data.result.metadata.caption || '';
                        const mediaUrls = data.result.downloadUrl;
                        
                        for (let i = 0; i < mediaUrls.length; i++) {
                            await conn.sendFile(m.chat, mediaUrls[i], '', (i === 0 ? caption : ''), m);
                            await sleep(1000);
                        }
                        success = true;
                    } else {
                        throw new Error('API Alternatif (Nekorinn) juga gagal.');
                    }
                } catch (fallbackError) {
                    console.error(fallbackError);
                    // Biarkan error ini dilempar ke catch utama untuk memberi reaksi '❌'
                    throw fallbackError;
                }
            }
        } else {
            throw 'URL Instagram tidak valid. Harap gunakan link untuk Post, Reel, atau Story.';
        }

        // Memberikan feedback akhir jika sukses
        if (success) {
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        } else {
            throw 'Gagal mengunduh media setelah mencoba semua API.';
        }

    } catch (err) {
        console.error('Error akhir:', err);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
}

handler.help = ['ig', 'instagram'].map(v => v + ' <url>');
handler.tags = ['downloader'];
handler.command = /^(instagram|ig|igdl|igstory)$/i;
handler.limit = false;

module.exports = handler;