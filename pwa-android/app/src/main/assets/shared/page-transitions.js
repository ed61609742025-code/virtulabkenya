// ============================================================
//  VirtuLab Kenya — Ultra-Smooth Instant Page Transitions & Pre-fetch
//  App-like zero-flicker transitions, turbo top bar & tactile feedback
// ============================================================

(function() {
  'use strict';

  const PREFETCHED_URLS = new Set();
  let progressBar = null;
  let progressTimer = null;

  function ensureProgressBar() {
    if (progressBar && document.body.contains(progressBar)) return progressBar;
    progressBar = document.getElementById('vlkGlobalProgressBar');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.id = 'vlkGlobalProgressBar';
      document.body.appendChild(progressBar);
    }
    return progressBar;
  }

  function startProgressBar() {
    const bar = ensureProgressBar();
    if (!bar) return;
    if (progressTimer) clearInterval(progressTimer);

    bar.style.display = 'block';
    bar.style.opacity = '1';
    bar.style.width = '0%';

    let currentWidth = 10;
    bar.style.width = currentWidth + '%';

    progressTimer = setInterval(() => {
      if (currentWidth < 85) {
        currentWidth += Math.random() * 15 + 5;
        if (currentWidth > 85) currentWidth = 85;
        bar.style.width = currentWidth + '%';
      }
    }, 40);
  }

  function completeProgressBar() {
    const bar = ensureProgressBar();
    if (!bar) return;
    if (progressTimer) clearInterval(progressTimer);

    bar.style.width = '100%';
    setTimeout(() => {
      bar.style.opacity = '0';
      setTimeout(() => {
        bar.style.display = 'none';
        bar.style.width = '0%';
      }, 200);
    }, 120);
  }

  // Pre-fetch link on hover / touchstart for instant cache
  function prefetchLink(url) {
    if (!url || PREFETCHED_URLS.has(url)) return;
    PREFETCHED_URLS.add(url);

    try {
      const linkEl = document.createElement('link');
      linkEl.rel = 'prefetch';
      linkEl.href = url;
      linkEl.as = 'document';
      document.head.appendChild(linkEl);
    } catch(e) {}
  }

  // Global smooth navigation API
  window.smoothNavigate = function(targetUrl, delayMs = 110) {
    if (!targetUrl) return;

    // Check if same page hash
    if (targetUrl.startsWith('#') || targetUrl === window.location.pathname + window.location.search) {
      return;
    }

    startProgressBar();
    document.body.classList.add('page-transitioning-out');

    setTimeout(() => {
      window.location.href = targetUrl;
    }, delayMs);
  };

  // Intercept click on internal links
  function handleLinkClick(e) {
    // Ignore modified clicks (Cmd/Ctrl/Shift/Middle click)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    const anchor = e.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    // Ignore anchors, javascript, external links, downloads, mailto, target blank
    if (
      href.startsWith('#') ||
      href.startsWith('javascript:') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      anchor.getAttribute('target') === '_blank' ||
      anchor.hasAttribute('download')
    ) {
      return;
    }

    // Ignore external origin links
    if (href.startsWith('http://') || href.startsWith('https://')) {
      try {
        const urlObj = new URL(href);
        if (urlObj.origin !== window.location.origin) return;
      } catch(err) {
        return;
      }
    }

    // Smooth transition
    e.preventDefault();
    window.smoothNavigate(anchor.href, 110);
  }

  // Pre-fetch on mouse hover or touchstart
  function handleLinkHover(e) {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
      prefetchLink(anchor.href);
    }
  }

  function init() {
    ensureProgressBar();

    // Attach document-level event delegation
    document.addEventListener('click', handleLinkClick, { capture: true });
    document.addEventListener('mouseover', handleLinkHover, { passive: true });
    document.addEventListener('touchstart', handleLinkHover, { passive: true });

    // Handle back/forward cache (pageshow event)
    window.addEventListener('pageshow', (event) => {
      document.body.classList.remove('page-transitioning-out');
      completeProgressBar();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
