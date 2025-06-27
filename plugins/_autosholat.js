const axios = require('axios');

// Inisialisasi cache di luar scope fungsi agar tidak hilang
// Strukturnya akan: { tanggal: 'YYYY-MM-DD', data: [...] }
let jadwalCache = {};

module.exports = {
    before: async function (m) {
        // Jangan jalankan fungsi jika pesan berasal dari bot itu sendiri
        if (m.isBaileys) return;

        // Inisialisasi state anti-spam per chat
        this.autosholat = this.autosholat || {};
        const id = m.chat;
        
        // Jika notifikasi sedang aktif di chat ini, hentikan proses.
        if (id in this.autosholat) {
            return;
        }

        try {
            const date = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
            
            // !! BATASAN TAHUN DIHAPUS !!
            // Kode akan mencoba mengambil jadwal untuk tahun berapapun.

            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const todayString = `${year}-${month}-${day}`;

            // --- Peningkatan: Logika Caching ---
            // Cek apakah cache sudah ada dan apakah tanggalnya masih sama dengan hari ini.
            if (!jadwalCache.data || jadwalCache.tanggal !== todayString) {
                console.log(`[🔄] Mencari jadwal sholat baru untuk tanggal ${todayString}...`);
                const url = `https://raw.githubusercontent.com/lakuapik/jadwalsholatorg/master/adzan/surabaya/${year}/${month}.json`;
                
                try {
                    const response = await axios.get(url);
                    // Simpan data dan tanggal ke cache
                    jadwalCache = {
                        tanggal: todayString,
                        data: response.data
                    };
                    console.log(`[✅] Jadwal sholat untuk bulan ${month}/${year} berhasil dimuat.`);
                } catch (e) {
                    console.error(`[❌] Gagal mengambil data dari URL: ${url}. Mungkin jadwal untuk bulan/tahun tersebut belum tersedia.`);
                    // Hentikan eksekusi jika gagal mengambil data
                    return;
                }
            }

            // Gunakan data dari cache
            const jadwalBulanan = jadwalCache.data;
            if (!jadwalBulanan || !Array.isArray(jadwalBulanan)) {
                return;
            }

            const jadwalHariIni = jadwalBulanan.find((d) => d.tanggal === todayString);

            if (!jadwalHariIni) {
                return; // Tidak ada jadwal untuk hari ini, lewati.
            }

            const prayerTimes = [
                { name: 'Subuh', time: jadwalHariIni.shubuh },
                { name: 'Dzuhur', time: jadwalHariIni.dzuhur },
                { name: 'Ashar', time: jadwalHariIni.ashr },
                { name: 'Maghrib', time: jadwalHariIni.magrib },
                { name: 'Isya', time: jadwalHariIni.isya }
            ];

            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");
            const timeNow = `${hours}:${minutes}`;

            for (const prayer of prayerTimes) {
                if (timeNow === prayer.time) {
                    const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? this.user.jid : m.sender;
                    const caption = `🕌 Waktu Sholat untuk *Surabaya* 🕌\n\nHai kak @${who.split`@`[0]},\nWaktu *${prayer.name}* telah tiba. Mari sejenak tinggalkan aktivitas dunia, ambil air wudhu dan dirikan shalat.\n\n*${prayer.time} WIB*\n_untuk wilayah Surabaya dan sekitarnya._`;
                    
                    // Kirim notifikasi dan set timeout untuk anti-spam
                    this.autosholat[id] = [
                        this.sendMessage(m.chat, {
                            text: caption,
                            mentions: [who]
                        }),
                        setTimeout(() => {
                            // Hapus lock setelah 59 detik agar bisa mengirim notifikasi sholat berikutnya
                            delete this.autosholat[id];
                        }, 59000)
                    ];
                    break; // Keluar dari loop setelah menemukan waktu sholat yang cocok
                }
            }

        } catch (error) {
            console.error(`[❗] Terjadi kesalahan pada fungsi auto sholat: ${error.message}`);
        }
    },
    disabled: false
};