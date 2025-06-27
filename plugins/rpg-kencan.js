let handler = async (m, { conn, text }) => {
  const user = global.db.data.users[m.sender]
  const now = Date.now()
  const cooldown = 600000 // 10 menit

  const lastDate = user.lastdate || 0
  const remaining = cooldown - (now - lastDate)
  if (remaining > 0) {
    return conn.reply(m.chat, `⏳ Kamu harus menunggu *${clockString(remaining)}* sebelum kencan lagi.`, m)
  }

  if (!text || text.trim() === '') {
    const femaleList = getFemaleCharacters().map((char, i) => `${i + 1}. ${char}`).join('\n')
    const maleList = getMaleCharacters().map((char, i) => `${i + 1}. ${char}`).join('\n')
    const msg = `Gunakan format: *.kencan [wanita/pria] [nomor]*

🌸 *Karakter Wanita:*
${femaleList}

🔹 *Karakter Pria:*
${maleList}

Contoh:
.kencan wanita 3
.kencan pria 7`
    return conn.reply(m.chat, msg, m)
  }

  const args = text.trim().split(' ')
  const genderArg = args[0]?.toLowerCase()
  const charNumber = args[1]

  let gender = '', characters = []
  if (genderArg === 'wanita' || genderArg === 'w') {
    gender = 'wanita'
    characters = getFemaleCharacters()
  } else if (genderArg === 'pria' || genderArg === 'p') {
    gender = 'pria'
    characters = getMaleCharacters()
  } else {
    return conn.reply(m.chat, `Gunakan: *.kencan wanita [nomor]* atau *.kencan pria [nomor]*`, m)
  }

  if (!charNumber || !/^\d+$/.test(charNumber)) {
    return conn.reply(m.chat, `Masukkan nomor karakter valid. Contoh: *.kencan ${gender} 1*`, m)
  }

  const index = parseInt(charNumber) - 1
  if (index < 0 || index >= characters.length) {
    return conn.reply(m.chat, `Nomor karakter harus antara 1 dan ${characters.length}.`, m)
  }

  const character = characters[index]
  const { place, experience, steps } = generateDateScenario()
  const { endingText, rewardExp } = generateDateEnding()

  user.lastdate = now

  const intro = `Kamu sedang berkencan dengan *${character}*!\n📍 Tempat: *${place}*\n✨ Pengalaman: *${experience}*`
  let processMsg = await conn.reply(m.chat, intro, m)
  
  // Edit pesan proses dengan menambahkan setiap langkah kencan
  let currentSteps = intro + '\n\n'

  for (let i = 0; i < steps.length; i++) {
    await delay(4000) // Tunggu 4 detik
    currentSteps += steps[i] + '\n'
    await conn.sendMessage(m.chat, { 
      text: currentSteps, 
      edit: processMsg 
    })
  }

  user.exp += rewardExp
  await delay(2000) // Tunggu 2 detik sebelum mengirim hasil

  // Menghapus pesan proses
  await conn.sendMessage(m.chat, { delete: processMsg.key })

  const resultMsg = `~ Kencan telah selesai...

💑 *Informasi Kencan* 💑
👤 Nama Pasangan: ${character}
📍 Tempat Kencan: ${place}
🌟 Pengalaman: ${experience}
Ending:
${endingText}

✨ *+${rewardExp}* Exp`

  return conn.reply(m.chat, resultMsg, m)
}

handler.help = ['kencan']
handler.tags = ['rpg']
handler.command = /^kencan$/i
handler.register = true
handler.group = true
handler.rpg = true

module.exports = handler

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s]
    .filter(v => v > 0)
    .map((v, i) => i === 0 ? `${v} jam` : i === 1 ? `${v} menit` : `${v} detik`)
    .join(' ')
}

function getFemaleCharacters() {
  return [
    'Sakura', 'Asuna', 'Mikasa', 'Kagome', 'Saber',
    'Rei', 'Rem', 'Mio', 'Erza', 'Haruhi',
    'Lucy', 'Nami', 'Hinata', 'Rias', 'Rukia',
    'Inori', 'Zero Two', 'Nanami', 'Nezuko', 'Holo',
    'Miku Nakano', 'Kaguya Shinomiya', 'Mai Sakurajima', 'Violet Evergarden', 'Emilia',
    'Raphtalia', 'Aqua', 'Megumin', 'Tohru', 'Shiro',
    'Kurisu Makise', 'Ochaco Uraraka', 'Kallen Stadtfeld', 'Yukino Yukinoshita', 'Winry Rockbell',
    'Historia Reiss', 'Sasha Braus', 'Annie Leonhart', 'Yoruichi Shihouin', 'Orihime Inoue',
    'Misato Katsuragi', 'Asuka Langley', 'Mari Makinami', 'Yuno Gasai', 'Esdeath',
    'Akame', 'Mine', 'Leone', 'Shizuka Hiratsuka', 'Yui Yuigahama',
    'Misaki Ayuzawa', 'Taiga Aisaka', 'Chihaya Ayase', 'Hitagi Senjougahara', 'Touka Kirishima',
    'Rize Kamishiro', 'Hestia', 'Lala Satalin Deviluke', 'Nino Nakano', 'Itsuki Nakano',
    'Yotsuba Nakano', 'Ichika Nakano', 'Shinobu Kochou', 'Kanao Tsuyuri', 'Robin'
  ]
}

function getMaleCharacters() {
  return [
    'Kirito', 'Eren Yeager', 'Naruto Uzumaki', 'Sasuke Uchiha', 'Levi Ackerman',
    'Light Yagami', 'Lelouch Lamperouge', 'Ichigo Kurosaki', 'Luffy', 'Gojo Satoru',
    'Tanjiro Kamado', 'Kakashi Hatake', 'Guts', 'Spike Spiegel', 'L Lawliet',
    'Edward Elric', 'Shinji Ikari', 'Kazuto Kirigaya', 'Shoyo Hinata', 'Izuku Midoriya',
    'Katsuki Bakugo', 'Todoroki Shoto', 'Hisoka', 'Killua Zoldyck', 'Gon Freecss',
    'Itachi Uchiha', 'Zenitsu Agatsuma', 'Inosuke Hashibira', 'All Might', 'Aizen Sousuke',
    'Grimmjow Jaegerjaquez', 'Roy Mustang', 'Alphonse Elric', 'Hachiman Hikigaya', 'Yukihira Soma',
    'Yato', 'Usui Takumi', 'Rintarou Okabe', 'Armin Arlert', 'Jean Kirstein',
    'Reiner Braun', 'Bertholdt Hoover', 'Zeke Yeager', 'Erwin Smith', 'Hange Zoë',
    'Sanji', 'Zoro', 'Brook', 'Franky', 'Usopp',
    'Sakuta Azusagawa', 'Miyuki Shirogane', 'Yuu Ishigami', 'Jotaro Kujo', 'Joseph Joestar',
    'Giorno Giovanna', 'Dio Brando', 'Gintoki Sakata', 'Taiga Kagami', 'Ryuji Takasu',
    'Kazuma Satou', 'Subaru Natsuki', 'Shinya Kogami', 'Shigeo Kageyama', 'Yuuji Itadori'
  ]
}

function generateDateScenario() {
  const data = [
    {
      place: 'Observatorium Bintang',
      experiences: ['Melihat galaksi bareng', 'Minta make-a-wish saat lihat bintang jatuh'],
      steps: [
        '🔭 Kalian naik ke menara observatorium...',
        '🌌 Teleskop diarahkan ke gugusan bintang Orion...',
        '💫 Sebuah bintang jatuh melintas. Dia mengucap harapan pelan...',
        '❤️ Kamu dan dia tersenyum dalam keheningan malam...'
      ]
    },
    {
      place: 'Festival Lampion',
      experiences: ['Melepas lampion', 'Berjalan di antara lampu', 'Foto bareng di bawah langit malam'],
      steps: [
        '🎆 Lampion-lampion mulai naik ke langit malam...',
        '✨ Kalian menuliskan harapan dan melepasnya bersama...',
        '❤️ Lampionmu terbang bersamaan dengan miliknya...',
        '📸 Foto berdua di bawah cahaya hangat festival...'
      ]
    },
    {
      place: 'Rooftop City Light',
      experiences: ['Ngobrol di atas gedung', 'Ngemil bekal bareng', 'Nonton kota dari atas'],
      steps: [
        '🌃 Angin malam berhembus lembut...',
        '🪟 Kalian duduk di tepi rooftop melihat lampu kota...',
        '🍱 Dia buka bekal yang dia bawa sendiri...',
        '❤️ Kalian ngobrol soal hal random sampai lupa waktu...'
      ]
    },
    {
      place: 'Studio Musik',
      experiences: ['Main lagu bareng', 'Kamu nyanyi, dia iringi gitar', 'Ketawa karena suara fals'],
      steps: [
        '🎸 Kamu duduk dan mulai petik gitar...',
        '🎶 Dia nyanyi pelan dengan suara merdu...',
        '🎤 Kamu ikut nyanyi tapi malah fals, dia ketawa...',
        '❤️ Akhirnya kalian bikin lagu kecil bersama...'
      ]
    },
    {
      place: 'Wahana Bianglala',
      experiences: ['Naik bianglala tinggi', 'Deg-degan di atas', 'Ngobrol pelan dalam diam'],
      steps: [
        '🎡 Kalian naik ke dalam kabin yang mulai bergerak...',
        '🌆 Pemandangan kota dari atas terlihat menakjubkan...',
        '🤝 Dia memegang tanganmu diam-diam...',
        '❤️ Hanya keheningan yang terasa hangat...'
      ]
    },
    {
      place: 'Pantai Pasir Hitam',
      experiences: ['Jalan di pasir', 'Main air', 'Sunset romantis'],
      steps: [
        '🌊 Ombak lembut menyapu kaki kalian...',
        '✍️ Kalian menulis nama di pasir...',
        '💦 Dia cipratin air ke kamu sambil tertawa...',
        '❤️ Duduk diam menatap langit jingga bareng...'
      ]
    },
    {
      place: 'Taman Sakura',
      experiences: ['Piknik bareng', 'Kelopak jatuh di rambut', 'Tidur di bawah pohon'],
      steps: [
        '🌸 Angin menerbangkan kelopak sakura...',
        '🍱 Kalian piknik dengan bekal sederhana...',
        '🌺 Satu kelopak jatuh di rambutnya, kamu betulkan pelan...',
        '❤️ Dia tersenyum malu sambil balas tatapanmu...'
      ]
    },
    {
      place: 'Kafe Vintage',
      experiences: ['Ngopi santai', 'Ngobrol berat', 'Main boardgame'],
      steps: [
        '☕ Kalian duduk di sofa dekat jendela tua...',
        '🎶 Musik jazz mengalun dari speaker lawas...',
        '♟️ Main catur kecil, dan kamu kalah telak...',
        '❤️ "Kamu lucu banget waktu serius," katanya...'
      ]
    },
    {
      place: 'Hujan di Halte',
      experiences: ['Neduh bareng', 'Kasih jaket', 'Ngobrol dalam hujan'],
      steps: [
        '🌧️ Hujan deras bikin kalian lari ke halte...',
        '🧥 Kamu buka jaket dan menawarkannya ke dia...',
        '☔ Kalian duduk diam mendengarkan hujan turun...',
        '❤️ "Aku suka momen kayak gini," bisiknya pelan...'
      ]
    },
    {
      place: 'Pasar Tradisional',
      experiences: ['Jajan kaki lima', 'Main bareng bocah', 'Tawar-menawar'],
      steps: [
        '🍢 Bau sate dan gorengan menyeruak...',
        '🎯 Kalian main lempar cincin buat dapet boneka...',
        '🎈 Bocah kecil ngajak main dan dia ikut senang...',
        '❤️ Pulang bawa plastik isi makanan dan tawa...'
      ]
    },
    {
      place: 'Museum Kota Tua',
      experiences: ['Lihat lukisan', 'Bahas sejarah', 'Selfie lucu'],
      steps: [
        '🖼️ Kalian berdiri lama di depan lukisan lama...',
        '📚 Dia ngarang cerita soal lukisan itu sambil ketawa...',
        '📸 Selfie bareng patung dengan gaya aneh...',
        '❤️ "Aku seneng banget main ke tempat beginian bareng kamu..."'
      ]
    },
    {
      place: 'Danau Tenang',
      experiences: ['Naik perahu', 'Kasih makan ikan', 'Diam nyaman'],
      steps: [
        '🛶 Perahu kayu mengayuh pelan ke tengah danau...',
        '🐟 Kalian lempar remah roti ke air...',
        '🌿 Angin lembut membawa suara burung jauh...',
        '❤️ Kalian duduk tanpa bicara, tapi terasa hangat...'
      ]
    },
    {
      place: 'Glamping di Pegunungan',
      experiences: ['Api unggun', 'Cerita masa kecil', 'Lihat bintang'],
      steps: [
        '🔥 Api unggun memancarkan cahaya oranye lembut...',
        '🍫 Dia menawarkan coklat panas yang dibawanya...',
        '⭐ Langit malam penuh bintang bikin dia terpesona...',
        '❤️ Kamu duduk lebih dekat, dan dia nggak menolak...'
      ]
    },
    {
      place: 'Stasiun Malam',
      experiences: ['Duduk di bangku', 'Ngobrol soal hidup', 'Lihat kereta lewat'],
      steps: [
        '🚉 Suara roda kereta menghilang di kejauhan...',
        '🧳 Kalian duduk berdampingan di bangku besi...',
        '🌙 Dia cerita tentang mimpi kecilnya yang belum tercapai...',
        '❤️ "Aku senang kamu dengerin," katanya sambil senyum pelan...'
      ]
    },
    {
      place: 'Rumah Pohon Rahasia',
      experiences: ['Lihat ladang dari atas', 'Cerita rahasia', 'Makan snack bareng'],
      steps: [
        '🌳 Kalian naik anak tangga rumah pohon tua...',
        '🍂 Angin sore menggetarkan daun-daun sekitar...',
        '📝 Dia tunjuk nama yang tertulis di kayu tua: "Aku yang nulis ini waktu kecil."',
        '❤️ Kamu kasih snack, dia bilang, "Enaknya dibagi dua, ya?"'
      ]
    },
    {
      place: 'Lapangan Sepak Bola Kosong',
      experiences: ['Main bola bareng', 'Jatuh bareng', 'Ngobrol di rumput'],
      steps: [
        '⚽ Kalian saling tendang bola kecil ke arah gawang...',
        '🏃‍♀️ Kamu terpeleset, dia malah ketawa duluan...',
        '🌾 Kalian rebahan di rumput sambil lihat langit sore...',
        '❤️ "Makasih ya, hari ini aku ketawa beneran..."'
      ]
    },
    {
      place: 'Perpustakaan Kota',
      experiences: ['Cari buku bareng', 'Ngobrol bisik-bisik', 'Berbagi cerita favorit'],
      steps: [
        '📚 Jari-jari kalian menelusuri buku di rak tua...',
        '🤫 Dia bisikkan judul buku favoritnya sambil tersenyum...',
        '📖 Kalian duduk berdampingan membaca buku masing-masing...',
        '❤️ "Kencan di perpus itu underrated," katanya sambil tertawa pelan...'
      ]
    },
    {
      place: 'Kebun Bunga Mawar',
      experiences: ['Foto di antara bunga', 'Memetik satu mawar', 'Ngobrol soal arti bunga'],
      steps: [
        '🌹 Kalian berjalan di antara semak mawar merah dan putih...',
        '👃 Dia menunduk mencium aroma mawar dengan mata terpejam...',
        '📸 Kamu diam-diam mengambil foto saat dia tersenyum pada bunga...',
        '❤️ "Menurutmu, bunga ini cocok di mana?" tanyanya sambil memegang setangkai mawar...'
      ]
    },
    {
      place: 'Toko Vinyl Klasik',
      experiences: ['Dengerin musik jadul', 'Nostalgia', 'Joget kecil'],
      steps: [
        '🎵 Suara krasak-krusuk vinyl tua mengisi ruangan...',
        '🎧 Kalian berbagi earphone sambil mendengarkan lagu lama...',
        '💃 Dia bergoyang kecil mengikuti irama tanpa sadar...',
        '❤️ "Lagu ini mengingatkanku pada seseorang," katanya sambil memandangmu...'
      ]
    },
    {
      place: 'Puncak Bukit',
      experiences: ['Hiking bareng', 'Minum dari botol yang sama', 'Lihat kota dari atas'],
      steps: [
        '🥾 Napas kalian terengah setelah mendaki setengah jalan...',
        '🧗‍♀️ Dia ulurkan tangan membantumu di bagian yang curam...',
        '🌄 Akhirnya sampai di puncak, pemandangan kota terhampar...',
        '❤️ "Rasanya semua perjuangan tadi worth it," bisiknya sambil tersenyum puas...'
      ]
    }
  ]
  const pick = data[Math.floor(Math.random() * data.length)]
  const exp = pick.experiences[Math.floor(Math.random() * pick.experiences.length)]
  return { place: pick.place, experience: exp, steps: pick.steps }
}

function generateDateEnding() {
  const list = [
    { endingText: '💞 *Akhir Bahagia*: Kencan luar biasa! Kalian janjian ketemu lagi.', rewardExp: 3500 },
    { endingText: '💕 *Romantis Banget*: Bertukar nomor dan senyum manis.', rewardExp: 3000 },
    { endingText: '❤️ *Kencan Sempurna*: Kayak jodoh beneran!', rewardExp: 4000 },
    { endingText: '😊 *Pertemanan Baru*: Gagal cinlok, tapi dapet teman baru.', rewardExp: 1500 },
    { endingText: '🤔 *Canggung*: Beberapa momen aneh tapi tetap seru.', rewardExp: 1800 },
    { endingText: '🌈 *Ending Tak Terduga*: Ada hal lucu yang tak terduga!', rewardExp: 2000 },
    { endingText: '💘 *Cinta Pada Pandangan Pertama*: Kalian langsung klik dan serasa kenal lama!', rewardExp: 4500 },
    { endingText: '🎭 *Plot Twist*: Ternyata dia teman masa kecilmu yang hilang kontak!', rewardExp: 3800 },
    { endingText: '🌟 *Kenangan Abadi*: "Ini kencan terbaik yang pernah aku alami."', rewardExp: 4200 },
    { endingText: '🌧️ *Hujan Tiba-tiba*: Kencan berakhir dengan lari kehujanan dan ketawa bareng.', rewardExp: 2500 },
    { endingText: '📱 *Janji Virtual*: "Aku bakal video call kamu besok, ya?"', rewardExp: 2800 },
    { endingText: '🧸 *Hadiah Kecil*: Dia memberimu gantungan kunci sebagai kenang-kenangan.', rewardExp: 3200 },
    { endingText: '📝 *Puisi Dadakan*: Dia menuliskan puisi kecil di serbet sebagai kenang-kenangan.', rewardExp: 3600 },
    { endingText: '🍀 *Kebetulan Manis*: Kalian ternyata punya hobi yang sama!', rewardExp: 2700 },
    { endingText: '🎵 *Lagu Spesial*: "Lagu ini akan selalu mengingatkanku padamu."', rewardExp: 3300 },
    { endingText: '🤭 *Salah Tingkah*: Dia malu-malu minta foto bareng sebelum pulang.', rewardExp: 2600 },
    { endingText: '🥺 *Momen Emosional*: "Sudah lama tidak ada yang mendengarkanku seperti kamu."', rewardExp: 3900 },
    { endingText: '🌉 *Janji Di Jembatan*: "Ayo ketemu lagi di tempat yang sama minggu depan."', rewardExp: 3400 },
    { endingText: '📆 *Rencana Masa Depan*: Kalian udah ngerencanain kencan berikutnya!', rewardExp: 4100 },
    { endingText: '🌹 *Ciuman Pipi*: Dia mencium pipimu sebelum pulang!', rewardExp: 5000 }
  ]
  return list[Math.floor(Math.random() * list.length)]
}