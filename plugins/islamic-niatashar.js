let handler = async (m, { conn }) => {
    try {
        const niatAshar = {
            name: "Niat Shalat Ashar",
            arabic: "اُصَلِّى فَرْضَ الْعَصْرِاَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
            latin: "Ushalli fardhol 'ashri arba'a raka'aatim mustaqbilal qiblati adaa-an lillaahi ta'aala",
            terjemahan: "Aku berniat shalat fardhu 'Ashar empat raka'at menghadap kiblat karena Allah Ta'ala."
        };

        let responseText = `*━━━ • Niat Shalat Ashar • ━━━*\n\n`;
        responseText += `*Nama Niat:*\n${niatAshar.name}\n\n`;
        responseText += `*Arab:*\n${niatAshar.arabic}\n\n`;
        responseText += `*Latin:*\n${niatAshar.latin}\n\n`;
        responseText += `*Terjemahan:*\n${niatAshar.terjemahan}`;

        await conn.reply(m.chat, responseText, m);

    } catch (e) {
        console.error(e);
        await m.reply('Maaf, terjadi kesalahan saat memproses permintaan Anda.');
    }
}

handler.help = ['niatashar'];
handler.tags = ['islamic'];
handler.command = /^(niatashar)$/i;
handler.group = true;

module.exports = handler;