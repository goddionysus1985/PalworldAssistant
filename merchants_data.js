// ============================================================
//  PALWORLD HELPER — Справочник всех торговцев Палпагоса
// ============================================================

const MERCHANTS_DATA = [
  {
    id: 'm_small_red',
    name: 'Бродячий торговец (Красный)',
    type: 'red',
    typeName: '🔴 Сырьё и материалы',
    location: 'Небольшое поселение (Small Settlement)',
    coords: '73, -486',
    fastTravel: 'Телепорт «Небольшое поселение»',
    desc: 'Первый ключевой торговец в игре. Стоит внутри деревянной хижины на холме деревни. Идеален для ранней покупки костей и семян пшеницы.',
    items: [
      { name: 'Кость', price: 100, icon: '🦴', cat: 'raw', tip: 'Нужна для Цемента и улучшений базы' },
      { name: 'Кожа', price: 150, icon: '🛡️', cat: 'raw', tip: 'Для сбруи, сёдел и брони' },
      { name: 'Рог', price: 300, icon: '📯', cat: 'raw', tip: 'Для медикаментов' },
      { name: 'Шерсть', price: 100, icon: '🧶', cat: 'raw', tip: 'Для ткани и утепления' },
      { name: 'Обычная ткань', price: 150, icon: '🧵', cat: 'raw', tip: 'Для брони и глайдеров' },
      { name: 'Семена пшеницы', price: 100, icon: '🌾', cat: 'seeds', tip: 'Критично для запуска пшеничных ферм и Тортов' },
      { name: 'Семена ягод', price: 50, icon: '🍓', cat: 'seeds', tip: 'Стартовые ягодные плантации' },
      { name: 'Стрелы ×10', price: 50, icon: '🏹', cat: 'ammo', tip: 'Боеприпасы для луков' },
      { name: 'Низкосортные медикаменты', price: 240, icon: '💊', cat: 'meds', tip: 'Лечит язву и простуду палов' }
    ]
  },
  {
    id: 'm_small_blue',
    name: 'Торговец палами (Синий)',
    type: 'blue',
    typeName: '🔵 Торговец палами',
    location: 'Небольшое поселение (Small Settlement)',
    coords: '75, -480',
    fastTravel: 'Телепорт «Небольшое поселение»',
    desc: 'Стоит у входа в деревню. Позволяет сдать лишних пойманных палов за золото или докупить недостающих ранних специалистов.',
    items: [
      { name: 'Скупка любых палов', price: 'Динамическая', icon: '💰', cat: 'pals', tip: 'Принимает любых палов в обмен на золото' },
      { name: 'Ламбалль', price: 800, icon: '🐾', cat: 'pals', tip: 'Шерсть и стартовая ручная работа' },
      { name: 'Чикипи', price: 600, icon: '🐾', cat: 'pals', tip: 'Яйца для Тортов на Ранчо' },
      { name: 'Фокспаркс', price: 1200, icon: '🔥', cat: 'pals', tip: 'Огнемётчик и раннее разжигание огня' },
      { name: 'Пенгуллет', price: 1500, icon: '💧', cat: 'pals', tip: 'Универсал: полив, крафт, охлаждение' },
      { name: 'Рушоар', price: 2200, icon: '⛏️', cat: 'pals', tip: 'Ездовой кабан для быстрого бурения камня' }
    ]
  },
  {
    id: 'm_fish_red_ammo',
    name: 'Торговец снаряжением (Рыбацкая деревня)',
    type: 'red',
    typeName: '🔴 Патроны и снаряжение',
    location: 'Рыбацкая деревня (Fisherman\'s Point)',
    coords: '-478, -745',
    fastTravel: 'Телепорт «Рыбацкая деревня» (Южное побережье вулкана)',
    desc: 'Главный оружейный магазин юга! Здесь продаются все виды патронов (винтовочные, пистолетные, для дробовика) и жаростойкое бельё.',
    items: [
      { name: 'Патроны для пистолета ×10', price: 1200, icon: '🔫', cat: 'ammo', tip: 'Стандартные пистолетные пули' },
      { name: 'Патроны для винтовки ×10', price: 1500, icon: '🎯', cat: 'ammo', tip: 'Для однозарядной и штурмовой винтовки' },
      { name: 'Патроны для дробовика ×10', price: 1500, icon: '💥', cat: 'ammo', tip: 'Высокий урон в упор' },
      { name: 'Мушкетные пули ×10', price: 250, icon: '🧨', cat: 'ammo', tip: 'Дешёвые пули для раннего мушкета' },
      { name: 'Огнеупорное бельё +1', price: 1000, icon: '🩳', cat: 'gear', tip: 'Защищает от перегрева в лаве и на вулкане' },
      { name: 'Качественное масло пала', price: 300, icon: '🛢️', cat: 'raw', tip: 'Для создания Полимера и огнестрела' },
      { name: 'Орган пламени', price: 100, icon: '🔥', cat: 'raw', tip: 'Для огненных стрел, факелов и плавильни' }
    ]
  },
  {
    id: 'm_fish_red_food',
    name: 'Торговец провизией (Рыбацкая деревня)',
    type: 'red',
    typeName: '🔴 Семена и провизия',
    location: 'Рыбацкая деревня (Fisherman\'s Point)',
    coords: '-470, -750',
    fastTravel: 'Телепорт «Рыбацкая деревня»',
    desc: 'Продавец редких семян для автоматизации топовой базы с едой.',
    items: [
      { name: 'Семена томатов', price: 200, icon: '🍅', cat: 'seeds', tip: 'Необходимы для Салата (бафф +30% к скорости работы)' },
      { name: 'Семена салата-латука', price: 200, icon: '🥬', cat: 'seeds', tip: 'Основа для топового рациона базы' },
      { name: 'Мясо капирити', price: 150, icon: '🥩', cat: 'food', tip: 'Сытное мясо для кулинарии' },
      { name: 'Кость', price: 100, icon: '🦴', cat: 'raw', tip: 'Материал для крафта' }
    ]
  },
  {
    id: 'm_dune_red_gear',
    name: 'Торговец броней и патронами (Деревня у дюн)',
    type: 'red',
    typeName: '🔴 Эндгейм-экипировка',
    location: 'Деревня у дюн (Dune Shelter)',
    coords: '356, 347',
    fastTravel: 'Телепорт «Деревня у дюн» (Северо-восточная пустыня)',
    desc: 'Самый продвинутый официальный торговец в игре. Продаёт высокоуровневые патроны, схемы помпового дробовика и морозостойкое бельё.',
    items: [
      { name: 'Патроны для штурмовой винтовки ×10', price: 1500, icon: '💥', cat: 'ammo', tip: 'Для автомата AR — главный расходник эндгейма' },
      { name: 'Патроны для дробовика ×10', price: 1500, icon: '🔫', cat: 'ammo', tip: 'Для помпового дробовика' },
      { name: 'Морозостойкое бельё +1', price: 1000, icon: '🧤', cat: 'gear', tip: 'Защищает от замерзания в Астральных горах' },
      { name: 'Высокосортные медикаменты', price: 3000, icon: '💊', cat: 'meds', tip: 'Мгновенно излечивает депрессию и слабость палов' },
      { name: 'Орган мороза', price: 100, icon: '❄️', cat: 'raw', tip: 'Для холодильников и ледяного оружия' },
      { name: 'Орган электричества', price: 100, icon: '⚡', cat: 'raw', tip: 'Для генераторов и электроловушек' }
    ]
  },
  {
    id: 'm_black_church',
    name: 'Чёрный торговец: Заброшенная шахта',
    type: 'black',
    typeName: '🏴‍☠️ Чёрный торговец',
    location: 'Заброшенная шахта (Desolate Church Mine)',
    coords: '41, -402',
    fastTravel: 'Телепорт «Церковь запустения» (Спуститесь вниз к реке в расщелину)',
    desc: 'Самый доступный подпольный торговец. Прячется в пещере у водопада под церковью. Скупает браконьеров и палов по максимальной цене золотом.',
    items: [
      { name: 'Скупка контрабанды и NPC', price: 'Максимальная', icon: '💰', cat: 'pals', tip: 'Покупает любых палов и пойманных людей' },
      { name: 'Редкие палы с ночными пассивками', price: '3,000–35,000', icon: '🐾', cat: 'pals', tip: 'Случайный набор из 5 редких палов (ротация каждые сутки)' },
      { name: 'Увеличение золота за поимку', price: 'Сервис', icon: '🪙', cat: 'service', tip: 'Лучший способ заработать 100,000+ золота за 10 минут' }
    ]
  },
  {
    id: 'm_black_flopie',
    name: 'Чёрный торговец: Гора Флопи',
    type: 'black',
    typeName: '🏴‍☠️ Чёрный торговец',
    location: 'Тайная бухта у горы Флопи (Mount Flopie)',
    coords: '-30, -170',
    fastTravel: 'Телепорт «Центральная вершина озера»',
    desc: 'Спрятан на дне ущелья у водопада. В ассортименте часто встречаются палы для быстрой селекции (Кетси, Дайрдаул, Лилин).',
    items: [
      { name: 'Контрабандные палы 25–35 уровня', price: '12,000–45,000', icon: '🐾', cat: 'pals', tip: 'Шанс получить редких палов без поиска по всей карте' },
      { name: 'Скупка палов оптом', price: 'Высокая', icon: '💰', cat: 'pals', tip: 'Быстрая очистка переполненного Палбокса с огромной прибылью' }
    ]
  },
  {
    id: 'm_black_volcano',
    name: 'Чёрный торговец: Побережье вулкана',
    type: 'black',
    typeName: '🏴‍☠️ Чёрный торговец',
    location: 'Западный утёс Обсидиана (Mount Obsidian)',
    coords: '-795, -630',
    fastTravel: 'Телепорт «Лавовый кратер юга»',
    desc: 'Эндгейм-контрабандист. Продаёт редчайших высокоуровневых палов стихий Огня и Тьмы.',
    items: [
      { name: 'Высокоуровневые палы (Lv40+)', price: '30,000–90,000', icon: '🐾', cat: 'pals', tip: 'Готовые палы для эндгейм-баз и разведения' },
      { name: 'Скупка эндгейм-палов', price: 'Экстра', icon: '💎', cat: 'pals', tip: 'Даёт до 15,000 золота за одного сильного пала' }
    ]
  }
];

let activeMerchantType = 'all';
let merchantSearchQuery = '';

function renderMerchantsGuide() {
  const container = document.getElementById('merchantsContainer');
  if (!container) return;

  const filtered = MERCHANTS_DATA.filter(m => {
    const matchType = (activeMerchantType === 'all') || (m.type === activeMerchantType);
    if (!matchType) return false;

    if (!merchantSearchQuery) return true;
    const q = merchantSearchQuery.toLowerCase();
    const matchMeta = m.name.toLowerCase().includes(q) || m.location.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q);
    const matchItem = m.items.some(it => it.name.toLowerCase().includes(q) || it.tip.toLowerCase().includes(q));
    return matchMeta || matchItem;
  });

  if (!filtered.length) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text2);background:var(--bg2);border-radius:12px;border:1px dashed var(--border)">
        <div style="font-size:32px;margin-bottom:8px">🔍</div>
        <div style="font-size:16px;font-weight:700">Торговцы или товары не найдены</div>
        <div style="font-size:13px;margin-top:4px">Попробуйте изменить категорию или поисковый запрос</div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(m => {
    const typeColor = m.type === 'red' ? '#ef4444' : m.type === 'blue' ? '#3b82f6' : '#a855f7';
    return `
      <div class="card" style="display:flex;flex-direction:column;justify-content:space-between;border-top:3px solid ${typeColor}">
        <div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px">
            <h3 style="margin:0;font-size:17px">${m.name}</h3>
            <span class="badge" style="background:${typeColor}22;color:${typeColor};border:1px solid ${typeColor}44;font-size:11px;white-space:nowrap">${m.typeName}</span>
          </div>
          <div style="font-size:12px;color:var(--text2);margin-bottom:10px;line-height:1.5">
            <div>📍 <strong>Локация:</strong> ${m.location}</div>
            <div>🗺️ <strong>Координаты:</strong> <span style="color:var(--accent)">[${m.coords}]</span> (${m.fastTravel})</div>
          </div>
          <p style="font-size:12.5px;color:var(--text);margin-bottom:12px">${m.desc}</p>

          <div style="font-size:11.5px;text-transform:uppercase;font-weight:700;color:var(--text2);letter-spacing:.5px;margin-bottom:6px">
            Ассортимент и цены:
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px">
            ${m.items.map(it => `
              <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:6px 10px;display:flex;align-items:center;justify-content:space-between;gap:8px">
                <div style="display:flex;align-items:center;gap:6px;min-width:0">
                  <span style="font-size:14px">${it.icon}</span>
                  <span style="font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${it.name}</span>
                </div>
                <div style="font-size:12px;font-weight:700;color:#ffd700;white-space:nowrap">
                  ${typeof it.price === 'number' ? it.price + ' G' : it.price}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display:flex;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.05)">
          <button class="sub-tab active" style="flex:1;padding:8px 12px;font-size:12px" onclick="window._jumpToMap('${m.name}')">
            📍 Показать на карте
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function initMerchantsEvents() {
  const btns = document.querySelectorAll('[data-merchant-type]');
  btns.forEach(b => {
    b.addEventListener('click', () => {
      btns.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      activeMerchantType = b.dataset.merchantType;
      renderMerchantsGuide();
    });
  });

  const inp = document.getElementById('merchantsSearchInput');
  if (inp) {
    inp.addEventListener('input', (e) => {
      merchantSearchQuery = e.target.value.trim();
      renderMerchantsGuide();
    });
  }
}

if (typeof window !== 'undefined') {
  window.MERCHANTS_DATA = MERCHANTS_DATA;
  window.renderMerchantsGuide = renderMerchantsGuide;
  window.initMerchantsEvents = initMerchantsEvents;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MERCHANTS_DATA, renderMerchantsGuide };
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      renderMerchantsGuide();
      initMerchantsEvents();
    });
  } else {
    renderMerchantsGuide();
    initMerchantsEvents();
  }
}
