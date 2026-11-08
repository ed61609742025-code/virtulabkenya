/**
 * VirtuLab Kenya — Apparatus Pedagogy & Novice Scaffolding Tests
 * 
 * Validates:
 * 1. Completeness and validity of APPARATUS_DATA (18 apparatus, categories, SVG paths)
 * 2. Public API contract of ApparatusGallery
 * 3. Cross-page integration (lab.html, qualitative.html, reference.html, home.html)
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const ApparatusGallery = require('../../client/shared/apparatus-gallery.js');

describe('Apparatus Pedagogy & Novice Scaffolding Suite', () => {

  describe('1. APPARATUS_DATA Catalog Integrity', () => {
    it('should contain all 32 standard KCSE laboratory apparatus', () => {
      assert.strictEqual(ApparatusGallery.APPARATUS_DATA.length, 32);
    });

    it('every apparatus should have id, name, category, viewBox, svgPath, primaryUse, labContext', () => {
      const validCategories = ['Glassware', 'Measurement', 'Heating', 'Transfer', 'Safety'];

      ApparatusGallery.APPARATUS_DATA.forEach((item, index) => {
        assert.ok(item.id, `Item ${index} must have an id`);
        assert.ok(item.name, `Item ${index} must have a name`);
        assert.ok(validCategories.includes(item.category), `Item ${item.id} has invalid category: ${item.category}`);
        assert.ok(item.viewBox, `Item ${item.id} must have a viewBox`);
        assert.ok(item.svgPath && item.svgPath.length > 5, `Item ${item.id} must have a non-empty svgPath`);
        assert.ok(item.primaryUse && item.primaryUse.length > 10, `Item ${item.id} must have primaryUse`);
        assert.ok(item.labContext && item.labContext.length > 10, `Item ${item.id} must have labContext`);
        assert.ok(Array.isArray(item.quizDistractors) && item.quizDistractors.length >= 2, `Item ${item.id} must have quiz distractors`);
        assert.ok(Array.isArray(item.useDistractors) && item.useDistractors.length >= 2, `Item ${item.id} must have use distractors`);
      });
    });

    it('should include core KCSE volumetric and qualitative analysis apparatus', () => {
      const ids = ApparatusGallery.APPARATUS_DATA.map(a => a.id);
      assert.ok(ids.includes('burette'), 'Must include burette');
      assert.ok(ids.includes('bulb-pipette'), 'Must include bulb-pipette');
      assert.ok(ids.includes('conical-flask'), 'Must include conical-flask');
      assert.ok(ids.includes('test-tube'), 'Must include test-tube');
      assert.ok(ids.includes('bunsen-burner'), 'Must include bunsen-burner');
      assert.ok(ids.includes('thermometer'), 'Must include thermometer');
      assert.ok(ids.includes('safety-goggles'), 'Must include safety-goggles');
      assert.ok(ids.includes('volumetric-flask'), 'Must include volumetric-flask');
      assert.ok(ids.includes('white-tile'), 'Must include white-tile');
      assert.ok(ids.includes('electronic-balance'), 'Must include electronic-balance');
      assert.ok(ids.includes('stopwatch'), 'Must include stopwatch');
      assert.ok(ids.includes('separating-funnel'), 'Must include separating-funnel');
    });
  });

  describe('2. Public API Contract', () => {
    it('should export open, close, startQuiz, isQuizPassed, resetProgress', () => {
      assert.strictEqual(typeof ApparatusGallery.open, 'function');
      assert.strictEqual(typeof ApparatusGallery.close, 'function');
      assert.strictEqual(typeof ApparatusGallery.startQuiz, 'function');
      assert.strictEqual(typeof ApparatusGallery.isQuizPassed, 'function');
      assert.strictEqual(typeof ApparatusGallery.resetProgress, 'function');
    });
  });

  describe('3. Cross-Page Integration Checks', () => {
    const clientDir = path.join(__dirname, '../../client/student');

    it('lab.html should include apparatus-gallery.js and apparatus-gallery.css', () => {
      const labHtml = fs.readFileSync(path.join(clientDir, 'lab.html'), 'utf8');
      assert.ok(labHtml.includes('apparatus-gallery.js'), 'lab.html must include apparatus-gallery.js');
      assert.ok(labHtml.includes('apparatus-gallery.css'), 'lab.html must include apparatus-gallery.css');
      assert.ok(labHtml.includes('vlk_apparatus_certified'), 'lab.html must check vlk_apparatus_certified for first-time gate');
    });

    it('qualitative.html should include apparatus-gallery.js and gate check', () => {
      const qualHtml = fs.readFileSync(path.join(clientDir, 'qualitative.html'), 'utf8');
      assert.ok(qualHtml.includes('apparatus-gallery.js'), 'qualitative.html must include apparatus-gallery.js');
      assert.ok(qualHtml.includes('vlk_apparatus_certified'), 'qualitative.html must check certification');
    });

    it('home.html should feature the apparatus onboarding card and script', () => {
      const homeHtml = fs.readFileSync(path.join(clientDir, 'home.html'), 'utf8');
      assert.ok(homeHtml.includes('apparatusOnboardingCard'), 'home.html must include apparatus onboarding card');
      assert.ok(homeHtml.includes('apparatus-gallery.js'), 'home.html must load apparatus-gallery.js');
    });

    it('reference.html should provide apparatus guide quick action and modal scripts', () => {
      const refHtml = fs.readFileSync(path.join(clientDir, 'reference.html'), 'utf8');
      assert.ok(refHtml.includes('apparatus-gallery.js'), 'reference.html must include apparatus-gallery.js');
      assert.ok(refHtml.includes('Apparatus Guide'), 'reference.html must have an Apparatus Guide button');
    });
  });

  describe('4. Mobile Touch Swipe & Upgraded Bench Cards', () => {
    const sharedDir = path.join(__dirname, '../../client/shared');

    it('apparatus-gallery.js should include touch swipe navigation and keyboard arrow support', () => {
      const jsCode = fs.readFileSync(path.join(sharedDir, 'apparatus-gallery.js'), 'utf8');
      assert.ok(jsCode.includes('attachDetailSwipe'), 'Must include attachDetailSwipe function');
      assert.ok(jsCode.includes('touchstart') && jsCode.includes('touchmove') && jsCode.includes('touchend'), 'Must register touch event listeners');
      assert.ok(jsCode.includes('vlk-ag-floating-nav') && jsCode.includes('vlk-ag-swipe-hint'), 'Must include floating touch buttons and mobile swipe hint');
      assert.ok(jsCode.includes('vlk-ag-slide-next') && jsCode.includes('vlk-ag-slide-prev'), 'Must include slide next and prev transition classes');
      assert.ok(jsCode.includes('vlk-ag-card-index') && jsCode.includes('vlk-ag-card-spec-chip'), 'Must render apparatus item numbers and specification chips');
      assert.ok(jsCode.includes('ArrowRight') && jsCode.includes('ArrowLeft'), 'Must support keyboard arrow key browsing');
      assert.ok(jsCode.includes('APPARATUS_DATA.length') && jsCode.includes('Apparatus'), 'Header subtitle must dynamically report the apparatus count');
    });

    it('apparatus-gallery.css should provide mobile touch and card layout styles', () => {
      const cssCode = fs.readFileSync(path.join(sharedDir, 'apparatus-gallery.css'), 'utf8');
      assert.ok(cssCode.includes('.vlk-ag-card-index'), 'Must style card index badge');
      assert.ok(cssCode.includes('.vlk-ag-card-spec-chip'), 'Must style key capability spec chip');
      assert.ok(cssCode.includes('.vlk-ag-floating-nav'), 'Must style floating chevron touch buttons');
      assert.ok(cssCode.includes('.vlk-ag-swipe-hint'), 'Must style mobile swipe hint pill');
      assert.ok(cssCode.includes('.vlk-ag-slide-next') && cssCode.includes('.vlk-ag-slide-prev'), 'Must style directional slide animations');
      assert.ok(cssCode.includes('.vlk-ag-detail-progress-bar') && cssCode.includes('.vlk-ag-detail-progress-fill'), 'Must style detail progress indicators');
    });
  });
});
