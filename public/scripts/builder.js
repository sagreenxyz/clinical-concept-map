/**
 * builder.js — Clinical Concept Map Builder
 * Vanilla JS module for the /builder page of the Astro static site.
 * No external dependencies.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Constants ───────────────────────────────────────────────────────────────
  const STORAGE_KEY = 'clinicalConceptMapData';
  const AUTOSAVE_INTERVAL = 5000; // ms
  const PREVIEW_DEBOUNCE = 300;   // ms

  const NANDA_DIAGNOSES = [
    'Ineffective Airway Clearance',
    'Impaired Gas Exchange',
    'Decreased Cardiac Output',
    'Ineffective Tissue Perfusion',
    'Acute Pain',
    'Chronic Pain',
    'Activity Intolerance',
    'Fatigue',
    'Deficient Fluid Volume',
    'Excess Fluid Volume',
    'Imbalanced Nutrition: Less Than Body Requirements',
    'Risk for Infection',
    'Impaired Skin Integrity',
    'Risk for Falls',
    'Anxiety',
    'Deficient Knowledge',
    'Impaired Physical Mobility',
    'Self-Care Deficit',
    'Disturbed Sleep Pattern',
    'Ineffective Coping',
    'Risk for Aspiration',
    'Acute Confusion',
    'Impaired Urinary Elimination',
    'Constipation',
    'Ineffective Breathing Pattern',
  ];

  // ─── Smart Alert Rules ───────────────────────────────────────────────────────
  const SMART_ALERTS = [
    {
      keyword: 'copd',
      severity: 'critical',
      message: 'O₂ target 88–92%. Do NOT titrate to ≥95%.',
    },
    {
      keyword: 'parkinson',
      severity: 'critical',
      message:
        'Carbidopa-Levodopa timing critical. NPO does NOT apply to PD meds. Avoid dopamine-blocking antiemetics.',
    },
    {
      keyword: 'sepsis',
      severity: 'critical',
      message:
        'Sepsis 1-hour bundle: cultures before antibiotics, lactate, 30 mL/kg IVF, broad-spectrum abx.',
    },
    {
      keyword: 'dka',
      severity: 'warning',
      message: 'Monitor potassium — insulin drives K⁺ into cells. Hold if K⁺ <3.5.',
    },
    {
      keyword: 'aki',
      severity: 'warning',
      message: 'Review nephrotoxic medications. Avoid NSAIDs, contrast, aminoglycosides.',
    },
  ];

  // ─── 3. Tab Navigation ───────────────────────────────────────────────────────
  function initTabs() {
    const tabBtns = document.querySelectorAll('.builder-tab-btn');
    const tabContents = document.querySelectorAll('.builder-tab-content');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        tabBtns.forEach((b) => b.classList.remove('active'));
        tabContents.forEach((c) => c.classList.remove('active'));
        btn.classList.add('active');
        const panel = document.querySelector(`.builder-tab-content[data-tab="${target}"]`);
        if (panel) panel.classList.add('active');
      });
    });

    // Activate first tab by default
    if (tabBtns.length) tabBtns[0].click();
  }

  // ─── 1. Auto-Save & Restore ───────────────────────────────────────────────────
  function gatherFormData() {
    const data = {};
    document.querySelectorAll('input, textarea, select').forEach((el) => {
      if (el.id) data[el.id] = el.value;
    });
    return data;
  }

  function restoreFormData(data) {
    Object.entries(data).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.value = value;
    });
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gatherFormData()));
    } catch (_) {
      // Storage unavailable — silently skip
    }
  }

  function clearStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  }

  function showRestoreBanner(data) {
    const existing = document.getElementById('restore-banner');
    if (existing) return;

    const banner = document.createElement('div');
    banner.id = 'restore-banner';
    banner.style.cssText =
      'position:fixed;top:0;left:0;right:0;z-index:9999;background:#1e40af;color:#fff;' +
      'padding:12px 20px;display:flex;align-items:center;gap:12px;font-family:sans-serif;font-size:14px;';
    banner.innerHTML = `
      <span style="flex:1">📋 Restore your previous session?</span>
      <button id="restore-accept-btn" style="background:#fff;color:#1e40af;border:none;padding:6px 14px;border-radius:4px;cursor:pointer;font-weight:600;">Accept</button>
      <button id="restore-clear-btn" style="background:transparent;color:#fff;border:1px solid #fff;padding:6px 14px;border-radius:4px;cursor:pointer;">Clear</button>
    `;
    document.body.prepend(banner);

    document.getElementById('restore-accept-btn').addEventListener('click', () => {
      restoreFormData(data);
      banner.remove();
      updatePreview();
    });

    document.getElementById('restore-clear-btn').addEventListener('click', () => {
      clearStorage();
      banner.remove();
    });
  }

  function initAutoSave() {
    // Check for saved session
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && Object.keys(data).length > 0) showRestoreBanner(data);
      }
    } catch (_) {}

    // Auto-save every 5 seconds
    setInterval(saveToStorage, AUTOSAVE_INTERVAL);

    // Manual "Clear all / Start over"
    const clearBtn = document.getElementById('clear-all-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear all data and start over? This cannot be undone.')) {
          document.querySelectorAll('input, textarea, select').forEach((el) => {
            el.value = '';
          });
          clearStorage();
          updatePreview();
          clearSmartAlerts();
          clearSuggestions();
        }
      });
    }
  }

  // ─── 2. Condition Suggestion Engine ──────────────────────────────────────────
  function fuzzyMatch(input, candidates) {
    const lower = input.toLowerCase().trim();
    if (!lower) return null;
    return candidates.find(
      (c) =>
        c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase().split(' ')[0])
    ) || null;
  }

  function clearSuggestions() {
    document.querySelectorAll('.suggestion-panel').forEach((p) => (p.innerHTML = ''));
  }

  function insertTextIntoField(targetId, text) {
    const el = document.getElementById(targetId);
    if (!el) return;
    const sep = el.value.trim() ? '\n' : '';
    el.value += sep + text;
    el.dispatchEvent(new Event('input'));
  }

  function buildChipList(items, targetId, panelEl) {
    items.forEach((item) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;';
      const span = document.createElement('span');
      span.style.cssText = 'flex:1;font-size:13px;';
      span.textContent = item;
      const btn = document.createElement('button');
      btn.textContent = 'Insert';
      btn.style.cssText =
        'font-size:11px;padding:2px 8px;background:#2563eb;color:#fff;border:none;border-radius:3px;cursor:pointer;white-space:nowrap;';
      btn.addEventListener('click', () => insertTextIntoField(targetId, item));
      row.appendChild(span);
      row.appendChild(btn);
      panelEl.appendChild(row);
    });
  }

  function populateSuggestions(condition) {
    const fields = [
      { panelId: 'suggestion-pathophys', targetId: 'pathophys-text', key: 'pathophysiology' },
      { panelId: 'suggestion-riskfactors', targetId: 'riskfactors-text', key: 'riskFactors' },
      { panelId: 'suggestion-cues', targetId: 'cues-text', key: 'cues' },
      { panelId: 'suggestion-diagnoses', targetId: 'diagnoses-text', key: 'diagnoses' },
      { panelId: 'suggestion-interventions', targetId: 'interventions-text', key: 'interventions' },
      { panelId: 'suggestion-evaluations', targetId: 'evaluations-text', key: 'evaluations' },
    ];

    fields.forEach(({ panelId, targetId, key }) => {
      const panel = document.getElementById(panelId);
      if (!panel) return;
      panel.innerHTML = '';
      const items = condition[key];
      if (Array.isArray(items) && items.length) {
        const header = document.createElement('p');
        header.style.cssText = 'font-size:12px;font-weight:600;margin:0 0 4px;color:#374151;';
        header.textContent = `Suggested for ${condition.name}:`;
        panel.appendChild(header);
        buildChipList(items, targetId, panel);
      }
    });
  }

  function initSuggestionEngine() {
    const diagField = document.getElementById('pat-diagnosis');
    if (!diagField) return;

    diagField.addEventListener('input', () => {
      const clinical = window.ClinicalData;
      if (!clinical || !Array.isArray(clinical)) return;

      const match = fuzzyMatch(diagField.value, clinical);
      clearSuggestions();
      if (match) {
        populateSuggestions(match);
        checkSmartAlerts(diagField.value);
      } else {
        clearSmartAlerts();
      }
    });
  }

  // ─── 5. Smart Alert System ───────────────────────────────────────────────────
  function clearSmartAlerts() {
    const container = document.getElementById('smart-alerts');
    if (container) container.innerHTML = '';
  }

  function checkSmartAlerts(diagnosisText) {
    const container = document.getElementById('smart-alerts');
    if (!container) return;
    container.innerHTML = '';
    const lower = diagnosisText.toLowerCase();

    SMART_ALERTS.forEach(({ keyword, severity, message }) => {
      if (!lower.includes(keyword)) return;
      const alert = document.createElement('div');
      const isCritical = severity === 'critical';
      alert.style.cssText =
        `margin-bottom:8px;padding:10px 14px;border-radius:6px;font-size:13px;border-left:4px solid ` +
        (isCritical ? '#dc2626;background:#fef2f2;color:#7f1d1d;' : '#f59e0b;background:#fffbeb;color:#78350f;');
      alert.innerHTML = `<strong>${isCritical ? '🚨 CRITICAL:' : '⚠️ WARNING:'}</strong> ${message}`;
      container.appendChild(alert);
    });
  }

  // ─── 4. ABG Interpreter ───────────────────────────────────────────────────────
  function interpretABG(ph, paco2, pao2, hco3, o2sat) {
    let phStatus, co2Status, hco3Status;

    if (ph < 7.35) phStatus = 'acidosis';
    else if (ph > 7.45) phStatus = 'alkalosis';
    else phStatus = 'normal';

    if (paco2 > 45) co2Status = 'respiratory acidosis';
    else if (paco2 < 35) co2Status = 'respiratory alkalosis';
    else co2Status = 'normal';

    if (hco3 < 22) hco3Status = 'metabolic acidosis';
    else if (hco3 > 26) hco3Status = 'metabolic alkalosis';
    else hco3Status = 'normal';

    // Determine primary disturbance
    let primary = '';
    let compensating = false;
    let fullyCompensated = false;

    if (phStatus === 'normal') {
      if (co2Status !== 'normal' && hco3Status !== 'normal') {
        fullyCompensated = true;
        primary = co2Status; // label by respiratory
      } else {
        return { result: 'Within Normal Limits', cause: 'No disturbance detected.', priority: 'Routine monitoring.' };
      }
    } else if (phStatus === 'acidosis') {
      if (co2Status === 'respiratory acidosis') {
        primary = 'Respiratory Acidosis';
        compensating = hco3Status === 'metabolic alkalosis';
      } else if (hco3Status === 'metabolic acidosis') {
        primary = 'Metabolic Acidosis';
        compensating = co2Status === 'respiratory alkalosis';
      } else {
        primary = 'Acidosis';
      }
    } else {
      if (co2Status === 'respiratory alkalosis') {
        primary = 'Respiratory Alkalosis';
        compensating = hco3Status === 'metabolic acidosis';
      } else if (hco3Status === 'metabolic alkalosis') {
        primary = 'Metabolic Alkalosis';
        compensating = co2Status === 'respiratory acidosis';
      } else {
        primary = 'Alkalosis';
      }
    }

    let label;
    if (fullyCompensated) label = `Fully Compensated ${primary.replace(/(acidosis|alkalosis)/i, (m) => m.charAt(0).toUpperCase() + m.slice(1))}`;
    else if (compensating) label = `Partially Compensated ${primary}`;
    else label = `Uncompensated ${primary}`;

    // Clinical cause and nursing priority
    const causes = {
      'Respiratory Acidosis': 'Caused by hypoventilation (e.g., COPD, opioid overdose, respiratory failure).',
      'Respiratory Alkalosis': 'Caused by hyperventilation (e.g., anxiety, pain, mechanical ventilation).',
      'Metabolic Acidosis': 'Caused by increased acid load or bicarbonate loss (e.g., DKA, renal failure, diarrhea).',
      'Metabolic Alkalosis': 'Caused by bicarbonate excess or H⁺ loss (e.g., vomiting, NG suction, diuretics).',
      'Acidosis': 'Mixed or unclear acidosis — assess further.',
      'Alkalosis': 'Mixed or unclear alkalosis — assess further.',
      'respiratory acidosis': 'Caused by hypoventilation.',
      'respiratory alkalosis': 'Caused by hyperventilation.',
    };
    const priorities = {
      'Respiratory Acidosis': 'Priority: Ensure patent airway, position HOB 30–45°, monitor SpO₂, prepare for possible ventilatory support.',
      'Respiratory Alkalosis': 'Priority: Treat underlying cause (pain, anxiety). Coach slow breathing. Monitor electrolytes.',
      'Metabolic Acidosis': 'Priority: Monitor potassium and cardiac rhythm. Prepare for sodium bicarbonate per order.',
      'Metabolic Alkalosis': 'Priority: Replace chloride/potassium per order. Monitor for tetany and dysrhythmias.',
    };

    const basePrimary = primary.replace(/Fully Compensated |Partially Compensated |Uncompensated /, '');
    const cause = causes[basePrimary] || 'Assess clinical context for underlying cause.';
    const priority = priorities[basePrimary] || 'Monitor vitals and labs closely; notify provider.';

    // O2 sat note
    let o2note = '';
    if (o2sat !== null && !isNaN(o2sat)) {
      o2note = o2sat < 95 ? ' ⚠️ SpO₂ below 95% — assess oxygenation.' : ' SpO₂ adequate.';
    }

    return { result: label + o2note, cause, priority };
  }

  function initABGInterpreter() {
    const btn = document.getElementById('abg-interpret-btn');
    const resultDiv = document.getElementById('abg-result');
    if (!btn || !resultDiv) return;

    btn.addEventListener('click', () => {
      const ph = parseFloat(document.getElementById('abg-ph')?.value);
      const paco2 = parseFloat(document.getElementById('abg-paco2')?.value);
      const pao2 = parseFloat(document.getElementById('abg-pao2')?.value);
      const hco3 = parseFloat(document.getElementById('abg-hco3')?.value);
      const o2satEl = document.getElementById('abg-o2sat');
      const o2sat = o2satEl ? parseFloat(o2satEl.value) : null;

      if ([ph, paco2, pao2, hco3].some(isNaN)) {
        resultDiv.innerHTML = '<p style="color:#dc2626;">Please enter valid numeric values for pH, PaCO₂, PaO₂, and HCO₃.</p>';
        return;
      }

      const { result, cause, priority } = interpretABG(ph, paco2, pao2, hco3, o2sat);
      resultDiv.innerHTML = `
        <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:12px;border-radius:6px;font-size:14px;">
          <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#14532d;">🧪 ${result}</p>
          <p style="margin:0 0 4px;"><strong>Clinical Cause:</strong> ${cause}</p>
          <p style="margin:0;"><strong>Nursing Priority:</strong> ${priority}</p>
        </div>`;
    });
  }

  // ─── 6. Cue Type Dropdown ────────────────────────────────────────────────────
  function initCueTypeDropdowns() {
    // Apply to existing and dynamically added rows via delegation
    const cueTable = document.getElementById('cue-table');
    if (!cueTable) return;

    cueTable.addEventListener('change', (e) => {
      if (e.target.classList.contains('cue-type-select')) {
        updateCueStatus(e.target);
      }
    });
  }

  function updateCueStatus(selectEl) {
    const row = selectEl.closest('tr');
    if (!row) return;
    const statusCell = row.querySelector('.cue-status');
    if (!statusCell) return;

    const colors = {
      Objective: '#1d4ed8',
      Subjective: '#7c3aed',
      Lab: '#b45309',
      Vital: '#0f766e',
    };
    const color = colors[selectEl.value] || '#374151';
    statusCell.style.color = color;
    statusCell.style.fontWeight = '600';
    statusCell.textContent = selectEl.value;
  }

  // ─── 12. Add/Remove Cue Rows ────────────────────────────────────────────────
  function createCueRow() {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" class="cue-data-input" style="width:100%;box-sizing:border-box;" placeholder="Cue data..." /></td>
      <td>
        <select class="cue-type-select" style="width:100%;">
          <option value="Objective">Objective</option>
          <option value="Subjective">Subjective</option>
          <option value="Lab">Lab</option>
          <option value="Vital">Vital</option>
        </select>
      </td>
      <td class="cue-status" style="font-size:12px;">Objective</td>
      <td><button class="remove-cue-btn" style="background:#dc2626;color:#fff;border:none;padding:3px 8px;border-radius:3px;cursor:pointer;">✕</button></td>
    `;
    tr.querySelector('.remove-cue-btn').addEventListener('click', () => tr.remove());
    return tr;
  }

  function initCueRows() {
    const addBtn = document.getElementById('add-cue-row');
    const table = document.getElementById('cue-table');
    if (!addBtn || !table) return;

    addBtn.addEventListener('click', () => {
      const tbody = table.querySelector('tbody') || table;
      tbody.appendChild(createCueRow());
    });

    // Wire up any pre-existing remove buttons
    table.querySelectorAll('.remove-cue-btn').forEach((btn) => {
      btn.addEventListener('click', () => btn.closest('tr').remove());
    });
  }

  // ─── 7. NANDA Diagnosis Builder ──────────────────────────────────────────────
  function populateNandaDropdowns() {
    [1, 2, 3].forEach((i) => {
      const select = document.getElementById(`dx-nanda-${i}`);
      if (!select) return;
      // Only populate if empty
      if (select.options.length <= 1) {
        NANDA_DIAGNOSES.forEach((dx) => {
          const opt = document.createElement('option');
          opt.value = dx;
          opt.textContent = dx;
          select.appendChild(opt);
        });
      }
    });
  }

  function buildNandaStatement(index) {
    const nanda = document.getElementById(`dx-nanda-${index}`)?.value || '';
    const rt = document.getElementById(`dx-rt-${index}`)?.value.trim() || '';
    const aeb = document.getElementById(`dx-aeb-${index}`)?.value.trim() || '';
    if (!nanda) return '';
    let stmt = nanda;
    if (rt) stmt += ` related to ${rt}`;
    if (aeb) stmt += ` as evidenced by ${aeb}`;
    return stmt;
  }

  function initNandaBuilder() {
    populateNandaDropdowns();

    [1, 2, 3].forEach((i) => {
      const btn = document.getElementById(`dx-build-${i}`);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const preview = document.getElementById(`dx-preview-${i}`);
        if (!preview) return;
        const stmt = buildNandaStatement(i);
        preview.textContent = stmt || '(No diagnosis selected)';
        preview.style.cssText =
          'font-size:13px;padding:8px;background:#f1f5f9;border-radius:4px;margin-top:6px;font-style:italic;color:#1e293b;';
      });
    });
  }

  // ─── 8. SMART Goal Checker ───────────────────────────────────────────────────
  function checkSMARTGoals() {
    const fields = document.querySelectorAll('.goal-field');
    fields.forEach((field) => {
      const existing = field.parentElement.querySelector('.goal-warning');
      if (existing) existing.remove();

      const text = field.value.trim().toLowerCase();
      if (!text) return;

      const warnings = [];

      if (/nurse will|i will/.test(text))
        warnings.push("Goals must be from patient's perspective (avoid 'nurse will' / 'I will').");

      const hasTimeframe = /\b(shift|hour|minute|discharge|day)\b/.test(text);
      if (!hasTimeframe) warnings.push('Add a timeframe (e.g., "by end of shift", "within 24 hours").');

      const hasMeasure = /(%|\/10|\bmmhg\b|\bml\b|\bmg\b|\bbpm\b)/.test(text);
      if (!hasMeasure) warnings.push('Add a measurable value (%, /10, mmHg, mL, mg, bpm).');

      if (warnings.length) {
        const div = document.createElement('div');
        div.className = 'goal-warning';
        div.style.cssText =
          'font-size:12px;color:#92400e;background:#fffbeb;border:1px solid #f59e0b;padding:6px 10px;border-radius:4px;margin-top:4px;';
        div.innerHTML = warnings.map((w) => `⚠️ ${w}`).join('<br>');
        field.insertAdjacentElement('afterend', div);
      }
    });
  }

  function initGoalChecker() {
    const btn = document.getElementById('check-goals-btn');
    if (btn) btn.addEventListener('click', checkSMARTGoals);
  }

  // ─── 9. Evaluation Checker ───────────────────────────────────────────────────
  function checkEvaluations() {
    const fields = document.querySelectorAll('.eval-field');
    fields.forEach((field) => {
      const existing = field.parentElement.querySelector('.eval-warning');
      if (existing) existing.remove();

      const text = field.value.trim().toLowerCase();
      if (!text) return;

      const warnings = [];

      const vagueImprovement = /(patient improved|patient better|goal met)\b/.test(text);
      const hasMeasure = /(%|\/10|\bmmhg\b|\bml\b|\bmg\b|\bbpm\b|\d+)/.test(text);
      if (vagueImprovement && !hasMeasure)
        warnings.push('"Improved" / "better" / "goal met" should include a measurement.');

      if (/not met/i.test(field.value)) {
        const row = field.closest('tr, .eval-row, [data-eval-row]');
        const revisedPlan = row ? row.querySelector('.revised-plan-field') : null;
        if (revisedPlan && !revisedPlan.value.trim())
          warnings.push('"Not Met" status requires a revised plan.');
      }

      if (warnings.length) {
        const div = document.createElement('div');
        div.className = 'eval-warning';
        div.style.cssText =
          'font-size:12px;color:#7f1d1d;background:#fef2f2;border:1px solid #fca5a5;padding:6px 10px;border-radius:4px;margin-top:4px;';
        div.innerHTML = warnings.map((w) => `🚨 ${w}`).join('<br>');
        field.insertAdjacentElement('afterend', div);
      }
    });
  }

  function initEvalChecker() {
    const btn = document.getElementById('check-evals-btn');
    if (btn) btn.addEventListener('click', checkEvaluations);
  }

  // ─── 10. Live Preview Panel ──────────────────────────────────────────────────
  let previewTimer = null;

  function val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function buildPreviewSection(title, content) {
    if (!content) return '';
    return `<div style="margin-bottom:12px;">
      <h3 style="font-size:13px;font-weight:700;text-transform:uppercase;color:#374151;border-bottom:1px solid #d1d5db;padding-bottom:2px;margin:0 0 4px;">${title}</h3>
      <p style="font-size:13px;margin:0;white-space:pre-wrap;color:#111827;">${content}</p>
    </div>`;
  }

  function updatePreview() {
    const preview = document.getElementById('live-preview');
    if (!preview) return;

    const name = val('pat-name');
    const initials = val('pat-initials');
    const date = val('pat-date');
    const dx = val('pat-diagnosis');

    // Build NANDA statements
    const nandaStmts = [1, 2, 3].map((i) => buildNandaStatement(i)).filter(Boolean).join('\n');

    // Collect cue rows
    const cueRows = [];
    document.querySelectorAll('#cue-table tbody tr, #cue-table tr').forEach((tr) => {
      const input = tr.querySelector('.cue-data-input');
      const type = tr.querySelector('.cue-type-select');
      if (input && input.value.trim()) {
        cueRows.push(`[${type ? type.value : 'Cue'}] ${input.value.trim()}`);
      }
    });

    preview.innerHTML = `
      <div style="font-family:'Times New Roman',serif;max-width:760px;padding:20px;border:1px solid #d1d5db;border-radius:6px;background:#fff;">
        <div style="text-align:center;margin-bottom:16px;border-bottom:2px solid #374151;padding-bottom:10px;">
          <h2 style="margin:0;font-size:18px;">Clinical Concept Map</h2>
          ${name ? `<p style="margin:4px 0;font-size:14px;"><strong>Patient:</strong> ${name}${initials ? ` (${initials})` : ''}</p>` : ''}
          ${date ? `<p style="margin:0;font-size:13px;color:#6b7280;">${date}</p>` : ''}
        </div>
        ${buildPreviewSection('Medical Diagnosis', dx)}
        ${buildPreviewSection('Pathophysiology', val('pathophys-text'))}
        ${buildPreviewSection('Risk Factors', val('riskfactors-text'))}
        ${cueRows.length ? buildPreviewSection('Assessment Cues', cueRows.join('\n')) : ''}
        ${nandaStmts ? buildPreviewSection('Nursing Diagnoses', nandaStmts) : ''}
        ${buildPreviewSection('Goals / Expected Outcomes', val('goals-text'))}
        ${buildPreviewSection('Nursing Interventions', val('interventions-text'))}
        ${buildPreviewSection('Evaluation', val('evaluations-text'))}
      </div>`;
  }

  function schedulePreviewUpdate() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(updatePreview, PREVIEW_DEBOUNCE);
  }

  function initLivePreview() {
    document.addEventListener('input', schedulePreviewUpdate);
    document.addEventListener('change', schedulePreviewUpdate);
    updatePreview();
  }

  // ─── 11. Print Button ─────────────────────────────────────────────────────────
  function initPrintButton() {
    const btn = document.getElementById('print-btn');
    if (btn) btn.addEventListener('click', () => window.print());
  }

  // ─── Bootstrap ───────────────────────────────────────────────────────────────
  initTabs();
  initAutoSave();
  initSuggestionEngine();
  initABGInterpreter();
  initCueTypeDropdowns();
  initCueRows();
  initNandaBuilder();
  initGoalChecker();
  initEvalChecker();
  initLivePreview();
  initPrintButton();
});
