const jkt48Api = require('@jkt48/core');

const formatNewsContent = (htmlContent) => {
    if (!htmlContent) return '';
    let text = htmlContent;
    text = text.replace(/<br\s*\/?>/gi, '\n').replace(/<p[^>]*>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<li>/gi, '\n');
    text = text.replace(/<[^>]*>/g, '');
    text = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&ldquo;/g, '“')
        .replace(/&rdquo;/g, '”')
        .replace(/&lsquo;/g, '‘')
        .replace(/&rsquo;/g, '’')
        .replace(/&amp;/g, '&')
        .replace(/&middot;/g, '•')
        .replace(/&ndash;/g, '–')
        .replace(/&mdash;/g, '—')
        .replace(/\[email&#160;protected\]/g, 'info@jkt48.com');
    const paragraphs = text.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    return paragraphs.join('\n\n');
};

const extractImageFromContent = (content) => {
    if (!content) return null;
    const imgMatch = content.match(/<img[^>]+src=["'](.*?)["']/);
    return imgMatch ? (imgMatch[1].startsWith('http') ? imgMatch[1] : `https://www.jkt48.com${imgMatch[1]}`) : null;
};

let handler = async (m, { conn, args }) => {
  const API_KEY = 'JKTCONNECT';

  try {
    if (!args[0]) {
      const response = await jkt48Api.news(API_KEY);
      const newsList = response.news;

      if (!newsList || newsList.length === 0) {
        return conn.reply(m.chat, "Tidak ada berita yang ditemukan saat ini.", m);
      }

      let message = "📰 *Berita Terbaru JKT48*\n\n";
      newsList.slice(0, 10).forEach((item, index) => {
        message += `${index + 1}. ${item.title}\n`;
      });
      message += "\nKetik *.news [nomor]* untuk membaca berita selengkapnya.";
      
      return conn.reply(m.chat, message, m);
    } 
    
    else {
      const newsIndex = parseInt(args[0]) - 1;
      
      const response = await jkt48Api.news(API_KEY);
      const newsList = response.news;

      if (isNaN(newsIndex) || newsIndex < 0 || newsIndex >= newsList.length) {
        return conn.reply(m.chat, "Nomor berita tidak valid. Silakan cek daftar berita dengan mengetik *.news*.", m);
      }

      const selectedNews = newsList[newsIndex];
      const newsDetail = await jkt48Api.newsDetail(selectedNews.id, API_KEY);

      if (!newsDetail || !newsDetail.content) {
        return conn.reply(m.chat, "Gagal memuat detail berita.", m);
      }

      const formattedContent = formatNewsContent(newsDetail.content);
      const imageUrl = extractImageFromContent(newsDetail.content);

      const message = `📰 *${newsDetail.title}*\n\n${formattedContent}`;
      await conn.reply(m.chat, message, m);

      if (imageUrl) {
        await new Promise(resolve => setTimeout(resolve, 500)); 
        await conn.sendMessage(m.chat, { 
          image: { url: imageUrl }
        });
      }
    }
  } catch (err) {
    console.error("Error:", err);
    conn.reply(m.chat, "Terjadi kesalahan saat mengambil berita.", m);
  }
};

handler.help = ['news [nomor]'];
handler.tags = ['jkt48'];
handler.command = /^(news|jkt48news)$/i;

module.exports = handler;