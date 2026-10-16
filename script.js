/* ============================================================
   归去来凤兮 · 个人主页 交互脚本
   原生 JS，零依赖：主题切换 / 移动菜单 / 滚动侦测 /
   导航高亮 / 滚动显现 / QQ 复制 / 页脚年份
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- 页脚年份 ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 深色 / 浅色主题切换（localStorage 记忆） ---------- */
  var toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.body.classList.add('theme-anim');           // 切换瞬间给全局颜色加过渡
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      setTimeout(function () { document.body.classList.remove('theme-anim'); }, 420);
    });
  }

  /* ---------- 移动端菜单 ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');
  if (navToggle && menu) {
    navToggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    });
    // 点完链接自动收起
    menu.addEventListener('click', function (e) {
      if (e.target && e.target.tagName === 'A') {
        menu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 头部：滚过 Hero 后加实色背景 ---------- */
  var header = document.getElementById('site-header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 导航高亮（scroll-spy） ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-menu a[href^="#"]'));
  var linkMap = {};
  navLinks.forEach(function (l) {
    var id = l.getAttribute('href').slice(1);
    var sec = document.getElementById(id);
    if (sec) linkMap[id] = l;
  });
  var spySections = Object.keys(linkMap).map(function (id) { return document.getElementById(id); });
  if ('IntersectionObserver' in window && spySections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          var l = linkMap[en.target.id];
          if (l) l.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    spySections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 滚动显现（同组元素依次淡入） ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    revealEls.forEach(function (el) {
      var group = Array.prototype.slice.call(el.parentNode.children)
        .filter(function (c) { return c.classList.contains('reveal'); });
      var idx = group.indexOf(el);
      if (idx > 0) el.style.transitionDelay = (idx * 0.08) + 's';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in-view');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    // 极老浏览器兜底：直接显示
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- QQ 一键复制 ---------- */
  var qqBtn = document.getElementById('copy-qq');
  var toast = document.getElementById('toast');
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  if (qqBtn) {
    qqBtn.addEventListener('click', function () {
      var qq = qqBtn.getAttribute('data-qq') || '';
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = qq;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          showToast('QQ 号已复制：' + qq);
        } catch (e) {
          showToast('复制失败，请手动复制：' + qq);
        }
        document.body.removeChild(ta);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(qq).then(function () {
          showToast('QQ 号已复制：' + qq);
        }, fallback);
      } else {
        fallback();
      }
    });
  }
})();
