const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scraper function yang lebih robust untuk mengambil jadwal TV.
 * - Tidak lagi menggunakan new Promise wrapper yang tidak perlu.
 * - Membaca elemen per kolom (<td>) bukan per baris, jadi lebih akurat.
 * - Mengembalikan data terstruktur untuk memudahkan formatting.
 * - Melemparkan error (throw) jika gagal, agar bisa ditangkap oleh handler.
 */
async function getAcaraNow() {
    try {
        const { data } = await axios.get('https://www.jadwaltv.net/channel/acara-tv-nasional-saat-ini', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const schedule = [];
        let currentChannel = null;

        $('table.table.table-bordered > tbody > tr').each((i, elem) => {
            const row = $(elem);
            
            // Cek apakah ini baris nama stasiun TV
            const channelCell = row.find('td[colspan="2"]');
            if (channelCell.length) {
                currentChannel = channelCell.find('strong').text().trim();
                schedule.push({
                    type: 'channel',
                    name: currentChannel
                });
            } else {
                // Ini adalah baris acara TV
                const time = row.find('td:nth-child(1)').text().trim();
                const event = row.find('td:nth-child(2)').text().trim();
                
                // Pastikan baris acara valid dan bukan header tabel
                if (time && event && time !== 'Jam' && event !== 'Acara') {
                    schedule.push({
                        type: 'event',
                        time: time,
                        name: event
                    });
                }
            }
        });
        
        if (schedule.length === 0) {
            throw new Error('Tidak ada jadwal yang ditemukan, mungkin struktur situs telah berubah.');
        }
        
        return schedule;
    } catch (err) {
        // Melemparkan error agar bisa ditangani di handler
        throw new Error(`Gagal mengambil atau memproses data jadwal TV: ${err.message}`);
    }
}


/**
 * Handler utama untuk command.
 * - Menggunakan reaksi emoji untuk feedback.
 * - Memformat data terstruktur menjadi output yang rapi.
 * - Menangani error dari scraper dengan baik.
 */
let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        const acara = await getAcaraNow();
        
        let responseText = "📺 *ACARA TV NASIONAL SAAT INI* 📺\n\n";
        
        acara.forEach(item => {
            if (item.type === 'channel') {
                // Format untuk nama stasiun TV
                responseText += `\n╭─「 *${item.name}* 」\n`;
            } else if (item.type === 'event') {
                // Format untuk setiap acara
                responseText += `│ 🕒 ${item.time} - ${item.name}\n`;
            }
        });

        await m.reply(responseText.trim());
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        await m.reply(`Maaf, terjadi kesalahan saat mengambil jadwal acara TV.\n\n*Pesan Error:*\n${e.message}`);
    }
}

handler.help = ["acaranow"];
handler.tags = ["internet"];
handler.command = ["acaranow", "jadwaltvnow"];
module.exports = handler;