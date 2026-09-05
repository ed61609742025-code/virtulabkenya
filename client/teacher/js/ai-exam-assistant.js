// ============================================================
//  VirtuLab Kenya — AI Teacher Exam Assistant Controller ("Walimu AI")
//  Multimodal Paper Parsing, Idea-to-Exam Generation & Refinement
// ============================================================

(function() {
  'use strict';

  let currentExamDraft = null;
  let activeAiMode = 'idea'; // 'idea' | 'upload'
  let uploadedFile = null;   // { name, size, type, dataUrl }
  let activeResultSubTab = 'blueprint'; // 'blueprint' | 'studentPaper' | 'markingScheme' | 'technicianGuide'

  const PRESET_TEMPLATES = {
    classic: {
      prompt: 'Form 4 mock exam with classic acid-base titration of HCl and NaOH, qualitative identification of Lead(II) nitrate using NaOH, NH3 and KI, and organic testing of Ethanol with litmus and warm acidified KMnO4.',
      form: 'Form 4',
      type: 'kcseComposite',
      difficulty: 'standard',
      duration: 135
    },
    redox: {
      prompt: 'Standard KCSE Paper 3 mock focusing on Redox titration of acidified potassium manganate(VII) (KMnO4) with ammonium iron(II) sulfate (Fe2+), qualitative analysis of zinc sulfate (ZnSO4), and tests for an unsaturated alkene (Cyclohexene) with bromine and KMnO4.',
      form: 'Form 4',
      type: 'kcseComposite',
      difficulty: 'standard',
      duration: 135
    },
    energy: {
      prompt: 'Form 3 practical exam on Thermochemistry: determination of molar enthalpy of neutralization between dilute hydrochloric acid and sodium hydroxide, combined with qualitative identification of copper(II) carbonate.',
      form: 'Form 3',
      type: 'energy',
      difficulty: 'standard',
      duration: 90
    },
    rates: {
      prompt: 'Form 3 Term 2 mock on Reaction Rates using the disappearing cross experiment with sodium thiosulfate and hydrochloric acid, including graph plotting questions and qualitative tests for chloride salts.',
      form: 'Form 3',
      type: 'rates',
      difficulty: 'standard',
      duration: 90
    },
    gas: {
      prompt: 'Inorganic chemistry practical on the preparation, drying, and collection of carbon(IV) oxide gas from calcium carbonate and dilute HCl, followed by confirmatory tests using calcium hydroxide (lime water).',
      form: 'Form 2',
      type: 'gas',
      difficulty: 'foundational',
      duration: 60
    },
    twosalt: {
      prompt: 'Advanced Form 4 Merit Exam testing two-salt separation and qualitative identification of a mixture containing barium sulfate and zinc sulfate, with stoichiometric dibasic acid titration (H2SO4 + 2NaOH).',
      form: 'Form 4',
      type: 'kcseComposite',
      difficulty: 'challenge',
      duration: 135
    }
  };

  // ── Mode Switcher ─────────────────────────────────────────────
  window.setAiExamMode = function(mode) {
    activeAiMode = mode;
    const btnIdea = document.getElementById('aiModeBtnIdea');
    const btnUpload = document.getElementById('aiModeBtnUpload');
    const secIdea = document.getElementById('aiIdeaSection');
    const secUpload = document.getElementById('aiUploadSection');

    if (btnIdea) btnIdea.classList.toggle('active', mode === 'idea');
    if (btnUpload) btnUpload.classList.toggle('active', mode === 'upload');

    if (secIdea) secIdea.style.display = mode === 'idea' ? 'block' : 'none';
    if (secUpload) secUpload.style.display = mode === 'upload' ? 'block' : 'none';
  };

  // ── Template Chip Selection ───────────────────────────────────
  window.selectAiTemplate = function(presetKey) {
    const p = PRESET_TEMPLATES[presetKey];
    if (!p) return;

    window.setAiExamMode('idea');
    const promptInput = document.getElementById('aiPromptInput');
    if (promptInput) {
      promptInput.value = p.prompt;
      promptInput.focus();
    }

    const formSelect = document.getElementById('aiFormSelect');
    if (formSelect) formSelect.value = p.form;

    const typeSelect = document.getElementById('aiTypeSelect');
    if (typeSelect) typeSelect.value = p.type;

    const diffSelect = document.getElementById('aiDiffSelect');
    if (diffSelect) diffSelect.value = p.difficulty;

    const durInput = document.getElementById('aiDurationInput');
    if (durInput) durInput.value = p.duration;
  };

  // ── File Upload & Drag-and-Drop Handlers ───────────────────────
  window.handleAiFileSelect = function(event) {
    const file = event.target.files && event.target.files[0];
    if (file) processUploadFile(file);
  };

  window.handleAiDragOver = function(event) {
    event.preventDefault();
    event.stopPropagation();
    const zone = document.getElementById('aiDropZone');
    if (zone) zone.classList.add('dragover');
  };

  window.handleAiDragLeave = function(event) {
    event.preventDefault();
    event.stopPropagation();
    const zone = document.getElementById('aiDropZone');
    if (zone) zone.classList.remove('dragover');
  };

  window.handleAiFileDrop = function(event) {
    event.preventDefault();
    event.stopPropagation();
    const zone = document.getElementById('aiDropZone');
    if (zone) zone.classList.remove('dragover');

    const dt = event.dataTransfer;
    const file = dt.files && dt.files[0];
    if (file) processUploadFile(file);
  };

  function compressImageFile(file, maxWidth = 1600, quality = 0.82) {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = function(e) {
        img.onload = function() {
          let { width, height } = img;
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve({
            dataUrl: canvas.toDataURL('image/jpeg', quality),
            type: 'image/jpeg'
          });
        };
        img.onerror = () => resolve({ dataUrl: e.target.result, type: file.type });
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  async function processUploadFile(file) {
    // 8MB limit ensures cloud upload doesn't hit proxy timeouts or RAM limits on Render
    const maxBytes = 8 * 1024 * 1024;
    if (file.size > maxBytes && !file.type.startsWith('image/')) {
      alert('This PDF scan is ' + (file.size / (1024 * 1024)).toFixed(1) + ' MB. Cloud AI parsing works best with exam papers under 8MB. Please compress the PDF, or paste the question text into the box below.');
      return;
    }

    // For photo scans (JPEG/PNG), compress client-side on canvas to reduce memory
    if (file.type.startsWith('image/')) {
      const compressed = await compressImageFile(file);
      if (compressed) {
        uploadedFile = {
          name: file.name,
          size: Math.round(compressed.dataUrl.length * 0.75),
          type: compressed.type,
          dataUrl: compressed.dataUrl
        };
        renderFilePreview();
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedFile = {
        name: file.name,
        size: file.size,
        type: file.type || 'application/pdf',
        dataUrl: e.target.result
      };
      renderFilePreview();
    };
    reader.onerror = function() {
      alert('Failed to read file. Please try another exam paper.');
    };

    reader.readAsDataURL(file);
  }

  function renderFilePreview() {
    const previewWrap = document.getElementById('aiFilePreviewWrap');
    const emptyNotice = document.getElementById('aiDropZoneNotice');
    if (!uploadedFile) {
      if (previewWrap) previewWrap.style.display = 'none';
      if (emptyNotice) emptyNotice.style.display = 'block';
      return;
    }

    if (emptyNotice) emptyNotice.style.display = 'none';
    if (previewWrap) {
      previewWrap.style.display = 'flex';
      const nameEl = document.getElementById('aiFileName');
      const sizeEl = document.getElementById('aiFileSize');
      const iconEl = document.getElementById('aiFileIcon');
      if (nameEl) nameEl.textContent = uploadedFile.name;
      if (sizeEl) sizeEl.textContent = (uploadedFile.size / (1024 * 1024)).toFixed(2) + ' MB';
      if (iconEl) {
        if (uploadedFile.type.includes('image')) iconEl.textContent = '🖼️';
        else if (uploadedFile.type.includes('pdf')) iconEl.textContent = '📑';
        else iconEl.textContent = '📄';
      }
    }
  }

  window.removeSelectedAiFile = function() {
    uploadedFile = null;
    const fileInput = document.getElementById('aiFileInput');
    if (fileInput) fileInput.value = '';
    renderFilePreview();
  };

  // ── Show / Hide Animated Generating State ─────────────────────
  function setGeneratingState(isGenerating, message = 'Synthesizing KNEC Chemistry Exam...') {
    const genWrap = document.getElementById('aiGeneratingState');
    const actionBtns = document.querySelectorAll('.ai-action-btn');
    const msgEl = document.getElementById('aiGenStatusText');

    if (genWrap) genWrap.style.display = isGenerating ? 'flex' : 'none';
    if (msgEl) msgEl.textContent = message;
    actionBtns.forEach(btn => btn.disabled = isGenerating);
  }

  // ── Mode 1: Generate Exam From Idea ───────────────────────────
  window.submitAiIdeaExam = async function() {
    const prompt = (document.getElementById('aiPromptInput')?.value || '').trim();
    if (!prompt) {
      alert('Please describe your exam idea or select a curriculum template chip above.');
      document.getElementById('aiPromptInput')?.focus();
      return;
    }

    const formLevel = document.getElementById('aiFormSelect')?.value || 'Form 4';
    const moduleType = document.getElementById('aiTypeSelect')?.value || 'kcseComposite';
    const difficulty = document.getElementById('aiDiffSelect')?.value || 'standard';
    const durationMinutes = parseInt(document.getElementById('aiDurationInput')?.value, 10) || 135;

    setGeneratingState(true, 'Consulting Walimu AI Chief Examiner: Balancing equations & building KNEC rubrics...');

    try {
      const resp = await AiExamAssistant.generateFromIdea({
        prompt,
        formLevel,
        moduleType,
        difficulty,
        durationMinutes
      });

      if (resp && resp.exam) {
        renderExamResults(resp.exam, true);
        const meta = resp.exam._meta || resp.exam.meta;
        if (meta?.isFallback) {
          showTemporaryToast('⚠️ ' + (meta.warning || 'Standard KNEC curriculum template loaded.'), 'error', 7000);
        }
      } else {
        throw new Error(resp.error || 'Could not generate exam.');
      }
    } catch (err) {
      showTemporaryToast('AI Note: ' + (err.message || 'Could not connect to AI service. Using verified KNEC template.'), 'error');
    } finally {
      setGeneratingState(false);
    }
  };

  // ── Mode 2: Parse Uploaded Exam Paper ─────────────────────────
  window.submitAiPaperUpload = async function() {
    const textContent = (document.getElementById('aiPastedText')?.value || '').trim();
    const teacherNotes = (document.getElementById('aiUploadNotes')?.value || '').trim();

    if (!uploadedFile && !textContent) {
      showTemporaryToast('Please upload an exam paper (PDF or image) or paste the exam text.', 'error');
      return;
    }

    setGeneratingState(true, 'Walimu AI Multimodal Vision: Analyzing exam paper questions, reagents & observations...');

    try {
      const resp = await AiExamAssistant.parsePaper({
        fileData: uploadedFile ? uploadedFile.dataUrl : null,
        mimeType: uploadedFile ? uploadedFile.type : null,
        textContent,
        teacherNotes
      });

      if (resp && resp.exam) {
        renderExamResults(resp.exam, true);
        const meta = resp.exam._meta || resp.exam.meta;
        if (meta?.isFallback) {
          showTemporaryToast('⚠️ ' + (meta.warning || 'Standard KNEC curriculum template loaded.'), 'error', 7000);
        }
      } else {
        throw new Error(resp.error || 'Could not parse exam paper.');
      }
    } catch (err) {
      console.warn('[AI Paper Upload Warning]:', err.message);
      const is520OrTimeout = err.message && (err.message.includes('520') || err.message.includes('504') || err.message.includes('timeout') || err.message.includes('failed with status'));
      if (is520OrTimeout) {
        showTemporaryToast('⚠️ Cloud parsing timed out or file was large. Loading verified KNEC Paper 3 blueprint for editing...', 'error', 8000);
        // Automatically select and load the KNEC curriculum template so the teacher is never blocked
        if (typeof window.selectAiTemplate === 'function') {
          window.selectAiTemplate('classic');
        }
      } else {
        showTemporaryToast('AI Parsing Note: ' + (err.message || 'Failed to parse paper. Using standard KNEC layout.'), 'error', 6000);
      }
    } finally {
      setGeneratingState(false);
    }
  };

  // ── Conversational Refinement ("Walimu Co-Pilot") ─────────────
  window.submitAiRefinement = async function() {
    if (!currentExamDraft) {
      showTemporaryToast('Generate or upload an exam first before refining.', 'error');
      return;
    }

    const input = document.getElementById('aiRefineInput');
    const instruction = (input?.value || '').trim();
    if (!instruction) {
      showTemporaryToast('Please enter what you would like to adjust (e.g. "Change pipette to 20 cm³", "Use Methyl Orange").', 'error');
      input?.focus();
      return;
    }

    const refineBtn = document.querySelector('.ai-refine-input-row button');
    if (refineBtn) {
      refineBtn.disabled = true;
      refineBtn.innerHTML = '<span>Refining ⏳</span>';
    }

    setGeneratingState(true, `Refining exam: "${instruction}"...`);

    try {
      const resp = await AiExamAssistant.refineDraft({
        currentDraft: currentExamDraft,
        instruction
      });

      if (resp && resp.exam) {
        renderExamResults(resp.exam, false);
        if (input) input.value = '';
        const meta = resp.exam._meta || resp.exam.meta;
        const changes = meta?.appliedChanges || [];
        if (changes.length > 0) {
          showTemporaryToast('✓ ' + changes.join(' · '));
        } else {
          showTemporaryToast(`✓ Exam refined with: "${instruction}"`);
        }
      } else {
        throw new Error(resp.error || 'Could not refine draft.');
      }
    } catch (err) {
      showTemporaryToast('Refinement Note: ' + (err.message || 'Could not apply refinement.'), 'error');
    } finally {
      setGeneratingState(false);
      if (refineBtn) {
        refineBtn.disabled = false;
        refineBtn.innerHTML = '<span>Refine ⚡</span>';
      }
    }
  };

  window.applyRefineChip = function(text) {
    const input = document.getElementById('aiRefineInput');
    if (input) {
      input.value = text;
      input.focus();
    }
  };

  // ── Client-side Direct Quick-Update Functions ───────────────────
  function recalculateAndSyncExam() {
    if (!currentExamDraft?.examConfig?.q1) return;
    const q1 = currentExamDraft.examConfig.q1;
    const nA = q1.ratioA || 1;
    const nB = q1.ratioB || 1;
    const cA = parseFloat(q1.trueAcidMolarity) || 0.1;
    const cB = parseFloat(q1.trueBaseMolarity) || 0.1;
    const vB = parseFloat(q1.pipetteVolume) || 25.0;

    q1.trueTitre = Number(((nA * cB * vB) / (nB * cA)).toFixed(2));
    q1.instructions = `You are provided with ${q1.solutionA} and ${q1.solutionB}. Pipette ${vB.toFixed(1)} cm³ of Solution B into a conical flask and titrate with Solution A using ${q1.indicator} indicator.`;

    // Re-render other tabs
    renderStudentPaperTab(currentExamDraft);
    renderMarkingSchemeTab(currentExamDraft);
    renderTechnicianGuideTab(currentExamDraft);
  }

  window.quickSetConcA = function(conc) {
    if (!currentExamDraft?.examConfig?.q1) return;
    const q1 = currentExamDraft.examConfig.q1;
    q1.trueAcidMolarity = parseFloat(conc);
    const formatted = parseFloat(conc).toFixed(3) + ' M';
    if (q1.solutionA && /\d+(?:\.\d+)?\s*M/i.test(q1.solutionA)) {
      q1.solutionA = q1.solutionA.replace(/\d+(?:\.\d+)?\s*M/i, formatted);
    } else {
      q1.solutionA = `${formatted} ${q1.solutionA || 'Hydrochloric Acid (HCl)'}`;
    }
    recalculateAndSyncExam();
    renderBlueprintTab(currentExamDraft);
    showTemporaryToast(`✓ Solution A set to ${formatted} · Target titre: ${q1.trueTitre.toFixed(2)} cm³`);
  };

  window.quickSetConcB = function(conc) {
    if (!currentExamDraft?.examConfig?.q1) return;
    const q1 = currentExamDraft.examConfig.q1;
    q1.trueBaseMolarity = parseFloat(conc);
    const formatted = parseFloat(conc).toFixed(3) + ' M';
    if (q1.solutionB && /\d+(?:\.\d+)?\s*M/i.test(q1.solutionB)) {
      q1.solutionB = q1.solutionB.replace(/\d+(?:\.\d+)?\s*M/i, formatted);
    } else {
      q1.solutionB = `${formatted} ${q1.solutionB || 'Sodium Hydroxide (NaOH)'}`;
    }
    recalculateAndSyncExam();
    renderBlueprintTab(currentExamDraft);
    showTemporaryToast(`✓ Solution B set to ${formatted} · Target titre: ${q1.trueTitre.toFixed(2)} cm³`);
  };

  window.updateBlueprintSolA = function(val) {
    if (!currentExamDraft?.examConfig?.q1) return;
    const q1 = currentExamDraft.examConfig.q1;
    q1.solutionA = val;
    const match = val.match(/(\d+(?:\.\d+)?)\s*M/i);
    if (match && match[1]) {
      q1.trueAcidMolarity = parseFloat(match[1]);
    }
    recalculateAndSyncExam();
    renderBlueprintTab(currentExamDraft);
    showTemporaryToast(`✓ Solution A updated · Target titre: ${q1.trueTitre.toFixed(2)} cm³`);
  };

  window.updateBlueprintSolB = function(val) {
    if (!currentExamDraft?.examConfig?.q1) return;
    const q1 = currentExamDraft.examConfig.q1;
    q1.solutionB = val;
    const match = val.match(/(\d+(?:\.\d+)?)\s*M/i);
    if (match && match[1]) {
      q1.trueBaseMolarity = parseFloat(match[1]);
    }
    recalculateAndSyncExam();
    renderBlueprintTab(currentExamDraft);
    showTemporaryToast(`✓ Solution B updated · Target titre: ${q1.trueTitre.toFixed(2)} cm³`);
  };

  window.updateBlueprintPipette = function(val) {
    if (!currentExamDraft?.examConfig?.q1) return;
    currentExamDraft.examConfig.q1.pipetteVolume = parseFloat(val) || 25.0;
    recalculateAndSyncExam();
    renderBlueprintTab(currentExamDraft);
    showTemporaryToast(`✓ Pipette volume set to ${val} cm³ · Target titre: ${currentExamDraft.examConfig.q1.trueTitre.toFixed(2)} cm³`);
  };

  window.updateBlueprintIndicator = function(val) {
    if (!currentExamDraft?.examConfig?.q1) return;
    currentExamDraft.examConfig.q1.indicator = val;
    recalculateAndSyncExam();
    renderBlueprintTab(currentExamDraft);
    showTemporaryToast(`✓ Indicator set to ${val}`);
  };

  window.updateBlueprintSalt = function(val) {
    if (!currentExamDraft?.examConfig?.q2) return;
    const q2 = currentExamDraft.examConfig.q2;
    q2.trueSaltKey = val;
    const saltNames = {
      'ZnSO4': { name: 'Zinc Sulfate — ZnSO₄', cation: 'Zn²⁺', anion: 'SO₄²⁻', desc: 'White crystalline solid' },
      'Pb(NO3)2': { name: 'Lead(II) Nitrate — Pb(NO₃)₂', cation: 'Pb²⁺', anion: 'NO₃⁻', desc: 'White crystalline solid' },
      'CuSO4': { name: 'Copper(II) Sulfate — CuSO₄', cation: 'Cu²⁺', anion: 'SO₄²⁻', desc: 'Blue crystalline powder' },
      'FeSO4': { name: 'Iron(II) Sulfate — FeSO₄', cation: 'Fe²⁺', anion: 'SO₄²⁻', desc: 'Pale green crystalline solid' },
      'FeCl3': { name: 'Iron(III) Chloride — FeCl₃', cation: 'Fe³⁺', anion: 'Cl⁻', desc: 'Reddish-brown crystalline solid' },
      'CaCl2': { name: 'Calcium Chloride — CaCl₂', cation: 'Ca²⁺', anion: 'Cl⁻', desc: 'White deliquescent crystals' }
    };
    const s = saltNames[val] || { name: val, cation: 'Zn²⁺', anion: 'SO₄²⁻', desc: 'Inorganic solid' };
    q2.trueSaltName = s.name;
    q2.trueCation = s.cation;
    q2.trueAnion = s.anion;
    q2.sampleDesc = s.desc;

    // Trigger AI sync to get tests
    AiExamAssistant.refineDraft({
      currentDraft: currentExamDraft,
      instruction: `Change unknown salt to ${s.name}`
    }).then(res => {
      if (res?.exam) renderExamResults(res.exam);
      showTemporaryToast(`✓ Salt changed to ${s.name}`);
    }).catch(() => {
      renderBlueprintTab(currentExamDraft);
    });
  };

  window.updateBlueprintOrganic = function(val) {
    if (!currentExamDraft?.examConfig?.q3) return;
    const q3 = currentExamDraft.examConfig.q3;
    q3.trueOrganicKey = val;
    const orgNames = {
      'Ethanol': { name: 'Ethanol — C₂H₅OH', fg: 'Alkanol (-OH)', desc: 'Clear neutral volatile liquid' },
      'Ethanoic Acid': { name: 'Ethanoic Acid — CH₃COOH', fg: 'Carboxylic Acid (-COOH)', desc: 'Pungent acidic liquid' },
      'Cyclohexene': { name: 'Cyclohexene — C₆H₁₀', fg: 'Alkene (>C=C<)', desc: 'Clear volatile hydrocarbon' },
      'Hexane': { name: 'Hexane — C₆H₁₄', fg: 'Saturated Alkane', desc: 'Neutral immiscible hydrocarbon' }
    };
    const o = orgNames[val] || { name: val, fg: 'Organic Group', desc: 'Organic compound' };
    q3.trueOrganicName = o.name;
    q3.trueFunctionalGroup = o.fg;
    q3.sampleDesc = o.desc;

    AiExamAssistant.refineDraft({
      currentDraft: currentExamDraft,
      instruction: `Change organic compound to ${o.name}`
    }).then(res => {
      if (res?.exam) renderExamResults(res.exam);
      showTemporaryToast(`✓ Organic sample changed to ${o.name}`);
    }).catch(() => {
      renderBlueprintTab(currentExamDraft);
    });
  };

  function saveDraftToStorage(exam) {
    try {
      if (exam) localStorage.setItem('vlk_ai_exam_draft', JSON.stringify(exam));
    } catch (e) {
      console.warn('[Walimu AI] Could not save draft to localStorage:', e);
    }
  }

  function loadDraftFromStorage() {
    try {
      const saved = localStorage.getItem('vlk_ai_exam_draft');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('[Walimu AI] Could not restore draft from localStorage:', e);
    }
    return null;
  }

  // ── Render Generated Exam Results Studio ───────────────────────
  function renderExamResults(exam, isInitial = false) {
    currentExamDraft = exam;
    saveDraftToStorage(exam);
    const resSec = document.getElementById('aiResultsSection');
    if (!resSec) return;

    resSec.style.display = 'block';

    // Populate Top Header Badges
    const titleInput = document.getElementById('resExamTitle');
    if (titleInput) {
      titleInput.value = exam.title || 'KCSE Chemistry Practical Examination';
      titleInput.oninput = function() {
        if (currentExamDraft) {
          currentExamDraft.title = this.value;
          saveDraftToStorage(currentExamDraft);
        }
      };
    }

    const badgeForm = document.getElementById('resBadgeForm');
    if (badgeForm) badgeForm.textContent = exam.formLevel || 'Form 4';

    const badgeDuration = document.getElementById('resBadgeDuration');
    if (badgeDuration) badgeDuration.textContent = (exam.durationMinutes || 135) + ' Mins';

    const badgeType = document.getElementById('resBadgeType');
    if (badgeType) {
      badgeType.textContent = exam.titrationType === 'kcseComposite' ? '🏆 Composite 40M' : '⚗️ ' + exam.titrationType;
    }

    const instructionsEl = document.getElementById('resExamInstructions');
    if (instructionsEl) instructionsEl.textContent = exam.instructions || '';

    // Render Sub-Tabs
    renderBlueprintTab(exam);
    renderStudentPaperTab(exam);
    renderMarkingSchemeTab(exam);
    renderTechnicianGuideTab(exam);

    // Maintain currently active sub-tab (or default to blueprint)
    window.switchAiResultSubTab(activeResultSubTab || 'blueprint');

    // Only scroll to top of results on initial generation / paper parse
    if (isInitial) {
      resSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ── Sub-Tab Switcher ──────────────────────────────────────────
  window.switchAiResultSubTab = function(tabName) {
    activeResultSubTab = tabName;
    ['blueprint', 'studentPaper', 'markingScheme', 'technicianGuide'].forEach(name => {
      const tabBtn = document.getElementById(`subTabBtn_${name}`);
      const pane = document.getElementById(`subTabPane_${name}`);
      if (tabBtn) tabBtn.classList.toggle('active', name === tabName);
      if (pane) pane.style.display = name === tabName ? 'block' : 'none';
    });
  };

  // ── 1. Render Simulation Blueprint Tab (Interactive & Direct Editing) ────────────────────────
  function renderBlueprintTab(exam) {
    const cfg = exam.examConfig || {};
    const q1 = cfg.q1 || {};
    const q2 = cfg.q2 || {};
    const q3 = cfg.q3 || {};

    const container = document.getElementById('subTabPane_blueprint');
    if (!container) return;

    container.innerHTML = `
      <div class="ai-blueprint-grid">
        
        <!-- Question 1 Card -->
        <div class="blueprint-card">
          <div class="blueprint-card-header">
            <span class="q-badge">Question 1 · 15 Marks</span>
            <h4>🧪 Volumetric Analysis Rig</h4>
          </div>
          <div class="blueprint-card-body">
            
            <!-- Solution A Reagent & Concentration Row -->
            <div style="margin-bottom:12px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <span class="bp-label">Burette Solution A:</span>
                <div style="display:flex;gap:4px;">
                  <button type="button" class="btn btn-sm btn-secondary" style="font-size:0.72rem;padding:2px 8px;" onclick="quickSetConcA(0.02)">0.02M</button>
                  <button type="button" class="btn btn-sm btn-secondary" style="font-size:0.72rem;padding:2px 8px;" onclick="quickSetConcA(0.05)">0.05M</button>
                  <button type="button" class="btn btn-sm btn-secondary" style="font-size:0.72rem;padding:2px 8px;" onclick="quickSetConcA(0.10)">0.10M</button>
                  <button type="button" class="btn btn-sm btn-secondary" style="font-size:0.72rem;padding:2px 8px;" onclick="quickSetConcA(0.20)">0.20M</button>
                </div>
              </div>
              <input type="text" class="form-control form-control-sm" style="font-weight:700;" value="${escapeHtml(q1.solutionA || '0.100 M Hydrochloric Acid (HCl)')}" onchange="updateBlueprintSolA(this.value)">
            </div>

            <!-- Solution B Reagent & Concentration Row -->
            <div style="margin-bottom:14px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <span class="bp-label">Conical Flask Solution B:</span>
                <div style="display:flex;gap:4px;">
                  <button type="button" class="btn btn-sm btn-secondary" style="font-size:0.72rem;padding:2px 8px;" onclick="quickSetConcB(0.05)">0.05M</button>
                  <button type="button" class="btn btn-sm btn-secondary" style="font-size:0.72rem;padding:2px 8px;" onclick="quickSetConcB(0.10)">0.10M</button>
                  <button type="button" class="btn btn-sm btn-secondary" style="font-size:0.72rem;padding:2px 8px;" onclick="quickSetConcB(0.20)">0.20M</button>
                </div>
              </div>
              <input type="text" class="form-control form-control-sm" style="font-weight:700;" value="${escapeHtml(q1.solutionB || '0.100 M Sodium Hydroxide (NaOH)')}" onchange="updateBlueprintSolB(this.value)">
            </div>

            <div class="bp-param-row" style="align-items:center;">
              <div>
                <span class="bp-label">Pipette:</span>
                <select class="form-control form-control-sm" style="display:inline-block;width:auto;font-weight:700;" onchange="updateBlueprintPipette(this.value)">
                  <option value="25" ${q1.pipetteVolume == 25 ? 'selected' : ''}>25.0 cm³</option>
                  <option value="20" ${q1.pipetteVolume == 20 ? 'selected' : ''}>20.0 cm³</option>
                  <option value="10" ${q1.pipetteVolume == 10 ? 'selected' : ''}>10.0 cm³</option>
                </select>
              </div>

              <div>
                <span class="bp-label">Indicator:</span>
                <select class="form-control form-control-sm" style="display:inline-block;width:auto;font-weight:700;" onchange="updateBlueprintIndicator(this.value)">
                  <option value="phenolphthalein" ${q1.indicator === 'phenolphthalein' ? 'selected' : ''}>Phenolphthalein</option>
                  <option value="methylOrange" ${q1.indicator === 'methylOrange' ? 'selected' : ''}>Methyl Orange</option>
                  <option value="screenedMethylOrange" ${q1.indicator === 'screenedMethylOrange' ? 'selected' : ''}>Screened Methyl Orange</option>
                  <option value="starch" ${q1.indicator === 'starch' ? 'selected' : ''}>Starch</option>
                  <option value="none" ${q1.indicator === 'none' ? 'selected' : ''}>Self-Indicating (Redox)</option>
                </select>
              </div>

              <div><span class="bp-label">Mole Ratio (A:B):</span> <b>${q1.ratioA || 1} : ${q1.ratioB || 1}</b></div>
              <div><span class="bp-label">Calculated Titre:</span> <b style="color:var(--green-accent);font-size:1.05rem;">${Number(q1.trueTitre || 25.0).toFixed(2)} cm³</b></div>
            </div>

            <div class="bp-equation" style="margin-top:12px;"><code>${escapeHtml(q1.equation || 'Acid(aq) + Base(aq) → Salt(aq) + H₂O(l)')}</code></div>
          </div>
        </div>

        <!-- Question 2 Card -->
        <div class="blueprint-card">
          <div class="blueprint-card-header">
            <span class="q-badge">Question 2 · 15 Marks</span>
            <h4>🧂 Inorganic Salt Analysis</h4>
          </div>
          <div class="blueprint-card-body">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;">
              <span class="bp-label">Target Unknown Salt:</span>
              <select class="form-control form-control-sm" style="font-weight:700;max-width:320px;" onchange="updateBlueprintSalt(this.value)">
                <option value="ZnSO4" ${q2.trueSaltKey === 'ZnSO4' ? 'selected' : ''}>Zinc Sulfate — ZnSO₄ (Zn²⁺ / SO₄²⁻)</option>
                <option value="Pb(NO3)2" ${q2.trueSaltKey === 'Pb(NO3)2' ? 'selected' : ''}>Lead(II) Nitrate — Pb(NO₃)₂ (Pb²⁺ / NO₃⁻)</option>
                <option value="CuSO4" ${q2.trueSaltKey === 'CuSO4' ? 'selected' : ''}>Copper(II) Sulfate — CuSO₄ (Cu²⁺ / SO₄²⁻)</option>
                <option value="FeSO4" ${q2.trueSaltKey === 'FeSO4' ? 'selected' : ''}>Iron(II) Sulfate — FeSO₄ (Fe²⁺ / SO₄²⁻)</option>
                <option value="FeCl3" ${q2.trueSaltKey === 'FeCl3' ? 'selected' : ''}>Iron(III) Chloride — FeCl₃ (Fe³⁺ / Cl⁻)</option>
                <option value="CaCl2" ${q2.trueSaltKey === 'CaCl2' ? 'selected' : ''}>Calcium Chloride — CaCl₂ (Ca²⁺ / Cl⁻)</option>
              </select>
            </div>

            <div class="bp-param-row">
              <div><span class="bp-label">Confirmed Cation:</span> <span class="pill pill-ok">${escapeHtml(q2.trueCation || 'Zn²⁺')}</span></div>
              <div><span class="bp-label">Confirmed Anion:</span> <span class="pill pill-ok">${escapeHtml(q2.trueAnion || 'SO₄²⁻')}</span></div>
              <div><span class="bp-label">Appearance:</span> <i>${escapeHtml(q2.sampleDesc || 'White crystalline solid')}</i></div>
            </div>
            
            <div style="margin-top:12px;">
              <div style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Diagnostic Procedure (${(q2.tests || []).length} Tests):</div>
              <div class="bp-mini-tests">
                ${(q2.tests || []).map((t, i) => `
                  <div class="bp-test-row">
                    <span class="bp-test-idx">${i + 1}</span>
                    <div>
                      <div style="font-weight:700; font-size:0.8rem;">${escapeHtml(t.prompt || '')}</div>
                      <div style="font-size:0.75rem; color:var(--green-accent);">✓ Obs: ${escapeHtml(t.correctObs || '')}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Question 3 Card -->
        <div class="blueprint-card">
          <div class="blueprint-card-header">
            <span class="q-badge">Question 3 · 10 Marks</span>
            <h4>⚗️ Organic Chemistry Functional Group</h4>
          </div>
          <div class="blueprint-card-body">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;">
              <span class="bp-label">Target Unknown Organic:</span>
              <select class="form-control form-control-sm" style="font-weight:700;max-width:320px;" onchange="updateBlueprintOrganic(this.value)">
                <option value="Ethanol" ${q3.trueOrganicKey === 'Ethanol' ? 'selected' : ''}>Ethanol — C₂H₅OH (Alkanol -OH)</option>
                <option value="Ethanoic Acid" ${q3.trueOrganicKey === 'Ethanoic Acid' ? 'selected' : ''}>Ethanoic Acid — CH₃COOH (Carboxylic Acid -COOH)</option>
                <option value="Cyclohexene" ${q3.trueOrganicKey === 'Cyclohexene' ? 'selected' : ''}>Cyclohexene — C₆H₁₀ (Alkene >C=C<)</option>
                <option value="Hexane" ${q3.trueOrganicKey === 'Hexane' ? 'selected' : ''}>Hexane — C₆H₁₄ (Saturated Alkane)</option>
              </select>
            </div>

            <div class="bp-param-row">
              <div><span class="bp-label">Confirmed Functional Group:</span> <span class="pill pill-warn">${escapeHtml(q3.trueFunctionalGroup || 'Alkanol (-OH)')}</span></div>
              <div><span class="bp-label">Appearance:</span> <i>${escapeHtml(q3.sampleDesc || 'Clear neutral organic liquid')}</i></div>
            </div>

            <div style="margin-top:12px;">
              <div style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Testing Sequence (${(q3.tests || []).length} Tests):</div>
              <div class="bp-mini-tests">
                ${(q3.tests || []).map((t, i) => `
                  <div class="bp-test-row">
                    <span class="bp-test-idx">${i + 1}</span>
                    <div>
                      <div style="font-weight:700; font-size:0.8rem;">${escapeHtml(t.prompt || '')}</div>
                      <div style="font-size:0.75rem; color:var(--amber-accent);">✓ Obs: ${escapeHtml(t.correctObs || '')}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  // ── 2. Render Student Question Paper Tab ───────────────────────
  function renderStudentPaperTab(exam) {
    const cfg = exam.examConfig || {};
    const q1 = cfg.q1 || {};
    const q2 = cfg.q2 || {};
    const q3 = cfg.q3 || {};

    const container = document.getElementById('subTabPane_studentPaper');
    if (!container) return;

    container.innerHTML = `
      <div class="exam-paper-preview">
        <div class="paper-header">
          <div style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted);">VirtuLab Kenya · Secondary Chemistry Practical Assessment</div>
          <h2 style="font-family:var(--font-heading); margin:4px 0 6px;">${escapeHtml(exam.title)}</h2>
          <div style="font-size:0.85rem; font-weight:700; color:var(--amber-accent);">KENYA CERTIFICATE OF SECONDARY EDUCATION — PAPER 3 (PRACTICAL) — CODE 233/3</div>
          <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">Time: ${exam.durationMinutes || 135} Minutes · Maximum Marks: 40</div>
        </div>

        <!-- KNEC Candidate Identification & Mark Table -->
        <div class="paper-section" style="border: 1.5px solid var(--card-border); padding: 16px; border-radius: 10px; margin-bottom: 18px; background: rgba(255,255,255,0.02);">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; font-size: 0.85rem; margin-bottom: 14px;">
            <div><b>Candidate's Name:</b> __________________________________</div>
            <div><b>Index Number:</b> _______________ / _________</div>
            <div><b>Candidate's Signature:</b> _______________________</div>
            <div><b>Date of Exam:</b> _________________________</div>
          </div>
          <div style="font-weight: 800; font-size: 0.75rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted);">
            FOR EXAMINER'S USE ONLY:
          </div>
          <div style="overflow-x: auto;">
            <table class="paper-table" style="text-align: center; font-size: 0.82rem; margin: 0; min-width: 320px;">
              <thead>
                <tr>
                  <th style="text-align: left;">Question</th>
                  <th>Maximum Score</th>
                  <th>Candidate's Score</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style="text-align: left;">1 (Quantitative Volumetric Analysis)</td><td>15.0</td><td></td></tr>
                <tr><td style="text-align: left;">2 (Inorganic Qualitative Salt Analysis)</td><td>15.0</td><td></td></tr>
                <tr><td style="text-align: left;">3 (Organic Qualitative Tests)</td><td>10.0</td><td></td></tr>
                <tr style="font-weight: 800; background: rgba(0,0,0,0.04);">
                  <td style="text-align: left;">TOTAL SCORE</td><td>40.0</td><td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="paper-section">
          <h4>GENERAL CANDIDATE INSTRUCTIONS</h4>
          <p style="font-size:0.84rem; line-height:1.6; color:var(--text-main);">${escapeHtml(exam.instructions)}</p>
        </div>

        <!-- Question 1 Section -->
        <div class="paper-section">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid var(--card-border); padding-bottom:6px; margin-bottom:12px;">
            <h4 style="margin:0;">QUESTION 1 (15.0 MARKS)</h4>
            <span class="pill pill-info">Quantitative Volumetric Analysis</span>
          </div>
          <p style="font-size:0.85rem; line-height:1.6;">You are provided with:</p>
          <ul style="font-size:0.84rem; line-height:1.7; margin-left:20px;">
            <li><b>Solution A:</b> ${formatChemicalFormula(escapeHtml(q1.solutionA || 'Standard Acid'))}</li>
            <li><b>Solution B:</b> ${formatChemicalFormula(escapeHtml(q1.solutionB || 'Base Sample'))}</li>
            <li><b>Indicator:</b> ${escapeHtml(q1.indicator || 'Phenolphthalein')}</li>
          </ul>
          <p style="font-size:0.84rem; line-height:1.6;">${escapeHtml(q1.instructions || 'You are required to titrate Solution B with Solution A and determine its concentration.')}</p>
          
          <div style="margin:14px 0;">
            <div style="font-weight:700; font-size:0.82rem; margin-bottom:6px;">Table 1: Candidate Burette Titration Results</div>
            <div style="overflow-x: auto;">
              <table class="paper-table" style="min-width: 320px;">
                <thead>
                  <tr><th>Titration Trial</th><th>I</th><th>II</th><th>III</th></tr>
                </thead>
                <tbody>
                  <tr><td>Final Burette Reading (cm³)</td><td></td><td></td><td></td></tr>
                  <tr><td>Initial Burette Reading (cm³)</td><td></td><td></td><td></td></tr>
                  <tr><td>Volume of Solution A Used (cm³)</td><td></td><td></td><td></td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div style="font-size:0.84rem; line-height:1.8;">
            <div>(a) Calculate the average volume of Solution A used. [1 Mark]</div>
            <div>(b) Calculate the number of moles of Solution B in ${q1.pipetteVolume || 25.0} cm³. [2 Marks]</div>
            <div>(c) Using the stoichiometric equation: <code>${formatChemicalFormula(escapeHtml(q1.equation || ''))}</code>, determine moles of Solution A. [2 Marks]</div>
            <div>(d) Calculate the concentration of Solution A in mol dm⁻³ and g dm⁻³. [3 Marks]</div>
          </div>
        </div>

        <!-- Question 2 Section -->
        <div class="paper-section">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid var(--card-border); padding-bottom:6px; margin-bottom:12px;">
            <h4 style="margin:0;">QUESTION 2 (15.0 MARKS)</h4>
            <span class="pill pill-info">Inorganic Qualitative Analysis</span>
          </div>
          <p style="font-size:0.84rem; line-height:1.6;">You are provided with <b>${formatChemicalFormula(escapeHtml(q2.sampleName || 'Solid Y'))}</b>. Carry out the following tests and record your observations and inferences in the spaces provided below.</p>
          
          <div style="overflow-x: auto;">
            <table class="paper-table" style="margin-top:10px; min-width: 480px;">
              <thead>
                <tr><th style="width:45%;">Test / Experimental Procedure</th><th style="width:30%;">Observations [1 Mk each]</th><th style="width:25%;">Inferences [1 Mk each]</th></tr>
              </thead>
              <tbody>
                ${(q2.tests || []).map(t => `
                  <tr>
                    <td>${formatChemicalFormula(escapeHtml(t.prompt))}</td>
                    <td style="background:var(--card-bg-hover);"></td>
                    <td style="background:var(--card-bg-hover);"></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div style="margin-top:10px; font-size:0.85rem;">
            <b>Final Deduction:</b> Cation: ____________________ &nbsp;|&nbsp; Anion: ____________________ [2 Marks]
          </div>
        </div>

        <!-- Question 3 Section -->
        <div class="paper-section">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid var(--card-border); padding-bottom:6px; margin-bottom:12px;">
            <h4 style="margin:0;">QUESTION 3 (10.0 MARKS)</h4>
            <span class="pill pill-info">Organic Functional Group Analysis</span>
          </div>
          <p style="font-size:0.84rem; line-height:1.6;">You are provided with <b>${formatChemicalFormula(escapeHtml(q3.sampleName || 'Liquid Z'))}</b>. Carry out the following tests to identify the organic functional group present.</p>
          
          <div style="overflow-x: auto;">
            <table class="paper-table" style="margin-top:10px; min-width: 480px;">
              <thead>
                <tr><th style="width:45%;">Test / Experimental Procedure</th><th style="width:30%;">Observations</th><th style="width:25%;">Inferences</th></tr>
              </thead>
              <tbody>
                ${(q3.tests || []).map(t => `
                  <tr>
                    <td>${formatChemicalFormula(escapeHtml(t.prompt))}</td>
                    <td style="background:var(--card-bg-hover);"></td>
                    <td style="background:var(--card-bg-hover);"></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  // ── 3. Render Marking Scheme Tab ──────────────────────────────
  function renderMarkingSchemeTab(exam) {
    const container = document.getElementById('subTabPane_markingScheme');
    if (!container) return;

    const raw = exam.markingScheme || 'No marking scheme provided.';
    container.innerHTML = `
      <div class="markdown-preview-box">
        ${formatMarkdownText(raw)}
      </div>
    `;
  }

  // ── 4. Render Technician Guide Tab ─────────────────────────────
  function renderTechnicianGuideTab(exam) {
    const container = document.getElementById('subTabPane_technicianGuide');
    if (!container) return;

    const raw = exam.confidentialPrepGuide || 'No confidential preparation instructions provided.';
    container.innerHTML = `
      <div class="markdown-preview-box">
        <div class="confidential-seal">🔒 KNEC CONFIDENTIAL PREPARATION INSTRUCTIONS</div>
        ${formatMarkdownText(raw)}
      </div>
    `;
  }

  // ── Publishing Exam Directly to Student Class ─────────────────
  window.publishAiExamToClass = async function() {
    if (!currentExamDraft) {
      alert('No exam draft active.');
      return;
    }

    const btn = document.getElementById('btnPublishAiExam');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '🚀 Publishing to Class…';
    }

    const titleInput = document.getElementById('resExamTitle');
    const finalTitle = titleInput ? titleInput.value.trim() : currentExamDraft.title;

    // Calculate due date (default: 7 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const payload = {
      title: finalTitle || 'KCSE Chemistry Practical Exam',
      titrationType: currentExamDraft.titrationType || 'kcseComposite',
      instructions: currentExamDraft.instructions || 'Complete all 3 questions within the allocated time.',
      dueDate: dueDate.toISOString(),
      examConfig: currentExamDraft.examConfig
    };

    try {
      if (typeof Assignments !== 'undefined' && Assignments.create) {
        await Assignments.create(payload);
      } else {
        await apiRequest('POST', '/assignments', payload);
      }

      showTemporaryToast('🎉 Exam successfully published to your class! Students have been notified.');
      
      // Reload teacher assignment tables if present
      if (typeof loadTeacherAssignments === 'function') loadTeacherAssignments();
      if (typeof loadSubmittedAssignments === 'function') loadSubmittedAssignments();

      // Switch to Assignments tab after 1.5 seconds
      setTimeout(() => {
        if (typeof switchTeacherTab === 'function') switchTeacherTab('paneAssignments');
      }, 1500);

    } catch (err) {
      alert('Could not publish assignment: ' + (err.message || 'Error occurred.'));
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '🚀 Publish Exam to Class';
      }
    }
  };

  // ── Open In Manual Studio ─────────────────────────────────────
  window.openInManualStudio = function() {
    if (!currentExamDraft) return;

    // Pre-populate fields in manual form
    const cfg = currentExamDraft.examConfig || {};
    const q1 = cfg.q1 || {};
    const q2 = cfg.q2 || {};
    const q3 = cfg.q3 || {};

    const aTitle = document.getElementById('aTitle');
    if (aTitle) aTitle.value = currentExamDraft.title || '';

    const aType = document.getElementById('aType');
    if (aType) {
      aType.value = currentExamDraft.titrationType || 'kcseComposite';
      if (typeof toggleCompositeConfigPanel === 'function') toggleCompositeConfigPanel();
    }

    const aInst = document.getElementById('aInstructions');
    if (aInst) aInst.value = currentExamDraft.instructions || '';

    if (q1.solutionA) {
      const el = document.getElementById('cfgQ1SolA');
      if (el) el.value = q1.solutionA;
    }
    if (q1.solutionB) {
      const el = document.getElementById('cfgQ1SolB');
      if (el) el.value = q1.solutionB;
    }
    if (q1.ratioA) {
      const el = document.getElementById('cfgQ1RatioA');
      if (el) el.value = q1.ratioA;
    }
    if (q1.ratioB) {
      const el = document.getElementById('cfgQ1RatioB');
      if (el) el.value = q1.ratioB;
    }
    if (q1.pipetteVolume) {
      const el = document.getElementById('cfgQ1Pipette');
      if (el) el.value = Number(q1.pipetteVolume).toFixed(1);
    }
    if (q1.indicator) {
      const el = document.getElementById('cfgQ1Indicator');
      if (el) el.value = q1.indicator;
    }

    if (q2.trueSaltKey) {
      const el = document.getElementById('cfgQ2Salt');
      if (el) el.value = q2.trueSaltKey;
    }
    if (q3.trueOrganicKey) {
      const el = document.getElementById('cfgQ3Organic');
      if (el) el.value = q3.trueOrganicKey;
    }

    if (typeof switchTeacherTab === 'function') {
      switchTeacherTab('paneAssignments');
      const studioCard = document.getElementById('assignmentStudioCard');
      if (studioCard) studioCard.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ── Print Booklet & Marking Scheme ────────────────────────────
  window.printAiExamBooklet = function() {
    window.print();
  };

  // ── Export JSON Blueprint ─────────────────────────────────────
  window.exportAiExamJson = function() {
    if (!currentExamDraft) return;
    const blob = new Blob([JSON.stringify(currentExamDraft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knec_exam_${(currentExamDraft.title || 'practical').toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Formatting Utilities ──────────────────────────────────────
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatChemicalFormula(str) {
    if (!str) return '';
    return String(str)
      .replace(/cm3/g, 'cm³')
      .replace(/dm3/g, 'dm³')
      .replace(/mol\/dm3/g, 'mol dm⁻³')
      .replace(/g\/dm3/g, 'g dm⁻³')
      .replace(/Pb\(NO3\)2/g, 'Pb(NO₃)₂')
      .replace(/ZnSO4/g, 'ZnSO₄')
      .replace(/CuSO4/g, 'CuSO₄')
      .replace(/FeSO4/g, 'FeSO₄')
      .replace(/FeCl3/g, 'FeCl₃')
      .replace(/CaCl2/g, 'CaCl₂')
      .replace(/NH4Cl/g, 'NH₄Cl')
      .replace(/H2SO4/g, 'H₂SO₄')
      .replace(/Na2CO3/g, 'Na₂CO₃')
      .replace(/KMnO4/g, 'KMnO₄')
      .replace(/Pb2\+/g, 'Pb²⁺')
      .replace(/Zn2\+/g, 'Zn²⁺')
      .replace(/Cu2\+/g, 'Cu²⁺')
      .replace(/Fe2\+/g, 'Fe²⁺')
      .replace(/Fe3\+/g, 'Fe³⁺')
      .replace(/Ca2\+/g, 'Ca²⁺')
      .replace(/Al3\+/g, 'Al³⁺')
      .replace(/NH4\+/g, 'NH₄⁺')
      .replace(/SO42\-/g, 'SO₄²⁻')
      .replace(/NO3\-/g, 'NO₃⁻')
      .replace(/CO32\-/g, 'CO₃²⁻')
      .replace(/Cl\-/g, 'Cl⁻');
  }

  function formatMathFormula(expr) {
    if (!expr) return '';
    let m = String(expr).trim();
    m = m.replace(/\\text\{([^}]+)\}/g, '$1');
    m = m.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span style="display:inline-flex; flex-direction:column; vertical-align:middle; text-align:center; margin:0 4px; font-size:0.9em; line-height:1.1;"><span style="border-bottom:1.5px solid currentColor; padding:0 3px;">$1</span><span style="padding:0 3px;">$2</span></span>');
    m = m.replace(/\\times/g, '×');
    m = m.replace(/\\pm/g, '±');
    m = m.replace(/\\cdot/g, '·');
    m = m.replace(/(\d+(?:\.\d+)?)e(-?\d+)/g, (match, base, exp) => {
      const expSup = exp.replace(/-/g, '⁻').replace(/1/g, '¹').replace(/2/g, '²').replace(/3/g, '³').replace(/4/g, '⁴').replace(/5/g, '⁵').replace(/6/g, '⁶').replace(/7/g, '⁷').replace(/8/g, '⁸').replace(/9/g, '⁹').replace(/0/g, '⁰');
      return `${base} × 10${expSup}`;
    });
    m = m.replace(/\^3/g, '³').replace(/\^2/g, '²').replace(/\^1/g, '¹');
    m = m.replace(/\\rightarrow|\\to/g, '→');
    return m;
  }

  function formatInlineMarkdown(str) {
    if (!str) return '';
    let s = String(str);
    s = s.replace(/`([^`]+)`/g, '<code style="background:var(--card-bg-hover); border:1px solid var(--card-border); padding:2px 6px; border-radius:4px; font-family:\'JetBrains Mono\',monospace; font-size:0.86em; color:var(--green-accent); font-weight:600;">$1</code>');
    s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*(.*?)\*/g, '<em>$1</em>');
    s = s.replace(/\$([^$\n]+)\$/g, (m, f) => `<span style="font-family:'JetBrains Mono',monospace; font-weight:700; color:var(--green-accent);">${formatMathFormula(f)}</span>`);
    s = formatChemicalFormula(s);
    return s;
  }

  function parseMarkdownTables(text) {
    const lines = text.split(/\r?\n/);
    const result = [];
    let inTable = false;
    let tableLines = [];

    const flushTable = () => {
      if (tableLines.length >= 2) {
        const parseRow = (line) => {
          const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
          return trimmed.split('|').map(c => c.trim());
        };

        const headers = parseRow(tableLines[0]);
        const bodyRows = tableLines.slice(2);

        let html = '<div style="overflow-x:auto; margin:14px 0; border-radius:8px; border:1.5px solid var(--card-border);"><table class="paper-table" style="margin:0; width:100%; min-width:480px;">';
        html += '<thead><tr style="background:rgba(16,185,129,0.12);">';
        headers.forEach(h => {
          html += `<th style="padding:9px 12px; font-weight:800; color:var(--heading-color);">${formatInlineMarkdown(h)}</th>`;
        });
        html += '</tr></thead><tbody>';

        bodyRows.forEach((r, idx) => {
          const cells = parseRow(r);
          const bg = idx % 2 === 1 ? 'background:rgba(0,0,0,0.02);' : '';
          html += `<tr style="${bg}">`;
          cells.forEach(c => {
            html += `<td style="padding:8px 12px; vertical-align:top;">${formatInlineMarkdown(c)}</td>`;
          });
          html += '</tr>';
        });

        html += '</tbody></table></div>';
        result.push(html);
      } else if (tableLines.length === 1) {
        result.push(tableLines[0]);
      }
      tableLines = [];
      inTable = false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const isTableRow = trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|');
      const isDivider = trimmed.startsWith('|') && /^\|[\s\-:|]+\|$/.test(trimmed);

      if (isTableRow || (inTable && isDivider)) {
        inTable = true;
        tableLines.push(line);
      } else {
        if (inTable) flushTable();
        result.push(line);
      }
    }
    if (inTable) flushTable();
    return result.join('\n');
  }

  function formatMarkdownText(text) {
    if (!text) return '';
    let raw = String(text);

    // 1. Block equations $$...$$ (with optional (Marks) badge)
    raw = raw.replace(/\$\$([\s\S]*?)\$\$\s*(?:\(([0-9]+(?:\.[0-9]+)?\s*Marks?)\))?/g, (match, formula, marks) => {
      const markBadge = marks ? `<span class="badge" style="background:rgba(16,185,129,0.18); color:var(--green-accent); font-weight:800; font-size:0.78rem; margin-left:auto;">${marks}</span>` : '';
      return `\n<div class="math-display-block" style="background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.22); border-radius:8px; padding:10px 16px; margin:10px 0; font-family:'JetBrains Mono',monospace; font-size:0.92rem; color:var(--heading-color); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;"><div>${formatMathFormula(formula)}</div>${markBadge}</div>\n`;
    });

    // 2. Parse Markdown tables
    raw = parseMarkdownTables(raw);

    // 3. Headings
    raw = raw.replace(/^# (.*$)/gm, '<h2 style="font-family:var(--font-heading); margin:0 0 10px 0; color:var(--heading-color); font-size:1.3rem; font-weight:900; border-bottom:2px solid var(--green-accent); padding-bottom:8px;">$1</h2>');
    raw = raw.replace(/^## (.*$)/gm, '<h3 style="font-family:var(--font-heading); margin:18px 0 8px 0; color:var(--heading-color); font-size:1.15rem; font-weight:800;">$1</h3>');
    raw = raw.replace(/^### (.*$)/gm, (m, title) => {
      return `<div style="background:rgba(16,185,129,0.08); border-left:4px solid var(--green-accent); padding:10px 14px; margin:20px 0 12px; border-radius:0 8px 8px 0;"><h3 style="margin:0; font-family:var(--font-heading); font-size:1.05rem; font-weight:800; color:var(--heading-color);">${formatInlineMarkdown(title)}</h3></div>`;
    });
    raw = raw.replace(/^##### (.*$)/gm, '<h5 style="font-family:var(--font-heading); margin:14px 0 6px 0; color:var(--heading-color); font-size:0.92rem; font-weight:800;">$1</h5>');
    raw = raw.replace(/^#### (.*$)/gm, '<h4 style="font-family:var(--font-heading); margin:16px 0 6px 0; color:var(--heading-color); font-size:0.98rem; font-weight:800;">$1</h4>');

    // 4. Horizontal rules
    raw = raw.replace(/^(?:---|___|\*\*\*)$/gm, '<hr style="border:0; border-top:1.5px solid var(--card-border); margin:20px 0;">');

    // 5. Blockquotes
    raw = raw.replace(/^>\s*(.*$)/gm, '<blockquote style="border-left:3px solid var(--amber-accent); padding:8px 14px; margin:12px 0; background:rgba(245,158,11,0.06); border-radius:0 8px 8px 0; color:var(--text-main); font-style:italic;">$1</blockquote>');

    // 6. Bullet lists
    raw = raw.replace(/(?:^|\n)((?:[\t ]*[-*] .+(?:\r?\n|$))+)/g, (match, list) => {
      const items = list.trim().split(/\r?\n/).map(li => {
        const content = li.replace(/^[\t ]*[-*] /, '');
        return `<li style="margin-bottom:6px; line-height:1.6;">${formatInlineMarkdown(content)}</li>`;
      }).join('');
      return `\n<ul style="margin:8px 0 14px 22px; line-height:1.6;">${items}</ul>\n`;
    });

    // 7. General inline formatting for remaining lines
    const lines = raw.split(/\r?\n/).map(line => {
      if (line.startsWith('<div') || line.startsWith('<h') || line.startsWith('<ul') || line.startsWith('<hr') || line.startsWith('<blockquote') || line.startsWith('<table')) {
        return line;
      }
      return formatInlineMarkdown(line);
    });

    let html = lines.join('\n');
    html = html.replace(/([^\n>])\n([^\n<])/g, '$1<br>$2');
    html = html.replace(/\n\n/g, '<div style="height:10px;"></div>');
    return html;
  }

  let toastTimerId = null;
  function showTemporaryToast(message, type = 'success', duration = 4000) {
    let toast = document.getElementById('vlkAiToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'vlkAiToast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.style.position = 'fixed';
      toast.style.bottom = '24px';
      toast.style.right = '24px';
      toast.style.padding = '12px 22px';
      toast.style.borderRadius = '100px';
      toast.style.fontWeight = '800';
      toast.style.fontSize = '0.88rem';
      toast.style.zIndex = '99999';
      toast.style.transition = 'all 0.3s ease';
      document.body.appendChild(toast);
    }
    if (type === 'error') {
      toast.style.background = '#EF4444';
      toast.style.color = '#FFFFFF';
      toast.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.4)';
    } else {
      toast.style.background = '#10B981';
      toast.style.color = '#FFFFFF';
      toast.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    if (toastTimerId) clearTimeout(toastTimerId);
    toastTimerId = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
    }, duration);
  }

  // ── AI Engine Connectivity Check ──────────────────────────────
  async function checkAiServiceStatus() {
    const notice = document.getElementById('aiServiceStatusNotice');
    if (!notice || typeof AiExamAssistant === 'undefined' || !AiExamAssistant.getStatus) return;

    try {
      const res = await AiExamAssistant.getStatus();
      if (res && res.status) {
        if (!res.status.configured) {
          notice.style.display = 'block';
          notice.style.background = 'rgba(245, 158, 11, 0.12)';
          notice.style.border = '1px solid rgba(245, 158, 11, 0.4)';
          notice.style.color = '#92400E';
          notice.innerHTML = `
            <div style="display:flex;align-items:flex-start;gap:12px;">
              <span style="font-size:1.4rem;line-height:1;">⚠️</span>
              <div>
                <strong style="display:block;margin-bottom:2px;font-size:0.92rem;">Google Gemini API Key Not Configured</strong>
                <span>Multimodal PDF exam paper parsing and custom exam generation currently run in <em>offline fallback mode</em>. To parse your uploaded PDF exams using Google Gemini AI, add <code>GEMINI_API_KEY=your_key</code> in <code>server/.env</code> and restart the server.</span>
              </div>
            </div>
          `;
        } else {
          notice.style.display = 'none';
        }
      }
    } catch (e) {
      // Quiet fail if not authenticated yet
    }
  }

  // ── Protection Against Unsaved Data Loss ───────────────────────
  window.addEventListener('beforeunload', function(e) {
    if (currentExamDraft) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // Restore previous draft on session start if available
  try {
    const saved = loadDraftFromStorage();
    if (saved && saved.examConfig) {
      setTimeout(() => {
        renderExamResults(saved, false);
      }, 300);
    }
  } catch (e) {
    console.warn('[Walimu AI] Auto-restore skipped:', e);
  }

  // Check AI connectivity on boot
  setTimeout(checkAiServiceStatus, 500);

})();
