global.owner = ['6282139311790'];
global.mods = ['6282139311790'];
global.prems = ['6282139311790'];
global.nameowner = 'Firdaus';
global.numberowner = '6282139311790';
global.mail = 'seirajloy48@gmail.com';
global.gc = 'https://chat.whatsapp.com/CfvA2XeXOh60LGtlsfXEz3';
global.instagram = 'https://instagram.com/firdauss4_';
global.wm = '© Marshaaa';
global.wait = '_*Tunggu sedang di proses...*_';
global.eror = '_*Server Error*_';
global.stiker_wait = '*⫹⫺ Stiker sedang dibuat...*';
global.packname = 'Created by Bot';
global.author = '© Shaa ft. fxxdxxs';
global.maxwarn = '2'; // Peringatan maksimum
global.antiporn = false; // Auto delete pesan porno (bot harus admin)
global.spam = true;
global.gcspam = false;

//INI WAJIB DI ISI!//
global.lann = 'YOUR_APIKEY_HERE' 
//Daftar terlebih dahulu https://api.betabotz.eu.org

//INI OPTIONAL BOLEH DI ISI BOLEH JUGA ENGGA//
global.btc = 'YOUR_APIKEY_HERE'
//Daftar https://api.botcahx.eu.org 

global.APIs = {   
  lann: 'https://api.betabotz.eu.org',
  btc: 'https://api.botcahx.eu.org'
}
global.APIKeys = { 
  'https://api.betabotz.eu.org': global.lann, 
  'https://api.botcahx.eu.org': global.btc //OPSIONAL
}

let fs = require('fs')
let chalk = require('chalk')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  delete require.cache[file]
  require(file)
})
