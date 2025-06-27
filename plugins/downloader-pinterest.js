let handler = async (m, { conn, text, usedPrefix, command, args }) => {
  if (!args.length) return m.reply(`Contoh penggunaan: ${usedPrefix}${command} <query>`);

  let query = args.join(" ");

  // Kirim reaksi (Baileys kompatibel)
  await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

  try {
    let res = await fetch(`https://api.jkt48connect.my.id/api/pin?query=${encodeURIComponent(query)}&api_key=marshalena`);
    let json = await res.json();

    // Log response untuk debugging
    console.log("API Response:", json);

    // Pastikan response valid dan ada hasil
    if (!json || !Array.isArray(json) || json.length === 0) {
      return conn.sendMessage(m.chat, { text: "❌ Tidak ditemukan hasil untuk pencarian ini." }, { quoted: m });
    }

    let result = pickRandom(json); // Pilih hasil acak dari array

    // Pastikan `result.images_url` adalah URL yang valid
    if (!result.images_url.startsWith("http")) {
      return conn.sendMessage(m.chat, { text: "❌ Gagal mengambil gambar. Coba lagi nanti." }, { quoted: m });
    }

    await conn.sendMessage(m.chat, {
      image: { url: result.images_url },
      caption: `🔍 *Hasil Pencarian Pinterest*\n\n📌 *Pencarian:* ${query}\n🔗 *Sumber:* ${result.pin}\n🏷 *Judul:* ${result.grid_title || "Tidak ada judul"}`
    }, { quoted: m });

  } catch (e) {
    console.error("Pinterest API Error:", e);
    conn.sendMessage(m.chat, { text: `❌ Terjadi kesalahan saat mengambil gambar. Coba lagi nanti.` }, { quoted: m });
  }
};

handler.help = ['pinterest *<text>*'];
handler.tags = ['internet', 'downloader'];
handler.command = /^(pinterest|pin)$/i;
module.exports = handler;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}