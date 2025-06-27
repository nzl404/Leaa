const { getRecentLive } = require('jkt48connect-cli');

let handler = async function (m, { conn }) {
    await conn.sendPresenceUpdate('composing', m.chat);
    const apiKey = "marshalena";

    try {
        const response = await getRecentLive(apiKey);
        const data = response;

        if (!data || !Array.isArray(data) || data.length === 0) {
            return conn.reply(m.chat, "Tidak ada data recent gift live untuk saat ini.", m);
        }

        let message = `✨ *Recent Gift Live JKT48*\n\n`;
        data.forEach((item, index) => {
            const nickname = item.member.nickname?.replace(/\s+/g, '');
            const roomUrl = nickname
                ? `https://www.showroom-live.com/JKT48_${nickname}`
                : `https://www.showroom-live.com/officialJKT48`;

            const formattedDate = new Date(item.created_at).toLocaleString("id-ID", {
                timeZone: "Asia/Jakarta",
                weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            // --- PERBAIKAN FINAL DI SINI ---
            // Menggunakan optional chaining (?.) untuk mengakses data yang mungkin tidak ada
            // Lalu berikan nilai default "N/A" jika data tidak ditemukan.
            const viewersCount = item.live_info.viewers?.num;
            const viewersText = viewersCount ? viewersCount.toLocaleString("id-ID") : "N/A";
            
            // Periksa juga untuk durasi, untuk keamanan
            const durationMinutes = item.live_info.duration ? (item.live_info.duration / 60000).toFixed(2) : "N/A";

            message += `*${index + 1}. ${item.member.name}*\n`;
            if (item.member.nickname) {
                message += `• Nickname: ${item.member.nickname}\n`;
            }
            message += `• Tanggal: ${formattedDate} WIB\n`;
            message += `• Total Gift: ${item.total_gift.toLocaleString("id-ID")}\n`;
            message += `• Durasi Live: ${durationMinutes} menit\n`;
            message += `• Viewers: ${viewersText}\n`;
            message += `• Room: ${roomUrl}\n\n`;
        });

        await conn.relayMessage(m.chat, {
            extendedTextMessage: {
                text: message.trim(),
                contextInfo: {
                    externalAdReply: {
                        title: "Recent Gifts - Showroom JKT48",
                        body: `Data terbaru dari ${data.length} aktivitas live terakhir.`,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: "https://files.catbox.moe/kzc4og.jpg",
                        sourceUrl: "https://www.showroom-live.com/onlivesg/JKT48"
                    }
                }
            }
        }, {});

    } catch (error) {
        console.error("Recent Gift Error:", error);
        await conn.reply(m.chat, `Maaf, terjadi kesalahan saat mengolah data: ${error.message}`, m);
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
};

handler.help = ["recentgift"];
handler.tags = ["jkt48"];
handler.command = /^(recentgift)$/i;
module.exports = handler;