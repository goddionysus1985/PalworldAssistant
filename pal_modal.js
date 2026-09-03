// ============================================================
//  PAL MODAL — Интерактивная карточка пала с подробной инфой
// ============================================================

(function () {
  'use strict';

  // База подробных данных о популярных и ключевых палах
  const PAL_DETAILS = {
    'Анубис': {
      eng: 'Anubis',
      deckNo: '№ 100',
      element: ['Земля'],
      role: 'Элитный крафтер & Боевой танк',
      work: [
        { job: 'Ручная работа', level: 4, icon: '🔨' },
        { job: 'Добыча камня', level: 3, icon: '⛏️' },
        { job: 'Транспортировка', level: 2, icon: '🚀' }
      ],
      partnerSkill: 'Страж пустыни — наделяет атаки игрока стихией Земли и совершает скоростные уклонения от атак боссов.',
      habitat: 'Сумеречные дюны (Центральная пустыня), координаты (-130, -90). Полевой босс Lv47.',
      drops: 'Кость, Драгоценная сера, Схематика легендарного оружия',
      breedingPower: 570,
      tips: 'Абсолютный топ для базы — крафтит любые сферы и боеприпасы мгновенно благодаря Lv4 Ручной работы.'
    },
    'Орсерк': {
      eng: 'Orserk',
      deckNo: '№ 106',
      element: ['Дракон', 'Электро'],
      role: 'Энергетик №1 & Боевой маг молний',
      work: [
        { job: 'Электричество', level: 4, icon: '⚡' },
        { job: 'Ручная работа', level: 2, icon: '🔨' },
        { job: 'Транспортировка', level: 3, icon: '🚀' }
      ],
      partnerSkill: 'Грозовой рёв — в бою увеличивает дроп с водных палов при их победе.',
      habitat: 'Заповедник дикой природы №3 (Северо-восток карты, океан).',
      drops: 'Электро-орган, Клык дракона, Золотые монеты',
      breedingPower: 220,
      tips: 'Один Орсерк с лёгкостью питает самую огромную базу с несколькими электростанциями.'
    },
    'Джетрагон': {
      eng: 'Jetragon',
      deckNo: '№ 111',
      element: ['Дракон'],
      role: 'Самый быстрый летающий маунт в игре',
      work: [
        { job: 'Сбор', level: 3, icon: '🌾' }
      ],
      partnerSkill: 'Воздушный истребитель — позволяет летать верхом на рекордной скорости и стрелять ракетами из пусковых установок.',
      habitat: 'Вулкан, Обжигающие лавовые поля, Полевой легендарный босс Lv50.',
      drops: 'Алмаз, Полимер, Драконий кристалл, Схематика Ракетницы',
      breedingPower: 70,
      tips: 'Флагманский легендарный пал. Поймать трудно, но даёт невероятную мобильность на всей карте.'
    },
    'Фросталлион': {
      eng: 'Frostallion',
      deckNo: '№ 110',
      element: ['Лёд'],
      role: 'Легендарный ледяной пегас & Топ против драконов',
      work: [
        { job: 'Охлаждение', level: 4, icon: '❄️' }
      ],
      partnerSkill: 'Ледяной шквал — превращает атаки всадника в ледяные и усиливает ледяной урон команды на +30%.',
      habitat: 'Астральные горы (Снежный биом), Полевой легендарный босс Lv50.',
      drops: 'Орган мороза, Алмаз, Схематика брони Пал-металла',
      breedingPower: 80,
      tips: 'Лучший контр-пал против боссов стихии Дракон (Джетрагон, Астогон).'
    },
    'Фросталлион Нокт': {
      eng: 'Frostallion Noct',
      deckNo: '№ 110B',
      element: ['Тьма'],
      role: 'Топ-сборщик урожая Lv7 & Тёмный маунт',
      work: [
        { job: 'Сбор', level: 4, icon: '🌾' }
      ],
      partnerSkill: 'Ночной шквал — наделяет атаки всадника стихией Тьмы и усиливает тёмные атаки.',
      habitat: 'Только через Разведение: Фросталлион + Некромус / Хелзейр.',
      drops: 'Тёмный кристалл, Алмаз',
      breedingPower: 90,
      tips: 'Не спаунится в дикой природе. Единственный пал со сбором урожая высочайшего ранга.'
    },
    'Беллануар Либеро': {
      eng: 'Bellanoir Libero',
      deckNo: '№ 112B',
      element: ['Тьма'],
      role: 'Эндгейм рейд-босс & Максимальный ДПС',
      work: [
        { job: 'Ручная работа', level: 4, icon: '🔨' },
        { job: 'Медицина', level: 4, icon: '💊' },
        { job: 'Транспортировка', level: 2, icon: '🚀' }
      ],
      partnerSkill: 'Сумеречная королева — уникальные самонаводящиеся лучи тьмы с колоссальным уроном.',
      habitat: 'Призыв через Алтарь на базе (плиты рейд-босса из данжей высокого уровня).',
      drops: 'Сердце тьмы, Свит-рубины, Древнее ядро цивилизации',
      breedingPower: 50,
      tips: 'Один из самых грозных боссов в игре (HP свыше 450,000). Необходима подготовленная база-арена.'
    },
    'Джормунтид': {
      eng: 'Jormuntide',
      deckNo: '№ 101',
      element: ['Дракон', 'Вода'],
      role: 'Лучший поливальщик в игре & Водный маунт',
      work: [
        { job: 'Полив', level: 4, icon: '💧' }
      ],
      partnerSkill: 'Повелитель бури — позволяет плавать верхом без расхода выносливости.',
      habitat: 'Озеро в центре карты, Полевой босс Lv45.',
      drops: 'Пал-масло, Орган жидкости',
      breedingPower: 310,
      tips: 'С Lv4 полива грядки поливаются за секунды, что удваивает скорость выращивания ферм.'
    },
    'Джормунтид Игнис': {
      eng: 'Jormuntide Ignis',
      deckNo: '№ 101B',
      element: ['Дракон', 'Огонь'],
      role: 'Лучший плавильщик слитков & Огненный дракон',
      work: [
        { job: 'Разжигание', level: 4, icon: '🔥' }
      ],
      partnerSkill: 'Лавовый дракон — верхом усиливает огненные атаки на +50%.',
      habitat: 'Заповедник дикой природы №2 (Запад карты в океане).',
      drops: 'Огненный орган, Высококачественное масло пала',
      breedingPower: 315,
      tips: 'Плавит Слитки Пал-металла и пищу со скоростью реактивного самолёта.'
    },
    'Лилин': {
      eng: 'Lyleen',
      deckNo: '№ 104',
      element: ['Трава'],
      role: 'Королева плодородия & Полевой лекарь',
      work: [
        { job: 'Посадка', level: 4, icon: '🌱' },
        { job: 'Ручная работа', level: 3, icon: '🔨' },
        { job: 'Сбор', level: 2, icon: '🌾' },
        { job: 'Медицина', level: 3, icon: '💊' }
      ],
      partnerSkill: 'Благословение богини — мгновенно восстанавливает большое количество здоровья игроку по кнопке навыка.',
      habitat: 'Заповедник дикой природы №3 (Северо-восток).',
      drops: 'Низкосортные медикаменты, Семена томатов',
      breedingPower: 250,
      tips: 'Идеальный пал для фермы и незаменимый карманный хиллер для сложных боёв.'
    },
    'Бигарде': {
      eng: 'Beegarde',
      deckNo: '№ 050',
      element: ['Трава'],
      role: 'Единственный производитель Мёда на Ранчо',
      work: [
        { job: 'Скотоводство', level: 1, icon: '🍯' },
        { job: 'Посадка', level: 1, icon: '🌱' },
        { job: 'Ручная работа', level: 1, icon: '🔨' },
        { job: 'Сбор', level: 1, icon: '🌾' },
        { job: 'Лесоповал', level: 1, icon: '🪓' }
      ],
      partnerSkill: 'Пчелиный рабочий — производит Мёд при назначении на Ранчо пастбища.',
      habitat: 'Центральные луга, окрестности башни Лилли.',
      drops: 'Мёд, Семена пшеницы',
      breedingPower: 1110,
      tips: 'Мёд не портится в сундуках и необходим для Тортов — фундамента всей системы скрещивания.'
    },
    'Некромус': {
      eng: 'Necromus',
      deckNo: '№ 109',
      element: ['Тьма'],
      role: 'Легендарный тёмный кентавр',
      work: [
        { job: 'Добыча камня', level: 2, icon: '⛏️' },
        { job: 'Лесоповал', level: 2, icon: '🪓' }
      ],
      partnerSkill: 'Тёмный рыцарь — позволяет совершать тройной прыжок при верховой езде.',
      habitat: 'Северная пустыня, спаунится парой вместе с Паладиусом (Боссы Lv50).',
      drops: 'Слитки Пал-металла, Алмаз',
      breedingPower: 70,
      tips: 'Отличный танк стихии Тьмы с уникальной мобильностью благодаря тройному прыжку.'
    },
    'Паладиус': {
      eng: 'Paladius',
      deckNo: '№ 108',
      element: ['Нейтральный'],
      role: 'Легендарный рыцарь света',
      work: [
        { job: 'Добыча камня', level: 2, icon: '⛏️' },
        { job: 'Лесоповал', level: 2, icon: '🪓' }
      ],
      partnerSkill: 'Священный рыцарь — даёт тройной прыжок при езде верхом.',
      habitat: 'Северная пустыня (в паре с Некромусом, Lv50).',
      drops: 'Слитки Пал-металла, Алмаз',
      breedingPower: 60,
      tips: 'Один из самых живучих палов в игре с огромным запасом брони.'
    },
    'Астогон': {
      eng: 'Astegon',
      deckNo: '№ 098',
      element: ['Дракон', 'Тьма'],
      role: 'Топ-шахтёр Lv4 & Разрушитель руды',
      work: [
        { job: 'Добыча камня', level: 4, icon: '⛏️' },
        { job: 'Ручная работа', level: 1, icon: '🔨' }
      ],
      partnerSkill: 'Чёрный дракон — верхом наносит увеличенный урон рудным жилам.',
      habitat: 'Вулкан, шахта разрушенной крепости (Босс Lv48) или Заповедник №3.',
      drops: 'Пал-металл, Клык дракона',
      breedingPower: 150,
      tips: 'Верхом на Астогоне рудные жилы с серой и металлом разбиваются за пару ударов навыка.'
    },
    'Вумпо': {
      eng: 'Wumpo',
      deckNo: '№ 091',
      element: ['Лёд'],
      role: 'Транспорт Lv4 & Дровосек Lv3',
      work: [
        { job: 'Транспортировка', level: 4, icon: '🚀' },
        { job: 'Лесоповал', level: 3, icon: '🪓' },
        { job: 'Ручная работа', level: 2, icon: '🔨' },
        { job: 'Охлаждение', level: 2, icon: '❄️' }
      ],
      partnerSkill: 'Снежный великан — увеличивает максимальный переносимый вес игрока на +120..+160 в инвентаре.',
      habitat: 'Астральные снежные горы, север карты.',
      drops: 'Лёд, Морозостойкая шерсть',
      breedingPower: 450,
      tips: 'Перевозит огромные объёмы руды и камня на базе за один подход.'
    },
    'Вумпо Ботан': {
      eng: 'Wumpo Botan',
      deckNo: '№ 091B',
      element: ['Трава'],
      role: 'Транспорт Lv4 & Садовод',
      work: [
        { job: 'Транспортировка', level: 4, icon: '🚀' },
        { job: 'Посадка', level: 1, icon: '🌱' },
        { job: 'Ручная работа', level: 2, icon: '🔨' },
        { job: 'Лесоповал', level: 3, icon: '🪓' }
      ],
      partnerSkill: 'Лесной великан — повышает грузоподъёмность инвентаря игрока.',
      habitat: 'Заповедник дикой природы №2 (Океан на западе).',
      drops: 'Листья, Семена',
      breedingPower: 460,
      tips: 'Отличный помощник для транспортировки древесины и камня.'
    },
    'Гриззболт': {
      eng: 'Grizzbolt',
      deckNo: '№ 103',
      element: ['Электро'],
      role: 'Миниганнер & Электрик',
      work: [
        { job: 'Электричество', level: 3, icon: '⚡' },
        { job: 'Ручная работа', level: 2, icon: '🔨' },
        { job: 'Лесоповал', level: 2, icon: '🪓' },
        { job: 'Транспортировка', level: 3, icon: '🚀' }
      ],
      partnerSkill: 'Шквальный пулемёт — позволяет взять в руки тяжелый шестиствольный миниган и вести сокрушительный огонь.',
      habitat: 'Заповедник дикой природы №1 (Южный океан).',
      drops: 'Электро-орган, Кожа',
      breedingPower: 380,
      tips: 'Специальное седло с миниганом наносит рекордный урон по боссам в упор.'
    },
    'Шэдоубик': {
      eng: 'Shadowbeak',
      deckNo: '№ 107',
      element: ['Тьма'],
      role: 'Летающий грифон тьмы & Сильнейший навык',
      work: [
        { job: 'Сбор', level: 1, icon: '🌾' }
      ],
      partnerSkill: 'Модифицированный геном — верхом усиливает атаки стихии Тьмы. Имеет уникальный навык «Божественная катастрофа».',
      habitat: 'Заповедник дикой природы №3.',
      drops: 'Углеволокно, Пал-слитки',
      breedingPower: 120,
      tips: 'Уникальный навык «Divine Disaster» выпускает шквал световых сфер и лазеров, стирая боссов.'
    }
  };

  // Элементные цвета
  const EL_COLORS = {
    'Огонь': '#ef4444',
    'Вода': '#3b82f6',
    'Трава': '#10b981',
    'Электро': '#eab308',
    'Лёд': '#67e8f9',
    'Земля': '#d97706',
    'Тьма': '#a855f7',
    'Дракон': '#8b5cf6',
    'Нейтральный': '#94a3b8'
  };

  // Создание разметки модального окна
  function initModalDOM() {
    if (document.getElementById('palModalOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'palModalOverlay';
    overlay.className = 'pal-modal-overlay';
    overlay.innerHTML = `
      <div class="pal-modal-card" id="palModalCard">
        <button class="pal-modal-close" id="palModalClose" title="Закрыть (Esc)">✕</button>
        <div id="palModalContent"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePalModal();
    });

    const closeBtn = overlay.querySelector('#palModalClose');
    if (closeBtn) closeBtn.addEventListener('click', closePalModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePalModal();
    });
  }

  // Получить или синтезировать данные пала
  function getPalData(nameOrEng) {
    if (!nameOrEng) return null;
    const raw = String(nameOrEng).trim();

    // 1. Прямой поиск в детальной базе
    if (PAL_DETAILS[raw]) return PAL_DETAILS[raw];

    // Поиск по английскому
    for (const [k, v] of Object.entries(PAL_DETAILS)) {
      if (v.eng.toLowerCase() === raw.toLowerCase() || k.toLowerCase() === raw.toLowerCase()) {
        return v;
      }
    }

    // 2. Поиск в DATA / DATA_EXT
    let found = null;
    if (typeof DATA !== 'undefined' && DATA.basePals) {
      found = DATA.basePals.find(p => p.name === raw || p.eng === raw);
    }
    if (!found && typeof DATA !== 'undefined' && DATA.combatPals) {
      found = DATA.combatPals.find(p => p.name === raw || p.eng === raw);
    }
    if (!found && typeof DATA_EXT !== 'undefined' && DATA_EXT.breedingPals) {
      found = DATA_EXT.breedingPals.find(p => p.name === raw || p.eng === raw);
    }

    // Синтезируем карточку
    const engName = (found && found.eng) ? found.eng : (typeof RU_TO_ENG !== 'undefined' && RU_TO_ENG[raw]) ? RU_TO_ENG[raw] : raw;
    const ruName = (found && found.name) ? found.name : raw;
    const element = (found && found.element) ? (Array.isArray(found.element) ? found.element : [found.element]) : ['Обычный'];

    return {
      name: ruName,
      eng: engName,
      deckNo: 'Палдек',
      element: element,
      role: (found && found.role) ? found.role : (found && found.job) ? `Специалист: ${found.job} (Lv${found.level || 3})` : 'Универсальный пал',
      work: (found && found.job) ? [{ job: found.job, level: found.level || 3, icon: found.jobIcon || '🔨' }] : [
        { job: 'Универсал', level: 2, icon: '🐾' }
      ],
      partnerSkill: (found && found.tip) ? found.tip : 'Полезный навык спутника в команде и на базе.',
      habitat: (found && found.where) ? found.where : 'Острова Палпагос, дикие просторы.',
      drops: 'Материалы стихии, опыт',
      breedingPower: (found && found.power) ? found.power : 500,
      tips: (found && found.tip) ? found.tip : 'Используйте в лагере или в боевом отряде.'
    };
  }

  // Открытие модального окна
  function openPalModal(nameOrEng) {
    initModalDOM();
    const data = getPalData(nameOrEng);
    if (!data) return;

    const overlay = document.getElementById('palModalOverlay');
    const content = document.getElementById('palModalContent');

    const primaryEl = (data.element && data.element[0]) ? data.element[0] : 'Огонь';
    const elColor = EL_COLORS[primaryEl] || 'var(--accent)';
    const imgHtml = (typeof palImgTag === 'function') ? palImgTag(data.eng || data.name, 96, data.name) : '🐾';

    content.innerHTML = `
      <div class="pal-modal-header" style="border-bottom:2px solid ${elColor}33">
        <div class="pal-modal-avatar" style="border-color:${elColor}">
          ${imgHtml}
        </div>
        <div class="pal-modal-titles">
          <div class="pal-modal-no">${data.deckNo || 'Palworld'}</div>
          <h2 class="pal-modal-name">${data.name || nameOrEng}</h2>
          <div class="pal-modal-eng">${data.eng || ''}</div>
          <div class="pal-modal-elements">
            ${(data.element || ['Нейтральный']).map(el => `
              <span class="el-badge el-${el}">${el}</span>
            `).join('')}
            <span class="badge badge-S" style="font-size:11px">Мощь: ${data.breedingPower || '—'}</span>
          </div>
        </div>
      </div>

      <div class="pal-modal-body">
        <!-- Специализация / Работа -->
        <div class="pal-modal-section">
          <div class="pal-modal-sec-title">🛠️ Пригодность к работе:</div>
          <div class="pal-modal-jobs">
            ${(data.work || []).map(w => `
              <div class="pal-modal-job-pill">
                <span>${w.icon}</span>
                <span>${w.job}</span>
                <span class="pal-modal-job-lvl">Lv${w.level}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Навык спутника -->
        <div class="pal-modal-section">
          <div class="pal-modal-sec-title">⚡ Навык спутника & Роль:</div>
          <div class="pal-modal-box">
            <strong>${data.role || 'Боевой пал'}</strong>
            <p style="margin-top:4px;color:var(--text2);font-size:13px">${data.partnerSkill}</p>
          </div>
        </div>

        <!-- Где найти -->
        <div class="pal-modal-section">
          <div class="pal-modal-sec-title">📍 Где найти & Дроп:</div>
          <div style="font-size:13px;color:var(--text);line-height:1.6">
            <div>🌍 <strong>Локация:</strong> <span style="color:var(--text2)">${data.habitat}</span></div>
            ${data.drops ? `<div style="margin-top:4px">🎁 <strong>Дроп:</strong> <span style="color:var(--text2)">${data.drops}</span></div>` : ''}
          </div>
        </div>

        <!-- Совет -->
        ${data.tips ? `
        <div class="pal-modal-section" style="margin-bottom:0">
          <div class="tip-box" style="margin-bottom:0;padding:10px 14px;font-size:12.5px">
            💡 <strong>Совет:</strong> ${data.tips}
          </div>
        </div>` : ''}

        <!-- Кнопки действий -->
        <div class="pal-modal-actions">
          <button class="pal-modal-btn pal-modal-btn-calc" onclick="window._jumpToBreeding('${data.name}')">
            🧮 В калькулятор скрещивания
          </button>
          <button class="pal-modal-btn pal-modal-btn-map" onclick="window._jumpToMap()">
            📍 Открыть карту
          </button>
        </div>
      </div>
    `;

    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closePalModal() {
    const overlay = document.getElementById('palModalOverlay');
    if (overlay) overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  // Быстрые переходы из модалки
  window._jumpToBreeding = function (palName) {
    closePalModal();
    if (typeof window.switchAllExtended === 'function') {
      window.switchAllExtended('breeding-calc');
    }
    setTimeout(() => {
      const p1 = document.getElementById('breedP1');
      if (p1 && palName) {
        for (let opt of p1.options) {
          if (opt.value === palName || opt.text.includes(palName)) {
            p1.value = opt.value;
            p1.dispatchEvent(new Event('change'));
            break;
          }
        }
      }
    }, 150);
  };

  window._jumpToMap = function () {
    closePalModal();
    if (typeof window.switchAllExtended === 'function') {
      window.switchAllExtended('map');
    }
  };

  window.openPalModal = openPalModal;
  window.closePalModal = closePalModal;

  // Автоматическая подсветка упоминаний палов в тексте
  function enhanceTextPalLinks() {
    const palNames = [
      'Анубис', 'Джетрагон', 'Орсерк', 'Фросталлион', 'Фросталлион Нокт',
      'Джормунтид', 'Джормунтид Игнис', 'Лилин', 'Беллануар', 'Бигарде',
      'Некромус', 'Паладиус', 'Астогон', 'Вумпо', 'Вумпо Ботан', 'Гриззболт',
      'Шэдоубик', 'Рэнджиши', 'Шаолонг', 'Дандилорд', 'Эгидрон', 'Солэнн',
      'Сильванс', 'Эйдролон', 'Селесдир Нокт'
    ];
    const targets = document.querySelectorAll('.card p, .tip-box, .warn-box, td');
    targets.forEach(node => {
      if (node.closest('#palModalOverlay') || node.querySelector('.pal-modal-card')) return;
      let html = node.innerHTML;
      let changed = false;
      palNames.forEach(name => {
        const regex = new RegExp(`(?<![<\\/\\wА-Яа-яЁё])(${name})(?![\\wА-Яа-яЁё>]|[^<]*>)`, 'g');
        if (regex.test(html)) {
          html = html.replace(regex, `<span class="pal-text-link" data-pal="$1" title="Нажмите для открытия карточки $1">$1</span>`);
          changed = true;
        }
      });
      if (changed) node.innerHTML = html;
    });
  }

  // Глобальное делегирование кликов по карточкам и упоминаниям палов
  document.addEventListener('DOMContentLoaded', () => {
    initModalDOM();
    setTimeout(enhanceTextPalLinks, 400);

    document.body.addEventListener('click', (e) => {
      // Игнорируем клики по кнопкам действий внутри карточки или формам
      if (e.target.closest('button, select, input, a, .tab-btn, .sub-tab')) return;

      const palCard = e.target.closest('.pal-card, .combat-card, [data-pal], .pal-text-link');
      if (palCard) {
        let palName = palCard.dataset.pal;
        if (!palName) {
          const nameEl = palCard.querySelector('.pal-name') || palCard.querySelector('.combat-name');
          if (nameEl) palName = nameEl.textContent.trim();
        }
        if (palName) {
          openPalModal(palName);
        }
      }
    });
  });

})();
