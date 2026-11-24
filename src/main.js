// Simulario landing page: the hero showcase.
// Each tab is a short frame sequence recorded from the real app. A sequence plays,
// pauses for HOLD ms, then the window slides to the next tab; the last tab loops to the first.
(function () {
  'use strict';
  var win = document.querySelector('.win');
  if (!win) return;

  var slides = Array.prototype.slice.call(win.querySelectorAll('.wslide'));
  var tabs = Array.prototype.slice.call(win.querySelectorAll('.wtab'));
  var panes = Array.prototype.slice.call(document.querySelectorAll('.wpane'));
  var track = win.querySelector('.wtrack');
  var bar = win.querySelector('.wprog i');
  var frames = slides.map(function (s) { return Array.prototype.slice.call(s.querySelectorAll('.fr')); });

  var STEP = [200, 220, 380, 0]; // ms per frame: CT atlas, neuroatlas, hyperfiltration, exam (own timing)
  var HOLD = 1000;               // pause after each animation, before sliding on
  var SLIDE = 650;               // slide transition (matches .wtrack in styles.css)

  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var timers = [];
  var cur = 0;

  function clear() { timers.forEach(clearTimeout); timers = []; }
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }

  function setFrame(f) {
    frames[cur].forEach(function (im, k) { im.classList.toggle('on', k === f); });
    var n = frames[cur].length;
    bar.style.width = (n > 1 ? (f / (n - 1)) * 100 : 100) + '%';
  }

  function show(i) {
    cur = i;
    track.style.transform = 'translateX(' + (-i * (100 / slides.length)) + '%)';
    slides.forEach(function (s, k) {
      s.setAttribute('aria-hidden', k === i ? 'false' : 'true');
      if (k !== i) frames[k].forEach(function (im, j) { im.classList.toggle('on', j === 0); });
    });
    tabs.forEach(function (t, k) {
      t.classList.toggle('on', k === i);
      t.setAttribute('aria-pressed', k === i ? 'true' : 'false');
    });
    panes.forEach(function (p) { p.hidden = Number(p.dataset.slide) !== i; });
  }

  function play(i, first) {
    clear();
    show(i);
    setFrame(0);
    var lead = first ? 900 : SLIDE;
    var n = frames[i].length;
    var end;
    if (i === 3) { // exam: question, then the answer is picked, then the feedback
      at(lead + 1300, function () { setFrame(1); });
      at(lead + 2000, function () { setFrame(2); });
      end = lead + 2000;
    } else {
      for (var k = 1; k < n; k++) (function (k) { at(lead + k * STEP[i], function () { setFrame(k); }); })(k);
      end = lead + (n - 1) * STEP[i];
    }
    at(end + HOLD, function () { play((i + 1) % slides.length); });
  }

  tabs.forEach(function (t, k) {
    t.addEventListener('click', function () {
      if (reduce) { clear(); show(k); setFrame(frames[k].length - 1); }
      else play(k);
    });
  });

  // Don't burn timers in a background tab.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) clear();
    else if (!reduce) play(cur);
  });

  if (reduce) { show(0); setFrame(frames[0].length - 1); }
  else play(0, true);
})();
