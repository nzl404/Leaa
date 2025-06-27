const axios = require('axios');

let handler = async (m, { text, usedPrefix, command }) => {
    try {
        // PERUBAHAN: Memeriksa apakah pengguna memasukkan nama kota
        if (!text) {
            // Jika tidak ada, kirim pesan cara penggunaan dan hentikan eksekusi
            return m.reply(`Untuk mengetahui cuaca, gunakan format:\n*${usedPrefix + command} <nama kota>*\n\nContoh:\n*${usedPrefix + command} Jakarta*`);
        }
        
        // Kode di bawah ini hanya akan berjalan jika 'text' (nama kota) ada
        const city = text;
        
        await m.reply(`Mencari informasi cuaca untuk *${city}*...`);

        // Panggil API dengan kota yang sudah di-encode
        const { data } = await axios.get(`https://api.nekorinn.my.id/info/weather?city=${encodeURIComponent(city)}`);

        // Validasi respons API
        if (!data.status || !data.result?.location) {
            throw new Error(data.message || `Kota "${city}" tidak ditemukan.`);
        }

        const { location, current } = data.result;
        
        // Format pesan output yang detail dan rapi
        let responseText = `*🌤️ Cuaca di ${location.name}, ${location.country}*\n`;
        responseText += `-----------------------------------\n`;
        responseText += `*Kondisi:* ${current.condition.text}\n`;
        responseText += `*Suhu:* ${current.temp_c}°C\n`;
        responseText += `*Terasa Seperti:* ${current.feelslike_c}°C\n`;
        responseText += `*Kelembapan:* ${current.humidity}%\n`;
        responseText += `*Angin:* ${current.wind_kph} km/j dari ${current.wind_dir}\n`;
        responseText += `*Tekanan Udara:* ${current.pressure_mb} mb\n`;
        responseText += `*Jarak Pandang:* ${current.vis_km} km\n`;
        responseText += `-----------------------------------\n`;
        responseText += `🕒 Terakhir diperbarui pada *${current.last_updated}*`;

        // Kirim pesan sebagai teks murni
        await m.reply(responseText);

    } catch (e) {
        console.error(e);
        m.reply(`Terjadi kesalahan: ${e.message}`);
    }
};

handler.help = ['cuaca [kota]'];
handler.tags = ['internet'];
handler.command = /^(cuaca|weather)$/i;
handler.limit = false;

module.exports = handler;