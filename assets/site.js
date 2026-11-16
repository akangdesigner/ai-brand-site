/* ai大師 官網共用腳本 */
(function () {
  var EMAIL_RE = /^\S+@\S+\.\S+$/;

  /* 聯絡表單 → Google 試算表（Apps Script 網頁應用程式網址，見 backend/google-apps-script.gs）
     留空 = 測試模式，資料不會送出 */
  var CONTACT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwQmkogzypt8wuGkXE8ehqy4zZhrsNeN61wOzMkfrARN2Zqj3swXfGF930aLeW8rVU9/exec';

  /* ---- 共用導覽列與頁尾 ---- */
  var page = document.body.getAttribute('data-page');
  var NAV = [
    ['index.html', '首頁', 'home'],
    ['services.html', '服務', 'services'],
    ['about.html', '關於我', 'about'],
    ['newsletter.html', '電子報', 'newsletter'],
    ['contact.html', '聯絡我們', 'contact']
  ];
  var nav = document.querySelector('nav.site');
  if (nav) {
    nav.innerHTML = '<div class="wrap"><a class="wordmark" href="index.html"><span>ai</span>大師</a>' +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-links" aria-label="開啟選單"><span></span><span></span><span></span></button>' +
      '<div class="links" id="site-links">' +
      NAV.map(function (n, i) {
        return '<a href="' + n[0] + '"' + (n[2] === page ? ' aria-current="page"' : '') + '><i class="idx">0' + (i + 1) + '</i>' + n[1] + '</a>';
      }).join('') +
      '<a class="nav-cta" href="contact.html#form">預約諮詢 →</a></div></div>';

    /* 手機版漢堡選單 */
    var tog = nav.querySelector('.nav-toggle');
    function setMenu(open) {
      nav.classList.toggle('open', open);
      document.documentElement.classList.toggle('menu-open', open);
      tog.setAttribute('aria-expanded', open);
      tog.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
    }
    tog.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    nav.querySelectorAll('.links a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); tog.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 760) setMenu(false); });  }
  var foot = document.querySelector('footer.site');
  if (foot) {
    foot.innerHTML =
      '<div class="wrap"><div class="foot-grid">' +
        '<div><a class="wordmark" href="index.html"><span>ai</span>大師</a><p style="margin:0;max-width:280px">中小企業 AI 導入與自動化顧問，以及給新手與中階使用者的 AI 課程。</p></div>' +
        '<div><h4>網站</h4><ul><li><a href="index.html">首頁</a></li><li><a href="services.html">服務</a></li><li><a href="about.html">關於我</a></li></ul></div>' +
        '<div><h4>聯絡</h4><ul><li><a href="contact.html">聯絡我們</a></li><li><a href="newsletter.html">電子報</a></li><li><a href="contact.html#form">預約諮詢</a></li></ul></div>' +
        '<div class="js-sub"><h4>訂閱電子報</h4>' +
          '<form class="sub-form" novalidate><input type="email" name="email" placeholder="輸入你的 Email" aria-label="Email"><button type="submit">訂閱</button></form>' +
          '<p class="ok" role="status" hidden>&gt; 已收到，請至信箱完成驗證。</p></div>' +
      '</div><div class="foot-bottom"><span>© 2026 ai大師</span><span>AI 導入 · 自動化 · 學習</span></div></div>';
  }

  /* ---- 按鈕箭頭：把結尾的 → 包成可動的 span ---- */
  document.querySelectorAll('.btn, .sub-form button, .links a.nav-cta, .text-link').forEach(function (el) {
    var last = el.lastChild;
    if (last && last.nodeType === 3 && /→\s*$/.test(last.nodeValue)) {
      last.nodeValue = last.nodeValue.replace(/\s*→\s*$/, ' ');
      var s = document.createElement('span'); s.className = 'arr'; s.textContent = '→';
      el.appendChild(s);
    }
  });

  /* ---- 常見問題：一次只展開一題，展開／收合有滑動動畫 ---- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function setDetails(d, open) {
    d._target = open;
    if (reduce || !d.animate) { d.open = open; return; }
    var sum = d.querySelector('summary');
    var start = d.offsetHeight + 'px';           // 先記錄目前高度（含動畫中途）
    if (d._anim) d._anim.cancel();
    d.open = true;
    var end = (open ? d.scrollHeight : sum.offsetHeight) + 'px';
    var a = d._anim = d.animate({ height: [start, end] }, { duration: 380, easing: 'cubic-bezier(.7,0,.2,1)' });
    a.onfinish = function () { if (d._anim === a) { d._anim = null; d.open = open; } };
  }
  document.querySelectorAll('.faq').forEach(function (faq) {
    var items = faq.querySelectorAll('details');
    items.forEach(function (d) {
      d._target = d.open;
      d.querySelector('summary').addEventListener('click', function (e) {
        e.preventDefault();
        var open = !d._target;
        if (open) items.forEach(function (o) { if (o !== d && o._target) setDetails(o, false); });
        setDetails(d, open);
      });
    });
  });

  /* ---- 電子報訂閱表單（尚未串接平台） ---- */
  document.querySelectorAll('.js-sub').forEach(function (box) {
    var form = box.querySelector('form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.elements.email;
      if (!input.value || !EMAIL_RE.test(input.value)) {
        input.setCustomValidity('請輸入有效的 Email'); input.reportValidity(); input.setCustomValidity(''); return;
      }
      // TODO: 串接 Mailchimp / Brevo / ConvertKit API
      form.hidden = true;
      var fine = box.querySelector('.fine'); if (fine) fine.hidden = true;
      box.querySelector('.ok').hidden = false;
    });
  });

  /* ---- 聯絡表單（尚未串接後端） ---- */
  var cf = document.getElementById('contact-form');
  if (cf) {
    cf.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      cf.querySelectorAll('[data-required]').forEach(function (el) {
        var v = el.value.trim();
        var bad = !v || (el.type === 'email' && !EMAIL_RE.test(v));
        var msg = el.parentNode.querySelector('.err');
        if (msg) msg.hidden = !bad;
        el.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad && ok) { el.focus(); ok = false; }
      });
      if (!ok) return;

      var done = document.getElementById('contact-ok');
      var btn = cf.querySelector('button[type=submit]');
      var fail = document.getElementById('contact-fail');
      if (fail) fail.hidden = true;

      if (!CONTACT_ENDPOINT) {
        console.warn('CONTACT_ENDPOINT 尚未設定：資料沒有送到 Google 試算表');
        document.getElementById('contact-test').hidden = false;
        cf.hidden = true; done.hidden = false;
        return;
      }

      var data = new URLSearchParams(new FormData(cf));
      data.append('page', location.pathname.split('/').pop() || 'contact.html');
      btn.disabled = true; btn.firstChild.nodeValue = '送出中… ';
      // Apps Script 不回傳 CORS 標頭，用 no-cors 送出（無法讀取回應內容）
      fetch(CONTACT_ENDPOINT, { method: 'POST', mode: 'no-cors', body: data })
        .then(function () { cf.hidden = true; done.hidden = false; })
        .catch(function () { if (fail) fail.hidden = false; })
        .then(function () { btn.disabled = false; btn.firstChild.nodeValue = '送出 '; });
    });
  }

  /* ---- 捲動進場 ---- */
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: .12 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- 圖片佔位：有圖才顯示 ---- */
  document.querySelectorAll('[data-img]').forEach(function (box) {
    var img = box.querySelector('img'), empty = box.querySelector('.empty');
    img.onload = function () { img.hidden = false; if (empty) empty.hidden = true; box.classList.remove('is-empty'); };
    img.src = box.getAttribute('data-img');
  });
})();
