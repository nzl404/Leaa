const axios = require('axios').default;
const { promisify } = require('util');
const sleep = promisify(setTimeout);

// Track recently sent media
let recentMedia = new Set();
const MAX_RECENT = 50; // Keep track of last 50 media

let handler = async (m, { conn }) => {
  try {
    // Show loading reaction
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

    // JSON URLs
    const jsonUrls = [
      'https://raw.githubusercontent.com/iniseira/asupan/main/cosplaygirl.json',
      'https://raw.githubusercontent.com/iniseira/asupan/main/cosplaygirl2.json'
    ];

    // Randomly select which JSON to use
    const selectedJsonUrl = jsonUrls[Math.floor(Math.random() * jsonUrls.length)];

    // Fetch media list with timeout
    const { data: mediaList } = await axios.get(
      selectedJsonUrl,
      {
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }
    );

    if (!Array.isArray(mediaList) || !mediaList.length) {
      throw new Error('Data media tidak valid');
    }

    // Filter out recently sent media
    const availableMedia = mediaList.filter(url => !recentMedia.has(url));
    
    // If all media have been recently sent, clear history
    if (availableMedia.length === 0) {
      recentMedia.clear();
    }

    // Try up to 3 different media files if download fails
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // Get random media URL from available media
        const mediaUrl = availableMedia.length > 0 
          ? availableMedia[Math.floor(Math.random() * availableMedia.length)]
          : mediaList[Math.floor(Math.random() * mediaList.length)];

        // Add to recent media
        recentMedia.add(mediaUrl);
        
        // Keep recent media set size in check
        if (recentMedia.size > MAX_RECENT) {
          const [firstItem] = recentMedia;
          recentMedia.delete(firstItem);
        }
        
        // Determine media type from extension
        const fileExtension = mediaUrl.split('.').pop().toLowerCase();
        const isVideo = fileExtension === 'mp4';
        const isHeic = fileExtension === 'heic';

        // Set appropriate config based on media type
        const config = {
          responseType: 'arraybuffer',
          timeout: isVideo ? 30000 : 15000, // Longer timeout for videos
          maxContentLength: isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024, // 50MB for videos, 10MB for images
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': isVideo
              ? 'video/mp4,video/*'
              : isHeic
              ? 'image/heic,image/*'
              : 'image/jpeg,image/*'
          }
        };

        // Download media
        const { data: mediaBuffer } = await axios.get(mediaUrl, config);

        // Send media based on type
        if (isVideo) {
          await conn.sendMessage(m.chat, {
            video: mediaBuffer,
            caption: '_Random Girl Cosplay_\n\n> Ketik lagi kalo mau yang lainnya.',
            quoted: m
          });
        } else {
          await conn.sendMessage(m.chat, {
            image: mediaBuffer,
            mimetype: isHeic ? 'image/heic' : 'image/jpeg',
            caption: '_Random Girl Cosplay_\n\n> Ketik lagi kalo mau yang lainnya.',
            quoted: m
          });
        }

        // Show success reaction
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        return;

      } catch (downloadError) {
        console.error(`Download attempt ${attempt + 1} failed:`, downloadError.message);
        if (attempt < 2) {
          await sleep(1500); // Wait 1.5s before retry
          continue;
        }
        throw downloadError;
      }
    }

  } catch (error) {
    // Log error
    console.error('[MEDIA ERROR]', {
      message: error.message,
      code: error.code || 'UNKNOWN'
    });

    // Show error reaction
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

    // Send user-friendly error message
    let errorMsg = '*Media tidak tersedia. Silakan coba lagi.*';
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      errorMsg = '*Koneksi terputus. Silakan coba lagi.*';
    }
    
    await conn.reply(m.chat, errorMsg, m);
  }
};

// Command settings
handler.help = ['cosplaygirl'];
handler.tags = ['asupan'];
handler.command = /^(cosplaygirl|cosgirl|cosg)$/i;

module.exports = handler;