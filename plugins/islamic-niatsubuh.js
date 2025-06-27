let handler = async (m, { conn }) => {
    try {
        const niatSubuh = {
            name: "Niat Shalat Subuh",
            arabic: "اُصَلِّى فَرْضَ الصُّبْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
            latin: "Ushalli fardhosh shubhi rok'ataini mustaqbilal qiblati adaa-an lillaahi ta'aala",
            terjemahan: "Aku berniat shalat fardhu Shubuh dua raka'at menghadap kiblat karena Allah Ta'ala."
        };

        let responseText = `*━━━ • Niat Shalat Subuh • ━━━*\n\n`;
        responseText += `*Nama Niat:*\n${niatSubuh.name}\n\n`;
        responseText += `*Arab:*\n${niatSubuh.arabic}\n\n`;
        responseText += `*Latin:*\n${niatSubuh.latin}\n\n`;
        responseText += `*Terjemahan:*\n${niatSubuh.terjemahan}`;

        await conn.reply(m.chat, responseText, m);

    } catch (e) {
        console.error(e);
        await m.reply('Maaf, terjadi kesalahan saat memproses permintaan Anda.');
    }
}

handler.help = ['niatshubuh'];
handler.tags = ['islamic'];
handler.command = /^(niatshubuh)$/i;
handler.group = true;

module.exports = handler;