const fetch = require('node-fetch');

const clientId = 'dOhZDxeorLJ93tOer1eMTw';
const clientSecret = 'XZCNrgPgM2ANbXcjfI5Z6Tws0NQuxg';
const username = 'iniseira';
const password = 'Argimo404';

let cachedToken = null;
let tokenExpiry = null;

const getAccessToken = async () => {
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    try {
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const response = await fetch('https://www.reddit.com/api/v1/access_token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'MyApp/1.0.0 (by /u/iniseira)'
            },
            body: `grant_type=password&username=${username}&password=${password}`
        });

        if (!response.ok) {
            throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.access_token) {
            throw new Error('No access token received');
        }

        cachedToken = data.access_token;
        tokenExpiry = Date.now() + ((data.expires_in || 3600) * 1000);
        
        return data.access_token;
    } catch (error) {
        throw new Error(`Authentication error: ${error.message}`);
    }
};

const extractMediaUrl = (post) => {
    if (!post.data) return null;

    // Check for preview images first
    if (post.data.preview?.images?.[0]?.source?.url) {
        return post.data.preview.images[0].source.url.replace(/&amp;/g, '&');
    }

    // Check for gallery
    if (post.data.is_gallery && post.data.media_metadata) {
        const images = Object.values(post.data.media_metadata);
        if (images.length > 0 && images[0].s?.u) {
            return images[0].s.u.replace(/&amp;/g, '&');
        }
    }

    // Check for direct media URL
    if (post.data.url) {
        const url = post.data.url.replace(/&amp;/g, '&');
        if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            return url;
        }

        // Handle imgur links
        if (url.includes('imgur.com')) {
            if (!url.includes('i.imgur.com')) {
                return url.replace('imgur.com', 'i.imgur.com') + '.jpg';
            }
            return url;
        }

        // Handle Reddit image/video hosting
        if (url.includes('i.redd.it')) {
            return url;
        }
    }

    // Check for Reddit-hosted video
    if (post.data.is_video && post.data.media?.reddit_video?.fallback_url) {
        return post.data.media.reddit_video.fallback_url;
    }

    return null;
};

const getValidMediaPosts = (posts) => {
    return posts.filter(post => {
        // Check if we can extract a valid media URL
        return extractMediaUrl(post) !== null;
    });
};

const pickRandom = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
};

let handler = async (m, { conn, text, usedPrefix, command, isPrems }) => {
    if (!text) {
        conn.reply(m.chat, `Gunakan contoh: ${usedPrefix}${command} memes`, m);
        return;
    }

    try {
        const accessToken = await getAccessToken();
        const sortMethods = ['hot', 'new', 'top'];
        const selectedSort = pickRandom(sortMethods);
        
        const timeFrames = ['hour', 'day', 'week', 'month', 'year', 'all'];
        const selectedTime = pickRandom(timeFrames);

        const url = selectedSort === 'top' 
            ? `https://oauth.reddit.com/r/${encodeURIComponent(text)}/top.json?limit=100&t=${selectedTime}`
            : `https://oauth.reddit.com/r/${encodeURIComponent(text)}/${selectedSort}.json?limit=100`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'MyApp/1.0.0 (by /u/iniseira)'
            }
        });

        if (!response.ok) {
            throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.data?.children?.length) {
            throw new Error(`Subreddit '${text}' tidak ditemukan atau tidak memiliki konten.`);
        }

        // Filter posts for media content and based on NSFW status
        const validPosts = getValidMediaPosts(data.data.children).filter(post => {
            if (post.data.over_18) {
                return isPrems; // Only show NSFW content to premium users
            }
            return true;
        });

        if (!validPosts.length) {
            if (data.data.children.some(post => post.data.over_18)) {
                throw new Error(`Konten NSFW hanya tersedia untuk user premium. Upgrade ke premium untuk mengakses.`);
            }
            throw new Error(`Tidak ada media yang valid di subreddit '${text}'. Coba subreddit lain.`);
        }

        const post = pickRandom(validPosts);
        const nsfwWarning = post.data.over_18 ? '⚠️ *NSFW*\n\n' : '';
        
        const mediaUrl = extractMediaUrl(post);
        if (!mediaUrl) {
            throw new Error('Gagal mendapatkan URL media.');
        }

        const caption = `${nsfwWarning}🔎 *Search:* r/${text}\n` +
                       `📝 *Title:* ${post.data.title}\n` +
                       `🔗 *Source:* https://reddit.com${post.data.permalink}`;

        // Send the media
        await conn.sendFile(m.chat, mediaUrl, 'reddit_media', caption, m);
    } catch (error) {
        conn.reply(m.chat, `Error: ${error.message}`, m);
    }
};

handler.help = ['subreddit <query>'];
handler.tags = ['internet'];
handler.command = /^(redditimage|reddit|r|subreddit)$/i;
handler.group = true;
handler.private = false;

module.exports = handler;