// ============================================================
//  PALWORLD HELPER — Расширенные функции (7 новых разделов)
// ============================================================

(function () {
  'use strict';

  // ── ГЛОБАЛЬНОЕ СОСТОЯНИЕ ──────────────────────────────────
  const state = {
    mapFilter: 'all',
    mapPopup: null,
    basePlanner: { selected: null, grid: {}, buildings: [] },
    techLearned: JSON.parse(localStorage.getItem('pw_tech') || '{}'),
    techFilter: 'all',
    techZoom: 1,
    foodGoal: 'work',
    breedPal1: null,
    breedPal2: null,
    breedMode: 'forward',  // 'forward' | 'reverse'
    goldSort: 'income',
    bossExpanded: {},
  };

  // ─── УТИЛИТЫ ──────────────────────────────────────────────
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return [...(ctx || document).querySelectorAll(sel)]; }

  // ─── ВСТАВКА ВКЛАДОК И СЕКЦИЙ ─────────────────────────────
  function insertTabsAndSections() {
    const main = qs('.main');
    const newSectionIds = [
      'base-analyzer', 'merchants', 'breeding-calc', 'map', 'food-calc', 'base-planner', 'tech-tree', 'bosses', 'gold'
    ];

    newSectionIds.forEach(id => {
      if (!qs('#' + id)) {
        const sec = el('div', 'section');
        sec.id = id;
        main.appendChild(sec);
      }
    });

    // Переключение вкладок — хендлер для всех кнопок
    qsa('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchAll(btn.dataset.tab));
    });

    // Хендлер для ссылок разделов в хедере
    qsa('.header-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.dataset.headTab;
        const cat = link.dataset.headCat;
        if (cat && typeof window._switchCategory === 'function') {
          window._switchCategory(cat, false);
        }
        switchAll(tab);
      });
    });
  }

  function switchAll(id) {
    const targetBtn = qs(`.tab-btn[data-tab="${id}"]`);
    if (targetBtn && targetBtn.dataset.cat) {
      if (typeof window._switchCategory === 'function') {
        window._switchCategory(targetBtn.dataset.cat, false);
      }
    }

    qsa('.tab-btn').forEach(b => {
      const isActive = b.dataset.tab === id;
      b.classList.toggle('active', isActive);
      if (isActive) {
        b.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
      }
    });

    // Синхронизация активной ссылки в хедере
    qsa('.header-link').forEach(link => {
      const isHeaderActive = link.dataset.headTab === id;
      link.classList.toggle('active', isHeaderActive);
      if (isHeaderActive) {
        link.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
      }
    });

    qsa('.section').forEach(s => s.classList.toggle('active', s.id === id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof window._closeSearch === 'function') window._closeSearch();
    // Ленивая инициализация карты
    if (id === 'map') setTimeout(initMapCanvas, 50);
  }

  window.switchAllExtended = switchAll;

  // ══════════════════════════════════════════════════════════
  //  1. КАЛЬКУЛЯТОР РАЗВЕДЕНИЯ
  // ══════════════════════════════════════════════════════════
  function buildBreedingCalc() {
    const sec = qs('#breeding-calc');
    const pals = DATA_EXT.breedingPals.slice().sort((a, b) => a.name.localeCompare(b.name, 'ru'));

    const optionsHtml = pals.map(p =>
      `<option value="${p.name}">${p.name} (${p.eng}) — Мощь: ${p.power}</option>`
    ).join('');

    sec.innerHTML = `
      <div class="section-header">
        <h2>🧮 Калькулятор разведения</h2>
        <p>Выбери двух палов и узнай их потомка. Учитываются особые комбинации.</p>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">
        <button class="sub-tab active" id="breedForwardBtn" onclick="window._breedMode('forward')">🔀 Кто получится?</button>
        <button class="sub-tab" id="breedReverseBtn" onclick="window._breedMode('reverse')">🔍 Кто нужен для...?</button>
      </div>

      <!-- ПРЯМОЙ: 2 пала → потомок -->
      <div id="breedForwardPanel">
        <div class="info-box">⚡ Формула: <code>Пол((Мощь1 + Мощь2 + 1) / 2)</code> → ищем ближайшего пала</div>
        <div class="breed-inputs-grid">
          <div>
            <label style="font-size:12px;color:var(--text2);display:block;margin-bottom:6px">Родитель 1</label>
            <select id="breedP1" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);font-size:14px">
              <option value="">— Выбери пала —</option>${optionsHtml}
            </select>
          </div>
          <div style="text-align:center;font-size:28px;color:var(--accent);font-weight:700">×</div>
          <div>
            <label style="font-size:12px;color:var(--text2);display:block;margin-bottom:6px">Родитель 2</label>
            <select id="breedP2" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);font-size:14px">
              <option value="">— Выбери пала —</option>${optionsHtml}
            </select>
          </div>
        </div>
        <div id="breedResult"></div>
      </div>

      <!-- ОБРАТНЫЙ: цель → пары -->
      <div id="breedReversePanel" style="display:none">
        <div class="info-box">🔍 Выбери желаемого потомка и узнай все возможные пары родителей</div>
        <div style="margin-bottom:20px">
          <label style="font-size:12px;color:var(--text2);display:block;margin-bottom:6px">Желаемый потомок</label>
          <select id="breedTarget" style="width:100%;max-width:400px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);font-size:13px">
            <option value="">— Выбери цель —</option>${optionsHtml}
          </select>
        </div>
        <div id="breedReverseResult"></div>
      </div>

      <!-- Особые комбинации -->
      <div class="section-header" style="margin-top:32px">
        <h2>⭐ Особые фиксированные комбинации</h2>
        <p>Эти пары дают конкретного потомка вне зависимости от формулы мощи</p>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Родитель 1</th><th></th><th>Родитель 2</th><th>→</th><th>Результат</th><th>Зачем</th></tr></thead>
          <tbody>
            ${DATA_EXT.specialBreeding.map(s => `
            <tr>
              <td><span class="pal-text-link" data-pal="${s.parent1}" title="Открыть карточку ${s.parent1}">${s.parent1}</span></td>
              <td style="color:var(--text2)">×</td>
              <td><span class="pal-text-link" data-pal="${s.parent2}" title="Открыть карточку ${s.parent2}">${s.parent2}</span></td>
              <td style="color:var(--accent)">→</td>
              <td><span class="pal-text-link" data-pal="${s.result}" title="Открыть карточку ${s.result}">${s.result}</span></td>
              <td style="color:var(--text2)">${s.note}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Слушатели для прямого расчёта
    qs('#breedP1').addEventListener('change', calcBreedForward);
    qs('#breedP2').addEventListener('change', calcBreedForward);
    qs('#breedTarget').addEventListener('change', calcBreedReverse);
  }

  window._breedMode = function(mode) {
    const isForward = mode === 'forward';
    qs('#breedForwardPanel').style.display = isForward ? '' : 'none';
    qs('#breedReversePanel').style.display = isForward ? 'none' : '';
    qs('#breedForwardBtn').classList.toggle('active', isForward);
    qs('#breedReverseBtn').classList.toggle('active', !isForward);
  };

  function calcBreedForward() {
    const p1name = qs('#breedP1').value;
    const p2name = qs('#breedP2').value;
    const out = qs('#breedResult');
    if (!p1name || !p2name) { out.innerHTML = ''; return; }

    // Проверка особых комбинаций
    const special = DATA_EXT.specialBreeding.find(s =>
      (s.parent1 === p1name && s.parent2 === p2name) ||
      (s.parent1 === p2name && s.parent2 === p1name)
    );

    if (special) {
      out.innerHTML = `
        <div class="tip-box">
          ⭐ <strong>Особая комбинация!</strong> Эта пара всегда даёт: <strong style="color:var(--accent);font-size:18px">${special.result}</strong>
          <br><span style="color:var(--text2)">${special.note}</span>
        </div>`;
      return;
    }

    const p1 = DATA_EXT.breedingPals.find(p => p.name === p1name);
    const p2 = DATA_EXT.breedingPals.find(p => p.name === p2name);
    if (!p1 || !p2) return;

    const childPower = Math.floor((p1.power + p2.power + 1) / 2);

    // Найти 3 ближайших
    const sorted = DATA_EXT.breedingPals
      .filter(p => p.name !== p1name && p.name !== p2name)
      .map(p => ({ ...p, diff: Math.abs(p.power - childPower) }))
      .sort((a, b) => a.diff - b.diff);

    const top = sorted.slice(0, 3);
    const best = top[0];

    out.innerHTML = `
      <div data-pal="${best.name}" style="background:var(--bg2);border:2px solid var(--accent);border-radius:12px;padding:20px;margin-bottom:16px;text-align:center;cursor:pointer" title="Нажмите, чтобы открыть карточку ${best.name}">
        <div style="font-size:13px;color:var(--text2);margin-bottom:8px">Мощь потомка: <strong style="color:var(--accent)">${childPower}</strong></div>
        <div style="margin-bottom:10px">${(typeof palImgTag === 'function') ? palImgTag(best.eng, 96, best.name) : '🌐'}</div>
        <div style="font-size:28px;font-weight:800;color:var(--text)">${best.name}</div>
        <div style="font-size:13px;color:var(--text2)">${best.eng} — Мощь: ${best.power}</div>
        <div style="font-size:11px;color:var(--accent);margin-top:6px">👉 Нажмите для подробной карточки</div>
      </div>
      <div style="font-size:13px;color:var(--text2);margin-bottom:10px">Ближайшие варианты:</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${top.map((p, i) => `
        <div data-pal="${p.name}" style="flex:1;min-width:180px;background:var(--bg3);border:1px solid ${i===0?'var(--accent)':'var(--border)'};border-radius:8px;padding:14px;text-align:center;cursor:pointer" title="Нажмите, чтобы открыть карточку ${p.name}">
          <div style="margin-bottom:8px">${(typeof palImgTag === 'function') ? palImgTag(p.eng, 56, p.name) : ''}</div>
          <div style="font-weight:700;font-size:${i===0?'16px':'14px'}">${p.name}</div>
          <div style="font-size:11px;color:var(--text2)">${p.eng}</div>
          <div style="font-size:12px;margin-top:4px">Мощь: <strong style="color:var(--accent)">${p.power}</strong></div>
          <div style="font-size:11px;color:var(--text2)">Отклонение: ±${p.diff}</div>
        </div>`).join('')}
      </div>`;
  }

  function calcBreedReverse() {
    const targetName = qs('#breedTarget').value;
    const out = qs('#breedReverseResult');
    if (!targetName) { out.innerHTML = ''; return; }

    const target = DATA_EXT.breedingPals.find(p => p.name === targetName);
    if (!target) return;

    // Особые комбинации для цели
    const specials = DATA_EXT.specialBreeding.filter(s => s.result === targetName);

    // Все пары через формулу (ограничим до 12)
    const pairs = [];
    const pals = DATA_EXT.breedingPals;
    for (let i = 0; i < pals.length; i++) {
      for (let j = i; j < pals.length; j++) {
        const childPower = Math.floor((pals[i].power + pals[j].power + 1) / 2);
        const closest = pals.reduce((best, p) =>
          Math.abs(p.power - childPower) < Math.abs(best.power - childPower) ? p : best
        );
        if (closest.name === targetName) {
          pairs.push({ p1: pals[i], p2: pals[j] });
          if (pairs.length >= 12) break;
        }
      }
      if (pairs.length >= 12) break;
    }

    out.innerHTML = `
      ${specials.length ? `
      <div class="tip-box" style="margin-bottom:16px">
        ⭐ <strong>Особые комбинации для ${targetName}:</strong><br>
        ${specials.map(s => `<strong>${s.parent1}</strong> × <strong>${s.parent2}</strong> — ${s.note}`).join('<br>')}
      </div>` : ''}
      <div style="font-size:13px;color:var(--text2);margin-bottom:10px">
        Пары через формулу ${pairs.length ? `(найдено ${pairs.length})` : '— не найдено через формулу'}:
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px">
        ${pairs.map(({p1,p2}) => `
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px;font-size:13px">
          <strong>${p1.name}</strong> <span style="color:var(--text2)">(${p1.power})</span>
          <span style="color:var(--accent)"> × </span>
          <strong>${p2.name}</strong> <span style="color:var(--text2)">(${p2.power})</span>
        </div>`).join('')}
        ${!pairs.length && !specials.length ? '<div class="no-results"><div class="icon">😢</div><p>Не найдено пар для этого пала</p></div>' : ''}
      </div>`;
  }

  // ══════════════════════════════════════════════════════════
  //  2. ИНТЕРАКТИВНАЯ КАРТА
  // ══════════════════════════════════════════════════════════
  const TYPE_COLORS = {
    legendary: '#ffd700',
    dungeon:   '#f59e0b',
    merchant:  '#10b981',
    ore:       '#6b7280',
    tower:     '#ef4444',
  };
  const TYPE_LABELS = {
    legendary: 'Легендарные палы',
    dungeon:   'Подземелья',
    merchant:  'Торговцы',
    ore:       'Месторождения',
    tower:     'Башни',
  };

  const TARGET_LOCATIONS = {
    'Анубис': {
      name: 'Анубис (Anubis)',
      coords: '[-130, -96]',
      teleport: 'Телепорт «Сумеречные дюны»',
      desc: 'Огромная каменная статуя Анубиса в центре песчаной пустыни. Полевой босс 47 уровня.',
      searchQuery: 'Anubis',
      cx: 480, cy: 380,
      icon: '🐾'
    },
    'Джетрагон': {
      name: 'Джетрагон (Jetragon)',
      coords: '[-789, -321]',
      teleport: 'Телепорт «Пляж вечного лета» (Вулкан)',
      desc: 'Лавовое озеро на самом западном краю вулканического острова. Легендарный босс 50 уровня.',
      searchQuery: 'Jetragon',
      cx: 610, cy: 90,
      icon: '🐉'
    },
    'Фросталлион': {
      name: 'Фросталлион (Frostallion)',
      coords: '[-357, 508]',
      teleport: 'Телепорт «Земли абсолютного нуля» (Астральные горы)',
      desc: 'Ледяное плато на северо-западе снежного региона. Легендарный босс 50 уровня.',
      searchQuery: 'Frostallion',
      cx: 140, cy: 60,
      icon: '❄️'
    },
    'Фросталлион Нокт': {
      name: 'Фросталлион Нокт (Frostallion Noct)',
      coords: 'База игрока (Разведение)',
      teleport: 'Пастбище свиданий',
      desc: 'В дикой природе не встречается. Выводится только скрещиванием: Фросталлион + Некромус.',
      searchQuery: 'Frostallion Noct',
      cx: 350, cy: 280,
      icon: '🖤'
    },
    'Некромус': {
      name: 'Некромус (Necromus)',
      coords: '[446, 680]',
      teleport: 'Телепорт «Глубокие песчаные дюны» (Северная пустыня)',
      desc: 'Северная часть пустыни. Патрулирует вместе с Паладиусом. Легендарный босс 50 уровня.',
      searchQuery: 'Necromus',
      cx: 160, cy: 380,
      icon: '💀'
    },
    'Паладиус': {
      name: 'Паладиус (Paladius)',
      coords: '[446, 680]',
      teleport: 'Телепорт «Глубокие песчаные дюны» (Северная пустыня)',
      desc: 'Северная часть пустыни. Сражается в паре с Некромусом. Легендарный босс 50 уровня.',
      searchQuery: 'Paladius',
      cx: 185, cy: 395,
      icon: '⚪'
    },
    'Джормунтид': {
      name: 'Джормунтид (Jormuntide)',
      coords: '[-176, -268]',
      teleport: 'Телепорт «Развилка у водопада»',
      desc: 'Огромное центральное озеро. Водный змей плавает в центре воды. Босс 45 уровня.',
      searchQuery: 'Jormuntide',
      cx: 310, cy: 270,
      icon: '💧'
    },
    'Джормунтид Игнис': {
      name: 'Джормунтид Игнис (Jormuntide Ignis)',
      coords: '[-660, -115]',
      teleport: 'Заповедник дикой природы №2 (Запад вулкана)',
      desc: 'Остров-заповедник в океане. Также вылупляется из Огромных драконьих яиц на вулкане.',
      searchQuery: 'Jormuntide Ignis',
      cx: 580, cy: 140,
      icon: '🔥'
    },
    'Орсерк': {
      name: 'Орсерк (Orserk)',
      coords: '[655, 625]',
      teleport: 'Заповедник дикой природы №3 (Северо-восток)',
      desc: 'Остров-заповедник в дальнем северо-восточном океане. Либо через разведение Дивинольв + Мерзитая.',
      searchQuery: 'Orserk',
      cx: 230, cy: 450,
      icon: '⚡'
    },
    'Астогон': {
      name: 'Астогон (Astegon)',
      coords: '[-578, -421]',
      teleport: 'Телепорт «Разрушенная шахта вулкана»',
      desc: 'Внутри темной пещеры в жерле вулкана. Босс 48 уровня.',
      searchQuery: 'Astegon',
      cx: 560, cy: 120,
      icon: '🖤'
    },
    'Лилин': {
      name: 'Лилин (Lyleen)',
      coords: '[660, 620]',
      teleport: 'Заповедник дикой природы №3 (Северо-восток)',
      desc: 'Остров в океане на северо-востоке карты. Пал-садовод высшего класса.',
      searchQuery: 'Lyleen',
      cx: 240, cy: 440,
      icon: '🌸'
    },
    'Гриззболт': {
      name: 'Гриззболт (Grizzbolt)',
      coords: '[90, -720]',
      teleport: 'Заповедник дикой природы №1 (Юг океана)',
      desc: 'Южный изолированный остров. Также босс первой Башни Синдиката Рейн.',
      searchQuery: 'Grizzbolt',
      cx: 350, cy: 460,
      icon: '⚡'
    },
    'Шэдоубик': {
      name: 'Шэдоубик (Shadowbeak)',
      coords: '[660, 630]',
      teleport: 'Заповедник дикой природы №3 (Северо-восток)',
      desc: 'Заповедник в океане. Также босс 5-й башни Виктора.',
      searchQuery: 'Shadowbeak',
      cx: 245, cy: 455,
      icon: '🦅'
    },
    'Беллануар': {
      name: 'Беллануар (Bellanoir)',
      coords: 'База игрока (Алтарь призыва)',
      teleport: 'Алтарь призыва на вашей базе',
      desc: 'Призывается с помощью Плиты Беллануар, фрагменты которой добываются в сундуках подземелий.',
      searchQuery: 'Bellanoir',
      cx: 350, cy: 280,
      icon: '🔮'
    },
    'Беллануар Либеро': {
      name: 'Беллануар Либеро (Bellanoir Libero)',
      coords: 'База игрока (Алтарь призыва)',
      teleport: 'Алтарь призыва на вашей базе',
      desc: 'Рейд-босс 50 уровня с 450,000 HP. Плита собирается в высокоуровневых данжах Астральных гор и Вулкана.',
      searchQuery: 'Bellanoir Libero',
      cx: 350, cy: 280,
      icon: '👑'
    },
    'Балзам': {
      name: 'Балзам (Bushi)',
      coords: '[-116, -491]',
      teleport: 'Телепорт «Царство мечника»',
      desc: 'Опечатанное царство мечника, босс 23 уровня.',
      searchQuery: 'Bushi',
      cx: 330, cy: 340,
      icon: '⚔️'
    },
    'Бигарде': {
      name: 'Бигарде (Beegarde)',
      coords: '[30, -320]',
      teleport: 'Телепорт «Лес башни Лилли»',
      desc: 'Холмы вокруг башни Лилли, летают группами с Элизаби.',
      searchQuery: 'Beegarde',
      cx: 260, cy: 360,
      icon: '🐝'
    },
    'Вумпо': {
      name: 'Вумпо (Wumpo)',
      coords: '[-120, 480]',
      teleport: 'Телепорт «Снежные хребты Астральных гор»',
      desc: 'Северные снежные поля и леса.',
      searchQuery: 'Wumpo',
      cx: 160, cy: 110,
      icon: '❄️'
    },
    'Дивинольв': {
      name: 'Дивинольв (Dinossom)',
      coords: '[80, -500]',
      teleport: 'Плато начинаний (Начальные луга)',
      desc: 'Бродит по холмам возле стартовой локации.',
      searchQuery: 'Dinossom',
      cx: 340, cy: 320,
      icon: '🦕'
    },
    'Мерзитая': {
      name: 'Мерзитая (Cinnamoth)',
      coords: '[30, -290]',
      teleport: 'Лес башни Лилли (Холмы)',
      desc: 'Летает среди цветов в центральных лесах.',
      searchQuery: 'Cinnamoth',
      cx: 280, cy: 330,
      icon: '🦋'
    },
    'Кельпсей Игнис': {
      name: 'Кельпсей Игнис (Kelpsea Ignis)',
      coords: '[-540, -480]',
      teleport: 'Пляж вулкана (Гора Обсидиан)',
      desc: 'Лавовые побережья и горячие источники на юге вулкана.',
      searchQuery: 'Kelpsea Ignis',
      cx: 520, cy: 160,
      icon: '🔥'
    },
    'Горм': {
      name: 'Горм (Gorirat)',
      coords: '[-100, -350]',
      teleport: 'Холмы исследователей',
      desc: 'Густые бамбуковые рощи и скалы центра острова.',
      searchQuery: 'Gorirat',
      cx: 290, cy: 290,
      icon: '🦍'
    }
  };

  function buildMap() {
    const sec = qs('#map');
    sec.innerHTML = `
      <div class="section-header">
        <h2>📍 Интерактивная карта Palworld</h2>
        <p>Официальная подробная карта MapGenie со всеми сундуками, боссами, статуями и точками телепорта</p>
      </div>

      <!-- Карточка выбранной цели на карте -->
      <div id="mapTargetSpotlight" style="display:none;margin-bottom:20px"></div>

      <!-- Переключатель режимов карты -->
      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center">
        <button class="sub-tab active" id="mapGenieTabBtn" onclick="window._setMapMode('mapgenie')">🗺️ Интерактивная карта MapGenie</button>
        <button class="sub-tab" id="mapSchematicTabBtn" onclick="window._setMapMode('schematic')">🧭 GPS-навигатор & Координаты (30+ точек)</button>
        <a href="https://mapgenie.io/palworld/maps/palpagos-islands" target="_blank" rel="noopener noreferrer" class="sub-tab" style="margin-left:auto;text-decoration:none;display:inline-flex;align-items:center;gap:6px;color:var(--accent)">
          ↗ Открыть на MapGenie.io
        </a>
      </div>

      <!-- 1. MAPGENIE INTERACTIVE EMBED -->
      <div id="mapGenieWrap" style="margin-bottom:24px">
        <div style="border:1px solid var(--border);border-radius:12px;overflow:hidden;background:#0d1117;box-shadow:0 4px 20px rgba(0,0,0,0.4)">
          <div style="padding:10px 14px;background:var(--bg3);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:12.5px;color:var(--text2)">
            <div style="display:flex;align-items:center;gap:6px">
              <span style="color:#10b981">●</span> <strong>MapGenie: Palpagos Islands</strong> — Сундуки, данжи, боссы, статуи Лифмунка, яйца, торговцы
            </div>
            <div style="font-size:11.5px">💡 Зум: колесо мыши / сжатие пальцами</div>
          </div>
          <iframe 
            src="https://mapgenie.io/palworld/maps/palpagos-islands?embed=dark" 
            style="width:100%;height:750px;min-height:550px;max-height:85vh;border:none;display:block;background:#111" 
            allowfullscreen 
            loading="lazy">
          </iframe>
        </div>
      </div>

      <!-- 2. НАВИГАТОР ПО КООРДИНАТАМ И ТЕЛЕПОРТАМ -->
      <div id="mapSchematicWrap" style="display:none">
        <div class="info-box">
          🧭 <strong>GPS-навигатор Палпагоса:</strong> Быстрый поиск точных координат, точек быстрого перемещения (телепортов) и ориентиров на местности для всех ключевых боссов, шахт и торговцев.
        </div>

        <!-- Поиск по точкам -->
        <div style="margin-bottom:14px">
          <input type="search" id="gpsSearchInput" placeholder="🔍 Найти босса, шахту или локацию (например: Анубис, Уголь, Вулкан, Башня)..." 
            style="width:100%;padding:12px 16px;border-radius:10px;background:var(--bg2);border:1px solid var(--border);color:var(--text);font-size:14px"
            oninput="window._filterGpsLocations(this.value)">
        </div>

        <!-- Категории точек -->
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">
          <button class="sub-tab active" data-mf="all" onclick="window._mapFilter(this,'all')">Все точки</button>
          <button class="sub-tab" data-mf="legendary" onclick="window._mapFilter(this,'legendary')">👑 Боссы и Легендарки</button>
          <button class="sub-tab" data-mf="merchant" onclick="window._mapFilter(this,'merchant')">🛒 Все торговцы</button>
          <button class="sub-tab" data-mf="tower" onclick="window._mapFilter(this,'tower')">🗼 Башни синдикатов</button>
          <button class="sub-tab" data-mf="ore" onclick="window._mapFilter(this,'ore')">⛏️ Залежи руды и угля</button>
          <button class="sub-tab" data-mf="dungeon" onclick="window._mapFilter(this,'dungeon')">🚪 Подземелья</button>
        </div>

        <!-- Список локаций в виде аккуратных карточек с координатами -->
        <div id="mapList" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px"></div>
      </div>
    `;

    renderMapList('all');
  }

  window._setMapMode = function(mode) {
    const isGenie = mode === 'mapgenie';
    const genieWrap = qs('#mapGenieWrap');
    const schematicWrap = qs('#mapSchematicWrap');
    const genieBtn = qs('#mapGenieTabBtn');
    const schematicBtn = qs('#mapSchematicTabBtn');

    if (genieWrap) genieWrap.style.display = isGenie ? 'block' : 'none';
    if (schematicWrap) schematicWrap.style.display = isGenie ? 'none' : 'block';
    if (genieBtn) genieBtn.classList.toggle('active', isGenie);
    if (schematicBtn) schematicBtn.classList.toggle('active', !isGenie);
  };

  let activeGpsFilter = 'all';
  let activeGpsSearch = '';

  window._mapFilter = function(btn, f) {
    qsa('[data-mf]').forEach(b => b.classList.toggle('active', b.dataset.mf === f));
    activeGpsFilter = f;
    renderMapList(activeGpsFilter);
  };

  window._filterGpsLocations = function(q) {
    activeGpsSearch = q.toLowerCase().trim();
    renderMapList(activeGpsFilter);
  };

  function renderMapList(filter) {
    const list = qs('#mapList');
    if (!list) return;
    // Собираем расширенный список всех точек Палпагоса
    const items = [];

    // 1. Альфа-боссы и Легендарки из TARGET_LOCATIONS
    Object.entries(TARGET_LOCATIONS).forEach(([name, data]) => {
      items.push({
        id: 'tgt_' + name,
        name: data.name || name,
        type: 'legendary',
        coords: data.coords,
        teleport: data.teleport,
        desc: data.desc,
        searchQuery: data.searchQuery || name,
        icon: data.icon || '👑',
        color: '#ffd700'
      });
    });

    // 2. Торговцы из MERCHANTS_DATA
    if (typeof MERCHANTS_DATA !== 'undefined') {
      MERCHANTS_DATA.forEach(m => {
        items.push({
          id: m.id,
          name: m.name,
          type: 'merchant',
          coords: m.coords,
          teleport: m.fastTravel,
          desc: m.desc + ' ' + m.location,
          searchQuery: m.location,
          icon: m.type === 'red' ? '🔴' : m.type === 'blue' ? '🔵' : '🏴‍☠️',
          color: '#10b981'
        });
      });
    }

    // 3. Башни, шахты и данжи из DATA_EXT.mapLocations
    if (typeof DATA_EXT !== 'undefined' && DATA_EXT.mapLocations) {
      DATA_EXT.mapLocations.forEach(ml => {
        if (ml.type === 'tower' || ml.type === 'ore' || ml.type === 'dungeon') {
          items.push({
            id: ml.id,
            name: ml.name,
            type: ml.type,
            coords: ml.type === 'tower' ? 'Башня с боссом' : 'Месторождение региона',
            teleport: ml.desc,
            desc: ml.desc,
            searchQuery: ml.name,
            icon: ml.icon,
            color: TYPE_COLORS[ml.type] || '#f59e0b'
          });
        }
      });
    }

    // Фильтрация
    const filtered = items.filter(it => {
      const matchCat = (filter === 'all') || (it.type === filter);
      if (!matchCat) return false;
      if (!activeGpsSearch) return true;
      return it.name.toLowerCase().includes(activeGpsSearch) ||
             it.desc.toLowerCase().includes(activeGpsSearch) ||
             (it.teleport && it.teleport.toLowerCase().includes(activeGpsSearch)) ||
             (it.coords && it.coords.toLowerCase().includes(activeGpsSearch));
    });

    if (!filtered.length) {
      list.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:36px;color:var(--text2);background:var(--bg2);border-radius:12px;border:1px dashed var(--border)">
          <div style="font-size:28px;margin-bottom:6px">🧭</div>
          <div style="font-weight:700">Локации не найдены</div>
          <div style="font-size:12px;margin-top:4px">Попробуйте изменить категорию или поисковый запрос</div>
        </div>
      `;
      return;
    }

    list.innerHTML = filtered.map(it => `
      <div class="card" style="border-top:3px solid ${it.color};display:flex;flex-direction:column;justify-content:space-between;padding:14px">
        <div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px">
            <div style="display:flex;align-items:center;gap:8px;min-width:0">
              <span style="font-size:20px">${it.icon}</span>
              <strong style="font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${it.name}</strong>
            </div>
            <span class="badge" style="background:${it.color}22;color:${it.color};font-size:10.5px;white-space:nowrap">
              ${TYPE_LABELS[it.type] || it.type}
            </span>
          </div>

          <div style="background:var(--bg3);padding:8px 10px;border-radius:6px;border:1px solid var(--border);margin-bottom:8px">
            <div style="font-size:10.5px;color:var(--text2);text-transform:uppercase;font-weight:700">Координаты в игре:</div>
            <div style="font-size:14px;font-weight:800;color:#ffd700;margin-top:1px">${it.coords}</div>
          </div>

          <div style="font-size:11.5px;color:var(--text2);margin-bottom:6px">
            ⚡ <strong>Телепорт:</strong> <span style="color:var(--text)">${it.teleport}</span>
          </div>
          <div style="font-size:12px;color:var(--text);line-height:1.4">${it.desc}</div>
        </div>

        <div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06)">
          <button class="sub-tab active" style="width:100%;padding:7px 10px;font-size:12px;display:flex;align-items:center;justify-content:center;gap:6px" 
            onclick="window._jumpToMap('${it.name.split(' (')[0]}')">
            🎯 Показать в фокусе карты →
          </button>
        </div>
      </div>
    `).join('');
  }

  // ─── ФОКУСИРОВКА НА ЦЕЛИ КАРТЫ ─────────────────────────────
  window._jumpToMap = function(targetName) {
    if (typeof window.closePalModal === 'function') window.closePalModal();
    if (typeof window.switchAllExtended === 'function') {
      window.switchAllExtended('map');
    }

    const spotlight = qs('#mapTargetSpotlight');
    if (!spotlight || !targetName) return;

    // Ищем в словаре локаций TARGET_LOCATIONS
    let loc = TARGET_LOCATIONS[targetName];

    // Ищем в MERCHANTS_DATA
    if (!loc && typeof MERCHANTS_DATA !== 'undefined') {
      const m = MERCHANTS_DATA.find(x => x.name === targetName || targetName.includes(x.name) || x.name.includes(targetName));
      if (m) {
        loc = {
          name: m.name,
          coords: m.coords,
          teleport: m.fastTravel,
          desc: m.desc + ' — ' + m.location,
          searchQuery: m.location,
          cx: m.type === 'red' ? 340 : m.type === 'blue' ? 342 : 320,
          cy: 330,
          icon: m.type === 'red' ? '🔴' : m.type === 'blue' ? '🔵' : '🏴‍☠️'
        };
      }
    }

    // Ищем в PAL_DETAILS
    if (!loc && typeof PAL_DETAILS !== 'undefined' && PAL_DETAILS[targetName]) {
      const p = PAL_DETAILS[targetName];
      loc = {
        name: `${targetName} (${p.eng || ''})`,
        coords: 'Указаны в описании биома',
        teleport: p.habitat || 'Локации обитания',
        desc: p.habitat || 'Обитает в дикой природе Палпагоса',
        searchQuery: p.eng || targetName,
        cx: 350,
        cy: 250,
        icon: '🐾'
      };
    }

    // Фоллбэк
    if (!loc) {
      loc = {
        name: targetName,
        coords: 'Смотрите координаты ниже',
        teleport: 'Ближайший телепорт региона',
        desc: `Местоположение цели «${targetName}»`,
        searchQuery: targetName,
        cx: 350,
        cy: 250,
        icon: '📍'
      };
    }

    const engSearch = loc.searchQuery || targetName;
    const mapGenieSearchUrl = `https://mapgenie.io/palworld/maps/palpagos-islands?search=${encodeURIComponent(engSearch)}`;

    spotlight.innerHTML = `
      <div style="background:linear-gradient(135deg,rgba(230,126,34,0.22),rgba(16,185,129,0.15));border:2px solid var(--accent);border-radius:14px;padding:18px 20px;box-shadow:0 6px 24px rgba(230,126,34,0.3)">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="font-size:30px;background:var(--bg3);width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);box-shadow:0 2px 8px rgba(0,0,0,0.3);flex-shrink:0">
              ${loc.icon || '📍'}
            </div>
            <div>
              <div style="font-size:11px;text-transform:uppercase;color:var(--accent);font-weight:800;letter-spacing:.8px">
                🎯 Выбранная цель на карте
              </div>
              <div style="font-size:19px;font-weight:800;color:var(--text)">
                ${loc.name}
              </div>
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="sub-tab active" onclick="window._setMapMode('schematic'); window._filterGpsLocations('${loc.name.split(' (')[0]}');" style="font-size:12.5px;padding:8px 14px">
              🧭 Найти в GPS-каталоге
            </button>
            <button class="sub-tab" onclick="document.getElementById('mapTargetSpotlight').style.display='none'" style="font-size:12px;padding:8px 12px">
              ✕ Закрыть
            </button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.08)">
          <div style="background:var(--bg3);padding:10px 14px;border-radius:8px;border:1px solid var(--border)">
            <div style="font-size:11px;color:var(--text2);text-transform:uppercase;font-weight:700">🗺️ Внутриигровые координаты:</div>
            <div style="font-size:17px;font-weight:800;color:#ffd700;margin-top:2px;letter-spacing:0.5px">
              ${loc.coords}
            </div>
          </div>
          <div style="background:var(--bg3);padding:10px 14px;border-radius:8px;border:1px solid var(--border)">
            <div style="font-size:11px;color:var(--text2);text-transform:uppercase;font-weight:700">⚡ Ближайшая точка телепорта:</div>
            <div style="font-size:13.5px;font-weight:700;color:var(--text);margin-top:2px">
              ${loc.teleport}
            </div>
          </div>
        </div>

        <div style="margin-top:12px;font-size:13px;color:var(--text);line-height:1.5;background:rgba(0,0,0,0.25);padding:10px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.05)">
          📍 <strong>Ориентиры на местности:</strong> ${loc.desc}
        </div>

        <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <a href="${mapGenieSearchUrl}" target="_blank" rel="noopener noreferrer" class="sub-tab" style="background:var(--bg3);color:var(--accent);text-decoration:none;display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;padding:9px 16px;border-color:var(--accent);border-radius:8px">
            🔍 Найти «${engSearch}» на карте MapGenie.io ↗
          </a>
          <span style="font-size:12px;color:var(--text2)">💡 Откроет интерактивную карту с точной локацией</span>
        </div>
      </div>
    `;
    spotlight.style.display = 'block';
    setTimeout(() => {
      spotlight.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  window._jumpToMapSpotlight = window._jumpToMap;

  // ══════════════════════════════════════════════════════════
  //  3. КАЛЬКУЛЯТОР ЕДЫ
  // ══════════════════════════════════════════════════════════
  function buildFoodCalc() {
    const sec = qs('#food-calc');
    sec.innerHTML = `
      <div class="section-header">
        <h2>🍽️ Калькулятор еды</h2>
        <p>Подбери оптимальную еду для палов по твоей цели</p>
      </div>

      <div style="margin-bottom:20px">
        <div style="font-size:13px;color:var(--text2);margin-bottom:8px">Цель:</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="sub-tab active" onclick="window._foodGoal(this,'work')">⚡ Максимальная работа</button>
          <button class="sub-tab" onclick="window._foodGoal(this,'san')">💚 Восстановление SAN</button>
          <button class="sub-tab" onclick="window._foodGoal(this,'atk')">⚔️ Атака</button>
          <button class="sub-tab" onclick="window._foodGoal(this,'def')">🛡️ Защита</button>
          <button class="sub-tab" onclick="window._foodGoal(this,'auto')">🤖 Автоматизируемое</button>
          <button class="sub-tab" onclick="window._foodGoal(this,'all')">📋 Все продукты</button>
        </div>
      </div>

      <div id="foodGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px"></div>
    `;

    renderFoodCalc('work');
  }

  window._foodGoal = function(btn, goal) {
    qsa('#food-calc .sub-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.foodGoal = goal;
    renderFoodCalc(goal);
  };

  function renderFoodCalc(goal) {
    const grid = qs('#foodGrid');
    if (!grid) return;

    let foods = [...DATA_EXT.foods];

    if (goal === 'work') foods = foods.filter(f => f.workSpeed > 0).sort((a,b) => b.workSpeed - a.workSpeed);
    else if (goal === 'san')  foods = foods.sort((a,b) => b.san - a.san);
    else if (goal === 'atk')  foods = foods.filter(f => f.atkBonus > 0).sort((a,b) => b.atkBonus - a.atkBonus);
    else if (goal === 'def')  foods = foods.filter(f => f.defBonus > 0).sort((a,b) => b.defBonus - a.defBonus);
    else if (goal === 'auto') foods = foods.filter(f => f.automate).sort((a,b) => b.workSpeed - a.workSpeed);
    else foods.sort((a,b) => b.nutrition - a.nutrition);

    if (!foods.length) {
      grid.innerHTML = '<div class="no-results"><div class="icon">🍽️</div><p>Нет блюд для выбранной цели</p></div>';
      return;
    }

    grid.innerHTML = foods.map(f => {
      const diffColors = ['', '#10b981', '#f0c332', '#f59e0b', '#ef4444', '#a855f7'];
      const diffLabels = ['', 'Очень легко', 'Легко', 'Средне', 'Сложно', 'Хардкор'];
      return `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:16px;transition:.18s" class="pal-card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <span style="font-size:28px">${f.icon}</span>
          <div>
            <div style="font-weight:700;font-size:15px">${f.name}</div>
            <div style="font-size:11px;color:${diffColors[f.difficulty]}">● ${diffLabels[f.difficulty]}</div>
          </div>
          ${f.automate ? '<span style="margin-left:auto;font-size:11px;background:rgba(16,185,129,.15);color:#10b981;border:1px solid rgba(16,185,129,.3);padding:2px 8px;border-radius:12px">Авто</span>' : ''}
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">
          ${foodStat('🍖 Сытость', f.nutrition, 250)}
          ${foodStat('💚 SAN', f.san, 30)}
          ${foodStat('⚡ Работа', f.workSpeed, 50, '%')}
        </div>

        ${f.atkBonus ? `<div style="margin-bottom:8px"><span class="badge badge-advanced">⚔️ Атака +${f.atkBonus}%</span></div>` : ''}
        ${f.defBonus ? `<div style="margin-bottom:8px"><span class="badge badge-intermediate">🛡️ Защита +${f.defBonus}%</span></div>` : ''}
        ${f.effect ? `<div style="font-size:12px;color:var(--accent3);margin-bottom:8px">✨ ${f.effect}</div>` : ''}

        <div style="background:var(--bg3);border-radius:6px;padding:8px 10px;font-size:12px;color:var(--text2)">
          📋 <strong>Рецепт:</strong> ${f.recipe}
        </div>
      </div>`;
    }).join('');
  }

  function foodStat(label, val, max, suffix='') {
    const pct = Math.min(100, (val / max) * 100);
    const color = pct > 70 ? '#10b981' : pct > 40 ? '#f0c332' : '#6b7280';
    return `
    <div>
      <div style="font-size:10px;color:var(--text2);margin-bottom:3px">${label}</div>
      <div style="background:var(--bg4);border-radius:4px;height:6px;overflow:hidden;margin-bottom:3px">
        <div style="height:100%;width:${pct}%;background:${color};border-radius:4px"></div>
      </div>
      <div style="font-size:12px;font-weight:600">${val}${suffix}</div>
    </div>`;
  }

  // ══════════════════════════════════════════════════════════
  //  4. ПЛАНИРОВЩИК БАЗЫ
  // ══════════════════════════════════════════════════════════
  const BUILDINGS = [
    { id: 'workbench', name: 'Верстак',        w: 2, h: 2, color: '#6b7280', emoji: '🔨' },
    { id: 'feedbox',   name: 'Кормушка',        w: 1, h: 2, color: '#10b981', emoji: '🍖' },
    { id: 'hotspring', name: 'Горячий источник',w: 2, h: 2, color: '#3b82f6', emoji: '♨️' },
    { id: 'chest',     name: 'Сундук',          w: 1, h: 1, color: '#92400e', emoji: '📦' },
    { id: 'ranch',     name: 'Ранчо',           w: 3, h: 3, color: '#d97706', emoji: '🐄' },
    { id: 'breeding',  name: 'Ферма разведения',w: 3, h: 2, color: '#ec4899', emoji: '🧬' },
    { id: 'power',     name: 'Электростанция',  w: 2, h: 2, color: '#eab308', emoji: '⚡' },
    { id: 'monitor',   name: 'Стойка монит.',   w: 1, h: 1, color: '#f59e0b', emoji: '📋' },
    { id: 'medical',   name: 'Медстанция',      w: 2, h: 2, color: '#e2e8f0', emoji: '💊' },
  ];

  const GRID_W = 20, GRID_H = 15, CELL = 36;
  let bpGrid = [];     // [row][col] = buildingId or null
  let bpPlaced = [];   // [{bid, r, c, w, h, id}]
  let bpSelected = null;
  let bpIdCounter = 0;

  function buildBasePlanner() {
    const sec = qs('#base-planner');

    const sidebar = BUILDINGS.map(b => `
      <div class="bp-item" data-bid="${b.id}" style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px 12px;cursor:pointer;display:flex;align-items:center;gap:8px;transition:.18s" onclick="window._bpSelect('${b.id}')">
        <span style="font-size:20px">${b.emoji}</span>
        <div>
          <div style="font-size:13px;font-weight:600">${b.name}</div>
          <div style="font-size:11px;color:var(--text2)">${b.w}×${b.h} клетки</div>
        </div>
      </div>
    `).join('');

    sec.innerHTML = `
      <div class="section-header">
        <h2>🏗️ Планировщик базы</h2>
        <p>Визуальная расстановка зданий. ЛКМ — поставить, ПКМ — убрать здание</p>
      </div>
      <div class="tip-box">🎯 Выбери здание слева → кликни на сетку для размещения. Правый клик убирает здание. Цель — минимизировать расстояния транспортировки.</div>

      <div class="bp-container-flex">
        <!-- Сайдбар зданий -->
        <div style="width:220px;flex-shrink:0">
          <div style="font-size:12px;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Здания</div>
          <div id="bpSidebar" style="display:flex;flex-direction:column;gap:6px">${sidebar}</div>
          <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border)">
            <button id="bpEraseBtn" onclick="window._bpToggleErase()" style="width:100%;margin-bottom:8px;background:var(--bg3);border:1px solid var(--border);color:var(--text2);border-radius:6px;padding:9px;cursor:pointer;font-size:13px">🧹 Режим ластика: ВЫКЛ</button>
            <button onclick="window._bpClear()" style="width:100%;background:rgba(248,81,73,.12);border:1px solid rgba(248,81,73,.3);color:#f85149;border-radius:6px;padding:9px;cursor:pointer;font-size:13px">🗑️ Очистить всё</button>
          </div>
          <div id="bpStats" style="margin-top:12px;font-size:12px;color:var(--text2)"></div>
        </div>

        <!-- Сетка -->
        <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;flex:1;max-width:100%">
          <div id="bpGridWrap" style="position:relative;display:inline-block;border:1px solid var(--border);border-radius:8px;overflow:hidden;cursor:crosshair">
            <canvas id="bpCanvas" width="${GRID_W * CELL}" height="${GRID_H * CELL}"></canvas>
          </div>
          <div style="font-size:11px;color:var(--text2);margin-top:8px">Размер базы: ${GRID_W}×${GRID_H} клеток • 👆 На мобильном сдвигайте сетку пальцем</div>
        </div>
      </div>
    `;

    // Инициализация сетки
    bpGrid = Array.from({ length: GRID_H }, () => new Array(GRID_W).fill(null));
    bpPlaced = [];
    bpSelected = null;

    const canvas = qs('#bpCanvas');
    canvas.addEventListener('click', bpHandleClick);
    canvas.addEventListener('contextmenu', e => { e.preventDefault(); bpHandleRightClick(e); });

    bpDraw();
  }

  window._bpSelect = function(bid) {
    bpSelected = bid;
    qsa('.bp-item').forEach(el => {
      el.style.borderColor = el.dataset.bid === bid ? 'var(--accent)' : 'var(--border)';
      el.style.background  = el.dataset.bid === bid ? 'rgba(230,126,34,.1)' : 'var(--bg3)';
    });
  };

  window._bpClear = function() {
    bpGrid = Array.from({ length: GRID_H }, () => new Array(GRID_W).fill(null));
    bpPlaced = [];
    bpDraw();
    updateBpStats();
  };

  let bpEraseMode = false;
  window._bpToggleErase = function() {
    bpEraseMode = !bpEraseMode;
    const btn = qs('#bpEraseBtn');
    if (btn) {
      btn.textContent = bpEraseMode ? '🧹 Режим ластика: ВКЛ' : '🧹 Режим ластика: ВЫКЛ';
      btn.style.background = bpEraseMode ? 'rgba(239,68,68,0.2)' : 'var(--bg3)';
      btn.style.borderColor = bpEraseMode ? 'var(--danger)' : 'var(--border)';
      btn.style.color = bpEraseMode ? '#f85149' : 'var(--text2)';
    }
  };

  function bpHandleClick(e) {
    if (bpEraseMode) {
      bpHandleRightClick(e);
      return;
    }
    if (!bpSelected) return;
    const b = BUILDINGS.find(b => b.id === bpSelected);
    if (!b) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / CELL);
    const row = Math.floor((e.clientY - rect.top) / CELL);

    if (col + b.w > GRID_W || row + b.h > GRID_H) return;

    // Проверка коллизий
    for (let r = row; r < row + b.h; r++)
      for (let c = col; c < col + b.w; c++)
        if (bpGrid[r][c]) return;

    const uid = ++bpIdCounter;
    for (let r = row; r < row + b.h; r++)
      for (let c = col; c < col + b.w; c++)
        bpGrid[r][c] = uid;

    bpPlaced.push({ bid: b.id, r: row, c: col, w: b.w, h: b.h, uid });
    bpDraw();
    updateBpStats();
  }

  function bpHandleRightClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / CELL);
    const row = Math.floor((e.clientY - rect.top) / CELL);
    if (row < 0 || row >= GRID_H || col < 0 || col >= GRID_W) return;
    const uid = bpGrid[row][col];
    if (!uid) return;

    const idx = bpPlaced.findIndex(p => p.uid === uid);
    if (idx === -1) return;
    const p = bpPlaced[idx];
    for (let r = p.r; r < p.r + p.h; r++)
      for (let c = p.c; c < p.c + p.w; c++)
        bpGrid[r][c] = null;

    bpPlaced.splice(idx, 1);
    bpDraw();
    updateBpStats();
  }

  function bpDraw() {
    const canvas = qs('#bpCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = GRID_W * CELL, H = GRID_H * CELL;

    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    // Сетка
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let r = 0; r <= GRID_H; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(W, r * CELL); ctx.stroke();
    }
    for (let c = 0; c <= GRID_W; c++) {
      ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, H); ctx.stroke();
    }

    // Здания
    bpPlaced.forEach(p => {
      const b = BUILDINGS.find(b => b.id === p.bid);
      if (!b) return;
      const x = p.c * CELL, y = p.r * CELL;
      const bw = p.w * CELL, bh = p.h * CELL;

      ctx.fillStyle = b.color + '33';
      ctx.fillRect(x + 1, y + 1, bw - 2, bh - 2);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, bw - 2, bh - 2);

      ctx.font = `${Math.min(22, Math.min(bw, bh) * 0.5)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(b.emoji, x + bw / 2, y + bh / 2);
    });
  }

  function updateBpStats() {
    const statsEl = qs('#bpStats');
    if (!statsEl) return;
    const counts = {};
    bpPlaced.forEach(p => { counts[p.bid] = (counts[p.bid] || 0) + 1; });
    const lines = Object.entries(counts).map(([bid, n]) => {
      const b = BUILDINGS.find(b => b.id === bid);
      return `${b.emoji} ${b.name}: <strong>${n}</strong>`;
    });
    statsEl.innerHTML = lines.length
      ? '<div style="font-size:12px;color:var(--text2);margin-bottom:6px">Размещено:</div>' + lines.map(l => `<div style="margin-bottom:4px">${l}</div>`).join('')
      : '';
  }

  // ══════════════════════════════════════════════════════════
  //  5. ДЕРЕВО ТЕХНОЛОГИЙ
  // ══════════════════════════════════════════════════════════
  const CAT_COLORS = {
    'Крафт':     '#f59e0b',
    'Еда':       '#10b981',
    'База':      '#3b82f6',
    'Поимка':    '#a855f7',
    'Разведение':'#ec4899',
    'Прокачка':  '#ef4444',
    'Выживание': '#6b7280',
    'Рейды':     '#ffd700',
  };

  function buildTechTree() {
    const sec = qs('#tech-tree');
    const cats = [...new Set(DATA_EXT.techTree.map(t => t.cat))];

    sec.innerHTML = `
      <div class="section-header">
        <h2>📊 Дерево технологий</h2>
        <p>Приоритеты изучения — от старта до эндгейма. Кликай для отметки изученного.</p>
      </div>
      <div class="tip-box">💡 Кликни на технологию чтобы отметить её как изученную. Прогресс сохраняется в браузере.</div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px">
        <button class="sub-tab active" onclick="window._techFilter(this,'all')">Все</button>
        ${cats.map(c => `<button class="sub-tab" onclick="window._techFilter(this,'${c}')" style="border-left:3px solid ${CAT_COLORS[c]||'#666'}">${c}</button>`).join('')}
      </div>

      <div id="techGrid"></div>

      <div style="margin-top:16px;display:flex;gap:16px;font-size:12px;color:var(--text2);flex-wrap:wrap">
        <span>🟠 Высокий приоритет</span>
        <span>🔵 Средний приоритет</span>
        <span>⚫ Низкий приоритет</span>
        <span>✅ Изучено</span>
      </div>
    `;

    renderTechGrid('all');
  }

  window._techFilter = function(btn, cat) {
    qsa('#tech-tree .sub-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.techFilter = cat;
    renderTechGrid(cat);
  };

  function renderTechGrid(cat) {
    const grid = qs('#techGrid');
    if (!grid) return;

    const tiers = [1, 2, 3, 4, 5];
    const tierNames = ['Tier 1: Уровень 1–5', 'Tier 2: Уровень 6–15', 'Tier 3: Уровень 16–25', 'Tier 4: Уровень 26–40', 'Tier 5: Уровень 41+'];

    grid.innerHTML = tiers.map((tier, ti) => {
      const items = DATA_EXT.techTree.filter(t => t.tier === tier && (cat === 'all' || t.cat === cat));
      if (!items.length) return '';
      return `
        <div style="margin-bottom:24px">
          <div style="font-size:13px;font-weight:700;color:var(--text2);margin-bottom:12px;text-transform:uppercase;letter-spacing:.5px">
            ${tierNames[ti]}
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">
            ${items.map(t => {
              const learned = !!state.techLearned[t.id];
              const pColor = t.priority === 'high' ? 'var(--accent)' : t.priority === 'medium' ? 'var(--accent2)' : 'var(--text2)';
              const catColor = CAT_COLORS[t.cat] || '#666';
              return `
              <div class="tech-node" data-tid="${t.id}" onclick="window._techToggle('${t.id}')" style="
                background:${learned ? 'rgba(16,185,129,.1)' : 'var(--bg2)'};
                border:1px solid ${learned ? '#10b981' : 'var(--border)'};
                border-left:3px solid ${catColor};
                border-radius:8px;padding:12px;cursor:pointer;transition:.18s;position:relative
              ">
                ${learned ? '<span style="position:absolute;top:8px;right:8px;color:#10b981;font-size:14px">✅</span>' : ''}
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
                  <span style="font-size:8px;color:${pColor}">●</span>
                  <strong style="font-size:13px">${t.name}</strong>
                </div>
                <div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap">
                  <span style="font-size:11px;background:var(--bg3);border:1px solid var(--border);padding:1px 7px;border-radius:4px;color:var(--accent)">Ур.${t.level}</span>
                  <span style="font-size:11px;background:var(--bg3);border:1px solid var(--border);padding:1px 7px;border-radius:4px;color:var(--text2)">${t.pts} очк.</span>
                  <span style="font-size:11px;padding:1px 7px;border-radius:4px;color:${catColor};background:${catColor}22">${t.cat}</span>
                </div>
                <div style="font-size:12px;color:var(--text2);line-height:1.5">${t.tip}</div>
              </div>`;
            }).join('')}
          </div>
        </div>`;
    }).join('');
  }

  window._techToggle = function(id) {
    state.techLearned[id] = !state.techLearned[id];
    if (!state.techLearned[id]) delete state.techLearned[id];
    localStorage.setItem('pw_tech', JSON.stringify(state.techLearned));
    renderTechGrid(state.techFilter);
  };

  // ══════════════════════════════════════════════════════════
  //  6. ГАЙДЫ ПО БОССАМ
  // ══════════════════════════════════════════════════════════
  const DANGER_COLORS = { low: '#10b981', medium: '#f0c332', high: '#ef4444', critical: '#a855f7' };
  const DANGER_LABELS = { low: 'Слабая', medium: 'Средняя', high: 'Высокая', critical: '☠️ Смертельно' };

  function buildBosses() {
    const sec = qs('#bosses');
    sec.innerHTML = `
      <div class="section-header">
        <h2>🎯 Гайды по боссам башен</h2>
        <p>Слабости, атаки, тактика и лучшие контр-палы для каждой башни</p>
      </div>
      <div class="warn-box">⏱️ Лимит времени на бой в башне: <strong>5 минут</strong>. Не тяни — атакуй непрерывно!</div>
      <div id="bossCards" style="display:flex;flex-direction:column;gap:16px"></div>
    `;

    qs('#bossCards').innerHTML = DATA_EXT.bosses.map(b => renderBossCard(b)).join('');
  }

  function renderBossCard(b) {
    const stars = '⭐'.repeat(b.difficulty) + '☆'.repeat(5 - b.difficulty);
    return `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;overflow:hidden">
      <!-- Шапка -->
      <div style="background:linear-gradient(90deg,${b.elementColor}22,transparent);padding:20px 24px;display:flex;align-items:center;gap:16px;cursor:pointer" onclick="window._bossToggle('${b.id}')">
        <span style="font-size:36px">${b.icon}</span>
        <div style="flex:1">
          <div style="font-size:20px;font-weight:800">${b.name}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
            <span style="font-size:12px;background:rgba(255,255,255,.08);padding:2px 10px;border-radius:12px">Ур. ${b.level}+</span>
            <span style="font-size:12px;background:${b.elementColor}22;color:${b.elementColor};border:1px solid ${b.elementColor}44;padding:2px 10px;border-radius:12px">${b.element}</span>
            <span style="font-size:12px;background:var(--bg3);padding:2px 10px;border-radius:12px">Слабость: <strong style="color:${b.weaknessColor}">${b.weakness}</strong></span>
            <span style="font-size:12px;color:var(--text2)">${stars}</span>
          </div>
        </div>
        <span id="bossArrow_${b.id}" style="color:var(--text2);font-size:18px;transition:.18s">${state.bossExpanded[b.id] ? '▲' : '▼'}</span>
      </div>

      <!-- Детали -->
      <div id="bossBody_${b.id}" style="display:${state.bossExpanded[b.id] ? 'block' : 'none'};padding:0 24px 24px">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-top:4px">

          <!-- Атаки -->
          <div>
            <div style="font-size:13px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Атаки</div>
            ${b.attacks.map(a => `
            <div style="background:var(--bg3);border:1px solid var(--border);border-left:3px solid ${DANGER_COLORS[a.danger]};border-radius:6px;padding:10px 12px;margin-bottom:8px">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
                <strong style="font-size:13px">${a.name}</strong>
                <span style="font-size:10px;color:${DANGER_COLORS[a.danger]}">${DANGER_LABELS[a.danger]}</span>
              </div>
              <div style="font-size:12px;color:var(--text2)">${a.desc}</div>
            </div>`).join('')}
          </div>

          <!-- Советы + Награды + Контр-палы -->
          <div>
            <div style="font-size:13px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Советы</div>
            ${b.tips.map(t => `
            <div style="display:flex;gap:8px;margin-bottom:8px;font-size:13px">
              <span style="color:var(--accent3);flex-shrink:0">✓</span>
              <span style="color:var(--text3)">${t}</span>
            </div>`).join('')}

            <div style="margin-top:16px">
              <div style="font-size:12px;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Лучшие контр-палы</div>
              <div style="display:flex;flex-wrap:wrap;gap:8px">
                ${b.counterPals.map(palName => {
                  // Ищем английское имя в DATA
                  const palData = (typeof DATA_EXT !== 'undefined' && DATA_EXT.breedingPals)
                    ? DATA_EXT.breedingPals.find(p => p.name === palName)
                    : null;
                  const img = (typeof palImgTag === 'function')
                    ? palImgTag((palData && palData.eng) ? palData.eng : palName, 48, palName)
                    : '';
                  return `<div data-pal="${palName}" style="display:flex;flex-direction:column;align-items:center;gap:4px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:8px 10px;min-width:70px;cursor:pointer;transition:transform .15s" title="Нажмите, чтобы открыть карточку ${palName}">
                    ${img}
                    <span style="font-size:11px;color:var(--text2);text-align:center;line-height:1.3">${palName}</span>
                  </div>`;
                }).join('')}
              </div>
            </div>

            <div style="margin-top:16px">
              <div style="font-size:12px;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Награды</div>
              ${b.rewards.map(r => `<div style="font-size:12px;color:var(--accent3)">• ${r}</div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  window._bossToggle = function(id) {
    state.bossExpanded[id] = !state.bossExpanded[id];
    const body = qs(`#bossBody_${id}`);
    const arrow = qs(`#bossArrow_${id}`);
    if (body) body.style.display = state.bossExpanded[id] ? 'block' : 'none';
    if (arrow) arrow.textContent = state.bossExpanded[id] ? '▲' : '▼';
  };

  // ══════════════════════════════════════════════════════════
  //  7. ГИД ПО ЗОЛОТУ
  // ══════════════════════════════════════════════════════════
  const INCOME_ORDER = { 'very-high': 0, high: 1, medium: 2, low: 3 };

  function buildGold() {
    const sec = qs('#gold');
    sec.innerHTML = `
      <div class="section-header">
        <h2>💰 Фарм золота</h2>
        <p>Лучшие методы от пассивных до эндгейм-производства</p>
      </div>

      <div class="tip-box">🏆 <strong>Топ совет:</strong> Маус / Маус Кризт на Ранчо + Думуд Гилд в пати — лучший пассивный доход без усилий. Для активного — регулярный фарм данжей за драгоценными камнями.</div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px">
        <button class="sub-tab active" onclick="window._goldSort(this,'income')">По доходу</button>
        <button class="sub-tab" onclick="window._goldSort(this,'difficulty')">По сложности</button>
        <button class="sub-tab" onclick="window._goldSort(this,'passive')">Только пассивные</button>
        <button class="sub-tab" onclick="window._goldSort(this,'active')">Только активные</button>
      </div>

      <div id="goldGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px"></div>
    `;

    renderGoldGrid('income');
  }

  window._goldSort = function(btn, sort) {
    qsa('#gold .sub-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.goldSort = sort;
    renderGoldGrid(sort);
  };

  function renderGoldGrid(sort) {
    const grid = qs('#goldGrid');
    if (!grid) return;

    let items = [...DATA_EXT.goldItems];
    if (sort === 'income')     items.sort((a, b) => (INCOME_ORDER[a.income] || 9) - (INCOME_ORDER[b.income] || 9));
    else if (sort === 'difficulty') items.sort((a, b) => a.difficulty - b.difficulty);
    else if (sort === 'passive')    items = items.filter(i => i.type === 'passive');
    else if (sort === 'active')     items = items.filter(i => i.type === 'active' || i.type === 'production');

    const incomeColors = { 'very-high': '#ffd700', high: '#10b981', medium: '#f0c332', low: '#6b7280' };
    const incomeLabels = { 'very-high': '💰💰💰 Очень высокий', high: '💰💰 Высокий', medium: '💰 Средний', low: '• Низкий' };
    const typeLabels   = { passive: '😴 Пассивный', active: '⚔️ Активный', production: '🏭 Производство' };

    grid.innerHTML = items.map(item => `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:18px;transition:.18s" class="pal-card">
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px">
          <span style="font-size:32px">${item.icon}</span>
          <div style="flex:1">
            <div style="font-weight:700;font-size:15px">${item.name}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">
              <span style="font-size:11px;color:${incomeColors[item.income]||'#fff'}">${incomeLabels[item.income]||''}</span>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
          <span style="font-size:11px;background:var(--bg3);border:1px solid var(--border);padding:2px 8px;border-radius:12px;color:var(--text2)">${typeLabels[item.type]||item.type}</span>
          <span style="font-size:11px;background:var(--bg3);border:1px solid var(--border);padding:2px 8px;border-radius:12px;color:var(--text2)">📊 ${item.method}</span>
        </div>
        <div style="background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.2);border-radius:6px;padding:8px 12px;margin-bottom:12px">
          <div style="font-size:11px;color:var(--text2)">Доход</div>
          <div style="font-size:15px;font-weight:700;color:#ffd700">${item.incomeLabel}</div>
        </div>
        <div style="font-size:13px;color:var(--text2);line-height:1.6">${item.tip}</div>
      </div>
    `).join('');
  }

  // ─── ИНИЦИАЛИЗАЦИЯ ────────────────────────────────────────
  function init() {
    insertTabsAndSections();
    buildBreedingCalc();
    buildMap();
    buildFoodCalc();
    buildBasePlanner();
    buildTechTree();
    buildBosses();
    buildGold();
    if (typeof window._switchCategory === 'function') window._switchCategory('guides', false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
