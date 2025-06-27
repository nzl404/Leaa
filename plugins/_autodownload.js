const { trimUndefined } = require('@adiwajshing/baileys');
let fetch = require('node-fetch');
const axios = require('axios');

let handler = m => m;

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const safeEncodeURL = (url) => {
    try {
        return encodeURIComponent(url).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16));
    } catch (error) {
        return url;
    }
}

// DOWNLOADER TIKTOK
async function downloadTikTok(link, m) {
    try {
        
        const response = await fetch(`https://api.betabotz.eu.org/api/download/tiktok?url=${encodeURIComponent(link)}&apikey=${lann}`);
        const data = await response.json();
        
        // Penyesuaian: Cek 'data.result.video' dan pastikan tidak kosong
        if (!data.status || !data.result.video || !data.result.video[0]) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            // Beri pesan error yang lebih jelas
            m.reply('Gagal mendapatkan link video dari respons API.');
            return;
        }
        
        // Penyesuaian: Ambil link dari elemen pertama array 'video'
        const videoUrl = data.result.video[0];
        const caption = data.result.title;
        
        // Kirim file menggunakan videoUrl yang sudah disesuaikan
        await conn.sendFile(m.chat, videoUrl, 'tiktok.mp4', caption, m);
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        // Beri pesan error yang lebih jelas
        m.reply(`Terjadi kesalahan saat memproses permintaan: ${error.message}`);
    }
}

// DOWNLOADER DOUYIN
async function downloadDouyin(link, m) {
    try {
        const response = await fetch(`https://api.betabotz.eu.org/api/download/douyin?url=${link}&apikey=${lann}`);
        const data = await response.json();
        
        if (!data.result || !data.result.video || data.result.video.length === 0) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return;
        }

        const caption = data.result.title || '';
        for (let v of data.result.video) {
            await conn.sendFile(m.chat, v, null, caption, m);
            await sleep(3000); // Memberi jeda jika ada banyak file
        }
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
}

// DOWNLOADER PINTEREST
async function downloadpin(link, m) {
    try {
        const response = await fetch(`https://api.betabotz.eu.org/api/download/pinterest?url=${link}&apikey=${lann}`);
        const res = await response.json();
        
        if (!res.result || !res.result.data) {
             await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
             return;
        }
        
        let { media_type, image, title, video } = res.result.data;

        if (media_type === 'video/mp4') {
            await conn.sendFile(m.chat, video, 'pin.mp4', title || '', m);
        } else {
            await conn.sendFile(m.chat, image, 'pin.jpg', title || '', m);
        }
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
}

// DOWNLOADER YOUTUBE
async function downloadyt(link, m) {
    try {
        // 🚫 Reaksi 'loading' dihapus
        const MAX_SIZE = 60 * 1024 * 1024;
        const response = await axios.get(`https://api.betabotz.eu.org/api/download/ytmp4?url=${encodeURIComponent(link)}&apikey=${lann}`);
        const res = response.data.result;

        if (!res || !res.mp4) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return conn.reply(m.chat, `Gagal mendapatkan link download dari API.`, m);
        }
        
        var { mp4, title } = res;

        const headResponse = await axios.head(mp4);
        const fileSize = parseInt(headResponse.headers['content-length']);
        
        if (fileSize > MAX_SIZE) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return conn.reply(m.chat, `⚠️ Ukuran video terlalu besar (${(fileSize / (1024 * 1024)).toFixed(2)}MB). Maksimal 60MB.`, m);
        }

        await conn.sendFile(m.chat, mp4, 'yt.mp4', title || '', m);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
}

// DOWNLOADER INSTAGRAM 
async function downloadInstagram(link, m) {
    const sentMedia = new Set();
    try {
        // 🚫 Reaksi 'loading' dihapus
        const response = await fetch(`https://api.betabotz.eu.org/api/download/igdowloader?url=${encodeURIComponent(link)}&apikey=${lann}`);
        let message = await response.json();
        
        if (!message.message || message.message.length === 0) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return;
        }
        
        const caption = message.title || '';
        for (let i of message.message) {
            if (!sentMedia.has(i._url)) {
                await conn.sendFile(m.chat, i._url, null, caption, m);
                sentMedia.add(i._url);
                await sleep(1000); // Jeda antar file
            }
        }
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
}

// DOWNLOADER FACEBOOK 
async function downloadFacebook(link, m) {
    try {
        try {
            console.log('Mencoba API Facebook dari Betabotz...');
            const response = await fetch(`https://api.betabotz.eu.org/api/download/fbdown?url=${encodeURIComponent(link)}&apikey=${lann}`);
            const js = await response.json();

            if (js.status && js.result?.length > 0) {
             
                const video = js.result.find(item => item.resolution?.includes('HD')) || js.result[0];
                
                await conn.sendFile(m.chat, video._url, 'fb.mp4', js.title || 'Video Facebook', m);
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
                
                return; 
            }
        } catch (e) {
            console.error('API Betabotz gagal:', e);
        }

        try {
            console.log('API Betabotz gagal, mencoba API dari Nekorin...');
            const response = await fetch(`https://api.nekorinn.my.id/downloader/facebook?url=${encodeURIComponent(link)}`);
            const js = await response.json();

            if (js.status && js.result?.length > 0) {
                const video = js.result.find(item => item.quality === 'hd') || js.result[0];
                
                await conn.sendFile(m.chat, video.url, 'fb.mp4', 'Video Facebook', m);
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
                
                return;
            }
        } catch (e) {
             console.error('API Nekorin juga gagal:', e);
        }

        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

    } catch (error) {
        console.error('Error tak terduga di fungsi downloadFacebook:', error);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
}


// DOWNLOADER SPOTIFY
async function _spotify(link, m) {
    try {
        const res = await fetch(`https://api.betabotz.eu.org/api/download/spotify?url=${link}&apikey=${lann}`);
        let jsons = await res.json();

        if (!jsons.result || !jsons.result.data || !jsons.result.data.url) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return;
        }

        const { thumbnail, title, url } = jsons.result.data;
        await conn.sendMessage(m.chat, {
            audio: { url: url },
            mimetype: 'audio/mpeg',
            contextInfo: {
                externalAdReply: {
                    title: title,
                    thumbnailUrl: thumbnail,
                    sourceUrl: link, // sourceUrl lebih baik link asli spotify
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
}

// DOWNLOADER TWITTER
async function _twitter(link, m) {
    const apiEndpoints = [
        { 
            name: 'Betabotz-V1',
            url: (link, lann) => `https://api.betabotz.eu.org/api/download/twitter?url=${encodeURIComponent(link)}&apikey=${lann}`,
            parser: (js) => {
                if (!js.status || !Array.isArray(js.result?.url) || js.result.url.length === 0) {
                    return null;
                }
                const hdUrl = js.result.url.find(item => item && item.hd)?.hd;
                const sdUrl = js.result.url.find(item => item && item.sd)?.sd;
                const finalUrl = hdUrl || sdUrl;
                if (finalUrl) {
                    return [{
                        url: finalUrl,
                        caption: js.result.title || ''
                    }];
                }
                return null;
            }
        },
        { 
            name: 'Nekorin',
            url: (link, lann) => `https://api.nekorinn.my.id/downloader/twitter?url=${encodeURIComponent(link)}`,
            parser: (js) => {
                if (js.status && js.result?.downloadUrl?.length > 0) {
                    const caption = js.result.caption || '';
                    return js.result.downloadUrl.map(media => ({ url: media.url, caption }));
                }
                return null;
            }
        },
        { 
            name: 'Betabotz-V2',
            url: (link, lann) => `https://api.betabotz.eu.org/api/download/twitter2?url=${encodeURIComponent(link)}&apikey=${lann}`,
            parser: (js) => {
                if (js.status && js.result?.mediaURLs?.length > 0) {
                    const caption = js.result.text || '';
                    return js.result.mediaURLs.map(url => ({ url, caption }));
                }
                return null;
            }
        }
    ];

    for (const api of apiEndpoints) {
        try {
            console.log(`Mencoba API Twitter dari: ${api.name}`);
            const response = await fetch(api.url(link, lann));
            const js = await response.json();
            const mediaList = api.parser(js);

            if (mediaList && mediaList.length > 0) {
                console.log(`Berhasil menggunakan API: ${api.name}`);
                for (const media of mediaList) {
                    await conn.sendFile(m.chat, media.url, null, media.caption, m);
                    await sleep(2000);
                }
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
                return;
            }
        } catch (e) {
            console.error(`API ${api.name} error:`, e);
        }
    }

    console.log('Semua API Twitter gagal.');
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
}



// DOWNLOADER THREADS
async function _threads(link, m) {
    try {
        const api = await fetch(`https://api.betabotz.eu.org/api/download/threads?url=${link}&apikey=${lann}`);
        const apiResponse = await api.json();
        
        if (!apiResponse.result) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return;
        }

        const video = apiResponse.result.video_urls?.[0];
        const foto = apiResponse.result.image_urls?.[0];
        const caption = apiResponse.result.title || '';

        if (video) {
            await conn.sendFile(m.chat, video.download_url, 'threads.mp4', caption, m);
        } else if (foto) {
            await conn.sendFile(m.chat, foto, 'threads.jpg', caption, m);
        } else {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return conn.reply(m.chat, `Konten tidak ditemukan pada link Threads tersebut.`, m);
        }
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
}

// DOWNLOADER CAPCUT
async function _capcut(link, m) {
    try {
        const response = await fetch(`https://api.betabotz.eu.org/api/download/capcut?url=${link}&apikey=${lann}`);
        const res = await response.json();
        
        if (!res.result || !res.result.video) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return;
        }

        const { video, title } = res.result;
        await conn.sendFile(m.chat, video, 'capcut.mp4', title || '', m);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
}

// DOWNLOADER SNACKVIDEO
async function _snackvideo(url, m) {
    try {
        const response = await fetch(`https://api.betabotz.eu.org/api/download/snackvideo?url=${url}&apikey=${lann}`);
        const res = await response.json();

        if (!res.result || !res.result.video_url) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return;
        }

        const videoUrl = res.result.video_url;
        const title = res.result.title || '';
        await conn.sendFile(m.chat, videoUrl, 'snack.mp4', title, m);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
}

// DOWNLOADER REDNOTE/XIAOHONGSHU
async function downloadRedNote(link, m) {
    try {
        const encodedUrl = safeEncodeURL(link);
        const response = await axios.get(`https://api.betabotz.eu.org/api/download/rednote?url=${encodedUrl}&apikey=${lann}`);
        
        if (!response.data || !response.data.result) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return;
        }

        const result = response.data.result;
        const caption = result.title || 'Tidak ada judul';
        
        if (result.video) {
            await conn.sendFile(m.chat, result.video, "rednote.mp4", caption, m);
        } else if (result.images && result.images.length > 0) {
            for (let img of result.images) {
                await conn.sendMessage(m.chat, { image: { url: img }, caption: caption }, { quoted: m });
                await sleep(1000); // Jeda antar gambar
            }
        } else {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return;
        }
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error('RedNote Download Error:', error);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
}



let old = new Date();
const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

handler.before = async function (m, { conn }) {
    try {
        let chat = global.db.data.chats[m.chat];
        
        // Skip if no text
        if (!m.text) return;

        // Skip if message starts with command prefixes
        if (m.text.startsWith('=>') || m.text.startsWith('>') || m.text.startsWith('.') || m.text.startsWith('#') || m.text.startsWith('!') || m.text.startsWith('/') || m.text.startsWith('\/')) return;

        // Check if it's a group chat
        const isGroup = m.isGroup || m.chat.endsWith('@g.us');

        // For group chats, check if autodl is enabled
        if (isGroup && !chat.autodl) return;

        // For private chats or enabled group chats, proceed with download
        if (!m.text.includes('http')) return;

        // Check if chat is banned
        if (chat.isBanned) return;

        let text = m.text.replace(/\n+/g, ' ');

        const tiktokRegex = /(?:https?:\/\/)?(?:www\.|vt\.|vm\.|t\.)?(?:tiktok\.com\/)(\S+)/i;
        const douyinRegex = /(?:https?:\/\/)?(?:www\.|vt\.|vm\.|t\.|v\.)?(?:douyin\.com\/)(\S+)/i;
        const instagramRegex = /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:tv\/|p\/|reel\/)(\S+)/i;
        const facebookRegex = /(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)/i;
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w\-]{11})(?:\S*)?/i;
        const pinterestRegex = /(?:https?:\/\/)?(?:pin\.it)\/([a-zA-Z0-9]+)/i;
        const spotifyRegex = /(?:https?:\/\/)?(?:open\.spotify\.com\/track\/)([a-zA-Z0-9]+)(?:\S*)?/i;
        const twitterRegex = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([A-Za-z0-9_]+)\/status\/(\d+)(?:\?[^#]*)?(?:#.*)?/i;
        const threadsRegex = /^(https?:\/\/)?(www\.)?threads\.net(\/[^\s]*)?(\?[^\s]*)?/;
        const capcutRegex = /^https:\/\/www\.capcut\.com\/(t\/[A-Za-z0-9_-]+\/?|template-detail\/\d+\?(?:[^=]+=[^&]+&?)+)$/;
        const snackvideoRegex = /^(https?:\/\/)?s\.snackvideo\.com\/p\/[a-zA-Z0-9]+$/i;
        const rednoteRegex = /(?:https?:\/\/)?(?:www\.)?(?:xhslink\.com|xiaohongshu\.com)\/([^\s"'<>]+)/i;

        if (text.match(tiktokRegex)) {
            await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
            await downloadTikTok(text.match(tiktokRegex)[0], m);
        } else if (text.match(douyinRegex)) {
            await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
            await downloadDouyin(text.match(douyinRegex)[0], m);
        } else if (text.match(instagramRegex)) {
            await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
            await downloadInstagram(text.match(instagramRegex)[0], m);
        } else if (text.match(facebookRegex)) {
            await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
            await downloadFacebook(text.match(facebookRegex)[0], m);
        } else if (text.match(youtubeRegex)) {
            await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
            await downloadyt(text.match(youtubeRegex)[0], m);
        } else if (text.match(pinterestRegex)) {
            await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
            await downloadpin(text.match(pinterestRegex)[0], m);
        } else if (text.match(spotifyRegex)) {
            await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
            await _spotify(text.match(spotifyRegex)[0], m);
        } else if (text.match(twitterRegex)) {
            await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
            await _twitter(text.match(twitterRegex)[0], m);
        } else if (text.match(threadsRegex)) {
            await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
            await _threads(text.match(threadsRegex)[0], m);
        } else if (text.match(capcutRegex)) {
            await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
            await _capcut(text.match(capcutRegex)[0], m);
        } else if (text.match(snackvideoRegex)) {
            await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
            await _snackvideo(text.match(snackvideoRegex)[0], m);
        } else if (text.match(rednoteRegex)) {
            await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });
            const url = text.match(rednoteRegex)[0];
            await downloadRedNote(url, m);
        }

    } catch (error) {
        console.error('Handler Error:', error);
    }

    return true;
}

module.exports = handler;