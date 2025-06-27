let handler = async (m, { conn }) => {
    try {
        const niatIsya = {
            name: "Niat Shalat Isya",
            arabic: "اُصَلِّى فَرْضَ الْعِشَاءِ اَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
            latin: "Ushalli fardhol 'isyaa-i arba'a raka'aatim mustaqbilal qiblati adaa-an lillaahi ta'aala",
            terjemahan: "Aku berniat shalat fardhu Isya empat raka'at menghadap kiblat karena Allah Ta'ala."
        };

        let responseText = `*━━━ • Niat Shalat Isya • ━━━*\n\n`;
        responseText += `*Nama Niat:*\n${niatIsya.name}\n\n`;
        responseText += `*Arab:*\n${niatIsya.arabic}\n\n`;
        responseText += `*Latin:*\n${niatIsya.latin}\n\n`;
        responseText += `*Terjemahan:*\n${niatIsya.terjemahan}`;

        await conn.reply(m.chat, responseText, m);

    } catch (e) {
        console.error(e);
        await m.reply('Maaf, terjadi kesalahan saat memproses permintaan Anda.');
    }
}

handler.help = ['niatisya'];
handler.tags = ['islamic'];
handler.command = /^(niatisya)$/i;
handler.group = true;

module.exports = handler;