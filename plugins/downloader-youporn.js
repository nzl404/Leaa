const fetch = require('node-fetch');
const { isUrl } = require("../lib/myfunc.js"); 

let handler = async (m, { conn, args }) => {
    // Check available disk space before processing
    const fs = require('fs');
    try {
        const stats = fs.statSync('/tmp');
        // Skip detailed space check, just ensure /tmp is writable
    } catch (error) {
        console.warn('Cannot check /tmp stats:', error.message);
    }

    if (!args[0]) {
        throw 'Harap masukkan URL YouPorn yang ingin diunduh.\n\n*Contoh:*\n.youporn https://www.youporn.com/watch/102559291/';
    }
    if (!isUrl(args[0]) || !args[0].includes('youporn.com/watch')) {
        throw 'URL tidak valid. Harap masukkan URL YouPorn yang benar.';
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        const apiUrl = `https://api.nekorinn.my.id/downloader/youporn?url=${encodeURIComponent(args[0])}`;
        
        // Add timeout and better error handling for API request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(apiUrl, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.status || !data.result || !data.result.downloadUrl) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply(data.message || 'Gagal mengambil data video dari API.');
        }

        const { title, author, views, datePublished, downloadUrl } = data.result;
        
        if (!downloadUrl || downloadUrl.length === 0) {
            throw new Error('Tidak ada link unduhan yang tersedia.');
        }

        // Prioritize lowest quality first to minimize space usage
        let selectedVideo = downloadUrl.find(v => v.quality === '240') || 
                           downloadUrl.find(v => v.quality === '360') || 
                           downloadUrl.find(v => v.quality === '480') ||
                           downloadUrl[downloadUrl.length - 1]; 

        // Initialize caption here, before using it
        let caption = `✨ *${title}* ✨

👤 *Author:* ${author}
👁️ *Views:* ${views}
📅 *Published:* ${datePublished}
⚙️ *Kualitas:* ${selectedVideo.quality}p

> _© Leaa_`;

        // Check if video URL is accessible and get file size
        const videoController = new AbortController();
        const videoTimeoutId = setTimeout(() => videoController.abort(), 15000);
        
        let videoSize = 0;
        try {
            const videoResponse = await fetch(selectedVideo.videoUrl, {
                method: 'HEAD', // Only get headers to check size and accessibility
                signal: videoController.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://www.youporn.com/'
                }
            });
            clearTimeout(videoTimeoutId);
            
            if (!videoResponse.ok) {
                throw new Error(`Video tidak dapat diakses (${videoResponse.status})`);
            }
            
            // Get file size from Content-Length header
            const contentLength = videoResponse.headers.get('content-length');
            if (contentLength) {
                videoSize = parseInt(contentLength);
                const videoSizeMB = (videoSize / (1024 * 1024)).toFixed(2);
                
                // Check if video exceeds 200MB limit
                if (videoSize > 200 * 1024 * 1024) { // 200MB in bytes
                    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                    return m.reply(`❌ Video terlalu besar (${videoSizeMB} MB). Maksimal 200 MB.\n\n🔄 Coba cari video dengan kualitas atau durasi yang lebih rendah.`);
                }
                
                // Add size info to caption
                caption += `\n📁 *Ukuran:* ${videoSizeMB} MB`;
            }
        } catch (videoError) {
            clearTimeout(videoTimeoutId);
            // If we can't get size, continue but warn user
            console.log('Cannot get video size:', videoError.message);
            caption += `\n⚠️ *Ukuran:* Tidak dapat dideteksi`;
        }

        // Try direct URL sending first (no local storage)
        try {
            // Method 1: Send as document (uses less processing)
            await conn.sendMessage(m.chat, {
                document: { 
                    url: selectedVideo.videoUrl,
                    // Add custom headers to avoid blocks
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': 'https://www.youporn.com/'
                    }
                },
                caption: caption,
                mimetype: 'video/mp4',
                fileName: `${title.replace(/[^a-zA-Z0-9\s-]/g, '').substring(0, 50)}.mp4`
            }, { quoted: m });
            
            m.reply('📁 Video dikirim sebagai dokumen untuk menghemat resource server.');
            
        } catch (docError) {
            console.log('Document method failed, trying video method:', docError.message);
            
            // Method 2: Try as video with minimal processing
            await conn.sendMessage(m.chat, { 
                video: { 
                    url: selectedVideo.videoUrl,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': 'https://www.youporn.com/'
                    }
                }, 
                caption: caption,
                mimetype: 'video/mp4',
                fileName: `${title.replace(/[^a-zA-Z0-9\s-]/g, '').substring(0, 50)}.mp4`,
                jpegThumbnail: null,
                // Disable any processing that might use temp files
                gifPlayback: false,
                ptv: false
            }, { 
                quoted: m,
                timeout: 300000 // 5 minutes timeout
            });
        }
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (error) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        console.error('YouPorn Handler Error:', error);
        
        // More specific error messages
        if (error.message.includes('ENOSPC')) {
            m.reply('❌ Server kehabisan ruang penyimpanan. Silakan coba lagi nanti atau hubungi admin.');
        } else if (error.message.includes('timeout') || error.name === 'AbortError') {
            m.reply('❌ Timeout: Proses download memakan waktu terlalu lama. Silakan coba lagi.');
        } else if (error.message.includes('HTTP')) {
            m.reply('❌ API sedang bermasalah. Silakan coba lagi nanti.');
        } else if (error.message.includes('Video tidak dapat diakses')) {
            m.reply('❌ Video tidak dapat diakses atau telah dihapus.');
        } else {
            m.reply(`❌ Terjadi kesalahan: ${error.message}`);
        }
    }
};

handler.help = ['youporn <url>', 'yp <url>'];
handler.tags = ['downloader', 'nsfw'];
handler.command = /^(youporn|yp)$/i;
handler.premium = true;
handler.limit = false;

module.exports = handler;