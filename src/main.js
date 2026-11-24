// Simulario landing page: the hero showcase.
// Each tab is a short 24–30 fps screen recording of the real app, played at RATE× speed. A video plays to the end,
// the window holds for HOLD ms, then the next tab's recording fades in; the last tab loops to the first.
(function () {
  'use strict';
  var win = document.querySelector('.win');
  if (!win) return;

  var slides = Array.prototype.slice.call(win.querySelectorAll('.wslide'));
  var tabs = Array.prototype.slice.call(win.querySelectorAll('.wtab'));
  var panes = Array.prototype.slice.call(document.querySelectorAll('.wpane'));
  var bar = win.querySelector('.wprog i');
  var vids = slides.map(function (s) { return s.querySelector('video'); });
  var stills = slides.map(function (s) { return s.querySelector('.still'); });

  var RATE = 1.6;    // playback speed of the recordings
  var HOLD = 150;    // gap after each video ends, before the next one appears
  var APPEAR = 220;  // fade-in of the next recording (matches .wslide.cur in styles.css)
  var FALLBACK = 4500; // if the browser blocks autoplay (e.g. iOS Low Power Mode), advance on a timer

  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var cur = 0, timer = null, resetTimer = null, raf = 0;

  function setBar(p) { bar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, p)) + ')'; }

  // Progress follows the video's own clock, so it moves as smoothly as the video.
  function tick() {
    var v = vids[cur];
    if (v && v.duration) setBar(v.currentTime / v.duration);
    raf = requestAnimationFrame(tick);
  }

  function show(i) {
    var prev = cur;
    cur = i;
    slides.forEach(function (s, k) {
      s.setAttribute('aria-hidden', k === i ? 'false' : 'true');
      s.classList.toggle('cur', k === i);
      s.classList.toggle('was', k === prev && prev !== i);   // stays underneath while the new one fades in
    });
    tabs.forEach(function (t, k) {
      t.classList.toggle('on', k === i);
      t.setAttribute('aria-pressed', k === i ? 'true' : 'false');
    });
    panes.forEach(function (p) { p.hidden = Number(p.dataset.slide) !== i; });
    // The outgoing video keeps its last frame underneath until the new one has appeared, then rewinds.
    clearTimeout(resetTimer);
    resetTimer = setTimeout(function () {
      slides.forEach(function (s) { s.classList.remove('was'); });
      vids.forEach(function (v, k) { if (k !== cur) { v.pause(); v.classList.remove('ready'); try { v.currentTime = 0; } catch (e) {} } });
    }, prev === i ? 0 : APPEAR + 30);
  }

  function next() { play((cur + 1) % slides.length); }

  function play(i, first) {
    clearTimeout(timer);
    show(i);
    setBar(0);
    var v = vids[i];
    try { v.currentTime = 0; } catch (e) {}
    v.defaultPlaybackRate = RATE; v.playbackRate = RATE;
    timer = setTimeout(function () {
      v.playbackRate = RATE;
      var p = v.play();
      if (p && typeof p.catch === 'function') p.catch(function () { timer = setTimeout(next, FALLBACK); });
    }, first ? 300 : 0);   // the next recording starts playing as it fades in
  }

  // A video is shown only once it is actually playing. Until then the still image of its first
  // frame sits underneath, so a loading video never flashes dark.
  vids.forEach(function (v) {
    v.addEventListener('playing', function () { v.classList.add('ready'); });
  });

  vids.forEach(function (v, k) {
    v.addEventListener('ended', function () {
      if (k !== cur || reduce) return;
      setBar(1);
      clearTimeout(timer);
      timer = setTimeout(next, HOLD);
    });
  });

  tabs.forEach(function (t, k) {
    t.addEventListener('click', function () {
      if (reduce) { show(k); setBar(1); }
      else play(k);
    });
  });

  // Pause in a background tab; carry on where it was when the page comes back.
  document.addEventListener('visibilitychange', function () {
    if (reduce) return;
    if (document.hidden) { clearTimeout(timer); vids[cur].pause(); }
    else if (vids[cur].ended) { timer = setTimeout(next, HOLD); }
    else { var p = vids[cur].play(); if (p && p.catch) p.catch(function () {}); }
  });

  if (reduce) {
    // No autoplay: each tab shows the end state of its recording.
    vids.forEach(function (v, k) { v.setAttribute('preload', 'none'); v.classList.remove('ready'); v.style.display = 'none'; stills[k].src = v.dataset.posterEnd; });
    show(0); setBar(1);
  } else {
    raf = requestAnimationFrame(tick);
    play(0, true);
  }
})();
