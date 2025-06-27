const { getTheater, getTheaterDetail } = require('jkt48connect-cli');

let handler = async (m, { conn }) => {
    await conn.sendPresenceUpdate('composing', m.chat);
    const apiKey = "marshalena";

    try {
        const theaterData = await getTheater(apiKey);
        if (!theaterData?.theater?.length) {
            throw new Error("Gagal mendapatkan data teater atau data kosong.");
        }

        const now = new Date();
        const upcomingEvents = theaterData.theater
            .filter(event => new Date(event.date) >= now)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (upcomingEvents.length === 0) {
            return conn.reply(m.chat, 'Saat ini tidak ada jadwal pertunjukan yang akan datang.', m);
        }

        const detailPromises = upcomingEvents.map(event => getTheaterDetail(apiKey, event.id));
        const eventDetails = await Promise.all(detailPromises);

        let message = `*Berikut adalah daftar member untuk jadwal pertunjukan teater mendatang.*\n\n`;

        for (let i = 0; i < upcomingEvents.length; i++) {
            const event = upcomingEvents[i];
            const detail = eventDetails[i];
            const eventUrl = `https://jkt48.com/theater/schedule/id/${event.id}?lang=id`;

            const memberList = detail?.shows?.[0]?.members?.length > 0
                ? detail.shows[0].members.map(member => member.name.trim()).join(", ")
                : "Belum diumumkan";

            const eventDate = new Date(event.date);
            const formattedDate = new Intl.DateTimeFormat('id-ID', {
                weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta'
            }).format(eventDate);
            const formattedTime = new Intl.DateTimeFormat('id-ID', {
                hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta'
            }).format(eventDate);

            message += `\`${event.title}\`\n`;
            message += `🗓️ ${formattedDate}\n`;
            message += `🕒 ${formattedTime} WIB\n`;
            message += `👥 ${memberList}\n`;
            message += `🔗 ${eventUrl}\n\n`;
        }

        await conn.reply(m.chat, message.trim(), m);

    } catch (error) {
        console.error("JKT48 Section Error:", error);
        await conn.reply(m.chat, `Terjadi kesalahan: ${error.message}`, m);
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
};

handler.help = ['jkt48section', 'memberlist'];
handler.tags = ['jkt48'];
handler.command = /^(jkt48section|memberlist)$/i;
module.exports = handler;