let fetch = require('node-fetch');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const args = text.split(' ');
    if (!text || args.length < 2) {
        throw `Perintah ini membutuhkan nomor surah DAN nomor ayat.\n\nContoh: *${usedPrefix + command} 2 255*`;
    }

    try {
        const noSurah = parseInt(args[0]);
        const noAyat = parseInt(args[1]);

        if (isNaN(noSurah) || noSurah < 1 || noSurah > 114) {
            throw `Nomor surah tidak valid. Harap masukkan nomor antara 1 dan 114.`;
        }
        if (isNaN(noAyat) || noAyat < 1) {
            throw `Nomor ayat tidak valid. Harap masukkan nomor yang benar.`;
        }

        await conn.sendMessage(m.chat, {
            react: {
                text: "⏳",
                key: m.key
            }
        });
        
        const res = await fetch(`https://api.betabotz.eu.org/api/muslim/surah?no=${noSurah}&apikey=${lann}`);
        if (!res.ok) throw `Gagal mengambil data dari API. Status: ${res.status}`;
        
        const json = await res.json();
        if (!json.status || !json.result || json.result.length === 0) {
            throw `Tidak dapat menemukan data untuk Surah nomor ${noSurah}.`;
        }
        
        const verses = json.result;

        if (noAyat > verses.length) {
            throw `Nomor ayat melebihi jumlah ayat di surah ini. Surah ${noSurah} hanya memiliki ${verses.length} ayat.`;
        }
        
        const verse = verses[noAyat - 1];
        let responseText = `*━━ • Surah No. ${noSurah} Ayat ${noAyat} • ━━*\n\n`;
        responseText += `${verse.arab}\n\n`;
        responseText += `*Latin:*\n${verse.latin}\n\n`;
        responseText += `*Terjemahan:*\n${verse.rumi}`;

        await conn.reply(m.chat, responseText, m);

    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        throw `Terjadi kesalahan:\n${errorMessage}`;
    }
}

handler.help = ['surah <no surah> <no ayat>'];
handler.tags = ['islamic'];
handler.command = /^(surah)$/i;
handler.group = true;

module.exports = handler;