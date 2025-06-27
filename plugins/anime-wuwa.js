const axios = require("axios");

// Helper function untuk jeda
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Daftar karakter
    const charaList = [
      "Calcharo", "Encore", "Jianxin", "Jiyan", "Lingyang",
      "Rover", "Verina", "Yinlin", "Aalto", "Baizhi",
      "Chixia", "Danjin", "Mortefi", "Sanhua", "Taoqi",
      "Yangyang", "Yuanwu",
    ];

    // Helper function untuk membuat huruf pertama kapital
    const capitalize = (txt) => {
      if (!txt) return '';
      return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
    };
    
    const charaName = capitalize(text);
    const exampleText = `*• Contoh :* ${usedPrefix + command} *Jiyan*\n\n*Karakter yang Tersedia:*\n${charaList.map((a) => "• " + a).join("\n")}`;

    if (!text || !charaList.includes(charaName)) {
        return m.reply(exampleText);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        // 1. Ambil data utama karakter
        const charaData = (await axios(`https://api.resonance.rest/characters/${charaName}`)).data;

        // 2. Ambil daftar nama senjata berdasarkan tipe senjata karakter
        const weaponListResponse = await axios(`https://api.resonance.rest/weapons/${charaData.weapon}`);
        const weaponNames = weaponListResponse.data.weapons;

        // 3. Ambil detail setiap senjata secara BERURUTAN untuk menghindari rate-limit
        let weaponDetails = [];
        console.log(`Mengambil detail untuk ${weaponNames.length} senjata tipe ${charaData.weapon}...`);
        for (const weaponName of weaponNames) {
            try {
                const weaponData = (await axios(`https://api.resonance.rest/weapons/${charaData.weapon}/${weaponName}`)).data;
                weaponDetails.push(weaponData);
                await sleep(100); // Jeda 100ms antar request
            } catch (e) {
                console.error(`Gagal mengambil detail senjata: ${weaponName}`, e);
            }
        }

        // 4. Format informasi senjata
        const weaponInfoText = weaponDetails
            .filter(w => typeof w.name === "string")
            .map(w => `
*• Nama:* ${w.name}
*• Tipe:* ${w.type}
*• Rarity:* ${"⭐".repeat(w.rarity)}
${w.stats.atk ? `*• Info Stats:*
  - ATK: ${w.stats.atk}
  - Substat: ${w.stats.substat.name || 'N/A'} [${w.stats.substat.value || 'N/A'}]` : ''}
${w.skill.name ? `*• Info Skill:*
  - Nama: ${w.skill.name || 'N/A'}
  - Deskripsi: ${w.skill.description || 'N/A'}` : ''}
`).join("\n\n");

        // 5. Gabungkan semua informasi menjadi satu caption
        const caption = `*[ WUTHERING WAVES - CHARACTER ]*

*• Nama:* ${charaData.name}
*• Quote:* _"${charaData.quote}"_
*• Atribut:* ${charaData.attribute}
*• Tipe Senjata:* ${charaData.weapon}
*• Rarity:* ${"⭐".repeat(charaData.rarity)}
*• Kelas:* ${charaData.class}
*• Tempat Lahir:* ${charaData.birthplace}
*• Ulang Tahun:* ${charaData.birthday}

*[ REKOMENDASI SENJATA - ${charaData.weapon.toUpperCase()} ]*
${weaponInfoText}`;

        // 6. Kirim pesan dengan gambar
        await conn.sendMessage(m.chat, {
            image: { url: `https://api.resonance.rest/characters/${charaName}/portrait` },
            caption: caption.trim(),
        }, { quoted: m });
        
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        await m.reply(`Terjadi kesalahan saat mengambil data untuk *${charaName}*. Mungkin API sedang down atau nama tidak valid.\n\n\`\`\`${error.message}\`\`\``);
    }
};

handler.help = ["wuthering", "wuwa"].map((a) => a + " [nama karakter]");
handler.tags = ["anime"];
handler.command = /^(wuthering|wuwa)$/i;
// Properti tambahan seperti owner, group, dll. bisa ditambahkan di sini jika perlu
// handler.owner = true;

module.exports = handler;