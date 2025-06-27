let handler = async (m, { conn, args }) => {
  let target = m.mentionedJid[0] || m.sender;
  let user = global.db.data.users[target];

  if (!user) {
    return m.reply('Pengguna tidak ditemukan di database.');
  }

  // --- [BARU] Fungsi Helper untuk memformat angka dan menangani Infinity ---
  const formatNumber = (num) => {
    if (num === Infinity) return '∞';
    if (typeof num !== 'number') return '0';
    return num.toLocaleString();
  };

  const formatRow = (label, value, maxLength) => {
    let paddedLabel = label.padEnd(maxLength, ' ');
    return `│ ${paddedLabel} : ${value}`;
  };

  // Definisikan panjang label terpanjang untuk setiap seksi
  const userInfoMaxLength = 10;
  const statusMaxLength = 8;
  const backpackMaxLength = 10;
  const weaponMaxLength = 10;

  // --- Logika Nama Senjata ---
  const armorNames = ['Tidak Punya', 'Leather Armor', 'Iron Armor', 'Gold Armor', 'Diamond Armor', 'Emerald Armor', 'Crystal Armor', 'Obsidian Armor', 'Netherite Armor', 'Wither Armor', 'Dragon Armor', 'Hacker Armor', 'GOD Armor'];
  const swordNames = ['Tidak Punya', 'Wooden Sword', 'Iron Sword', 'Gold Sword', 'Diamond Sword', 'Netherite Sword', 'Crystal Sword', 'Obsidian Sword', 'Netherite Sword', 'Wither Sword', 'Dragon Sword', 'Hacker Sword', 'GOD Sword'];
  const pickaxeNames = ['Tidak Punya', 'Wood Pickaxe', 'Iron Pickaxe', 'Gold Pickaxe', 'Diamond Pickaxe', 'Netherite Pickaxe', 'Crystal Pickaxe', 'Obsidian Pickaxe', 'Netherite Pickaxe', 'Wither Pickaxe', 'Dragon Pickaxe', 'Hacker Pickaxe', 'GOD Pickaxe'];
  const fishingrodNames = ['Tidak Punya', 'Wood FishingRod', 'Iron FishingRod', 'Gold FishingRod', 'Diamond FishingRod', 'Netherite FishingRod', 'Crystal FishingRod', 'Obsidian FishingRod', 'Netherite FishingRod', 'Wither FishingRod', 'Dragon FishingRod', 'Hacker FishingRod', 'GOD FishingRod'];
  const katanaNames = ['Tidak Punya', 'Wood Katana', 'Iron Katana', 'Gold Katana', 'Diamond Katana', 'Netherite Katana', 'Crystal Katana', 'Obsidian Katana', 'Netherite Katana', 'Wither Katana', 'Dragon Katana', 'Hacker Katana', 'GOD Katana'];
  const axeNames = ['Tidak Punya', 'Wood Axe', 'Iron Axe', 'Gold Axe', 'Diamond Axe', 'Netherite Axe', 'Crystal Axe', 'Obsidian Axe', 'Netherite Axe', 'Wither Axe', 'Dragon Axe', 'Hacker Axe', 'GOD Axe'];
  const bowNames = ['Tidak Punya', 'Wood Bow', 'Iron Bow', 'Gold Bow', 'Diamond Bow', 'Netherite Bow', 'Crystal Bow', 'Obsidian Bow', 'Netherite Bow', 'Wither Bow', 'Dragon Bow', 'Hacker Bow', 'GOD Bow'];

  // --- Karakter "Read More" ---
  const readmore = String.fromCharCode(8206).repeat(4001);

  // --- Membangun Pesan dengan Format Baru ---
  let userInfo = [
    `┌─「 *U S E R  I N F O* 」`,
    formatRow('Username', user.name || 'Unnamed', userInfoMaxLength),
    formatRow('Role', user.role || 'Newbie', userInfoMaxLength),
    formatRow('Level', formatNumber(user.level), userInfoMaxLength),
    formatRow('Exp', formatNumber(user.exp), userInfoMaxLength),
    formatRow('Limit', formatNumber(user.limit), userInfoMaxLength),
    formatRow('Money', formatNumber(user.money), userInfoMaxLength),
    `└─「 *${user.titlein || 'No Title'}* 」`
  ].join('\n');

  let userStatus = [
    `┌─「 *S T A T U S* 」`,
    formatRow('Health', formatNumber(user.healt), statusMaxLength),
    formatRow('Stamina', formatNumber(user.stamina), statusMaxLength),
    formatRow('Energi', formatNumber(user.energi), statusMaxLength),
    formatRow('Attack', formatNumber(user.attack), statusMaxLength),
    formatRow('Defense', formatNumber(user.defense), statusMaxLength),
    formatRow('Speed', formatNumber(user.speed), statusMaxLength),
    formatRow('Strength', formatNumber(user.strenght), statusMaxLength),
    `└─「 *${user.skill || 'No Skill'}* 」`
  ].join('\n');

  let visiblePart = "```" + userInfo + "\n\n" + userStatus + "```";

  let backpack = [
    `┌─「 *B A C K P A C K* 」`,
    formatRow('Potion', formatNumber(user.potion), backpackMaxLength),
    formatRow('Diamond', formatNumber(user.diamond), backpackMaxLength),
    formatRow('Emas', formatNumber(user.emas), backpackMaxLength),
    formatRow('Iron', formatNumber(user.iron), backpackMaxLength),
    formatRow('Berlian', formatNumber(user.berlian), backpackMaxLength),
    formatRow('Emerald', formatNumber(user.emerald), backpackMaxLength),
    formatRow('Litecoin', formatNumber(user.litecoin), backpackMaxLength),
    formatRow('Tiketcoin', formatNumber(user.tiketcoin), backpackMaxLength),
    formatRow('Batu', formatNumber(user.batu), backpackMaxLength),
    formatRow('Kayu', formatNumber(user.kayu), backpackMaxLength),
    formatRow('String', formatNumber(user.string), backpackMaxLength),
    formatRow('Coal', formatNumber(user.coal), backpackMaxLength),
    `└─「 *C R A T E S* 」`,
    formatRow('Common', formatNumber(user.common), backpackMaxLength),
    formatRow('Uncommon', formatNumber(user.uncommon), backpackMaxLength),
    formatRow('Mythic', formatNumber(user.mythic), backpackMaxLength),
    formatRow('Legendary', formatNumber(user.legendary), backpackMaxLength)
  ].join('\n');

  let weapons = [
      `┌─「 *E Q U I P M E N T* 」`,
      formatRow('Armor', `${armorNames[user.armor] || 'Unknown'} (+${formatNumber(user.armordurability)})`, weaponMaxLength),
      formatRow('Sword', `${swordNames[user.sword] || 'Unknown'} (+${formatNumber(user.sworddurability)})`, weaponMaxLength),
      formatRow('Pickaxe', `${pickaxeNames[user.pickaxe] || 'Unknown'} (+${formatNumber(user.pickaxedurability)})`, weaponMaxLength),
      formatRow('FishingRod', `${fishingrodNames[user.fishingrod] || 'Unknown'} (+${formatNumber(user.fishingroddurability)})`, weaponMaxLength),
      formatRow('Katana', `${katanaNames[user.katana] || 'Unknown'} (+${formatNumber(user.katanadurability)})`, weaponMaxLength),
      formatRow('Axe', `${axeNames[user.axe] || 'Unknown'} (+${formatNumber(user.axedurability)})`, weaponMaxLength),
      formatRow('Bow', `${bowNames[user.bow] || 'Unknown'} (+${formatNumber(user.bowdurability)})`, weaponMaxLength),
      `└──────────`
  ].join('\n');

  let pets = [
    `┌─「 *P E T S* 」`,
    formatRow('Pet Token', formatNumber(user.pet), 11),
    formatRow('Makanan', formatNumber(user.makananpet), 11),
    `├─「 *Koleksi* 」`,
    formatRow('Kucing', `Lv. ${formatNumber(user.kucing)}`, 11),
    formatRow('Anjing', `Lv. ${formatNumber(user.anjing)}`, 11),
    formatRow('Rubah', `Lv. ${formatNumber(user.rubah)}`, 11),
    formatRow('Serigala', `Lv. ${formatNumber(user.serigala)}`, 11),
    formatRow('Phonix', `Lv. ${formatNumber(user.phonix)}`, 11),
    `└──────────`
].join('\n');

  let hiddenPart = "\n\n" + "```" + backpack + "\n\n" + weapons + "\n\n" + pets + "```";

  // Gabungkan semua bagian menjadi satu pesan
  const capt = visiblePart + readmore + hiddenPart;

  conn.fakeReply(m.chat, capt, '0@s.whatsapp.net', 'Inventory', 'status@broadcast');
}

handler.help = ['inventory *@user*', 'inv *@user*']
handler.tags = ['rpg']
handler.command = /^inv|inventory$/i
handler.group = true
handler.rpg = true

module.exports = handler
