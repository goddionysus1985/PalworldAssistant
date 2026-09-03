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
  const sections      = document.querySelectorAll('.section');
  const pills         = document.querySelectorAll('.pill');
  const searchInput   = document.getElementById('globalSearch');
  const searchResults = document.getElementById('searchResults');
  const backTop       = document.getElementById('backTop');

  // --- ВКЛАДКИ ---------------------------------------------
  function switchTab(id) {
    activeTab = id;
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
    const idx = [];

    DATA.beginnerTips.forEach(t => idx.push({ title: t.title, text: t.text, section: 'home', label: '🏠 Начало', id: t.id }));
    DATA.mechanics.forEach(t => idx.push({ title: t.title, text: t.text, section: 'mechanics', label: '🔧 Механики', id: t.id }));
    DATA.basePals.forEach(p => idx.push({ title: p.name + ' (' + p.eng + ')', text: p.tip + ' ' + p.where, section: 'base', label: '🏡 База', id: p.id }));
    DATA.combatPals.forEach(p => idx.push({ title: p.name + ' (' + p.eng + ')', text: p.tip, section: 'combat', label: '⚔️ Боёвка', id: p.id }));
    DATA.passives.forEach(p => idx.push({ title: p.name + ' (' + p.eng + ')', text: p.effect + ' ' + p.tip, section: 'passives', label: '✨ Пассивки', id: p.id }));
    DATA.lifehacks.forEach(h => idx.push({ title: h.title, text: h.text, section: 'lifehacks', label: '💡 Лайфхаки', id: h.id }));
    DATA.breeding.forEach(b => idx.push({ title: b.title, text: b.text, section: 'breeding', label: '🧬 Разведение', id: b.id }));
    DATA.endgame.forEach(e => idx.push({ title: e.title, text: e.text, section: 'endgame', label: '🗺️ Контент', id: e.id }));

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
      searchResults.innerHTML = '<div class="sr-item"><div class="sr-title" style="color:var(--text2)">Ничего не найдено</div></div>';
    } else {
      searchResults.innerHTML = hits.map(h => `
        <div class="sr-item" data-section="${h.section}">
          <div class="sr-section">${h.label}</div>
          <div class="sr-title">${h.title}</div>
          <div class="sr-preview">${h.text.slice(0, 100)}…</div>
        </div>`).join('');
      searchResults.querySelectorAll('.sr-item').forEach(el => {
        el.addEventListener('click', () => {
          switchTab(el.dataset.section);
          searchInput.value = '';
          closeSearch();
        });
      });
    }

    searchResults.classList.add('visible');
  }

  function closeSearch() {
    searchResults.classList.remove('visible');
  }

  searchInput.addEventListener('input', e => runSearch(e.target.value.trim()));
  searchInput.addEventListener('focus', e => { if (e.target.value.trim().length >= 2) runSearch(e.target.value.trim()); });
  document.addEventListener('click', e => { if (!e.target.closest('.search-wrap') && !e.target.closest('#searchResults')) closeSearch(); });

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
      <div class="pal-card" data-level="all" data-id="${p.id}">
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
      <div class="combat-card" data-level="all" data-id="${p.id}">
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
    switchTab('home');
  }

  init();

})();
