// Handler utama (logika inti) diletakkan di bagian atas agar mudah dibaca.
let handler = async (m, { conn }) => {
    try {
        // Mengambil daftar wirid dari fungsi di bawah.
        const wiridList = getWiridData();
        
        // Memilih satu wirid secara acak dari daftar tersebut.
        const randomWirid = pickRandom(wiridList);

        // Format pesan balasan.
        let responseText = `*━━━ • Wirid & Dzikir • ━━━*\n\n`;
        responseText += `*📖 Bacaan:*\n${randomWirid.arabic}\n\n`;
        responseText += `*🔁 Dibaca:* ${randomWirid.times} kali\n`;

        // Tambahkan keterangan hanya jika ada.
        if (randomWirid.tnc && randomWirid.tnc.trim() !== "") {
            responseText += `*📝 Keterangan:* ${randomWirid.tnc}\n`;
        }
        
        responseText += `\n*Sumber:* Berbagai sumber shahih`;

        // Kirim balasan.
        await conn.reply(m.chat, responseText, m);

    } catch (e) {
        console.error(e);
        await m.reply('Maaf, terjadi kesalahan saat memproses permintaan Anda.');
    }
}

handler.help = ['wirid'];
handler.tags = ['islamic'];
handler.command = /^(wirid)$/i;

module.exports = handler;


// ——— BAGIAN DATA & FUNGSI PENUNJANG ———
// Diletakkan di bawah agar tidak mengganggu pembacaan logika utama.

/**
 * Fungsi untuk memilih item secara acak dari sebuah array.
 * @param {Array} list - Array yang akan dipilih itemnya.
 * @returns {*} Item yang dipilih secara acak.
 */
function pickRandom(list) {
    return list[Math.floor(list.length * Math.random())];
}

/**
 * Fungsi yang berisi dan mengembalikan daftar lengkap data wirid.
 * @returns {Array} Daftar objek wirid.
 */
function getWiridData() {
    return [
        {
            "id": 1, "times": 3, "arabic": "أَسْتَغْفِرُ اللهَ الْعَظِـيْمِ الَّذِيْ لَااِلَهَ اِلَّا هُوَ الْحَيُّ الْقَيُّوْمُ وَأَتُوْبُ إِلَيْهِ", "tnc": ""
        },
        {
            "id": 2, "times": 1, "arabic": "اَللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَاالْـجَلَالِ وَاْلإِكْرَام", "tnc": ""
        },
        {
            "id": 3, "times": 1, "arabic": "اَللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلاَ مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَاالْجَدِّ مِنْكَ الْجَدُّ", "tnc": ""
        },
        {
            "id": 4, "times": 1, "arabic": "اَللَّـهُمَّ اَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُсْنِ عِبَادَتِكَ", "tnc": ""
        },
        {
            "id": 5, "times": 3, "arabic": "لَاإِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِيْ وَيُمِيْتُ وَهُوَ عَلَى كُلِّ شَيْئٍ قَدِيْرٌ", "tnc": "(Dibaca tiga kali tiap selesai shalat fardhu, khusus setelah maghrib dan shubuh sepuluh kali)"
        },
        {
            "id": 6, "times": 7, "arabic": "اَللَّهُمَّ أَجِرْنِـى مِنَ النَّارِ", "tnc": "(Dibaca tujuh kali bakda maghrib dan shubuh)"
        },
        {
            "id": 7, "times": 1, "arabic": "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيْمِ. اَللهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَّلَانَوْمٌ، لَهُ مَافِي السَّمَاوَاتِ وَمَافِي اْلأَرْضِ مَن ذَا الَّذِيْ يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَابَيْنَ أَيْدِيْهِمْ وَمَاخَلْفَهُمْ وَلَا يُحِيْطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَآءَ، وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَاْلأَرْضَ وَلَا يَـؤدُهُ حِفْظُhُمَا وَهُوَ الْعَلِيُّ الْعَظِيْمُ", "tnc": "Ayat Kursi"
        },
        {
            "id": 8, "times": 1, "arabic": "آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ، كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ، وَقَالُوا سَمِعْنَا وَأَطَعْنَا غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ. لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا، لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ. رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا، رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا، رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ، وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا، أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ", "tnc": "Surat Al-Baqarah Ayat 285-286"
        },
        {
            "id": 9, "times": 1, "arabic": "شَهِدَ اللَّهُ أَنَّهُ لَا إِلَٰهَ إِلَّا هُوَ وَالْمَلَائِكَةُ وَأُولُو الْعِلْمِ قَائِمًا بِالْقِسْطِ، لَا إِلَٰهَ إِلَّا هُوَ الْعَزِيزُ الْحَكِيمُ، إِنَّ الدِّينَ عِنْدَ اللَّهِ الْإِسْلَامُ...", "tnc": "Surat Ali 'Imran Ayat 18-19 & 26-27"
        },
        {
            "id": 10, "times": 1, "arabic": "Membaca Surat al-Ikhlas, Surat al-Falaq, Surat an-Nas, lalu Surat al-Fatihah", "tnc": ""
        },
        {
            "id": 11, "times": 33, "arabic": "سُبْحَانَ اللهِ", "tnc": "Tasbih"
        },
        {
            "id": 12, "times": 33, "arabic": "اَلْحَمْدُلِلهِ", "tnc": "Tahmid"
        },
        {
            "id": 13, "times": 33, "arabic": "اَللهُ اَكْبَرْ", "tnc": "Takbir"
        },
        {
            "id": 14, "times": 1, "arabic": "اَللهُ اَكْبَرْ كَبِيْرًا وَالْحَمْدُ لِلهِ كَثِيْرًا وَسُبْحَانَ اللهِ بُكْرَةً وَأَصِيْلًا، لَاإِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيْكَ لَهُ...", "tnc": "Takbir penutup"
        },
        {
            "id": 15, "times": 1, "arabic": "أَفْضَلُ ذِكْرِ فَاعْلَمْ أَنَّهُ", "tnc": "Pengantar Tahlil"
        },
        {
            "id": 16, "times": 100, "arabic": "لَاإِلَهَ إِلَّا اللهُ", "tnc": "(Dibaca 300x bakda Subuh, 100x bakda Isya, 50x bakda Dhuhur, 50x bakda Ashar, dan 100x bakda Maghrib)"
        },
        {
            "id": 17, "times": 100, "arabic": "صَلَّى اللهُ عَلَى مُحَمَّدٍ", "tnc": "(Dibaca bakda Subuh 300 atau 100 kali)"
        },
        {
            "id": 18, "times": 1, "arabic": "لَاإِلَهَ إِلَّا اللهُ مُحَمَّدٌ رَسُوْلُ اللهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ", "tnc": "Kalimat Penutup"
        },
        // --- TAMBAHAN WIRID BARU ---
        {
            "id": 19, "times": 1, "arabic": "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", "tnc": "Sayyidul Istighfar (Raja Istighfar)"
        },
        {
            "id": 20, "times": 3, "arabic": "بِسْمِ اللهِ الَّذِي لا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلا فِي السَّمَاءِ وَهُوَ السَّمِيعُ العَلِيمُ", "tnc": "Dibaca 3x pagi dan petang untuk perlindungan dari segala bahaya."
        },
        {
            "id": 21, "times": 3, "arabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ", "tnc": "Dibaca 3x setelah shalat untuk meminta surga dan perlindungan dari neraka."
        },
        {
            "id": 22, "times": 1, "arabic": "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ. اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ", "tnc": "Shalawat Ibrahimiyah (dibaca saat tahiyat akhir)."
        }
    ];
}