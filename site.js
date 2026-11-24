/* Small, framework-free interactions for the portfolio. */
(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js-ready');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const languageButton = document.getElementById('language-toggle');
  const menuButton = document.getElementById('menu-toggle');
  const navigation = document.getElementById('site-nav');
  const motionButton = document.getElementById('motion-toggle');
  const filterStatus = document.getElementById('filter-status');
  const copyButton = document.getElementById('copy-email');
  const copyStatus = document.getElementById('copy-status');
  const sceneButtons = [...document.querySelectorAll('[data-scene]')];
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const papers = [...document.querySelectorAll('article[data-category]')];
  const email = 'eric_l@sjtu.edu.cn';
  const translations = {
    en: {
      pause: 'Pause motion', resume: 'Resume motion',
      menuOpen: 'Open navigation', menuClose: 'Close navigation',
      language: '切换为中文', copied: 'Email copied',
      copyFallback: `Email: ${email}`, copy: 'Copy email',
      filter: (count, category) => `${count} ${category === 'published' ? 'published ' : category === 'preprint' ? 'preprint ' : ''}${count === 1 ? 'work' : 'works'}`,
    },
    zh: {
      pause: '暂停动态', resume: '继续动态',
      menuOpen: '展开导航', menuClose: '收起导航',
      language: 'Switch to English', copied: '邮箱已复制',
      copyFallback: `邮箱：${email}`, copy: '复制邮箱',
      filter: (count, category) => category === 'published' ? `${count} 篇已发表论文` : category === 'preprint' ? `${count} 篇预印本` : `${count} 项研究成果`,
    },
  };
  let language = root.lang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  let paused = reducedMotion.matches;
  let activeFilter = 'all';
  let copyState = '';
  let copyTimer = 0;
  try {
    const saved = localStorage.getItem('yitong-site-language');
    if (saved === 'en' || saved === 'zh') language = saved;
  } catch (_) { /* A private browsing context may disable storage. */ }

  function updateMenuLabel() {
    if (!menuButton) return;
    const open = navigation?.classList.contains('is-open') || false;
    menuButton.setAttribute('aria-label', translations[language][open ? 'menuClose' : 'menuOpen']);
    menuButton.setAttribute('aria-expanded', String(open));
  }
  function setMenu(open) {
    navigation?.classList.toggle('is-open', open);
    updateMenuLabel();
  }
  function updateMotionLabel() {
    if (!motionButton) return;
    motionButton.textContent = translations[language][paused ? 'resume' : 'pause'];
    motionButton.setAttribute('aria-pressed', String(paused));
  }
  function setPaused(value) {
    paused = Boolean(value);
    updateMotionLabel();
    document.dispatchEvent(new CustomEvent('scene-motion', { detail: { paused } }));
  }
  function updateFilterStatus() {
    if (filterStatus) {
      filterStatus.textContent = translations[language].filter(papers.filter(paper => !paper.hidden).length, activeFilter);
    }
  }
  function setFilter(value) {
    if (!['all', 'published', 'preprint'].includes(value)) return;
    activeFilter = value;
    for (const button of filterButtons) {
      const selected = button.dataset.filter === value;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    }
    for (const paper of papers) paper.hidden = value !== 'all' && paper.dataset.category !== value;
    updateFilterStatus();
  }
  function updateCopyStatus() {
    if (copyStatus) copyStatus.textContent = copyState ? translations[language][copyState] : '';
    if (copyButton) copyButton.setAttribute('aria-label', translations[language].copy);
  }
  function setLanguage(value) {
    language = value === 'zh' ? 'zh' : 'en';
    root.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-en][data-zh]').forEach(element => {
      element.textContent = element.getAttribute(`data-${language}`);
    });
    if (languageButton) {
      languageButton.textContent = language === 'en' ? '中文' : 'EN';
      languageButton.setAttribute('aria-label', translations[language].language);
    }
    updateMotionLabel(); updateMenuLabel(); updateFilterStatus(); updateCopyStatus();
    try { localStorage.setItem('yitong-site-language', language); } catch (_) { /* Optional preference. */ }
  }
  function updateSceneButtons(mode) {
    for (const button of sceneButtons) {
      const selected = button.dataset.scene === mode;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    }
  }

  languageButton?.addEventListener('click', () => setLanguage(language === 'en' ? 'zh' : 'en'));
  menuButton?.addEventListener('click', () => setMenu(!navigation?.classList.contains('is-open')));
  navigation?.addEventListener('click', event => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation?.classList.contains('is-open')) {
      setMenu(false); menuButton?.focus();
    }
  });
  motionButton?.addEventListener('click', () => setPaused(!paused));
  filterButtons.forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));
  sceneButtons.forEach(button => button.addEventListener('click', () => {
    // scene.js already calls setMode for these buttons; keep one animation transition.
    updateSceneButtons(button.dataset.scene);
  }));
  copyButton?.addEventListener('click', async () => {
    window.clearTimeout(copyTimer);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(email);
      copyState = 'copied';
      copyTimer = window.setTimeout(() => { copyState = ''; updateCopyStatus(); }, 5000);
    } catch (_) {
      copyState = 'copyFallback';
    }
    updateCopyStatus();
  });
  if (copyStatus) copyStatus.setAttribute('aria-live', 'polite');
  if (filterStatus) filterStatus.setAttribute('aria-live', 'polite');

  const revealElements = [...document.querySelectorAll('.reveal')];
  let revealObserver;
  function revealAll() {
    revealElements.forEach(element => element.classList.add('is-visible'));
    revealObserver?.disconnect();
  }
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px 20px 0px' });
    revealElements.forEach(element => revealObserver.observe(element));
  }
  function onMotionPreference(event) {
    setPaused(event.matches);
    if (event.matches) revealAll();
  }
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', onMotionPreference);
  else reducedMotion.addListener(onMotionPreference);

  setFilter('all');
  updateSceneButtons('cloth');
  // Initialize the public canvas API once, without rebinding its click handlers.
  window.researchScene?.setMode('cloth');
  setMenu(false);
  setLanguage(language);
  setPaused(paused);
})();
