let handler = async (m, { conn }) => {
    try {
        const niatDzuhur = {
            name: "Niat Shalat Dzuhur",
            arabic: "اُصَلِّى فَرْضَ الظُّهْرِاَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
            latin: "Ushalli fardhodl dhuhri arba'a raka'aatim mustaqbilal qiblati adaa-an lillaahi ta'aala",
            terjemahan: "Aku berniat shalat fardhu Dzuhur empat raka'at menghadap kiblat karena Allah Ta'ala."
        };

        let responseText = `*━━━ • Niat Shalat Dzuhur • ━━━*\n\n`;
        responseText += `*Nama Niat:*\n${niatDzuhur.name}\n\n`;
        responseText += `*Arab:*\n${niatDzuhur.arabic}\n\n`;
        responseText += `*Latin:*\n${niatDzuhur.latin}\n\n`;
        responseText += `*Terjemahan:*\n${niatDzuhur.terjemahan}`;

        await conn.reply(m.chat, responseText, m);

    } catch (e) {
        console.error(e);
        await m.reply('Maaf, terjadi kesalahan saat memproses permintaan Anda.');
    }
}

handler.help = ['niatdzuhur'];
handler.tags = ['islamic'];
handler.command = /^(niatdzuhur)$/i;
handler.group = true;

module.exports = handler;