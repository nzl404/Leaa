const fetch = require('node-fetch');

let handler = async (m, { text, usedPrefix, command }) => {
    // PERUBAHAN: Pesan instruksi diperbarui dengan nama perintah baru
    if (!text) throw `Perintah ini membutuhkan nama kota.\n\n*Contoh Penggunaan:*\n*${usedPrefix}accuaca Surabaya*\n\n*Perintah yang Tersedia:*\n- accuaca\n- accprakiraan\n- accangin\n- acckualitasudara\n- accinfohujan\n- accinfomatahari`;

    try {
        await m.reply(`⏳ Mengambil data lengkap dari AccuWeather untuk *${text}*...`);

        const apiUrl = `https://api.nekorinn.my.id/info/accuweather?city=${encodeURIComponent(text)}`;
        let res = await fetch(apiUrl);
        if (!res.ok) throw `Gagal terhubung ke layanan cuaca (Status: ${res.status})`;

        let json = await res.json();
        if (!json.status || !json.result || !json.result.forecastData || json.result.forecastData.DailyForecasts.length === 0) {
            throw 'Lokasi tidak ditemukan atau data tidak tersedia.';
        }

        const location = json.result.location;
        const allForecasts = json.result.forecastData.DailyForecasts;
        const today = allForecasts[0];
        let output = '';

        // PERUBAHAN: Logika switch case disesuaikan dengan nama perintah baru
        switch (command.toLowerCase()) {
            case 'accuaca':
            case 'accweather': // Menambahkan alias bahasa Inggris
                output = `*Cuaca Hari Ini (AccuWeather) - ${location.name}, ${location.country}*

📅 *Tanggal:* ${new Date(today.Date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
🌡️ *Suhu:* ${today.Temperature.Min.Value}°C s/d ${today.Temperature.Max.Value}°C

*☀️ Siang:*
  - *Kondisi:* ${today.Day.IconPhrase}
  - *Angin:* ${today.Day.Wind.Speed.Value} km/j (${today.Day.Wind.Direction.Localized})

*🌙 Malam:*
  - *Kondisi:* ${today.Night.IconPhrase}
  - *Angin:* ${today.Night.Wind.Speed.Value} km/j (${today.Night.Wind.Direction.Localized})

Untuk detail lain, gunakan perintah:
- *${usedPrefix}accprakiraan ${text}*
- *${usedPrefix}accangin ${text}*
- *${usedPrefix}acckualitasudara ${text}*
- *${usedPrefix}accinfohujan ${text}*
- *${usedPrefix}accinfomatahari ${text}*`;
                break;

            case 'accprakiraan':
            case 'accforecast':
                output = `*Prakiraan Cuaca 5 Hari - ${location.name}*\n\n`;
                output += allForecasts.slice(0, 5).map(day => {
                    return `*🗓️ ${new Date(day.Date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}*
  - *Cuaca:* ${day.Day.IconPhrase}
  - *Suhu:* ${day.Temperature.Min.Value}°C - ${day.Temperature.Max.Value}°C
  - *Hujan:* ${day.Day.PrecipitationProbability}%`;
                }).join('\n\n');
                break;

            case 'accangin':
                output = `*🌬️ Detail Angin - ${location.name}*\n\n`;
                output += `*☀️ Siang Hari:*\n  - *Kecepatan:* ${today.Day.Wind.Speed.Value} km/j\n  - *Arah:* ${today.Day.Wind.Direction.Localized}\n\n`;
                output += `*🌙 Malam Hari:*\n  - *Kecepatan:* ${today.Night.Wind.Speed.Value} km/j\n  - *Arah:* ${today.Night.Wind.Direction.Localized}`;
                break;

            case 'acckualitasudara':
            case 'accaqi':
                const air = today.AirAndPollen;
                output = `*🍃 Kualitas Udara & Polen - ${location.name}*\n\n`;
                output += `*Kualitas Udara:* ${air.find(p => p.Name === 'AirQuality').Category} (${air.find(p => p.Name === 'AirQuality').Value})\n\n`;
                output += `*Tingkat Polen:*\n`;
                output += `  - Rumput: ${air.find(p => p.Name === 'Grass').Category} (${air.find(p => p.Name === 'Grass').Value})\n`;
                output += `  - Jamur: ${air.find(p => p.Name === 'Mold').Category} (${air.find(p => p.Name === 'Mold').Value})\n`;
                output += `  - Ragweed: ${air.find(p => p.Name === 'Ragweed').Category} (${air.find(p => p.Name === 'Ragweed').Value})\n`;
                output += `  - Pohon: ${air.find(p => p.Name === 'Tree').Category} (${air.find(p => p.Name === 'Tree').Value})`;
                break;

            case 'accinfohujan':
                output = `*💧 Info Hujan & Badai - ${location.name}*\n\n`;
                output += `*☀️ Siang Hari:*\n  - *Peluang Hujan:* ${today.Day.PrecipitationProbability}% ${today.Day.HasPrecipitation ? `(${today.Day.PrecipitationType})` : ''}\n  - *Peluang Badai Petir:* ${today.Day.ThunderstormProbability}%\n\n`;
                output += `*🌙 Malam Hari:*\n  - *Peluang Hujan:* ${today.Night.PrecipitationProbability}% ${today.Night.HasPrecipitation ? `(${today.Night.PrecipitationType})` : ''}\n  - *Peluang Badai Petir:* ${today.Night.ThunderstormProbability}%`;
                break;
            
            case 'accinfomatahari':
                output = `*☀️ Info Matahari & UV - ${location.name}*\n\n`;
                output += `*Lama Matahari Bersinar:* ${today.HoursOfSun} jam\n`;
                output += `*Indeks UV Maksimum:* ${air.find(p => p.Name === 'UVIndex').Value} (${air.find(p => p.Name === 'UVIndex').Category})`;
                break;

            default:
                throw 'Perintah tidak dikenali. Gunakan `accuaca`, `accprakiraan`, dll.';
        }
        
        m.reply(output);

    } catch (error) {
        console.error(error);
        m.reply(`Terjadi error: ${error.message || error || 'Gagal mengambil data, pastikan nama kota benar dan coba lagi.'}`);
    }
};

// PERUBAHAN: Semua perintah diberi prefix 'acc'
handler.help = ['accuaca', 'accprakiraan', 'accangin', 'acckualitasudara', 'accinfohujan', 'accinfomatahari'].map(v => v + ' <kota>');
handler.tags = ['internet'];
handler.command = /^(accuaca|accweather|accforecast|accprakiraan|accangin|acckualitasudara|accaqi|accinfohujan|accinfomatahari)$/i;
handler.limit = false;

module.exports = handler;