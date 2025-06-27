var fetch = require('node-fetch');

var handler = async (m, {
 text, 
 usedPrefix, 
 command
 }) => {
if (!text) throw `Masukkan pertanyaan!\n\n*Contoh:* Siapa Kamu? `
//Set Logic Disini 
let logic = 'Hai Saya Adalah Marsha, Bot Whatsapp Yang Dikembangkan Oleh Firdaus, Saya Bernama Marsha, Saya Dibuat Oleh Firdaus Dengan Penuh Kesempurnaan Yang Tiada Taraa,Jika Kamu Ingin Mencari Tau Lebih Dalam Tentang Ownerku Visit https://instagram.com/firdauss4_'
await m.reply(wait)
  var js = await fetch(`https://api.betabotz.eu.org/api/search/openai-logic?text=${text}&logic=${logic}&apikey=${lann}`)
var json = await js.json()
try {
  await m.reply(json.message)
} catch (err ) {
m.reply(`${eror}`)
}}
handler.command = /^(ai2|openai2|chatgpt2)$/i
handler.help = ['openai2'];
handler.tags = ['ai'];
handler.premium = false
module.exports = handler;
