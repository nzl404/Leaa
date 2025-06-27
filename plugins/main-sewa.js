const axios = require('axios');

let handler = async (m) => {
  let message = `Hello 👋
You can purchase premium packages or rent the bot for your group:

┌〔 Premium Packages 〕
├ 10k = Premium 10 Days
├ 20k = Premium 20 Days
├ 30k = Premium 30 Days
├ 40k = Premium 40 Days
├ 50k = Premium 50 Days
├ 60k = Premium 60 Days
└────
  
┌〔 Group Packages 〕
├ 15k = Rent 1 Month
├ 35k = Rent 3 Months
└ 85k = Rent 9 Months
────

To proceed with the payment, please type *.payment*

Thank you! 🙏`;
  
  await conn.sendMessage(m.chat, { text: message }, { quoted: m });
};

handler.help = ['sewa'];
handler.command = ['sewa', 'buybot'];
handler.tags = ['main'];

module.exports = handler;