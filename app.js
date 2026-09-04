// ============================================================
//  PALWORLD HELPER — Логика приложения
// ============================================================

(function () {
  'use strict';

  // --- Состояние -------------------------------------------
  let activeTab    = 'home';
  let activeFilter = 'all';
  let searchQuery  = '';

  // --- DOM --------------------------------------------------
  const tabBtns       = document.querySelectorAll('.tab-btn');
  const catBtns       = document.querySelectorAll('.cat-btn');
  const sections      = document.querySelectorAll('.section');
  const pills         = document.querySelectorAll('.pill');
  const searchInput   = document.getElementById('globalSearch');
  const searchClearBtn= document.getElementById('searchClearBtn');
  const searchResults = document.getElementById('searchResults');
  const backTop       = document.getElementById('backTop');

  let activeCat = 'guides';

  // --- КАТЕГОРИИ -------------------------------------------
  function switchCategory(cat, changeTab = true) {
    activeCat = cat;
    catBtns.forEach(b => b.classList.toggle('active', b.dataset.cat === cat));

    let firstVisibleTab = null;
    tabBtns.forEach(tab => {
      const match = tab.dataset.cat === cat;
      tab.style.display = match ? 'inline-flex' : 'none';
      if (match && !firstVisibleTab) firstVisibleTab = tab.dataset.tab;
    });

    if (changeTab && firstVisibleTab) {
      if (typeof window.switchAllExtended === 'function') {
        window.switchAllExtended(firstVisibleTab);
      } else {
        switchTab(firstVisibleTab);
      }
    }
  }

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => switchCategory(btn.dataset.cat, true));
  });

  window._switchCategory = switchCategory;

  // --- ВКЛАДКИ ---------------------------------------------
  function switchTab(id) {
    activeTab = id;

    // Синхронизация категории
    const targetBtn = document.querySelector(`.tab-btn[data-tab="${id}"]`);
    if (targetBtn && targetBtn.dataset.cat && targetBtn.dataset.cat !== activeCat) {
      switchCategory(targetBtn.dataset.cat, false);
    }

    tabBtns.forEach(b => {
      const isActive = b.dataset.tab === id;
      b.classList.toggle('active', isActive);
      if (isActive) {
        b.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
      }
    });
    sections.forEach(s => s.classList.toggle('active', s.id === id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeSearch();
  }

  tabBtns.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

  // --- ФИЛЬТР ПО УРОВНЮ ------------------------------------
  function applyFilter(filter) {
    activeFilter = filter;
    pills.forEach(p => p.classList.toggle('active', p.dataset.filter === filter));

    document.querySelectorAll('[data-level]').forEach(el => {
      const lvl = el.dataset.level;
      if (filter === 'all') {
        el.classList.remove('hidden');
      } else {
        el.classList.toggle('hidden', lvl !== filter && lvl !== 'all');
      }
    });
  }

  pills.forEach(p => p.addEventListener('click', () => applyFilter(p.dataset.filter)));

  // --- ПОИСК -----------------------------------------------
  function buildSearchIndex() {
    initAllTipsData();
    const idx = [];

    if (DATA.allTips) {
      DATA.allTips.forEach(t => idx.push({ title: t.title, text: t.text, section: 'tips', label: '💡 Совет', id: t.id }));
    }
    DATA.basePals.forEach(p => idx.push({ title: p.name + ' (' + p.eng + ')', text: p.tip + ' ' + p.where, section: 'base', label: '🏡 База', id: p.id }));
    DATA.combatPals.forEach(p => idx.push({ title: p.name + ' (' + p.eng + ')', text: p.tip, section: 'combat', label: '⚔️ Боёвка', id: p.id }));
    DATA.passives.forEach(p => idx.push({ title: p.name + ' (' + p.eng + ')', text: p.effect + ' ' + p.tip, section: 'passives', label: '✨ Пассивки', id: p.id }));
    DATA.breeding.forEach(b => idx.push({ title: b.title, text: b.text, section: 'breeding', label: '🧬 Разведение', id: b.id }));
    DATA.endgame.forEach(e => idx.push({ title: e.title, text: e.text, section: 'endgame', label: '🗺️ Контент', id: e.id }));

    // Индексация мощных интерактивных инструментов
    idx.push({ title: 'Отряд базы (Анализатор 15 слотов)', text: 'Оптимизатор отряда базы, проверка покрытия всех 12 профессий (огонь, полив, руда, посадка), рекомендации замен', section: 'base-analyzer', label: '🏰 Отряд базы', id: 'sec-base-analyzer' });
    idx.push({ title: 'Калькулятор скрещивания палов', text: 'Подбор пар родителей, расчет детёныша, таблица уникальных комбинаций разведения', section: 'breeding-calc', label: '🧮 Калькулятор', id: 'sec-breeding-calc' });
    idx.push({ title: 'Интерактивная карта и GPS навигатор', text: 'Координаты боссов, телепорты, карта MapGenie, шахты руды и угля, башни синдиката', section: 'map', label: '📍 Карта', id: 'sec-map' });
    idx.push({ title: 'Справочник всех торговцев Палпагоса', text: 'Красные торговцы патронами, синие торговцы палами, чёрные торговцы контрабандисты, координаты и товары', section: 'merchants', label: '🛒 Торговцы', id: 'sec-merchants' });
    idx.push({ title: 'Калькулятор еды для базы', text: 'Оптимальная еда для палов, салат, пицца, ягоды, восстановление SAN и сытости', section: 'food-calc', label: '🍽️ Еда', id: 'sec-food-calc' });
    idx.push({ title: 'Таблица стихий и урона', text: 'Колесо стихий, слабости и сопротивления, контр-пики против огня, воды, травы, электричества, льда, дракона, тьмы', section: 'elements', label: '🔥 Стихии', id: 'sec-elements' });
    idx.push({ title: 'Дерево технологий и очков древних технологий', text: 'Ключевые постройки, щиты, инкубатор, пистолет-гарпун, сбруя для палов', section: 'tech-tree', label: '📊 Технологии', id: 'sec-tech-tree' });
    idx.push({ title: 'Фарм золота и монет', text: 'Лучшие способы заработка золота, ферма Мопаки, скупка патронов, гвозди и салат', section: 'gold', label: '💰 Золото', id: 'sec-gold' });

    return idx;
  }

  const searchIndex = buildSearchIndex();

  function runSearch(q) {
    if (!q || q.length < 2) { closeSearch(); return; }
    const lq = q.toLowerCase();
    const hits = searchIndex.filter(i =>
      i.title.toLowerCase().includes(lq) || i.text.toLowerCase().includes(lq)
    ).slice(0, 8);

    if (!hits.length) {
      searchResults.innerHTML = '<div class="sr-item"><div class="sr-content"><div class="sr-title" style="color:var(--text2)">Ничего не найдено</div></div></div>';
    } else {
      searchResults.innerHTML = hits.map(h => {
        let thumb = `<div class="sr-thumb">${h.label.slice(0, 2)}</div>`;
        if (typeof getPalImg === 'function') {
          const rawName = h.title.split(' (')[0];
          const imgUrl = getPalImg(rawName);
          if (imgUrl) {
            thumb = `<img src="${imgUrl}" class="sr-thumb" alt="${rawName}" onerror="this.outerHTML='<div class=\\'sr-thumb\\'>🐾</div>'">`;
          }
        }
        return `
        <div class="sr-item" data-section="${h.section}">
          ${thumb}
          <div class="sr-content">
            <div class="sr-section">${h.label}</div>
            <div class="sr-title">${h.title}</div>
            <div class="sr-preview">${h.text.slice(0, 85)}…</div>
          </div>
        </div>`;
      }).join('');

      searchResults.querySelectorAll('.sr-item').forEach(el => {
        el.addEventListener('click', () => {
          if (typeof window.switchAllExtended === 'function') {
            window.switchAllExtended(el.dataset.section);
          } else {
            switchTab(el.dataset.section);
          }
          searchInput.value = '';
          if (searchClearBtn) searchClearBtn.style.display = 'none';
          closeSearch();
        });
      });
    }

    searchResults.classList.add('visible');
  }

  function closeSearch() {
    searchResults.classList.remove('visible');
  }

  window._closeSearch = closeSearch;

  searchInput.addEventListener('input', e => {
    const val = e.target.value.trim();
    if (searchClearBtn) searchClearBtn.style.display = val.length > 0 ? 'flex' : 'none';
    runSearch(val);
  });
  searchInput.addEventListener('focus', e => {
    if (e.target.value.trim().length >= 2) runSearch(e.target.value.trim());
  });

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchClearBtn.style.display = 'none';
      closeSearch();
      searchInput.focus();
    });
  }

  document.addEventListener('click', e => {
    if (!e.target.closest('.search-wrap') && !e.target.closest('#searchResults')) closeSearch();
  });

  // --- BACK TO TOP -----------------------------------------
  window.addEventListener('scroll', () => {
    backTop.classList.toggle('visible', window.scrollY > 300);
  });
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // --- RENDER: HOME ----------------------------------------
  function renderHome() {
    const container = document.getElementById('tips-container');
    container.innerHTML = DATA.beginnerTips.map(t => `
      <div class="card" data-level="beginner" data-id="${t.id}">
        <span class="card-icon">${t.icon}</span>
        <div class="level-row">
          <span class="badge badge-beginner">Новичок</span>
          ${t.tags.map(tag => `<span style="font-size:11px;color:var(--text2)">#${tag}</span>`).join('')}
        </div>
        <h3>${t.title}</h3>
        <p>${t.text}</p>
      </div>
    `).join('');
  }

  // --- RENDER: ALL TIPS (ВКЛАДКА «ВСЕ СОВЕТЫ») -------------
  let activeTipCat = 'all';
  let tipSearchQuery = '';

  function initAllTipsData() {
    if (DATA.allTips) return;
    DATA.allTips = [
      ...DATA.beginnerTips.map(t => ({ ...t, cat: 'beginner', catName: 'Старт', level: t.level || 'beginner' })),
      ...DATA.mechanics.map(t => ({ ...t, cat: 'mechanics', catName: 'Механики', level: t.level || 'intermediate' })),
      ...DATA.lifehacks.map(t => ({ ...t, cat: 'lifehacks', catName: 'Лайфхаки', level: t.level || 'intermediate' })),
      ...DATA.endgame.map(t => ({ ...t, cat: 'endgame', catName: 'Эндгейм', level: t.level || 'advanced' })),
      {
        id: 'tip_base_opt',
        title: 'Идеальное зонирование базы',
        icon: '🏗️',
        cat: 'base',
        catName: 'База',
        level: 'intermediate',
        tags: ['база', 'зонирование', 'оптимизация'],
        text: 'Располагайте сундуки прямо около станков и полей, а не в общем хранилище в углу базы. Палы тратят 70% времени на ходьбу — ближайший ящик ускорит производство в разы.'
      },
      {
        id: 'tip_breed_cake',
        title: 'Автоматизация Тортов для скрещивания',
        icon: '🎂',
        cat: 'breeding',
        catName: 'Разведение',
        level: 'intermediate',
        tags: ['разведение', 'торт', 'ранчо'],
        text: 'Торт не портится в сундуке фермы разведения! Поставьте на Ранчо палов Бигарде (Мёд), Моззарину (Молоко), Чикипи (Яйца). На авто-фермах сажайте Пшеницу и Ягоды с палами Лилин и Джормунтид.'
      },
      {
        id: 'tip_combat_elements',
        title: 'Элементальное покрытие боевого отряда',
        icon: '🔥',
        cat: 'combat',
        catName: 'Боёвка',
        level: 'beginner',
        tags: ['бой', 'стихии', 'отряд'],
        text: 'Берите в команду минимум 3 разные стихии: Огонь (против Льда/Травы), Электро (против Воды), Дракон (против Тьмы) и Земля (против Электро). Это даёт стабильный бонус ×1.5 урона по 95% боссов.'
      },
      {
        id: 'tip_san_hotspring',
        title: 'Лечение депрессии и падения SAN',
        icon: '♨️',
        cat: 'base',
        catName: 'База',
        level: 'beginner',
        tags: ['SAN', 'рассудок', 'база'],
        text: 'Если пал получил депрессию — примените Низкосортные медикаменты через меню инвентаря. Чтобы SAN не падал — постройте Улучшенный горячий источник и кормите палов Салатом (даёт +30% к скорости работы).'
      },
      {
        id: 'tip_legend_sphere',
        title: '100% шанс поимки редких палов',
        icon: '🔮',
        cat: 'endgame',
        catName: 'Эндгейм',
        level: 'advanced',
        tags: ['сферы', 'поимка', 'легенды'],
        text: 'Для легендарных боссов Lv50 (Джетрагон, Фросталлион, Некромус) сбивайте HP ниже 5%, накладывайте Заморозку или Шок и бросайте Легендарную сферу строго в спину пала (бонус Backstab +30%).'
      },
      {
        id: 'tip_glider_speed',
        title: 'Сверхскоростной полёт через Крюк + Глайдер',
        icon: '🚀',
        cat: 'lifehacks',
        catName: 'Лайфхаки',
        level: 'intermediate',
        tags: ['лайфхак', 'передвижение', 'глайдер'],
        text: 'Выстрелите крюком-кошкой в землю перед собой. В момент максимального разгона подтягивания прыгайте и раскрывайте Глайдер (или используйте Галеклава). Высокая скорость рывка сохранится на всю дальность полёта.'
      },
      {
        id: 'tip_gold_salad',
        title: 'Бесконечное золото на продаже Салата',
        icon: '💰',
        cat: 'lifehacks',
        catName: 'Золото',
        level: 'intermediate',
        tags: ['золото', 'торговля', 'салат'],
        text: 'Ферма Салата приносит тысячи единиц еды. Продавайте излишки любому торговцу в Деревне за сотни тысяч золота, а на полученные деньги покупайте у торговца кости, масло палов и боеприпасы.'
      },
      {
        id: 'tip_passives_inherit',
        title: 'Золотая четвёрка пассивок для боёвки',
        icon: '✨',
        cat: 'breeding',
        catName: 'Разведение',
        level: 'advanced',
        tags: ['пассивки', 'боёвка', 'селекция'],
        text: 'Идеальная сборка любого боевого пала: Легенда (+20% АТК), Мышцеголов (+30% АТК), Яростный (+20% АТК) и стихийный перк (например, Повелитель пламени / Владыка тьмы +20%). Суммарный урон вырастает на +90%!'
      }
    ];
  }

  function renderAllTips() {
    initAllTipsData();
    const container = document.getElementById('all-tips-container');
    if (!container) return;

    const filtered = DATA.allTips.filter(t => {
      const matchCat = (activeTipCat === 'all') ||
        (activeTipCat === 'beginner' && t.level === 'beginner') ||
        (activeTipCat === 'intermediate' && t.level === 'intermediate') ||
        (activeTipCat === 'advanced' && t.level === 'advanced') ||
        (t.cat === activeTipCat);

      if (!matchCat) return false;

      if (!tipSearchQuery) return true;
      const q = tipSearchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.text.toLowerCase().includes(q) || (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)));
    });

    const countEl = document.getElementById('tipsCountAll');
    if (countEl) countEl.textContent = DATA.allTips.length;

    if (!filtered.length) {
      container.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text2);background:var(--bg2);border-radius:12px;border:1px dashed var(--border)">
          <div style="font-size:32px;margin-bottom:8px">🔍</div>
          <div style="font-size:16px;font-weight:700">Ничего не найдено</div>
          <div style="font-size:13px;margin-top:4px">Попробуйте изменить категорию или поисковый запрос</div>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(t => {
      const lvlClass = t.level === 'advanced' ? 'badge-advanced' : t.level === 'intermediate' ? 'badge-intermediate' : 'badge-beginner';
      const lvlText  = t.level === 'advanced' ? 'Опытный' : t.level === 'intermediate' ? 'Средний' : 'Новичок';
      return `
      <div class="card" data-level="${t.level}" data-id="${t.id}">
        <span class="card-icon">${t.icon}</span>
        <div class="level-row" style="display:flex;align-items:center;justify-content:space-between;gap:6px">
          <span class="badge ${lvlClass}">${lvlText}</span>
          <span class="badge" style="background:var(--bg3);border:1px solid var(--border);color:var(--text2);font-size:11px">${t.catName || 'Совет'}</span>
        </div>
        <h3 style="margin-top:8px">${t.title}</h3>
        <p>${t.text}</p>
        ${t.tags ? `
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.05)">
          ${t.tags.map(tag => `<span style="font-size:11px;color:var(--text2)">#${tag}</span>`).join('')}
        </div>` : ''}
      </div>`;
    }).join('');

    if (typeof window.enhanceTextPalLinks === 'function') {
      setTimeout(window.enhanceTextPalLinks, 60);
    }
  }

  function initTipsEvents() {
    const tipBtns = document.querySelectorAll('[data-tip-cat]');
    tipBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tipBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTipCat = btn.dataset.tipCat;
        renderAllTips();
      });
    });

    const searchInput = document.getElementById('tipsSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        tipSearchQuery = e.target.value.trim();
        renderAllTips();
      });
    }
  }

  // --- RENDER: MECHANICS ------------------------------------
  function renderMechanics() {
    const container = document.getElementById('mechanics-container');
    container.innerHTML = DATA.mechanics.map(m => {
      const lvlClass = m.level === 'advanced' ? 'badge-advanced' : m.level === 'intermediate' ? 'badge-intermediate' : 'badge-beginner';
      const lvlText  = m.level === 'advanced' ? 'Опытный' : m.level === 'intermediate' ? 'Средний' : 'Новичок';
      return `
      <div class="card" data-level="${m.level}" data-id="${m.id}">
        <span class="card-icon">${m.icon}</span>
        <div class="level-row">
          <span class="badge ${lvlClass}">${lvlText}</span>
          ${m.tags.map(tag => `<span style="font-size:11px;color:var(--text2)">#${tag}</span>`).join('')}
        </div>
        <h3>${m.title}</h3>
        <p>${m.text}</p>
      </div>`;
    }).join('');
  }

  // --- RENDER: BASE PALS -----------------------------------
  function renderBase() {
    const container = document.getElementById('base-container');
    container.innerHTML = DATA.basePals.map(p => {
      const imgTag = (typeof palImgTag === 'function') ? palImgTag(p.eng, 72, p.name) : '';
      return `
      <div class="pal-card" data-level="all" data-id="${p.id}" data-pal="${p.name}" title="Кликните, чтобы открыть карточку пала">
        <div class="pal-header" style="display:flex;align-items:flex-start;gap:12px">
          ${imgTag ? `<div style="flex-shrink:0">${imgTag}</div>` : ''}
          <div style="flex:1">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6px;margin-bottom:6px">
              <div class="pal-name-wrap">
                <div class="pal-name">${p.name}</div>
                <div class="pal-eng">${p.eng}</div>
              </div>
              <span class="badge badge-${p.tier}">${p.tier}-ТИР</span>
            </div>
            <div class="pal-job">
              <span class="pal-job-icon">${p.jobIcon}</span>
              <span class="pal-job-name">${p.job}</span>
              <span class="pal-job-level">Lv${p.level}</span>
            </div>
          </div>
        </div>
        <div class="pal-tip" style="margin-top:10px">${p.tip}</div>
        <div class="pal-where"><strong>📍 Где найти:</strong> ${p.where}</div>
      </div>`;
    }).join('');
  }

  // --- RENDER: COMBAT --------------------------------------
  function renderCombat() {
    const container = document.getElementById('combat-container');
    container.innerHTML = DATA.combatPals.map(p => {
      const imgTag = (typeof palImgTag === 'function') ? palImgTag(p.eng, 80, p.name) : '';
      return `
      <div class="combat-card" data-level="all" data-id="${p.id}" data-pal="${p.name}" title="Кликните, чтобы открыть карточку пала">
        <div class="combat-header" style="display:flex;align-items:center;gap:12px">
          ${imgTag || `<span class="combat-icon">${p.icon}</span>`}
          <div style="flex:1">
            <div class="combat-name">${p.name}</div>
            <div class="combat-eng">${p.eng}</div>
          </div>
          <span class="badge badge-${p.tier}" style="margin-left:auto">${p.tier}</span>
        </div>
        <div class="combat-meta">
          <span class="badge badge-${p.tier}" style="font-size:10px">${p.role}</span>
          ${p.element.map(e => `<span class="el-badge el-${e}">${e}</span>`).join('')}
        </div>
        <div class="combat-tip">${p.tip}</div>
        <div class="combat-passives">
          <h5>Рекомендуемые пассивки:</h5>
          <div class="passives-list">${p.passives.map(ps => `<span class="ps-tag">${ps}</span>`).join('')}</div>
        </div>
      </div>`;
    }).join('');
  }

  // --- RENDER: PASSIVES ------------------------------------
  function renderPassives() {
    // Боёвка
    const combatContainer = document.getElementById('passives-combat');
    const combatData = DATA.passives.filter(p => p.category.startsWith('Бой'));
    combatContainer.innerHTML = combatData.map(p => `
      <div class="passive-card" data-level="all" data-id="${p.id}">
        <div class="passive-header">
          <div>
            <div class="passive-name">${p.name}</div>
            <div class="passive-eng">${p.eng}</div>
          </div>
          <span class="badge badge-${p.rarity}">${rarityLabel(p.rarity)}</span>
        </div>
        <div class="passive-effect">${p.effect}</div>
        <div class="passive-tip">${p.tip}</div>
      </div>
    `).join('');

    // Работа
    const workContainer = document.getElementById('passives-work');
    const workData = DATA.passives.filter(p => p.category === 'Работа');
    workContainer.innerHTML = workData.map(p => `
      <div class="passive-card" data-level="all" data-id="${p.id}">
        <div class="passive-header">
          <div>
            <div class="passive-name">${p.name}</div>
            <div class="passive-eng">${p.eng}</div>
          </div>
          <span class="badge badge-${p.rarity}">${rarityLabel(p.rarity)}</span>
        </div>
        <div class="passive-effect">${p.effect}</div>
        <div class="passive-tip">${p.tip}</div>
      </div>
    `).join('');
  }

  function rarityLabel(r) {
    return { legendary: 'Легендарная', epic: 'Эпическая', rare: 'Редкая', uncommon: 'Необычная' }[r] || r;
  }

  // --- RENDER: LIFEHACKS -----------------------------------
  function renderLifehacks() {
    const container = document.getElementById('lifehacks-container');
    container.innerHTML = DATA.lifehacks.map(h => {
      const lvlClass = h.level === 'advanced' ? 'badge-advanced' : h.level === 'intermediate' ? 'badge-intermediate' : 'badge-beginner';
      const lvlText  = h.level === 'advanced' ? 'Опытный' : h.level === 'intermediate' ? 'Средний' : 'Новичок';
      return `
      <div class="card" data-level="${h.level}" data-id="${h.id}">
        <span class="card-icon">${h.icon}</span>
        <div class="level-row">
          <span class="badge ${lvlClass}">${lvlText}</span>
          ${h.tags.map(tag => `<span style="font-size:11px;color:var(--text2)">#${tag}</span>`).join('')}
        </div>
        <h3>${h.title}</h3>
        <p>${h.text}</p>
      </div>`;
    }).join('');
  }

  // --- RENDER: BREEDING ------------------------------------
  function renderBreeding() {
    const container = document.getElementById('breeding-container');
    container.innerHTML = DATA.breeding.map((b, i) => {
      const lvlClass = b.level === 'advanced' ? 'badge-advanced' : b.level === 'intermediate' ? 'badge-intermediate' : 'badge-beginner';
      const lvlText  = b.level === 'advanced' ? 'Опытный' : b.level === 'intermediate' ? 'Средний' : 'Новичок';
      return `
      <div class="card" data-level="${b.level}" data-id="${b.id}">
        <span class="card-icon">${b.icon}</span>
        <div class="level-row">
          <span class="badge ${lvlClass}">${lvlText}</span>
        </div>
        <h3>${b.title}</h3>
        <p>${b.text}</p>
      </div>`;
    }).join('');
  }

  // --- RENDER: ENDGAME ------------------------------------
  function renderEndgame() {
    const container = document.getElementById('endgame-container');
    container.innerHTML = DATA.endgame.map(e => `
      <div class="card" data-level="${e.level}" data-id="${e.id}">
        <span class="card-icon">${e.icon}</span>
        <div class="level-row">
          <span class="badge badge-${e.level === 'advanced' ? 'advanced' : 'intermediate'}">${e.level === 'advanced' ? 'Опытный' : 'Средний'}</span>
        </div>
        <h3>${e.title}</h3>
        <p>${e.text}</p>
      </div>
    `).join('');
  }

  // --- БАЗА: ФИЛЬТР ПО ПРОФЕССИЯМ И ПОИСК -----------------
  let activeBaseJob = 'all';
  let activeBaseSearch = '';

  function applyBaseFilter() {
    const palCards = document.querySelectorAll('#base-container .pal-card');
    palCards.forEach(card => {
      const jobText = card.querySelector('.pal-job-name')?.textContent || '';
      const palName = card.querySelector('.pal-name')?.textContent || '';
      const palEng = card.querySelector('.pal-eng')?.textContent || '';
      const palTip = card.querySelector('.pal-tip')?.textContent || '';

      const matchJob = (activeBaseJob === 'all') || jobText.toLowerCase().includes(activeBaseJob.toLowerCase());
      const matchSearch = !activeBaseSearch || 
        palName.toLowerCase().includes(activeBaseSearch) ||
        palEng.toLowerCase().includes(activeBaseSearch) ||
        jobText.toLowerCase().includes(activeBaseSearch) ||
        palTip.toLowerCase().includes(activeBaseSearch);

      card.classList.toggle('hidden', !(matchJob && matchSearch));
    });
  }

  function initBaseJobFilters() {
    const jobBtns = document.querySelectorAll('.base-job-filters .sub-tab');
    if (!jobBtns.length) return;
    jobBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        jobBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeBaseJob = btn.dataset.job;
        applyBaseFilter();
      });
    });
  }

  window._filterBasePals = function(q) {
    activeBaseSearch = (q || '').trim().toLowerCase();
    applyBaseFilter();
  };

  // --- БОЁВКА: ПОИСК БОЕВЫХ ПАЛОВ --------------------------
  window._filterCombatPals = function(q) {
    const lq = (q || '').trim().toLowerCase();
    const cards = document.querySelectorAll('#combat-container .pal-card');
    cards.forEach(card => {
      const name = card.querySelector('.pal-name')?.textContent || '';
      const eng = card.querySelector('.pal-eng')?.textContent || '';
      const role = card.querySelector('.pal-role')?.textContent || '';
      const tip = card.querySelector('.pal-tip')?.textContent || '';
      const match = !lq ||
        name.toLowerCase().includes(lq) ||
        eng.toLowerCase().includes(lq) ||
        role.toLowerCase().includes(lq) ||
        tip.toLowerCase().includes(lq);
      card.classList.toggle('hidden', !match);
    });
  };

  // --- ПАССИВКИ: ПОИСК НАВЫКОВ -----------------------------
  window._filterPassives = function(q) {
    const lq = (q || '').trim().toLowerCase();
    const cards = document.querySelectorAll('.passive-card');
    cards.forEach(card => {
      const name = card.querySelector('.passive-name')?.textContent || '';
      const eng = card.querySelector('.passive-eng')?.textContent || '';
      const effect = card.querySelector('.passive-effect')?.textContent || '';
      const tip = card.querySelector('.passive-tip')?.textContent || '';
      const match = !lq ||
        name.toLowerCase().includes(lq) ||
        eng.toLowerCase().includes(lq) ||
        effect.toLowerCase().includes(lq) ||
        tip.toLowerCase().includes(lq);
      card.classList.toggle('hidden', !match);
    });
  };

  // --- СТИХИИ: ИНТЕРАКТИВНЫЙ ПОМОЩНИК ----------------------
  const ELEMENT_MATCHUPS = {
    'Огонь': {
      strongAgainst: ['Трава', 'Лёд'],
      weakAgainst: ['Вода'],
      bestCounters: ['Джормунтид', 'Азуроб', 'Шаолонг', 'Кельпсей'],
      avoidUsing: ['Лилин', 'Фросталлион', 'Дандилорд'],
      tip: 'Водные атаки наносят огненным боссам ×1.5 урона. Не выставляйте палов Травы и Льда!'
    },
    'Вода': {
      strongAgainst: ['Огонь'],
      weakAgainst: ['Электро'],
      bestCounters: ['Орсерк', 'Гриззболт', 'Дивинольв Люкс'],
      avoidUsing: ['Рэнджиши', 'Джормунтид Игнис', 'Фалерис'],
      tip: 'Электричество шокирует водные цели с бонусом ×1.5. Орсерк — непревзойдённый контр-пал.'
    },
    'Трава': {
      strongAgainst: ['Земля'],
      weakAgainst: ['Огонь'],
      bestCounters: ['Рэнджиши', 'Джормунтид Игнис', 'Ганглер Игнис', 'Фалерис'],
      avoidUsing: ['Анубис', 'Эгидрон', 'Рушоар'],
      tip: 'Огонь испепеляет Траву (множитель ×1.5). Используйте огненных драконов или палов с навыком Огнемёт.'
    },
    'Электро': {
      strongAgainst: ['Вода'],
      weakAgainst: ['Земля'],
      bestCounters: ['Анубис', 'Эгидрон', 'Рушоар', 'Гумосс'],
      avoidUsing: ['Йормунтид', 'Азуроб', 'Шаолонг'],
      tip: 'Земляные палы полностью поглощают урон от молний и наносят ×1.5 урона по Электро-палам.'
    },
    'Лёд': {
      strongAgainst: ['Дракон'],
      weakAgainst: ['Огонь'],
      bestCounters: ['Рэнджиши', 'Джормунтид Игнис', 'Балзам'],
      avoidUsing: ['Джетрагон', 'Эльпидран', 'Шаолонг'],
      tip: 'Огонь растапливает Лёд за секунды. Ни в коем случае не выставляйте Драконов — Лёд их сокрушает!'
    },
    'Земля': {
      strongAgainst: ['Электро'],
      weakAgainst: ['Трава'],
      bestCounters: ['Лилин', 'Дандилорд', 'Вумпо Ботан'],
      avoidUsing: ['Орсерк', 'Гриззболт', 'Пуляплюш'],
      tip: 'Травяные палы с лёгкостью побеждают Землю (бонус ×1.5 урона).'
    },
    'Тьма': {
      strongAgainst: ['Нейтральный'],
      weakAgainst: ['Дракон'],
      bestCounters: ['Джетрагон', 'Эльпидран', 'Шаолонг', 'Орсерк'],
      avoidUsing: ['Ламбалль', 'Котмалль', 'Мулопен'],
      tip: 'Драконы наносят максимальный урон по Тьме. Джетрагон против боссов Тьмы — абсолютная мета.'
    },
    'Дракон': {
      strongAgainst: ['Тьма'],
      weakAgainst: ['Лёд'],
      bestCounters: ['Фросталлион', 'Оксалуне', 'Маммотист Кризт', 'Реиндрикс'],
      avoidUsing: ['Некромус', 'Беллануар', 'Шэдоубик'],
      tip: 'Ледяные атаки — слабость Дракона. Фросталлион или Оксалуне быстро победят дракона.'
    },
    'Нейтральный': {
      strongAgainst: [],
      weakAgainst: ['Тьма'],
      bestCounters: ['Фросталлион Нокт', 'Беллануар', 'Некромус', 'Шэдоубик'],
      avoidUsing: [],
      tip: 'Нейтральные палы не наносят супер-урон ни по кому, но уязвимы к стихии Тьмы.'
    }
  };

  function renderElementAdvisor(elem) {
    const res = document.getElementById('elementAdvisorResult');
    if (!res) return;
    const data = ELEMENT_MATCHUPS[elem];
    if (!data) return;

    res.innerHTML = `
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:16px;margin-top:4px">
        <div style="font-size:15px;font-weight:700;margin-bottom:12px;color:var(--text)">
          Враг стихии: <span class="el-badge el-${elem}">${elem}</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-bottom:12px">
          <div style="background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.3);border-radius:8px;padding:12px">
            <div style="font-weight:700;font-size:13.5px;color:var(--accent3);margin-bottom:6px">
              ✅ Кого брать (×1.5 урона)
            </div>
            <div style="font-size:12px;color:var(--text2);margin-bottom:8px">
              Стихии: <strong>${data.weakAgainst.map(w => `<span class="el-badge el-${w}">${w}</span>`).join(' ')}</strong>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${data.bestCounters.map(p => `
                <div data-pal="${p}" style="display:flex;align-items:center;gap:6px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:3px 8px;font-size:12px;cursor:pointer" title="Нажмите, чтобы открыть карточку ${p}">
                  ${typeof palImgTag === 'function' ? palImgTag(p, 24) : '🐾'}
                  <span>${p}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="background:rgba(248,81,73,.1);border:1px solid rgba(248,81,73,.3);border-radius:8px;padding:12px">
            <div style="font-weight:700;font-size:13.5px;color:var(--danger);margin-bottom:6px">
              ❌ Не выставлять (слабость)
            </div>
            <div style="font-size:12px;color:var(--text2);margin-bottom:8px">
              Опасность от стихий: <strong>${data.strongAgainst.length ? data.strongAgainst.map(s => `<span class="el-badge el-${s}">${s}</span>`).join(' ') : '—'}</strong>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${data.avoidUsing.map(p => `
                <div data-pal="${p}" style="display:flex;align-items:center;gap:6px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:3px 8px;font-size:12px;opacity:0.85;cursor:pointer" title="Нажмите, чтобы открыть карточку ${p}">
                  ${typeof palImgTag === 'function' ? palImgTag(p, 24) : '⚠️'}
                  <span>${p}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        <div style="font-size:12.5px;color:var(--text2);line-height:1.5;background:var(--bg2);padding:8px 12px;border-radius:6px">
          💡 <strong>Тактика:</strong> ${data.tip}
        </div>
      </div>
    `;
  }

  function initElementAdvisor() {
    const btns = document.querySelectorAll('[data-pick-el]');
    if (!btns.length) return;
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderElementAdvisor(btn.dataset.pickEl);
      });
    });
    renderElementAdvisor('Огонь');
  }

  // --- INIT -----------------------------------------------
  function init() {
    renderHome();
    renderMechanics();
    renderBase();
    renderCombat();
    renderPassives();
    renderLifehacks();
    renderBreeding();
    renderEndgame();
    renderAllTips();
    initTipsEvents();
    initBaseJobFilters();
    initElementAdvisor();
    switchCategory('guides', false);
    switchTab('tips');
  }

  init();

})();
