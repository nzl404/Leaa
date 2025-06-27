let fetch = require('node-fetch');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        throw `Perintah ini digunakan untuk mencari tafsir berdasarkan kata kunci.\n\nContoh: *${usedPrefix + command} maryam*`;
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        const res = await fetch(`https://api.betabotz.eu.org/api/muslim/tafsirsurah?text=${encodeURIComponent(text)}&apikey=${lann}`);
        
        if (!res.ok) throw `Gagal mengambil data dari API Betabotz. Status: ${res.status}`;
        
        const json = await res.json();

        if (!json.status || !json.result || json.result.length === 0) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            throw `Tafsir untuk kata kunci "${text}" tidak ditemukan via API Betabotz.`;
        }
        
        const cleanResults = json.result.filter(item => item.tafsir && item.tafsir.trim() !== "");

        if (cleanResults.length === 0) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            throw `Tafsir untuk kata kunci "${text}" tidak ditemukan setelah memfilter hasil yang tidak valid dari API.`;
        }

        const randomTafsir = cleanResults[Math.floor(Math.random() * cleanResults.length)];
        
        let responseText = `*━━ • Tafsir Ditemukan • ━━*\n\n`;
        if (randomTafsir.surah) {
            responseText += `📖 *Surah & Ayat:*\n${randomTafsir.surah}\n\n`;
        }
        responseText += `📜 *Tafsir:*\n${randomTafsir.tafsir}\n\n`;
        if (randomTafsir.type) {
            responseText += `*Tipe:*\n${randomTafsir.type}\n\n`;
        }
        responseText += `*Sumber:*\n${randomTafsir.source}`;

        await conn.reply(m.chat, responseText, m);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        const errorMessage = e instanceof Error ? e.message : String(e);
        throw `Terjadi kesalahan:\n${errorMessage}`;
    }
}

handler.help = ['tafsir <kata kunci>'];
handler.tags = ['islamic'];
handler.command = /^(tafsir)$/i;
handler.group = true;

module.exports = handler;