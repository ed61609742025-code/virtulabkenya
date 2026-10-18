/**
 * VirtuLab Kenya — Precision Vector Icon System (vlk-icons.js)
 * 
 * Replaces system Unicode emojis with consistent, scalable, monochrome SVG icons.
 * Features:
 *  - Uniform 24x24 coordinate space with 1.75px stroke width
 *  - Responsive 'currentColor' fill & stroke adaptation (Dark/Light/Lab mode compatible)
 *  - Zero external icon font or network request overhead
 *  - Automatic DOM hydration via [data-vlk-icon="name"]
 *  - Programmatic string generation via VLKIcons.svg(name, options)
 */

(function(global) {
  'use strict';

  var ICONS = {
    // Chemistry Apparatus & Benchmarks
    'flask': '<path d="M10 2v7.31L4.75 18.1A2 2 0 0 0 6.47 21h11.06a2 2 0 0 0 1.72-2.9L14 9.31V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
    'test-tube': '<path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2"/><path d="M8.5 2h7"/><path d="M9.5 12h5"/>',
    'burette': '<rect x="10" y="2" width="4" height="18" rx="1"/><path d="M10 5h4M10 8h2M10 11h4M10 14h2M10 17h4"/><path d="M12 20v2"/><circle cx="12" cy="18" r="1.5"/>',
    'droplet': '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
    'atom': '<circle cx="12" cy="12" r="2.5"/><path d="M4.93 4.93c4.24-4.24 12.38 3.9 8.14 8.14-4.24 4.24-12.38-3.9-8.14-8.14z"/><path d="M19.07 4.93c-4.24-4.24-12.38 3.9-8.14 8.14 4.24 4.24 12.38-3.9 8.14-8.14z"/>',
    'flame': '<path d="M8.5 14.5A3.5 3.5 0 0 0 12 18a3.5 3.5 0 0 0 3.5-3.5c0-2-1.5-3.5-2.5-5-.5-1-1-2.5-1-3.5 0 0-2.5 2.5-2.5 5 0 1-.5 1.5-1 2.5z"/><path d="M12 2c5 4.5 7 9 7 13a7 7 0 1 1-14 0c0-4 3-7.5 7-13z"/>',
    'thermometer': '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/><circle cx="11.5" cy="17.5" r="1.5" fill="currentColor"/>',
    'microscope': '<path d="M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1M9 14h2M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2M12 6V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/>',
    'snowflake': '<line x1="12" y1="2" x2="12" y2="22"/><line x1="20" y1="7" x2="4" y2="17"/><line x1="4" y1="7" x2="20" y2="17"/><line x1="12" y1="6" x2="15" y2="3"/><line x1="12" y1="6" x2="9" y2="3"/><line x1="12" y1="18" x2="15" y2="21"/><line x1="12" y1="18" x2="9" y2="21"/>',
    'leaf': '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    'wind': '<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>',
    'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    'swirl': '<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 5v6h6"/><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 19v-6h-6"/>',
    
    // Examination & Telemetry
    'target': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    'timer': '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M10 2h4"/><path d="M19 5l-1.5 1.5"/>',
    'book': '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    'compass': '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    'shield-check': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>',
    'alert-triangle': '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    'clipboard': '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 12h6"/><path d="M9 16h6"/>',
    'table': '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/>',
    'calculator': '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="10" y2="18"/><line x1="14" y1="18" x2="16" y2="18"/>',
    'activity': '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    'trending-up': '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    'lightbulb': '<line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>',
    'trophy': '<path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/><path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1h10v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>',
    'award': '<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89L17 22l-5-3-5 3 1.52-9.11"/>',
    'crown': '<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>',
    'sparkles': '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>',

    // System & Navigation
    'settings': '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    'volume': '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>',
    'volume-x': '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>',
    'edit': '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    'sun': '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    'moon': '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    'printer': '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    'arrow-left': '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    'arrow-right': '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    'check': '<polyline points="20 6 9 17 4 12"/>',
    'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    'refresh': '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
    'info': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    'search': '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    'home': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    'school': '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    'lock': '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    'smartphone': '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
    'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'
  };

  /**
   * Generates an inline SVG string for the specified icon.
   * @param {string} name - The icon key (e.g., 'flask', 'burette')
   * @param {object} [opts] - Configuration options:
   *   @param {string} [opts.className] - Extra CSS classes (defaults to 'vlk-icon')
   *   @param {number|string} [opts.size] - Explicit width/height in px or em
   *   @param {number} [opts.strokeWidth=1.75] - Stroke width
   *   @param {string} [opts.ariaLabel] - Accessibility label; if omitted, sets aria-hidden="true"
   * @returns {string} SVG HTML markup
   */
  function svg(name, opts) {
    opts = opts || {};
    var inner = ICONS[name] || ICONS['flask'];
    var cls = 'vlk-icon' + (opts.className ? ' ' + opts.className : '');
    var sw = opts.strokeWidth || 1.75;
    var sizeAttr = opts.size ? ' width="' + opts.size + '" height="' + opts.size + '"' : '';
    var a11y = opts.ariaLabel ? ' role="img" aria-label="' + opts.ariaLabel + '"' : ' aria-hidden="true"';
    
    return '<svg class="' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round"' + sizeAttr + a11y + '>' + inner + '</svg>';
  }

  /**
   * Hydrates all elements with [data-vlk-icon] inside root.
   * If element has children or text, prepends the SVG icon or replaces contents if data-vlk-replace is set.
   * @param {HTMLElement} [root=document]
   */
  function hydrate(root) {
    root = root || document;
    var targets = root.querySelectorAll('[data-vlk-icon]');
    for (var i = 0; i < targets.length; i++) {
      var el = targets[i];
      var name = el.getAttribute('data-vlk-icon');
      var size = el.getAttribute('data-vlk-size');
      var cls = el.getAttribute('data-vlk-class') || '';
      var replace = el.getAttribute('data-vlk-replace') === 'true';
      var iconMarkup = svg(name, { size: size, className: cls });
      
      if (replace || el.children.length === 0 && !el.textContent.trim()) {
        el.innerHTML = iconMarkup;
      } else {
        // Prepend if not already prepended
        if (!el.querySelector('.vlk-icon')) {
          el.insertAdjacentHTML('afterbegin', iconMarkup + ' ');
        }
      }
    }
  }

  // Auto-hydrate on DOM ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { hydrate(); });
    } else {
      hydrate();
    }
  }

  var VLKIcons = {
    svg: svg,
    get: svg,
    hydrate: hydrate,
    list: function() { return Object.keys(ICONS); }
  };

  global.VLKIcons = VLKIcons;

})(typeof window !== 'undefined' ? window : this);
