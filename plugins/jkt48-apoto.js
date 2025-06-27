const fetch = require('node-fetch');

// Daftar member JKT48 per generasi (tidak ada perubahan)
const members = {
  gen3: ['Feni', 'Gracia'],
  gen6: ['Gita'],
  gen7: ['Christy', 'Eli', 'Freya', 'Jessi', 'Muthe', 'Olla'],
  gen8: ['Fiony', 'Flora', 'Lulu', 'Oniel'],
  gen9: ['Indah', 'Kathrina', 'Marsha'],
  gen10: ['Amanda', 'Lia', 'Ella', 'Indira', 'Lyn', 'Raisha'],
  gen11: ['Alya', 'Anindya', 'Cathy', 'Elin', 'Chelsea', 'Cynthia', 'Danella', 'Daisy', 'Gendis', 'Gracie', 'Greesel', 'Michie'],
  gen12: ['Aralie', 'Delynn', 'Lana', 'Erine', 'Fritzy', 'Lily', 'Trisha', 'Moreen', 'Levi', 'Nayla', 'Nachia', 'Oline', 'Regie', 'Ribka', 'Nala', 'Kimmy'],
  gen13: ['Virgi', 'Auwia', 'Rilly', 'Giaa', 'Maira', 'Ekin', 'Jemima', 'Mikaela', 'Intan']
};

// Fungsi utilitas (tidak ada perubahan)
const pickRandom = list => list[Math.floor(Math.random() * list.length)];
const getAllMembers = () => Object.values(members).flat();

// Handler utama (tidak ada perubahan)
let handler = async (m, { conn, command }) => {
  global.pinterestCache ??= new Map();

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

    const memberName = command.charAt(0).toUpperCase() + command.slice(1).toLowerCase();

    const allResults = await getJktPictures(`${memberName} JKT48`);

    if (allResults.length === 0) {
      throw new Error(`Tidak ada gambar ${memberName} ditemukan dari API.`);
    }
    
    let commandCache = global.pinterestCache.get(command) || [];
    const availableResults = allResults.filter(url => !commandCache.includes(url));

    if (availableResults.length === 0) {
        commandCache = [];
        global.pinterestCache.set(command, commandCache);
    }
    
    const finalResults = availableResults.length > 0 ? availableResults : allResults;
    const imageUrl = pickRandom(finalResults);
    
    const updatedCache = [...commandCache, imageUrl].slice(-50);
    global.pinterestCache.set(command, updatedCache);

    await conn.sendMessage(m.chat, { 
      image: { url: imageUrl }, 
      caption: `🌟 JKT48 • ${memberName}`
    }, { quoted: m });

  } catch (error) {
    console.error('Handler Error:', error);
    await conn.reply(m.chat, `❌ ${error.message || 'Gagal mencari gambar'}`, m);
  }
};


// =========================================================
// == FUNGSI API JKT48 CONNECT (VERSI PERBAIKAN) ==
// =========================================================
/**
 * Mengambil gambar dari API jkt48connect.
 * @param {string} query - Kata kunci pencarian, contoh: "Freya JKT48".
 * @returns {Promise<string[]>} - Sebuah promise yang berisi array URL gambar.
 */
async function getJktPictures(query) {
  const apiKey = "marshalena";
  const baseUrl = "https://api.jkt48connect.my.id/api/pin";
  
  const url = new URL(baseUrl);
  url.searchParams.set('query', query);
  url.searchParams.set('api_key', apiKey);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Gagal mengambil data dari API.' }));
      throw new Error(errorBody.message || `API Error dengan status: ${response.status}`);
    }

    const data = await response.json();

    // --- BAGIAN YANG DIPERBAIKI ---
    // Cek jika 'data' adalah sebuah array dan punya isi
    if (data && Array.isArray(data) && data.length > 0) {
      // Ubah array objek menjadi array URL gambar, dan filter jika ada yang kosong
      return data.map(item => item.images_url).filter(url => url);
    } else {
      console.warn("API tidak mengembalikan data gambar dalam format array yang diharapkan:", data);
      return [];
    }
    
  } catch (error) {
    console.error("API Fetch Error:", error);
    return []; 
  }
}


// Fungsi di bawah ini tidak lagi terpakai oleh getJktPictures, namun dibiarkan jika ada kegunaan lain
function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function getHighestQualityImage(images) {
  if (!images) return null;
  const qualityOrder = ['orig', '736x', '564x', '474x', '236x'];
  for (let quality of qualityOrder) {
    if (images[quality]?.url) return images[quality].url;
  }
  return null;
}

// Konfigurasi handler (tidak ada perubahan)
const commands = getAllMembers().map(member => member.toLowerCase());
handler.help = commands;
handler.tags = ['image', 'jkt48'];
handler.command = new RegExp(`^(${commands.join('|')})$`, 'i');

module.exports = handler;