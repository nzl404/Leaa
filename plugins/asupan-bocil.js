let fetch = require('node-fetch');

// In-memory cache to store sent videos and timestamps
let sentVideos = {};

let handler = async (m, { conn, usedPrefix, command }) => {
    // React with a clock emoji
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

    let res = await fetch('https://raw.githubusercontent.com/iniseira/asupan/main/bocil.json');
    let asup = await res.json();

    let now = Date.now();
    let cutoffTime = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

    // Filter out videos that were sent within the last 3 days
    let availableVideos = asup.filter(video => {
        let lastSent = sentVideos[video.url];
        return !lastSent || now - lastSent > cutoffTime;
    });

    // If all videos have been sent recently, reset the cache and reuse all videos
    if (availableVideos.length === 0) {
        sentVideos = {};
        availableVideos = asup;
    }

    // Select a random video
    let json = availableVideos[Math.floor(Math.random() * availableVideos.length)];

    // Mark the video as sent
    sentVideos[json.url] = now;

    // Send the MP4 file (video) with caption
    await conn.sendFile(m.chat, json.url, '', 'Pedo!', m, 'video/mp4');
};

handler.help = ['bocil'];
handler.tags = ['asupan'];
handler.command = /^(bocil)$/i;

module.exports = handler;