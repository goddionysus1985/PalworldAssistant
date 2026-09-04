// ============================================================
//  PALWORLD HELPER — Анализатор и оптимизатор отряда базы
// ============================================================

(function () {
  'use strict';

  // 12 базовых профессий Palworld
  const JOBS = [
    { key: 'kindling',    name: 'Разжигание огня',  icon: '🔥', desc: 'Плавка руды, приготовление пищи, производство слитков', critical: true },
    { key: 'watering',    name: 'Полив',            icon: '💧', desc: 'Полив грядок на фермах, мельница, дробилка руды',     critical: true },
    { key: 'planting',    name: 'Посадка',          icon: '🌱', desc: 'Засев пшеницы, ягод, томатов и салата',                critical: true },
    { key: 'electricity', name: 'Электричество',    icon: '⚡', desc: 'Питание сборочных линий, инкубаторов, фонарей',       critical: true },
    { key: 'handiwork',   name: 'Ручная работа',    icon: '🔨', desc: 'Крафт сфер, оружия, патронов и строительство зданий', critical: true },
    { key: 'gathering',   name: 'Сбор урожая',      icon: '🌾', desc: 'Сбор созревших культур с плантаций',                   critical: false },
    { key: 'lumbering',   name: 'Лесоповал',        icon: '🪓', desc: 'Заготовка древесины на лесопилке',                    critical: false },
    { key: 'mining',      name: 'Добыча камня',     icon: '⛏️', desc: 'Добыча руды, угля, серы и камня в карьере',          critical: true },
    { key: 'medicine',    name: 'Медицина',         icon: '💊', desc: 'Производство лекарств от травм и депрессии',          critical: false },
    { key: 'cooling',     name: 'Охлаждение',       icon: '❄️', desc: 'Хранение продуктов в холодильнике от порчи',          critical: false },
    { key: 'transporting',name: 'Транспортировка',  icon: '🚀', desc: 'Перенос ресурсов с полей и карьеров в сундуки',        critical: true },
    { key: 'farming',     name: 'Скотоводство',     icon: '🍯', desc: 'Производство яиц, молока, мёда и шерсти на Ранчо',    critical: false }
  ];

  // Топовые специалисты под каждую профессию
  const BEST_SPECIALISTS = {
    'kindling':    { name: 'Джормунтид Игнис', lvl: 4, alt: 'Рэнджиши', where: 'Заповедник дикой природы №2 (или Вулкан)' },
    'watering':    { name: 'Джормунтид',       lvl: 4, alt: 'Азуроб',   where: 'Озеро в центре карты (Босс Lv45)' },
    'planting':    { name: 'Лилин',            lvl: 4, alt: 'Дандилорд',where: 'Заповедник №3 (Северо-восток)' },
    'electricity': { name: 'Орсерк',           lvl: 4, alt: 'Гриззболт',where: 'Заповедник №3 (или Скрещивание Дивинольв + Мерзитая)' },
    'handiwork':   { name: 'Анубис',           lvl: 4, alt: 'Солэнн',   where: 'Сумеречные дюны (или Скрещивание)' },
    'gathering':   { name: 'Фросталлион Нокт', lvl: 4, alt: 'Вердаш',   where: 'Разведение: Фросталлион + Некромус' },
    'lumbering':   { name: 'Селесдир Нокт',    lvl: 4, alt: 'Вумпо',    where: 'Ночные леса и заповедники' },
    'mining':      { name: 'Астогон',          lvl: 4, alt: 'Анубис',   where: 'Разрушенная шахта вулкана (Босс Lv48)' },
    'medicine':    { name: 'Сильванс',         lvl: 4, alt: 'Лилин',    where: 'Западные леса' },
    'cooling':     { name: 'Фросталлион',      lvl: 4, alt: 'Ванвирм Кризт', where: 'Астральные горы (Босс Lv50)' },
    'transporting':{ name: 'Вумпо',            lvl: 4, alt: 'Эйдролон', where: 'Астральные снежные горы' },
    'farming':     { name: 'Бигарде',          lvl: 1, alt: 'Моззарина',where: 'Луга около башни Лилли (Мёд для Тортов)' }
  };

  // Готовые пресеты отрядов
  const PRESETS = {
    'food': {
      title: '🎂 Ферма еды и Тортов (Разведение)',
      desc: 'Оптимизирован для максимального производства Тортов, Салатов и ухода за пастбищем.',
      pals: ['Лилин', 'Лилин', 'Джормунтид', 'Джормунтид', 'Бигарде', 'Бигарде', 'Моззарина', 'Чикипи', 'Джормунтид Игнис', 'Анубис', 'Анубис', 'Вумпо']
    },
    'mining': {
      title: '⛏️ Металл, уголь и тяжелое производство',
      desc: 'Бесконечная плавка слитков, добыча руды и молниеносный крафт боеприпасов.',
      pals: ['Анубис', 'Анубис', 'Анубис', 'Астогон', 'Астогон', 'Эгидрон', 'Джормунтид Игнис', 'Джормунтид Игнис', 'Орсерк', 'Вумпо', 'Вумпо', 'Фросталлион']
    },
    'balanced': {
      title: '⚡ Универсальная автономная база',
      desc: 'Сбалансированное покрытие всех 12 профессий — база живёт и развивается без вашего вмешательства.',
      pals: ['Джормунтид Игнис', 'Джормунтид', 'Лилин', 'Орсерк', 'Анубис', 'Астогон', 'Вумпо', 'Бигарде', 'Моззарина', 'Фросталлион Нокт', 'Селесдир Нокт', 'Сильванс']
    }
  };

  // Текущий отряд игрока (массив имён палов, до 15)
  let currentRoster = [...PRESETS.balanced.pals];

  // Инициализация модуля
  function initBaseAnalyzer() {
    renderRosterUI();
    auditBase();
  }

  // Отрисовка слотов и управления отрядом
  function renderRosterUI() {
    const rosterContainer = document.getElementById('baseRosterSlots');
    if (!rosterContainer) return;

    rosterContainer.innerHTML = currentRoster.map((palName, idx) => {
      const img = (typeof palImgTag === 'function') ? palImgTag(palName, 44) : '🐾';
      return `
        <div class="roster-slot" style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:8px 10px;display:flex;align-items:center;gap:10px;position:relative">
          <div style="flex-shrink:0">${img}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" class="pal-text-link" data-pal="${palName}">
              ${palName}
            </div>
            <div style="font-size:11px;color:var(--text2)">Слот #${idx + 1}</div>
          </div>
          <button class="sub-tab" style="padding:2px 8px;font-size:11px;color:var(--danger);border-color:rgba(248,81,73,0.3)" onclick="window._removeRosterPal(${idx})" title="Удалить из отряда">✕</button>
        </div>
      `;
    }).join('');

    // Счётчик палов
    const countEl = document.getElementById('rosterCount');
    if (countEl) countEl.textContent = `${currentRoster.length} / 15`;

    // Заполнение селектора и datalist для быстрого ввода палов
    const palSelect = document.getElementById('addPalSelect');
    const palsDatalist = document.getElementById('rosterPalsDatalist');
    
    // Собираем всех уникальных палов
    const palsSet = new Set();
    if (typeof RU_TO_ENG !== 'undefined') Object.keys(RU_TO_ENG).forEach(p => palsSet.add(p));
    if (typeof PAL_DETAILS !== 'undefined') Object.keys(PAL_DETAILS).forEach(p => palsSet.add(p));
    if (typeof DATA_EXT !== 'undefined' && DATA_EXT.breedingPals) DATA_EXT.breedingPals.forEach(p => palsSet.add(p.name));
    const allPals = [...palsSet].sort((a, b) => a.localeCompare(b, 'ru'));

    if (palsDatalist && palsDatalist.children.length === 0) {
      allPals.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        const eng = (typeof RU_TO_ENG !== 'undefined' && RU_TO_ENG[p]) ? ` (${RU_TO_ENG[p]})` : '';
        opt.label = `${p}${eng}`;
        palsDatalist.appendChild(opt);
      });
    }

    if (palSelect && palSelect.options.length <= 1) {
      allPals.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        palSelect.appendChild(opt);
      });
    }
  }

  // Аудит текущего отряда базы
  function auditBase() {
    const matrixContainer = document.getElementById('baseJobMatrix');
    const recsContainer = document.getElementById('baseRecommendations');
    if (!matrixContainer || !recsContainer) return;

    // Собираем все работы текущего состава
    const jobCoverage = {};
    JOBS.forEach(j => {
      jobCoverage[j.key] = { maxLvl: 0, workers: [], info: j };
    });

    currentRoster.forEach(palName => {
      // Ищем данные пала
      let palData = null;
      if (typeof PAL_DETAILS !== 'undefined' && PAL_DETAILS[palName]) {
        palData = PAL_DETAILS[palName];
      } else if (typeof DATA !== 'undefined' && DATA.basePals) {
        palData = DATA.basePals.find(p => p.name === palName);
      }

      if (palData && palData.work) {
        palData.work.forEach(w => {
          // Сопоставляем название работы
          const matchedJob = JOBS.find(j => j.name.toLowerCase().includes(w.job.toLowerCase()) || w.job.toLowerCase().includes(j.name.toLowerCase()));
          if (matchedJob) {
            const entry = jobCoverage[matchedJob.key];
            if (w.level > entry.maxLvl) entry.maxLvl = w.level;
            entry.workers.push({ name: palName, level: w.level });
          }
        });
      } else {
        // Базовый фоллбэк если данных нет
        if (palName.includes('Игнис') || palName === 'Рэнджиши') {
          jobCoverage.kindling.maxLvl = Math.max(jobCoverage.kindling.maxLvl, 3);
          jobCoverage.kindling.workers.push({ name: palName, level: 3 });
        }
        if (palName === 'Анубис') {
          jobCoverage.handiwork.maxLvl = Math.max(jobCoverage.handiwork.maxLvl, 4);
          jobCoverage.handiwork.workers.push({ name: palName, level: 4 });
          jobCoverage.mining.maxLvl = Math.max(jobCoverage.mining.maxLvl, 3);
          jobCoverage.mining.workers.push({ name: palName, level: 3 });
        }
      }
    });

    // Отрисовка матрицы 12 работ
    matrixContainer.innerHTML = JOBS.map(j => {
      const cov = jobCoverage[j.key];
      let statusClass = 'good';
      let statusBadge = `<span class="badge badge-beginner" style="background:#10b981;color:#fff">Lv${cov.maxLvl}</span>`;
      let statusText = `Закрыто (${cov.workers.length} пал.)`;

      if (cov.maxLvl === 0) {
        statusClass = j.critical ? 'danger' : 'warn';
        statusBadge = `<span class="badge" style="background:var(--danger);color:#fff">НЕТ</span>`;
        statusText = j.critical ? '🚨 Критический пробел!' : 'Не назначено';
      } else if (cov.maxLvl <= 2 && j.critical) {
        statusClass = 'warn';
        statusBadge = `<span class="badge" style="background:#f59e0b;color:#000">Lv${cov.maxLvl} Слабо</span>`;
        statusText = '⚠️ Узкое горлышко';
      }

      const borderColor = cov.maxLvl === 0 ? (j.critical ? 'rgba(248,81,73,0.5)' : 'var(--border)') : 'rgba(16,185,129,0.3)';

      return `
        <div style="background:var(--bg3);border:1px solid ${borderColor};border-radius:10px;padding:12px;display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <span style="font-size:16px;display:flex;align-items:center;gap:6px">
                <span>${j.icon}</span> <strong>${j.name}</strong>
              </span>
              ${statusBadge}
            </div>
            <div style="font-size:11.5px;color:var(--text2);margin-bottom:8px;line-height:1.4">${j.desc}</div>
          </div>
          <div style="font-size:11px;color:${cov.maxLvl === 0 ? 'var(--danger)' : 'var(--accent3)'};padding-top:6px;border-top:1px solid rgba(255,255,255,0.05)">
            ${statusText}
          </div>
        </div>
      `;
    }).join('');

    // Генерация рекомендаций по оптимизации
    const recommendations = [];

    JOBS.forEach(j => {
      const cov = jobCoverage[j.key];
      const spec = BEST_SPECIALISTS[j.key];

      if (cov.maxLvl === 0 && j.critical) {
        recommendations.push({
          type: 'critical',
          icon: '🚨',
          title: `Срочно добавьте специалиста: ${j.name}`,
          desc: `На базе никто не умеет выполнять «${j.name}». Ресурсы не будут обрабатываться!`,
          action: `Поставьте <strong>${spec.name}</strong> (Lv${spec.lvl}) или ${spec.alt}. Найти: ${spec.where}.`,
          palToPut: spec.name
        });
      } else if (cov.maxLvl < 3 && j.critical && spec) {
        recommendations.push({
          type: 'upgrade',
          icon: '⚡',
          title: `Ускорение: прокачайте «${j.name}»`,
          desc: `Сейчас максимальный уровень равен Lv${cov.maxLvl}. Это замедляет базу.`,
          action: `Замените слабого рабочего на <strong>${spec.name}</strong> (Lv${spec.lvl}). Где найти: ${spec.where}.`,
          palToPut: spec.name
        });
      }
    });

    if (!recommendations.length) {
      recsContainer.innerHTML = `
        <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px">
          <span style="font-size:32px">👑</span>
          <div>
            <div style="font-size:15px;font-weight:700;color:var(--accent3)">Отряд вашей базы идеален!</div>
            <div style="font-size:12.5px;color:var(--text2);margin-top:2px">Все критические профессии закрыты высокоуровневыми специалистами. Производство работает на максимуме.</div>
          </div>
        </div>
      `;
    } else {
      recsContainer.innerHTML = recommendations.slice(0, 4).map(r => `
        <div style="background:var(--bg2);border:1px solid ${r.type === 'critical' ? 'rgba(248,81,73,0.4)' : 'rgba(230,126,34,0.4)'};border-radius:10px;padding:14px;margin-bottom:10px">
          <div style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:${r.type === 'critical' ? 'var(--danger)' : 'var(--accent)'};margin-bottom:4px">
            <span>${r.icon}</span> <span>${r.title}</span>
          </div>
          <div style="font-size:12.5px;color:var(--text);margin-bottom:6px">${r.desc}</div>
          <div style="font-size:12px;color:var(--text2);background:var(--bg3);padding:8px 10px;border-radius:6px">
            💡 <strong>Совет по замене:</strong> ${r.action}
          </div>
        </div>
      `).join('');
    }

    if (typeof window.enhanceTextPalLinks === 'function') {
      setTimeout(window.enhanceTextPalLinks, 60);
    }
  }

  // Добавление пала (через ввод текста или выбор из списка)
  window._addRosterPal = function () {
    const input = document.getElementById('addPalInput');
    const sel = document.getElementById('addPalSelect');
    let typed = input ? input.value.trim() : '';
    let palToAdd = '';

    // Если игрок написал имя пала в поле ввода
    if (typed) {
      const q = typed.toLowerCase();
      // Поиск подходящего пала
      const palsSet = new Set();
      if (typeof RU_TO_ENG !== 'undefined') Object.keys(RU_TO_ENG).forEach(p => palsSet.add(p));
      if (typeof PAL_DETAILS !== 'undefined') Object.keys(PAL_DETAILS).forEach(p => palsSet.add(p));
      if (typeof DATA_EXT !== 'undefined' && DATA_EXT.breedingPals) DATA_EXT.breedingPals.forEach(p => palsSet.add(p.name));
      const allPals = [...palsSet];

      // 1) Точное совпадение
      let match = allPals.find(p => p.toLowerCase() === q);
      // 2) Совпадение по английскому названию
      if (!match && typeof RU_TO_ENG !== 'undefined') {
        const foundRu = Object.keys(RU_TO_ENG).find(ru => (RU_TO_ENG[ru] || '').toLowerCase() === q);
        if (foundRu) match = foundRu;
      }
      // 3) Начинается с...
      if (!match) {
        match = allPals.find(p => p.toLowerCase().startsWith(q));
      }
      // 4) Содержит подстроку
      if (!match) {
        match = allPals.find(p => p.toLowerCase().includes(q));
      }

      palToAdd = match || typed;
    } else if (sel && sel.value) {
      palToAdd = sel.value;
    }

    if (!palToAdd) {
      if (input) input.focus();
      return;
    }

    if (currentRoster.length >= 20) {
      alert('В отряде базы может быть максимум 20 палов.');
      return;
    }

    currentRoster.push(palToAdd);
    if (input) {
      input.value = '';
      input.focus();
    }
    if (sel) sel.value = '';

    renderRosterUI();
    auditBase();
  };

  // Удаление пала
  window._removeRosterPal = function (idx) {
    currentRoster.splice(idx, 1);
    renderRosterUI();
    auditBase();
  };

  // Загрузка пресета
  window._loadRosterPreset = function (presetKey) {
    if (PRESETS[presetKey]) {
      currentRoster = [...PRESETS[presetKey].pals];
      renderRosterUI();
      auditBase();
    }
  };

  // Экспорт
  window.initBaseAnalyzer = initBaseAnalyzer;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBaseAnalyzer);
  } else {
    initBaseAnalyzer();
  }

})();
