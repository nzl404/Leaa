const { getTheater, getTheaterDetail } = require("jkt48connect-cli");

// 4. Dibuat fungsi bantuan untuk menghindari duplikasi kode
async function formatEventMessage(event, detail) {
    const eventDate = new Date(event.date);
    const formattedDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta'
    }).format(eventDate);
    const formattedTime = new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta'
    }).format(eventDate);

    const memberList = detail.shows?.[0]?.members
        ?.map(member => member.name.trim())
        .join(", ") || "Belum diumumkan";

    return `\`${event.title}\`\n` +
           `🗓️ ${formattedDate}\n` +
           `🕒 ${formattedTime} WIB\n` +
           `👥 ${memberList}\n` +
           `🔗 Detail: https://jkt48.com/theater/schedule/id/${event.id}?lang=id`;
}

let handler = async function (m, { conn }) {
    // 1. Pemeriksaan perintah di awal dihapus karena sudah ditangani oleh handler.command
    
    await conn.sendPresenceUpdate('composing', m.chat);

    const showThumbnails = {
        'Pajama Drive': 'https://files.catbox.moe/w91nid.jpg',
        'Ingin Bertemu': 'https://files.catbox.moe/iqiio1.jpg',
        'Aturan Anti Cinta': 'https://files.catbox.moe/zb3ltu.jpg',
        'Sambil Menggandeng Erat Tanganku': 'https://files.catbox.moe/gfqymz.jpg'
    };
    // Saran: Simpan API Key di file konfigurasi terpisah
    const apiKey = "marshalena"; 

    try {
        const theaterData = await getTheater(apiKey);
        if (!theaterData?.theater?.length) {
            throw new Error("Format data dari API tidak valid atau kosong");
        }

        // 2. Logika timezone yang lebih kuat
        const today = new Date();
        const todayDateString = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })).toISOString().split('T')[0];

        const todayEvents = theaterData.theater
            .filter(event => event.date.startsWith(todayDateString))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (todayEvents.length === 0) {
            const upcomingEvents = theaterData.theater
                .filter(event => new Date(event.date) > today)
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            if (upcomingEvents.length === 0) {
                return conn.sendMessage(m.chat, { text: "*❌ Tidak ada jadwal teater untuk hari ini maupun hari-hari mendatang.*" });
            }

            const nextEvent = upcomingEvents[0];
            const theaterDetail = await getTheaterDetail(apiKey, nextEvent.id);
            const formattedMessage = await formatEventMessage(nextEvent, theaterDetail);

            const message = `*❌ Tidak ada jadwal teater hari ini.*\n\n` +
                          `*_🎭 Jadwal teater terdekat:_*\n` +
                          formattedMessage;
                          
            return conn.relayMessage(m.chat, { /* ... relayMessage content ... */ }, {}); // (Sama seperti kode Anda)

        }

        // 3. Mengambil semua detail teater secara paralel untuk efisiensi
        const detailPromises = todayEvents.map(event => getTheaterDetail(apiKey, event.id));
        const theaterDetails = await Promise.all(detailPromises);

        let eventMessages = [];
        for (let i = 0; i < todayEvents.length; i++) {
            const event = todayEvents[i];
            const detail = theaterDetails[i];
            eventMessages.push(await formatEventMessage(event, detail));
        }

        const finalMessage = `*_🎭 Jadwal teater hari ini:_*\n\n` + eventMessages.join('\n\n');
        const firstEvent = todayEvents[0];

        await conn.relayMessage(m.chat, {
            extendedTextMessage: {
                text: finalMessage.trim(),
                contextInfo: {
                    externalAdReply: {
                        title: `Jadwal Teater JKT48`,
                        body: firstEvent.title,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: showThumbnails[firstEvent.title] || 'https://files.catbox.moe/w91nid.jpg', // Default thumbnail
                        sourceUrl: `https://jkt48.com/theater/schedule/id/${firstEvent.id}?lang=id`
                    }
                }
            }
        }, {});

    } catch (error) {
        console.error("Theater schedule error:", error);
        await conn.sendMessage(m.chat, { text: "*⚠️ Maaf, terjadi kesalahan saat mengambil jadwal teater. Silakan coba lagi nanti.*" });
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
};

handler.help = ['theaterschedule', 'jadwalteater', 'theater'];
handler.tags = ['jkt48'];
handler.command = /^(theaterschedule|jadwalteater|theater)$/i;

module.exports = handler;