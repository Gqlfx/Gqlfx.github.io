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

    // 下滑引导：滚过首屏一小段后就退场
    if (scrollHint) scrollHint.classList.toggle('is-gone', y > 140);
  }

  var scrollHint = document.querySelector('.scroll-hint');
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

  /* ============================================================
     终端小游戏（game 命令）
     ============================================================ */
  var currentGame = null;   // 进行中的游戏：{ handle(name,args,raw), stop() }
  var prefersReduced = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function endGame(msg) {
    if (currentGame && currentGame.stop) { try { currentGame.stop(); } catch (e) {} }
    currentGame = null;
    if (msg) print(msg);
  }
  // 关闭终端时静默停掉游戏（清定时器，防止后台空转）
  function stopCurrentGame() {
    if (currentGame && currentGame.stop) { try { currentGame.stop(); } catch (e) {} }
    currentGame = null;
  }
  // 启动游戏：handle(g, name, args, raw) 返回是否消费了这次输入
  function playGame(g, handle) {
    stopCurrentGame();
    currentGame = {
      handle: function (n, a, r) { return handle(g, n, a, r); },
      stop: g.stop || null
    };
  }
  // 游戏画面：一个可反复重绘的 <p>，textContent 写入，天然无注入风险
  function gameCanvas() {
    var el = document.createElement('p');
    el.className = 'term-pre';
    termOut.appendChild(el);
    return el;
  }
  function canvasDraw(el, lines) {
    el.textContent = lines.join('\n');
    scrollTerm();
  }

  var GAME_LIST = [
    { keys: ['1', 'guess'], name: '猜数字' },
    { keys: ['2', 'ttt'], name: '井字棋' },
    { keys: ['3', 'mine'], name: '扫雷' },
    { keys: ['4', 'life'], name: '生命游戏' }
  ];
  function gameMenu() {
    print('<span class="t-key">终端游戏厅</span>');
    print('<span class="t-dim">──────────────────────────────</span>');
    print('  <b>1</b>  猜数字    <span class="t-dim">1 – 100，提示帮你收窄范围</span>');
    print('  <b>2</b>  井字棋    <span class="t-dim">和内置 AI 下一盘</span>');
    print('  <b>3</b>  扫雷      <span class="t-dim">6 × 6 · 6 颗雷</span>');
    print('  <b>4</b>  生命游戏  <span class="t-dim">康威生命游戏，纯观赏</span>');
    print('');
    print('<span class="t-dim">game <编号或名字> 开始，如 game 1 · 游戏中 quit 退出</span>');
  }
  function gameHelp() {
    print('<span class="t-key">游戏中</span>');
    print('  按当前游戏的提示输入（数字 / move 5 / dig b3 ...）');
    print('  <b>quit</b>   退出游戏');
    print('  <b>clear</b>  清屏（游戏继续）');
    print('  <b>game</b>   打开游戏菜单');
  }

  /* ---------- 1. 猜数字 ---------- */
  function guessStart() {
    var g = {
      secret: 1 + Math.floor(Math.random() * 100),
      tries: 0, lo: 1, hi: 100, log: []
    };
    playGame(g, guessHandle);
    print('<span class="t-key">猜数字</span> <span class="t-dim">我已经想好一个 1 – 100 的数</span>');
    print('<span class="t-dim">直接输入数字即可，提示会帮你收窄范围。</span>');
    guessRender(g);
  }
  function guessRender(g) {
    var cells = 20, bar = '', i, v0, v1;
    for (i = 0; i < cells; i++) {
      v0 = 1 + (i * 99) / cells;
      v1 = 1 + ((i + 1) * 99) / cells;
      bar += (v1 >= g.lo && v0 <= g.hi) ? '█' : '░';
    }
    print('');
    print('  <span class="t-dim">1</span> ' + bar + ' <span class="t-dim">100</span>');
    print('  当前范围 <b>' + g.lo + ' – ' + g.hi + '</b>（还有 ' + (g.hi - g.lo + 1) + ' 种可能）');
    if (g.log.length) {
      print('  已猜 ' + g.log.map(function (h) {
        return h.n + (h.big ? '<span class="t-err">↑大</span>' : '<span class="t-dim">↓小</span>');
      }).join('   '));
    }
  }
  function guessHandle(g, name, args, raw) {
    var n = null;
    if (name === 'guess') n = parseInt(args, 10);
    else if (/^\d{1,3}$/.test(raw.trim())) n = parseInt(raw.trim(), 10);
    if (n === null || isNaN(n)) return false;
    if (n < 1 || n > 100) { print('<span class="t-err">超出范围，请输入 1 – 100。</span>'); return true; }
    var dup = g.log.some(function (h) { return h.n === n; });
    if (dup) { print('<span class="t-dim">' + n + ' 猜过了，换一个。</span>'); return true; }
    g.tries++;
    if (n === g.secret) {
      var rate = g.tries <= 5 ? '神算子，这直觉没谁了。'
        : g.tries <= 8 ? '不错，效率挺高。' : '赢了！节奏还能再压压。';
      print('');
      print('  <span class="t-key">' + n + '</span> 就是它！用了 <b>' + g.tries + '</b> 次 —— ' + rate);
      print('  <span class="t-dim">再来一局：game guess</span>');
      endGame(null);
      return true;
    }
    if (n < g.secret) {
      g.lo = Math.max(g.lo, n + 1);
      g.log.push({ n: n, big: false });
      print('  <b>' + n + '</b> <span class="t-dim">小了</span>');
    } else {
      g.hi = Math.min(g.hi, n - 1);
      g.log.push({ n: n, big: true });
      print('  <b>' + n + '</b> <span class="t-err">大了</span>');
    }
    guessRender(g);
    return true;
  }

  /* ---------- 2. 井字棋 ---------- */
  var TTT_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  function tttStart() {
    var g = { board: ['1','2','3','4','5','6','7','8','9'], over: false };
    g.stop = function () {
      if (!g.over && g.el && g.el.parentNode) g.el.parentNode.removeChild(g.el);
    };
    playGame(g, tttHandle);
    print('<span class="t-key">井字棋</span> <span class="t-dim">你执 X 先行，AI 执 O</span>');
    print('<span class="t-dim">move 5 或直接输入 5 落子。</span>');
    g.el = gameCanvas();   // 画布放在说明之后，避免棋盘浮在标题上方
    tttRender(g);
  }
  function tttRender(g) {
    var b = g.board;
    canvasDraw(g.el, [
      '  ┌───┬───┬───┐',
      '  │ ' + b[0] + ' │ ' + b[1] + ' │ ' + b[2] + ' │',
      '  ├───┼───┼───┤',
      '  │ ' + b[3] + ' │ ' + b[4] + ' │ ' + b[5] + ' │',
      '  ├───┼───┼───┤',
      '  │ ' + b[6] + ' │ ' + b[7] + ' │ ' + b[8] + ' │',
      '  └───┴───┴───┘'
    ]);
  }
  function tttWin(b) {
    for (var i = 0; i < TTT_LINES.length; i++) {
      var l = TTT_LINES[i];
      if (b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return b[l[0]];
    }
    return null;
  }
  function tttFull(b) {
    for (var i = 0; i < 9; i++) if (b[i] !== 'X' && b[i] !== 'O') return false;
    return true;
  }
  function tttAi(b) {
    var empty = [], i;
    for (i = 0; i < 9; i++) if (b[i] !== 'X' && b[i] !== 'O') empty.push(i);
    function pick(mark) {
      for (var k = 0; k < empty.length; k++) {
        var t = b.slice(); t[empty[k]] = mark;
        if (tttWin(t) === mark) return empty[k];
      }
      return -1;
    }
    var w = pick('O'); if (w >= 0) return w;
    var bl = pick('X'); if (bl >= 0) return bl;
    if (empty.indexOf(4) >= 0) return 4;
    var corners = [0, 2, 6, 8].filter(function (c) { return empty.indexOf(c) >= 0; });
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
    return empty[Math.floor(Math.random() * empty.length)];
  }
  function tttHandle(g, name, args, raw) {
    if (g.over) { endGame(null); print('<span class="t-dim">上局已结束，game ttt 再来一局。</span>'); return true; }
    var cell = -1;
    if (name === 'move') cell = parseInt(args, 10) - 1;
    else if (/^[1-9]$/.test(raw.trim())) cell = parseInt(raw.trim(), 10) - 1;
    if (cell < 0 || cell > 8) return false;
    if (g.board[cell] === 'X' || g.board[cell] === 'O') {
      print('<span class="t-dim">这个位置被占了。</span>'); return true;
    }
    g.board[cell] = 'X';
    if (tttWin(g.board) === 'X') { tttRender(g); print('  <span class="t-key">你赢了。</span>AI 陷入了沉思。'); g.over = true; endGame(null); return true; }
    if (tttFull(g.board)) { tttRender(g); print('  平局，势均力敌。'); g.over = true; endGame(null); return true; }
    g.board[tttAi(g.board)] = 'O';
    if (tttWin(g.board) === 'O') { tttRender(g); print('  <span class="t-err">AI 赢了。</span>game ttt 再来一局。'); g.over = true; endGame(null); return true; }
    if (tttFull(g.board)) { tttRender(g); print('  平局，势均力敌。'); g.over = true; endGame(null); return true; }
    tttRender(g);
    print('<span class="t-dim">该你了（1 – 9）。</span>');
    return true;
  }

  /* ---------- 3. 扫雷 ---------- */
  var MINE_ROWS = 'ABCDEF';
  function mineStart() {
    var g = { open: 0, started: false, over: false, grid: [], vis: [], flag: [] };
    var y, x;
    for (y = 0; y < 6; y++) {
      var a = [], b = [], c = [];
      for (x = 0; x < 6; x++) { a.push(0); b.push(false); c.push(false); }
      g.grid.push(a); g.vis.push(b); g.flag.push(c);
    }
    g.stop = function () {
      if (!g.over && g.el && g.el.parentNode) g.el.parentNode.removeChild(g.el);
    };
    playGame(g, mineHandle);
    print('<span class="t-key">扫雷</span> <span class="t-dim">6 × 6 · 6 颗雷</span>');
    print('<span class="t-dim">dig b3 挖开 · flag b3 标记 · 第一挖必安全</span>');
    g.el = gameCanvas();   // 同上：说明之后才是棋盘
    mineRender(g);
  }
  function mineRender(g, reveal) {
    var L = [], y, x;
    L.push('     1 2 3 4 5 6');
    for (y = 0; y < 6; y++) {
      var row = '   ' + MINE_ROWS[y] + ' ';
      for (x = 0; x < 6; x++) {
        var ch;
        if (!g.vis[y][x]) {
          ch = (reveal && g.grid[y][x] === -1) ? '*' : (g.flag[y][x] ? 'F' : '?');
        } else if (g.grid[y][x] === -1) ch = '*';
        else if (g.grid[y][x] === 0) ch = '·';
        else ch = String(g.grid[y][x]);
        row += ch + (x < 5 ? ' ' : '');
      }
      L.push(row);
    }
    L.push('   已挖 ' + g.open + ' / 30 · 雷 6');
    canvasDraw(g.el, L);
  }
  function minePlace(g, sr, sc) {
    var ban = {}, y, x, placed = 0;
    for (y = sr - 1; y <= sr + 1; y++) for (x = sc - 1; x <= sc + 1; x++) ban[y + ',' + x] = 1;
    while (placed < 6) {
      y = Math.floor(Math.random() * 6); x = Math.floor(Math.random() * 6);
      if (ban[y + ',' + x] || g.grid[y][x] === -1) continue;
      g.grid[y][x] = -1; placed++;
    }
    for (y = 0; y < 6; y++) for (x = 0; x < 6; x++) {
      if (g.grid[y][x] === -1) continue;
      var n = 0, dy, dx;
      for (dy = -1; dy <= 1; dy++) for (dx = -1; dx <= 1; dx++) {
        if (!dy && !dx) continue;
        var ny = y + dy, nx = x + dx;
        if (ny >= 0 && ny < 6 && nx >= 0 && nx < 6 && g.grid[ny][nx] === -1) n++;
      }
      g.grid[y][x] = n;
    }
  }
  function mineReveal(g, y, x) {
    if (y < 0 || y > 5 || x < 0 || x > 5 || g.vis[y][x] || g.flag[y][x]) return;
    g.vis[y][x] = true; g.open++;
    if (g.grid[y][x] !== 0) return;
    for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
      if (!dy && !dx) continue;
      mineReveal(g, y + dy, x + dx);
    }
  }
  function mineCell(s) {
    var m = /^([a-f])\s*([1-6])$/.exec(String(s).toLowerCase().trim());
    if (!m) return null;
    var y = MINE_ROWS.toLowerCase().indexOf(m[1]);
    return (y < 0) ? null : { y: y, x: parseInt(m[2], 10) - 1 };
  }
  function mineHandle(g, name, args, raw) {
    if (g.over) { endGame(null); print('<span class="t-dim">上局已结束，game mine 再来一局。</span>'); return true; }
    var act = 'dig', cell;
    if (name === 'flag' || name === 'f') { act = 'flag'; cell = mineCell(args); }
    else if (name === 'dig' || name === 'd') { cell = mineCell(args); }
    else { cell = mineCell(raw.trim()); }
    if (!cell) return false;
    if (act === 'dig' && g.flag[cell.y][cell.x] && !g.vis[cell.y][cell.x]) {
      print('<span class="t-dim">' + MINE_ROWS[cell.y] + (cell.x + 1) + ' 已标记，先 flag 取消。</span>');
      return true;
    }
    if (act === 'flag' && !g.vis[cell.y][cell.x]) {
      g.flag[cell.y][cell.x] = !g.flag[cell.y][cell.x];
      mineRender(g); return true;
    }
    if (!g.started) { g.started = true; minePlace(g, cell.y, cell.x); }
    if (g.grid[cell.y][cell.x] === -1) {
      g.over = true;
      mineRender(g, true);
      print('  <span class="t-err">踩雷了。</span>game mine 再来一局。');
      endGame(null);
      return true;
    }
    mineReveal(g, cell.y, cell.x);
    mineRender(g);
    if (g.open >= 30) {
      g.over = true;
      print('  <span class="t-key">全部排除，你赢了。</span>');
      endGame(null);
    }
    return true;
  }

  /* ---------- 4. 生命游戏 ---------- */
  function lifeStart() {
    if (prefersReduced) {
      print('<span class="t-dim">检测到系统「减少动态效果」已开启，生命游戏不自动播放。</span>');
      print('<span class="t-dim">试试 game guess / game ttt / game mine。</span>');
      return;
    }
    var w = Math.max(20, Math.min(56, Math.floor((termBody.clientWidth - 30) / 7.8)));
    var h = Math.max(10, Math.min(16, Math.round(w * 0.3)));
    var g = { w: w, h: h, gen: 0, grid: [], timer: null };
    var y, x;
    for (y = 0; y < h; y++) {
      var row = [];
      for (x = 0; x < w; x++) row.push(Math.random() < 0.28 ? 1 : 0);
      g.grid.push(row);
    }
    g.stop = function () {
      if (g.timer) { clearInterval(g.timer); g.timer = null; }
      if (g.el && g.el.parentNode) g.el.parentNode.removeChild(g.el);
    };
    playGame(g, lifeHandle);
    print('<span class="t-key">生命游戏</span> <span class="t-dim">康威生命游戏 · 任意输入停止</span>');
    g.el = gameCanvas();   // 同上
    lifeDraw(g);
    g.timer = setInterval(function () { lifeStep(g); lifeDraw(g); }, 260);
  }
  function lifeDraw(g) {
    var L = [], y, x, row;
    for (y = 0; y < g.h; y++) {
      row = '';
      for (x = 0; x < g.w; x++) row += g.grid[y][x] ? '█' : '·';
      L.push(row);
    }
    L.push('  第 ' + g.gen + ' 代 · 任意输入停止');
    canvasDraw(g.el, L);
  }
  function lifeStep(g) {
    var next = [], y, x, dy, dx, n;
    for (y = 0; y < g.h; y++) {
      var row = [];
      for (x = 0; x < g.w; x++) {
        n = 0;
        for (dy = -1; dy <= 1; dy++) for (dx = -1; dx <= 1; dx++) {
          if (!dy && !dx) continue;
          n += g.grid[(y + dy + g.h) % g.h][(x + dx + g.w) % g.w];
        }
        row.push(g.grid[y][x] ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0));
      }
      next.push(row);
    }
    g.grid = next;
    g.gen++;
  }
  function lifeHandle(g, name, args, raw) {
    g.stop();
    endGame(null);
    print('<span class="t-dim">生命游戏已停止（第 ' + g.gen + ' 代）。</span>');
    return true;
  }

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
      print('  <b>game</b>        终端游戏厅（猜数字/井字棋/扫雷/生命游戏）');
      print('  <b>echo</b> ...    复读机');
      print('  <b>clear</b>       清屏');
      print('  <b>exit / quit</b> 关闭终端');
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
      print('<span class="t-dim">about/  skills/  path/  ai/  contact/  games/  secret/</span>');
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
    game: function (args) {
      var key = String(args || '').trim().toLowerCase();
      if (!key) { gameMenu(); return; }
      var i, id = null;
      for (i = 0; i < GAME_LIST.length; i++) {
        if (GAME_LIST[i].keys.indexOf(key) >= 0) { id = GAME_LIST[i].keys[0]; break; }
      }
      if (!id) { print('<span class="t-err">没有这个游戏：' + esc(key) + '</span>'); gameMenu(); return; }
      if (id === '1') guessStart();
      else if (id === '2') tttStart();
      else if (id === '3') mineStart();
      else lifeStart();
    },
    clear: function () { termOut.innerHTML = ''; },
    exit: function () { bye(); },
    quit: function () { bye(); },
    q: function () { bye(); }
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

    // 游戏进行中：输入优先交给当前游戏处理
    if (currentGame) {
      if (name === 'quit' || name === 'exit' || name === 'q') { endGame('已退出游戏。输入 <b>game</b> 再来一局。'); scrollTerm(); return; }
      if (name === 'clear') { termOut.innerHTML = ''; scrollTerm(); return; }
      if (name === 'game') {
        endGame(null);
        if (args) { COMMANDS.game(args); } else { gameMenu(); }
        scrollTerm();
        return;
      }
      if (name === 'help') { gameHelp(); scrollTerm(); return; }
      if (currentGame.handle(name, args, cmd)) { scrollTerm(); return; }
      print('<span class="t-dim">游戏不认识的输入。<b>help</b> 看玩法，<b>quit</b> 退出。</span>');
      scrollTerm();
      return;
    }

    if (name === 'echo') {
      print(esc(args));
    } else if (name === 'sudo') {
      print('<span class="t-err">权限不足：你现在只是一名大一学生。</span>');
    } else if (name === 'rm') {
      print('<span class="t-err">别别别，这个站我刚搭好，还没备份呢。</span>');
    } else if (name === 'cat' && /resume|简历/.test(args)) {
      print('<span class="t-dim">resume.pdf 不存在 —— 还没什么可写的，先欠着。</span>');
    } else if (name === 'cat') {
      print('<span class="t-dim">没有这个文件。试试 <b>ls</b>。</span>');
    } else if (name === 'hello' || name === 'hi' || name === '你好') {
      print('你好！输入 <b>help</b> 看看能做什么。');
    } else if (COMMANDS[name]) {
      COMMANDS[name](args);
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
  var byeTimer = null;
  function closeTerm() {
    if (!terminal) return;
    clearTimeout(byeTimer);
    stopCurrentGame();
    // 先让输入框同步失焦：否则本次按键的 keyup 会落到刚被归还焦点的触发按钮上，
    // Enter 激活按钮产生合成 click，终端关了又立刻弹回（表现为"闪一下"）
    if (document.activeElement === termInput) termInput.blur();
    terminal.hidden = true;
    document.body.style.overflow = '';
    // 焦点归还要等本次按键的 keyup 派发完再执行；preventScroll 避免页面跳动
    if (lastFocus && lastFocus.focus) {
      setTimeout(function () {
        if (terminal.hidden) lastFocus.focus({ preventScroll: true });
      }, 260);
    }
  }
  // 告别语：打印 logout 后稍候再关，让用户看得见反馈
  function bye() {
    print('<span class="t-key">logout</span>');
    print('再见。按 <b>`</b> 随时回来。');
    scrollTerm();
    clearTimeout(byeTimer);
    byeTimer = setTimeout(closeTerm, 420);
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
