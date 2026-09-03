// ============================================================
//  PAL IMAGES — Маппинг русских/английских имён → internal CDN
//  Источник: cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/
// ============================================================

const PAL_IMG_BASE = 'https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/';

// Внутренние имена палов из игровых файлов
const PAL_INTERNAL = {
  // Базовые палы
  'Lamball':              'SheepBall',
  'Chikipi':              'ChickenPal',
  'Lifmunk':              'Carbunclo',
  'Foxparks':             'Kitsunebi',
  'Fuho':                 'Fuho',
  'Pengullet':            'PenguinPal',
  'Cattiva':              'CatBat',
  'Jolthog':              'Hedgehog',
  'Gumoss':               'Goolem',
  'Vixy':                 'NaughtyCat',
  'Hoocrates':            'SakuraSaurus',
  'Teafant':              'Elefan',
  'Depresso':             'Bushi',
  'Cremis':               'Mutton',
  'Daedream':             'NightFox',
  'Rushoar':              'Boar',
  'Nox':                  'NightBat',
  'Fuddler':              'GoldMole',
  'Killamari':            'Takoya',
  'Mau':                  'Yaksha',
  'Mau Cryst':            'Yaksha_Ice',
  'Leezpunk':             'LizardMan',
  'Leezpunk Ignis':       'LizardMan_Fire',
  'Flambelle':            'FlameBuffalo',
  'Wixen':                'FoxMage',
  'Verdash':              'GrassPanda',
  'Pukmite':              'RobinHood',
  'Gobfin':               'SwordofDamocles',
  'Gobfin Ignis':         'SwordofDamocles_Fire',
  'Rooby':                'RedArmet',
  'Tanzee':               'Gorilla',
  'Ribbuny':              'FrogBishop',
  'Incineram':            'Ronin',
  'Incineram Noct':       'Ronin_Dark',
  'Cinnamoth':            'ColorfulBird',
  'Arsox':                'BadCat',
  'Dumud':                'OilSlime',
  'Cawgnito':             'CrowWitch',
  'Loupmoon':             'WolfClown',
  'Galeclaw':             'Eagle',
  'Robinquill':           'SoundBird',
  'Robinquill Terra':     'SoundBird_Ground',
  'Gorirat':              'GorillaPunk',
  'Beegarde':             'Bee',
  'Elizabee':             'QueenBee',
  'Beegardes':            'Bee',
  'Grintale':             'GhostRabbit',
  'Swee':                 'Alpaca',
  'Sweepa':               'BigAlpaca',
  'Chillet':              'DoeHorn',
  'Chillet Ignis':        'DoeHorn_Fire',
  'Univolt':              'UniPegasus',
  'Foxcicle':             'IceFox',
  'Pyrin':                'FireHorse',
  'Pyrin Noct':           'FireHorse_Dark',
  'Reptyro':              'DragonRelic',
  'Reptyro Cryst':        'DragonRelic_Ice',
  'Hangyu':               'Hangyu',
  'Hangyu Cryst':         'Hangyu_Ice',
  'Mossanda':             'Panda',
  'Mossanda Lux':         'Panda_Electric',
  'Woolipop':             'Alpaca2',
  'Caprity':              'RedHorse',
  'Melpaca':              'CamelViper',
  'Eikthyrdeer':          'BirdDragon',
  'Eikthyrdeer Terra':    'BirdDragon_Ground',
  'Nitewing':             'Eagle2',
  'Surfent':              'SeaHorse',
  'Surfent Terra':        'SeaHorse_Ground',
  'Maraith':              'BlackGriffin',
  'Dinossom':             'FlowerDinosaur',
  'Dinossom Lux':         'FlowerDinosaur_Electric',
  'Sibelyx':              'IceDeer',
  'Elphidran':            'FairyDragon',
  'Elphidran Aqua':       'FairyDragon_Water',
  'Kelpsea':              'KelpFish',
  'Kelpsea Ignis':        'KelpFish_Fire',
  'Azurobe':              'BlueDragon',
  'Grintale':             'GhostRabbit',
  'Broncherry':           'SakuraSaurus2',
  'Broncherry Aqua':      'SakuraSaurus2_Water',
  'Petallia':             'FlowerPony',
  'Reindrix':             'IceReinDeer',
  'Relaxaurus':           'LazySaurus',
  'Relaxaurus Lux':       'LazySaurus_Electric',
  'Sparkit':              'ElectricKid',
  'Trumruck':             'ElectricOx',
  'Dazzi':                'ElectricGoat',
  'Lunaris':              'Moonrabbit',
  'Digtoise':             'ShellDigger',
  'Tombat':               'Badfly',
  'Lovander':             'Heartdumpling',
  'Flambelle':            'FlameBuffalo',
  'Vanwyrm':              'IcePhoenix',
  'Vanwyrm Cryst':        'IcePhoenix_Ice',
  'Bushi':                'SamuraiEvolved',
  'Beakon':               'LightningBird',
  'Ragnahawk':            'FireBird',
  'Katress':              'WitchCat',
  'Katress Ignis':        'WitchCat_Fire',
  'Wumpo':                'AbominatableSnowman',
  'Wumpo Botan':          'AbominatableSnowman_Grass',
  'Warsect':              'Beetle',
  'Warsect Terra':        'Beetle_Ground',
  'Fenglope':             'Unicorn',
  'Felbat':               'QueenBat',
  'Quivern':              'HexoloDragon',
  'Quivern Botan':        'HexoloDragon_Grass',
  'Blazehowl':            'WolfFirework',
  'Blazehowl Noct':       'WolfFirework_Dark',
  'Rayhound':             'IceFoxBig',
  'Kitsun':               'SandFox',
  'Dachsbun':             'FurryBunny',
  'Astegon':              'DragonBlack',
  'Menasting':            'ScorpionGod',
  'Menasting Terra':      'ScorpionGod_Ground',
  'Anastasia':            'LazerDragon',
  'Virgoad':              'SummerBird',
  'Lyleen':               'FlowerQueen',
  'Lyleen Noct':          'FlowerQueen_Dark',
  'Faeleris':             'Firecock',
  'Faleris':              'Firecock',
  'Faleris Ignis':        'Firecock_Fire',
  'Grizzbolt':            'ThunderBird',
  'Grizzolt':             'ThunderBird',
  'Orserk':               'ThunderDragonMan',
  'Shadowbeak':           'BlackGriffin2',
  'Paladius':             'HolyDragon',
  'Necromus':             'BlackDragon',
  'Frostallion':          'IceHorse',
  'Frostallion Noct':     'IceHorse_Dark',
  'Jetragon':             'LazerDragon',
  'Anubis':               'Anubis',
  'Jormuntide':           'SeaDragon',
  'Jormuntide Ignis':     'SeaDragon_Fire',
  'Mammorest':            'GrassMammoth',
  'Mammorest Cryst':      'GrassMammoth_Ice',
  'Yakumo':               'LittleZoe',
  'Mossanda':             'Panda',
  // Новые палы (приблизительные внутренние имена)
  'Renjishi':             'GodFoxSmall',
  'Shaolong':             'NagaDragon',
  'Dandilord':            'FlowerQueen2',
  'Aegidron':             'DragonBlue',
  'Solenne':              'MoonElf',
  'Silvance':             'IceDeerBig',
  'Eidrolon':             'PhantomDragon',
  'Bellanoir':            'DarkCrystal',
  'Bellanoir Libero':     'DarkCrystal_Pure',
  'Ghangler Ignis':       'SeaDragon2_Fire',
};

// Получить URL изображения пала по английскому имени
function getPalImg(engName, size) {
  const internal = PAL_INTERNAL[engName];
  if (!internal) return null;
  return `${PAL_IMG_BASE}T_${internal}_icon_normal.webp`;
}

// Получить URL с fallback (возвращает img-тег)
function palImgTag(engName, size, alt) {
  size = size || 64;
  const url = getPalImg(engName, size);
  const placeholder = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="8" fill="%23161b22"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="${Math.floor(size*0.45)}" fill="%23444">🌐</text></svg>`)}`;

  if (!url) {
    return `<img src="${placeholder}" width="${size}" height="${size}" alt="${alt||''}" style="border-radius:8px;object-fit:cover">`;
  }
  return `<img 
    src="${url}" 
    width="${size}" height="${size}" 
    alt="${alt||engName}" 
    style="border-radius:8px;object-fit:cover;background:#161b22"
    onerror="this.src='${placeholder}'"
  >`;
}
