const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const historyHtmlPath = path.resolve(__dirname, '../../client/student/history.html');
const historyJsPath = path.resolve(__dirname, '../../client/student/js/history.js');

describe('Student History Page Standards & Architectural Quality', () => {
  const html = fs.readFileSync(historyHtmlPath, 'utf8');
  const js = fs.readFileSync(historyJsPath, 'utf8');

  it('1. HTML Core & Design System Integration', () => {
    assert.match(html, /<!DOCTYPE html>/i, 'Should have standard HTML5 DOCTYPE');
    assert.match(html, /<body[^>]*class=["'][^"']*has-bottom-nav[^"']*["']/i, 'Body should have has-bottom-nav class for mobile viewport ergonomics');
    assert.match(html, /css\/home-redesign\.css/i, 'Should link home-redesign.css for modern tokens, elevation, and tactile physics');
    assert.match(html, /Plus\+Jakarta\+Sans/i, 'Should link Plus Jakarta Sans typography');
  });

  it('2. Top Navigation & Mobile Drawer Standards', () => {
    assert.match(html, /class=["'][^"']*nav-brand-academic[^"']*["']/i, 'Should use nav-brand-academic');
    assert.match(html, /id=["']studentName["']/i, 'Should include candidate name display #studentName');
    assert.match(html, /id=["']streakCount["']/i, 'Should include streak badge #streakCount');
    assert.match(html, /id=["']todayDate["']/i, 'Should include date display #todayDate');
    assert.match(html, /class=["'][^"']*vlk-nav-bar[^"']*["']/i, 'Should include desktop navigation pills bar .vlk-nav-bar');
    assert.match(html, /id=["']langToggleSingleBtn["']/i, 'Should include modern language single toggle #langToggleSingleBtn');
    assert.match(html, /class=["'][^"']*theme-multi-btn-group[^"']*["']/i, 'Should include desktop 3-chip theme toggle group');
    assert.match(html, /id=["']historyThemeToggleSingleBtn["']/i, 'Should include mobile single theme toggle button');
    assert.match(html, /id=["']mobileNavToggleBtn["']/i, 'Should include mobile hamburger navigation drawer trigger #mobileNavToggleBtn');
    assert.match(html, /id=["']vlkMobileDrawer["']/i, 'Should include slide-out mobile drawer #vlkMobileDrawer');
    assert.match(html, /id=["']vlkMobileDrawerBackdrop["']/i, 'Should include drawer backdrop #vlkMobileDrawerBackdrop');
  });

  it('3. Minimalist Hero & Academic Header', () => {
    assert.match(html, /class=["'][^"']*minimalist-hero-bar[^"']*["']/i, 'Should include minimalist-hero-bar');
    assert.match(html, /class=["'][^"']*mini-hero-tag[^"']*["']/i, 'Should include mini-hero-tag for syllabus alignment');
    assert.match(html, /class=["'][^"']*mini-hero-title[^"']*["']/i, 'Should include mini-hero-title for modern visual hierarchy');
  });

  it('4. KCSE Paper 3 Readiness Score Card', () => {
    assert.match(html, /class=["'][^"']*readiness-card[^"']*["']/i, 'Should include readiness-card');
    assert.match(html, /id=["']readinessScoreNum["']/i, 'Should include readiness score percentage container #readinessScoreNum');
    assert.match(html, /id=["']readinessStatus["']/i, 'Should include readiness milestone status #readinessStatus');
    assert.match(html, /id=["']readinessBarFill["']/i, 'Should include readiness progress bar fill #readinessBarFill');

    // 10 KCSE syllabus topics
    const expectedTopics = [
      'acidBase', 'redox', 'precipitation', 'complexometric',
      'qualitative', 'organic', 'solubility', 'energy', 'rates', 'gas'
    ];
    expectedTopics.forEach(topic => {
      assert.ok(html.includes(`data-topic="${topic}"`), `Should include topic card for ${topic}`);
      assert.ok(html.includes(`id="topicStatus-${topic}"`), `Should include topic status element for ${topic}`);
    });
  });

  it('5. Performance Analytics & Achievements Grid', () => {
    assert.match(html, /id=["']studentTrendChart["']/i, 'Should include 30-Day Accuracy Trend chart canvas #studentTrendChart');
    assert.match(html, /id=["']studentTypeChart["']/i, 'Should include By Practical Type chart canvas #studentTypeChart');
    assert.match(html, /id=["']achieveCompletedLabs["']/i, 'Should include achievements metric for completed labs #achieveCompletedLabs');
    assert.match(html, /id=["']achieveBadgesEarned["']/i, 'Should include achievements metric for badges earned #achieveBadgesEarned');
    assert.match(html, /id=["']achieveTopSkill["']/i, 'Should include achievements metric for top skill #achieveTopSkill');
    assert.match(html, /id=["']leaderboardBox["']/i, 'Should include dynamic leaderboard container #leaderboardBox');
  });

  it('6. Detailed Attempt Logs & Real-Time Filtering', () => {
    // 9 Navigation tabs
    const expectedTabs = [
      'tabTitration', 'tabQualitative', 'tabOrganic', 'tabSolubility',
      'tabEnergy', 'tabRates', 'tabGas', 'tabComposite', 'tabCPCAT'
    ];
    expectedTabs.forEach(tabId => {
      assert.ok(html.includes(`id="${tabId}"`), `Should include history tab ${tabId}`);
    });

    assert.match(html, /id=["']sessionSearchInput["']/i, 'Should include search input #sessionSearchInput');
    assert.match(html, /id=["']searchClearBtn["']/i, 'Should include search clear button #searchClearBtn');
    assert.match(html, /id=["']filterType["']/i, 'Should include titration sub-filter select #filterType');
    assert.match(html, /id=["']filterStatus["']/i, 'Should include pass/review status filter select #filterStatus');
    assert.match(html, /id=["']sessionsBox["']/i, 'Should include expandable sessions log box #sessionsBox');
    assert.match(html, /id=["']paginationBox["']/i, 'Should include pagination controls container #paginationBox');
  });

  it('7. Mobile Bottom Navigation Dock & PWA Ergonomics', () => {
    assert.match(html, /id=["']vlkBottomNav["']/i, 'Should include mobile bottom nav #vlkBottomNav');
    assert.match(html, /class=["'][^"']*vlk-bottom-nav-item\s+active[^"']*["'][^>]*id=["']bnav-history["']/i, 'History bottom nav item should be active');
    assert.match(html, /id=["']profileSettingsModal["']/i, 'Should preserve full profile settings modal');
  });

  it('8. JavaScript Log Loading & Compatibility Contracts', () => {
    assert.match(js, /function switchTab\(/, 'history.js should export switchTab');
    assert.match(js, /function onSearchFilterChange\(/, 'history.js should export onSearchFilterChange');
    assert.match(js, /function exportCurrentTabCSV\(/, 'history.js should export exportCurrentTabCSV');
    assert.match(js, /loadTitrationSessions\(\);/, 'history.js should initialize active tab sessions');
  });
});
