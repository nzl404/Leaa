let handler = async (m, { conn }) => {
    let readMore = String.fromCharCode(8206).repeat(4000); // Invisible long text untuk "Baca Selengkapnya"

    let rules = `*Tutorial Penggunaan Bot:*

1. Semua fitur bot menggunakan prefix, yaitu harus menggunakan titik (.) di awal perintah agar perintahnya aktif.
   _Contoh:_ *Ketik .menu all*
${readMore}
2. Jika kamu ingin bermain game, lihat di *List Game*. Kamu bisa menemukan fitur seperti *Family100* yang mengharuskan menjawab semua pertanyaan.
   _Contoh:_ *Ketik .family100*

3. Jika ingin mencari sesuatu, lihat di *List Menu Internet*. Kamu bisa menemukan fitur seperti *GSM Arena*.
   _Contoh:_ *Ketik .gsmarena Poco X7 Pro*

4. Jika ingin mendownload video, reels FB/IG, story IG, dan lainnya, lihat di *List Menu Download*.
   _Contoh:_ *Ketik .instagram https://www.instagram.com/reel/CtJzdShop6d/?igshid=MzRlODBiNWFlZA==*

5. Jika ingin mengubah atau menggunakan fitur yang berhubungan dengan media seperti audio, foto, dan video, balas chatnya dan ketik perintahnya.
   _Contoh:_ *Balas VN lalu ketik .tomp3*

6. Jika kehabisan limit, kamu bisa membelinya dengan *Ketik .beli limit 1*. Tidak punya koin? Mainkan game di *Menu Game*. Jika menang, kamu akan mendapatkan *EXP, koin, dan limit*.

*_Note: Jika masih tidak mengerti, hubungi Owner dengan .owner_*`;

    await conn.relayMessage(m.chat, {
        extendedTextMessage: {
            text: rules,
            contextInfo: {
                externalAdReply: {
                    title: "Panduan Penggunaan Bot",
                    mediaType: 1,
                    previewType: 0,
                    renderLargerThumbnail: true, // Thumbnail besar horizontal
                    thumbnailUrl: "https://wallpapercave.com/wp/wp6571854.jpg" // Ganti dengan URL gambar horizontal 16:9
                }
            }
        }
    }, { quoted: m });
};

handler.help = ['tutorial'];
handler.tags = ['info'];
handler.command = /^(tutorial)$/i;

module.exports = handler;