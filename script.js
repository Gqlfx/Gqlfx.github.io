/* ============================================================
   归去来凤兮 · 个人主页  v2
   原生 JS，零依赖：主题切换 / 移动菜单 / 滚动侦测 / 导航高亮 /
   滚动显现 / Bento 高光与倾斜 / Hero 视差 / 天数统计 /
   QQ 复制 / 终端彩蛋
   所有动效均尊重系统「减少动态效果」设置。
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 页脚年份 ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- 深色 / 浅色主题切换（localStorage 记忆） ---------- */
  var toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.body.classList.add('theme-anim');           // 切换瞬间给全局颜色加过渡
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      clearTimeout(toggle._t);
      toggle._t = setTimeout(function () { document.body.classList.remove('theme-anim'); }, 420);
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

  /* ---------- 头部：滚过 Hero 后加实色背景 + 导航高亮 + Hero 视差 ---------- */
  var header = document.getElementById('site-header');
  var heroBg = document.querySelector('.hero-bg');
  var heroInner = document.querySelector('.hero-inner');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-menu a[href^="#"]'));
  var spySections = navLinks.map(function (l) {
    return document.getElementById(l.getAttribute('href').slice(1));
  }).filter(Boolean);

  function onHeroParallax() {
    if (!heroBg || reduceMotion) return;
    var y = window.scrollY;
    if (y > window.innerHeight) return;
    heroBg.style.transform = 'translateY(' + (y * 0.16) + 'px)';
    if (heroInner) {
      heroInner.style.transform = 'translateY(' + (y * 0.06) + 'px)';
      heroInner.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.85)));
    }
  }

  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 24);

    // scroll-spy：手动计算，比 IO 更稳
    var pos = y + 120;
    var current = spySections[0];
    for (var i = 0; i < spySections.length; i++) {
      if (spySections[i].offsetTop <= pos) current = spySections[i];
    }
    if (window.innerHeight + y >= document.body.offsetHeight - 4) {
      current = spySections[spySections.length - 1];
    }
    navLinks.forEach(function (l) {
      l.classList.toggle('active', !!current && l.getAttribute('href') === '#' + current.id);
    });

    onHeroParallax();
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  /* ---------- 滚动显现（同组元素依次淡入） ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !reduceMotion) {
    revealEls.forEach(function (el) {
      var group = Array.prototype.slice.call(el.parentNode.children)
        .filter(function (c) { return c.classList.contains('reveal'); });
      var idx = group.indexOf(el);
      if (idx > 0) el.style.transitionDelay = Math.min(idx * 70, 350) + 'ms';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in-view');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- 关键词滚动带：复制一份实现无缝循环 ---------- */
  var track = document.querySelector('.marquee-track');
  if (track) track.innerHTML += track.innerHTML;

  /* ---------- 「学编程第 N 天」自动计算 + 数字滚动 ---------- */
  var PROFILE = { start: '2026-09-01' };

  function daysSince(dateStr) {
    var s = new Date(dateStr + 'T00:00:00');
    var n = new Date();
    var a = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
    var b = Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
    return Math.max(0, Math.round((b - a) / 86400000));
  }

  var countEls = Array.prototype.slice.call(document.querySelectorAll('.count'));
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-days'), 10);
    if (isNaN(target)) return;
    if (reduceMotion) { el.textContent = String(target); return; }
    var dur = 1100, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  countEls.forEach(function (el) {
    var s = el.getAttribute('data-start') || PROFILE.start;
    el.setAttribute('data-days', String(daysSince(s)));
  });
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    countEls.forEach(function (el) { cio.observe(el); });
  } else {
    countEls.forEach(runCounter);
  }

  /* ---------- 学习轨迹：折叠 / 展开更早的节点 ---------- */
  var timeline = document.getElementById('timeline');
  var tlToggle = document.getElementById('tl-toggle');
  if (timeline && tlToggle) {
    var tlLabel = tlToggle.querySelector('.tl-toggle-label');
    var tlCount = timeline.querySelectorAll('.tl-earlier').length;
    tlToggle.addEventListener('click', function () {
      var open = timeline.classList.toggle('open');
      tlToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (tlLabel) tlLabel.textContent = open ? '收起' : '展开更早的 ' + tlCount + ' 个节点';
    });
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

  /* ============================================================
     终端彩蛋
     ============================================================ */
  var terminal = document.getElementById('terminal');
  var termInput = document.getElementById('term-input');
  var termOut = document.getElementById('term-out');
  var termBody = document.getElementById('term-body');
  var lastFocus = null;
  var history = [];
  var hIdx = -1;

  var INFO = {
    name: '宋宇强',
    alias: '归去来凤兮',
    nick: '栖迟',
    school: '沈阳理工大学',
    major: '计算机科学与技术',
    grade: '2026 级',
    email: 'aikken150@gmail.com',
    github: 'https://github.com/Gqlfx',
    qq: '1005622697',
    start: '2026-09-01'
  };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function print(html) {
    var p = document.createElement('p');
    p.innerHTML = html;
    termOut.appendChild(p);
  }
  function printEcho(cmd) {
    print('<span class="pmt-user">guest@gqlfx</span><span class="pmt-sep">:</span>'
      + '<span class="pmt-path">~</span><span class="pmt-dollar">$</span> ' + esc(cmd));
  }
  function scrollTerm() { termBody.scrollTop = termBody.scrollHeight; }

  var COMMANDS = {
    help: function () {
      print('<span class="t-key">可用命令</span>');
      print('  <b>whoami</b>      我是谁');
      print('  <b>skills</b>      技能栈');
      print('  <b>path</b>        学习轨迹');
      print('  <b>ai</b>          AI 探索');
      print('  <b>contact</b>     联系方式');
      print('  <b>github</b>      打开我的 GitHub');
      print('  <b>days</b>        学编程第几天了');
      print('  <b>ls</b>          这个站点有什么');
      print('  <b>neofetch</b>    一份系统信息');
      print('  <b>date</b>        现在几点');
      print('  <b>echo</b> ...    复读机');
      print('  <b>clear</b>       清屏');
      print('  <span class="t-dim">提示：↑ ↓ 翻历史命令，Tab 补全</span>');
    },
    whoami: function () {
      print('<b>' + INFO.name + '</b> / ' + INFO.alias
        + ' <span class="t-dim">(朋友叫我「' + INFO.nick + '」)</span>');
      print(INFO.school + ' · ' + INFO.major + ' · ' + INFO.grade);
      print('小学开始对编程感兴趣，断断续续自学过一些；2026 年 9 月起系统学习，从 C 语言入手，现在还在基础阶段。');
      print('对 AI 应用和前端都有兴趣，还没决定主攻哪个。');
    },
    skills: function () {
      print('<span class="t-key">技能栈</span> <span class="t-dim">（如实标注，不夸大）</span>');
      print('  主攻      C 语言            <span class="t-dim">[■■□□□] 基础阶段</span>');
      print('  碰过      Python            <span class="t-dim">[■□□□□]</span>');
      print('  碰过      HTML / CSS / JS   <span class="t-dim">[■□□□□] 能看懂一点</span>');
      print('  工具      Git / GitHub      <span class="t-dim">[■□□□□] 正在用</span>');
      print('  工具      VS Code           <span class="t-dim">[■□□□□] 日常编辑器</span>');
      print('  工具      终端 / 命令行      <span class="t-dim">[■□□□□] 你正在用的这个</span>');
      print('  实践中    AI 辅助开发        <span class="t-dim">[■■□□□] 这个网站就是证据</span>');
    },
    path: function () {
      print('<span class="t-key">学习轨迹</span> <span class="t-dim">（越往下，越早）</span>');
      print('  2026.09 – 现在  系统学 C 语言，从 Hello World 到指针');
      print('  2026.09        入学 · ' + INFO.school + ' ' + INFO.major);
      print('  2023           第一个 AI 作品，靠 AI 搭手完成的');
      print('  2021           第一个有实际功能的 Python 程序');
      print('  2018           第一次 Hello World');
      print('  2018           初识编程，小学开始感兴趣');
    },
    ai: function () {
      print('<span class="t-key">AI 探索</span>');
      print('  1. 本站点 —— 从想法、设计到代码，和 AI 一轮轮聊出来的。');
      print('  2. 你正在看的这个终端 —— 也是一次「借 AI 造东西」的实验。');
      print('  <span class="t-dim">其余位置先空着，等下一次探索。</span>');
    },
    contact: function () {
      print('<span class="t-key">联系方式</span>');
      print('  邮箱    ' + INFO.email);
      print('  GitHub  ' + INFO.github);
      print('  QQ      ' + INFO.qq + ' <span class="t-dim">（页面上点击即可复制）</span>');
      print('<span class="t-dim">社团前辈、同路伙伴、想聊聊 AI 或学习的朋友，都欢迎来信，我会回。</span>');
    },
    github: function () {
      print('正在打开 ' + INFO.github + ' ...');
      window.open(INFO.github, '_blank', 'noopener');
    },
    days: function () {
      var d = daysSince(INFO.start);
      print('从 ' + INFO.start + ' 算起，今天是学编程的第 <b>' + d + '</b> 天。');
      print('<span class="t-dim">这个数字每天会自己长，急不来。</span>');
    },
    ls: function () {
      print('<span class="t-dim">about/  skills/  path/  ai/  contact/  secret/</span>');
    },
    neofetch: function () {
      var d = daysSince(INFO.start);
      [
        '<span class="t-key">guest@gqlfx</span>',
        '<span class="t-dim">-------------------------------</span>',
        'OS        : 归去来凤兮 Personal Site v2',
        'Host      : GitHub Pages',
        'Shell     : gui-sh',
        'Editor    : VS Code + AI',
        'Language  : C (系统学中), Python/HTML/CSS/JS (碰过)',
        'Location  : ' + INFO.school,
        'Major     : ' + INFO.major + ' · ' + INFO.grade,
        'Uptime    : 学编程 ' + d + ' 天',
        'Theme     : 暖砂 × 赤陶'
      ].forEach(function (l) { print(l); });
    },
    date: function () {
      print(new Date().toLocaleString('zh-CN', { hour12: false }));
    },
    clear: function () { termOut.innerHTML = ''; },
    exit: function () { closeTerm(); },
    quit: function () { closeTerm(); },
    q: function () { closeTerm(); }
  };

  function run(raw) {
    var cmd = raw.trim();
    printEcho(cmd);
    if (!cmd) { scrollTerm(); return; }

    history.push(cmd);
    hIdx = history.length;

    var parts = cmd.split(/\s+/);
    var name = parts[0].toLowerCase();
    var args = parts.slice(1).join(' ');

    if (name === 'echo') {
      print(esc(args));
    } else if (name === 'sudo') {
      print('<span class="t-err">权限不足：你现在只是一名大一学生。</span>');
    } else if (name === 'rm') {
      print('<span class="t-err">别别别，这个站还要交作业。</span>');
    } else if (name === 'cat' && /resume|简历/.test(args)) {
      print('<span class="t-dim">resume.pdf 不存在 —— 还没什么可写的，先欠着。</span>');
    } else if (name === 'cat') {
      print('<span class="t-dim">没有这个文件。试试 <b>ls</b>。</span>');
    } else if (name === 'hello' || name === 'hi' || name === '你好') {
      print('你好！输入 <b>help</b> 看看能做什么。');
    } else if (COMMANDS[name]) {
      COMMANDS[name]();
    } else {
      print('<span class="t-err">command not found: ' + esc(name) + '</span>');
      print('<span class="t-dim">输入 <b>help</b> 看看能做什么。</span>');
    }
    scrollTerm();
  }

  function openTerm() {
    if (!terminal) return;
    lastFocus = document.activeElement;
    terminal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(function () { termInput.focus(); }, 40);
  }
  function closeTerm() {
    if (!terminal) return;
    terminal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  if (terminal && termInput && termBody) {
    ['term-open', 'hero-term-open', 'footer-term-open'].forEach(function (id) {
      var b = document.getElementById(id);
      if (b) b.addEventListener('click', openTerm);
    });
    document.getElementById('term-close').addEventListener('click', closeTerm);
    document.getElementById('terminal-backdrop').addEventListener('click', closeTerm);

    termInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var v = termInput.value;
        termInput.value = '';
        run(v);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (hIdx > 0) { hIdx--; termInput.value = history[hIdx] || ''; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (hIdx < history.length - 1) { hIdx++; termInput.value = history[hIdx] || ''; }
        else { hIdx = history.length; termInput.value = ''; }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        var v = termInput.value.trim().toLowerCase();
        if (v) {
          var hit = Object.keys(COMMANDS).filter(function (k) { return k.indexOf(v) === 0; })[0];
          if (hit) termInput.value = hit;
        }
      }
    });

    // 点击终端空白处把焦点送回输入框
    termBody.addEventListener('click', function (e) {
      if (e.target === termBody || e.target === termOut) termInput.focus();
    });

    // Esc 关闭；反引号 ` 开 / 关
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !terminal.hidden) { closeTerm(); return; }
      if (e.code === 'Backquote') {
        var t = e.target;
        var tag = t && t.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        if (terminal.hidden) openTerm(); else closeTerm();
      }
    });
  }
})();
