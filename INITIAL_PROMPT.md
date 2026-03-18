# Clinical Concept Map Web Application — GitHub Agent Build Prompt

> **Complete specification for a GitHub Agent.** Copy this document in its entirety and paste it as your prompt. The agent should build and deploy everything described here without requiring follow-up prompts.

---

## PROJECT SETUP

Initialize an Astro project with the following configuration:

- **Output:** `static`
- **Base:** set to your GitHub repo name (e.g., `/clinical-concept-map/`)
- **Integrations:** none required beyond defaults
- **Node version:** 20
- **Build output directory:** `dist/`

Add a GitHub Actions workflow at `.github/workflows/deploy.yml` that builds and deploys to GitHub Pages on every push to `main`. Use:

- `actions/checkout@v4`
- `actions/configure-pages@v4`
- `actions/upload-pages-artifact@v3`
- `actions/deploy-pages@v4`

---

## DESIGN DIRECTION

Medical/clinical aesthetic: clean, authoritative, and approachable for students.

**Typography:**
- `DM Sans` (body) — import from Google Fonts
- `DM Serif Display` (headings) — import from Google Fonts

**Color palette (CSS custom properties):**

```css
:root {
  --color-bg:        #F8F7F4;
  --color-primary:   #1B4F72;
  --color-accent:    #2E86AB;
  --color-highlight: #E8A838;
  --color-text:      #1A1A1A;
  --color-step-1:    #2E86AB;
  --color-step-2:    #1A9E8F;
  --color-step-3:    #E8A838;
  --color-step-4:    #3A7D44;
  --color-step-5:    #C0533A;
  --color-critical:  #C0392B;
  --color-warning:   #E67E22;
  --color-tip:       #2980B9;
}
```

**Visual details:**
- Subtle grid background texture on the hero (CSS `background-image` with SVG data URI grid)
- Smooth scroll (`scroll-behavior: smooth`)
- Gentle fade-in animations on scroll via Intersection Observer
- Mobile responsive with sticky top nav
- Consistent `border-radius: 8px` on cards and panels
- Box shadows: `0 2px 8px rgba(0,0,0,0.08)`

---

## LIGHTBOX TUTORIAL SYSTEM

Implement a global lightbox/modal system used throughout the entire site and builder tool. This is a first-class feature — every major concept, step, and clinical decision point has a contextual tutorial trigger.

### Implementation

Create a single reusable `TutorialLightbox` component and a bundled JS module (`/src/scripts/tutorials.js`) that contains all tutorial content as a keyed object.

**HTML structure for every tutorial trigger:**

```html
<button class="tutorial-trigger" data-tutorial="key-name" aria-label="Learn more">
  <span class="tutorial-icon">?</span>
  <span class="tutorial-label">Clinical Insight</span>
</button>
```

Styling: a small pill-shaped button with a teal left border, subtle background, and a "?" icon. Should feel like a footnote-style annotation — present but not intrusive. On hover, it expands slightly and shows a tooltip "Click for clinical tutorial."

**Lightbox structure:**

```html
<div id="tutorial-overlay" class="tutorial-overlay" role="dialog" aria-modal="true">
  <div class="tutorial-modal">
    <div class="tutorial-header">
      <span class="tutorial-category-badge"></span>
      <h2 class="tutorial-title"></h2>
      <button class="tutorial-close" aria-label="Close">✕</button>
    </div>
    <div class="tutorial-body"></div>
    <div class="tutorial-footer">
      <span class="tutorial-source"></span>
      <button class="tutorial-close-btn">Got it</button>
    </div>
  </div>
</div>
```

**Behavior:**
- Opens on trigger button click
- Closes on overlay click, Escape key, or close button
- Body scroll locked while open
- Fade-in animation (150ms)
- On mobile: full-screen modal
- On desktop: centered modal, max-width 680px, max-height 80vh with internal scroll

### Tutorial Content Object

Store all tutorials in `/src/scripts/tutorials.js` as `window.ClinicalTutorials`. Each entry:

```javascript
window.ClinicalTutorials = {
  "key-name": {
    title: "Tutorial Title",
    category: "Category Badge Text",
    categoryColor: "#hex",
    source: "Clinical basis note",
    body: `<html content>`
  }
}
```

**Required tutorial entries** (implement all of the following):

---

**`ngn-model`** — What Is the NGN Clinical Judgment Model?
- Category: Foundational
- Body: Explain the NCLEX Next Generation Clinical Judgment (NGN) model. Cover: why NCSBN redesigned the NCLEX, what "clinical judgment" means vs memorization, the 6 cognitive skills (recognize cues, analyze cues, prioritize hypotheses, generate solutions, take actions, evaluate outcomes), how this concept map maps directly to those 6 skills, and why mastering this framework prepares students for both real patient care and the new NCLEX question types (bow-tie, extended drag-and-drop, matrix). Include a simple HTML table showing each NGN skill mapped to the concept map step.

**`pathophysiology-why`** — Why Pathophysiology Comes First
- Category: Clinical Reasoning
- Body: Explain that nursing interventions are only meaningful when they connect back to the disease mechanism. Walk through an example: a student who doesn't understand that pneumonia causes alveolar consolidation → V/Q mismatch → hypoxemia might correctly note "O₂ sat 88%" but fail to prioritize it or choose the right intervention. Contrast with a student who understands the mechanism — they immediately connect low sat to impaired diffusion and know positioning, nebulizers, and O₂ titration are the levers. Emphasize: the pathophysiology section is not a textbook entry — it should explain YOUR patient's situation, not a generic disease description.

**`objective-vs-subjective`** — Objective vs. Subjective Data: Why Both Matter
- Category: Assessment
- Body: Define objective data (measurable, observable, verifiable by anyone: vitals, labs, physical exam findings) and subjective data (reported by the patient or family: pain rating, complaint of nausea, "I feel short of breath"). Explain why both are clinically necessary — objective data can lag behind the patient's experience, and subjective data can be the earliest warning of deterioration. Give examples: a patient with O₂ sat 94% who reports "I feel like I can't breathe" should be taken seriously even though the number looks acceptable. Conversely, a patient with O₂ sat 88% who reports "I feel fine" is still in danger. Include a two-column HTML table of 8 examples each.

**`mar-as-cue`** — Reading the MAR as a Clinical Cue
- Category: Assessment
- Body: Explain that a medication administration record is a map of what is wrong with the patient. Walk through how to read it clinically: if a patient is on Furosemide → fluid overload or hypertension; Insulin drip → DKA or critical hyperglycemia; Heparin infusion → DVT, PE, or ACS; Carbidopa-Levodopa → Parkinson's disease (and the timing implications); broad-spectrum antibiotics → active infection. Emphasize: when you see a drug you don't recognize, look it up — it is a cue. Also cover held medications as cues (held metformin on admission → likely contrast study ordered or renal concern; held warfarin → procedure planned or bleeding risk). Include a reference table of 15 drug classes and what condition they signal.

**`supporting-vs-concerning`** — The Difference Between Supporting and Concerning Data
- Category: Analysis
- Body: Clarify that this is the most misunderstood step for new students. Supporting data = findings that are EXPECTED given the diagnosis (they confirm you have the right hypothesis). Concerning data = findings that are UNEXPECTED, worsening, or signal a complication beyond the primary diagnosis. A patient with CHF who has +2 pitting edema: edema is expected (supporting). That same patient who develops new onset confusion: confusion is NOT an expected CHF symptom — it's concerning (possible hypoperfusion, hyponatremia, or medication effect). Critically, a finding can belong in BOTH columns — elevated WBC in a sepsis patient is supporting (confirms infection) AND concerning (magnitude may signal severity). Include 10 worked examples as an HTML table.

**`abc-priority`** — Using the ABC Framework to Prioritize
- Category: Priority Setting
- Body: Explain Airway → Breathing → Circulation → Safety/all else as the foundational triage hierarchy. Provide worked examples: a patient with both "impaired gas exchange" and "risk for falls" — gas exchange wins because it is an ABC priority. A patient with "ineffective airway clearance" and "acute pain" — airway wins every time over pain. Then layer in Maslow's hierarchy for non-ABC problems. Cover the "actual vs. risk" rule: actual problems outrank risk problems UNLESS the risk is imminent (e.g., "Risk for Septic Shock" in a deteriorating patient outranks an actual "Imbalanced Nutrition" because severity matters). Give 5 clinical priority scenarios with correct rankings and rationales.

**`nanda-format`** — Writing a Correct NANDA Nursing Diagnosis
- Category: Diagnosis
- Body: Break down the three-part NANDA format: (1) Problem label (the NANDA-approved stem), (2) Related to (etiology — the cause or contributing factor), (3) As evidenced by (defining characteristics — the signs and symptoms you observed). Common errors: writing the medical diagnosis instead of a nursing diagnosis ("Pneumonia" is not a nursing diagnosis — "Impaired Gas Exchange r/t alveolar consolidation" IS); writing the r/t as the problem ("Fluid imbalance related to... related to..."); leaving AEB as generic ("as evidenced by patient presentation" is unacceptable — name the specific findings). Include 5 before/after examples showing a poorly written diagnosis corrected.

**`smart-goals`** — Writing Effective SMART Goals
- Category: Planning
- Body: Break down SMART: Specific (names the patient behavior or measurable outcome), Measurable (includes a number, scale, or observable action), Achievable (realistic for this patient given their condition and timeframe), Relevant (directly tied to the nursing diagnosis), Time-bound (includes a deadline or timeframe). The most critical rule: goals must be written from the PATIENT's perspective, not the nurse's. "Nurse will monitor O₂ sat" is a nursing intervention, not a patient goal. "Patient will maintain O₂ saturation ≥ 95% on 2L NC by end of shift" is a SMART goal. Include 8 side-by-side examples: weak goal on the left, corrected SMART goal on the right. Also include the fill-in-the-blank template and common measurable outcome values.

**`evaluation-evidence`** — How to Write Objective Evaluation Findings
- Category: Evaluation
- Body: Explain that "patient improved" or "goal met, patient tolerated care" are not acceptable evaluation entries. Evaluations must contain objective, measurable evidence. Show the difference: weak = "Patient's breathing improved." Strong = "Patient's O₂ saturation increased from 88% to 94% on 2L NC after repositioning and nebulizer treatment; respiratory rate decreased from 28 to 20; patient denies shortness of breath at rest." Explain how to tie the evaluation finding directly back to the SMART goal — if the goal said "O₂ sat ≥95%," the evaluation must address the O₂ sat value. Cover what to do when a goal is NOT met: don't just write "not met" — document what changed, why you believe it wasn't met, and what you would revise in the plan.

**`feedback-loop`** — The Reassessment Loop in Clinical Practice
- Category: Clinical Reasoning
- Body: Explain that the concept map is not a one-time document — in real nursing practice, evaluation of outcomes feeds directly back into the recognition of cues. After every intervention, the nurse reassesses: did the intervention work? Are there new cues? Has the priority shifted? Walk through a clinical scenario: patient admitted with sepsis, initial priority is perfusion (MAP <65). After fluid resuscitation, MAP improves to 70 — BUT now the nurse notices increasing creatinine (a new concerning cue). The priority has shifted from perfusion to renal protection. This is the feedback loop in action. Connect to how the NGN model is designed as a cycle, not a checklist.

**`oxygen-targets`** — O₂ Targets Are Not Universal: Why Context Matters
- Category: Critical Safety
- Body: Explain that the standard O₂ saturation target (≥95%) does NOT apply universally and that applying it blindly can harm patients. Cover each special population: COPD exacerbation (88–92% — hypoxic drive explanation), MI/ACS (≥94% — hyperoxia causes coronary vasoconstriction), CO poisoning (100% NRB — pulse ox reads falsely normal because carboxyhemoglobin is measured as oxyhemoglobin), post-cardiac arrest (94–99% — hyperoxia causes reperfusion injury), neonates (95–98% — retinopathy of prematurity risk above 99%). Include a reference table. Emphasize: always check the specific order or protocol for your patient, and if no specific target is ordered and the patient has COPD, clarify with the provider before titrating up to 95%.

**`copd-hypoxic-drive`** — The Hypoxic Drive in COPD: Mechanism and Clinical Implications
- Category: Respiratory — Critical
- Body: Explain the normal respiratory drive (rising CO₂ stimulates central chemoreceptors → breathing increases). In advanced COPD, chronic CO₂ retention causes the brain to reset its CO₂ threshold — central chemoreceptors become desensitized. The backup system — peripheral chemoreceptors in the carotid body — detect LOW O₂ and trigger breathing. This is the hypoxic drive. If you flood this patient with high-flow O₂, you eliminate the only trigger their body relies on → breathing slows → CO₂ rises further → respiratory acidosis worsens → CO₂ narcosis → respiratory failure. Cover: Venturi mask as the preferred delivery device (precisely controls FiO₂), target sat 88–92%, monitoring for rising PaCO₂ on serial ABGs, BiPAP as the escalation step before intubation. Include a diagram-style HTML flow showing the mechanism.

**`abg-interpretation`** — Step-by-Step ABG Interpretation
- Category: Lab Analysis
- Body: Provide a full ABG interpretation tutorial. Step 1: Is the pH acidotic (<7.35), normal (7.35–7.45), or alkalotic (>7.45)? Step 2: Check PaCO₂ (35–45 normal) — if elevated it is acidotic (respiratory), if low it is alkalotic. Step 3: Check HCO₃ (22–26 normal) — if elevated it is alkalotic (metabolic), if low it is acidotic. Step 4: Determine primary disorder (whichever matches the pH direction). Step 5: Check compensation — is the opposite system correcting? Step 6: Oxygenation — check PaO₂ (80–100 normal) and O₂ sat. Include a full reference table of all 4 disturbances with pH/PaCO₂/HCO₃ directions, common causes, and compensation patterns. Add 4 worked ABG examples with step-by-step answers.

**`parkinsons-hospital`** — Parkinson's Disease in the Hospital: The Hidden Dangers
- Category: Neurological — Critical
- Body: Explain why hospitalized Parkinson's patients face disproportionate risk compared to their community baseline. Cover the four critical hazard zones: (1) Medication timing — even a 30–60 minute delay in Carbidopa-Levodopa can precipitate a severe "off" episode with rigidity, immobility, and dysphagia; NPO orders almost never apply to PD medications — always verify with the provider; (2) Antiemetic danger — Haloperidol, Metoclopramide, Prochlorperazine, and Promethazine all block dopamine receptors and cause acute exacerbation of motor symptoms; safe alternatives: Ondansetron for nausea; (3) Dysphagia — oropharyngeal rigidity affects swallowing; aspiration pneumonia is a leading cause of death in PD; always assess swallowing before oral intake and consult SLP; (4) Freezing and falls — freezing episodes (sudden inability to initiate movement) are a major fall risk; visual cues (colored floor tape) and rhythmic auditory cues (counting "1-2-3-step") help patients initiate movement. Include a medication safety table: Contraindicated | Reason | Safe Alternative.

**`sepsis-bundle`** — Recognizing Sepsis and the 1-Hour Bundle
- Category: Sepsis — Critical
- Body: Cover Sepsis-3 definition (life-threatening organ dysfunction caused by dysregulated host response to infection — SOFA score ≥2 above baseline). Cover the clinical presentation: fever OR hypothermia, tachycardia, tachypnea, altered mental status, hypotension. Explain why elderly and immunocompromised patients present atypically (may be afebrile or hypothermic, first sign may be confusion alone). The 1-hour sepsis bundle: (1) Draw blood cultures ×2 from separate sites BEFORE antibiotics — cultures drawn after antibiotics may be falsely negative; (2) Measure lactate — lactate ≥2 = sepsis, ≥4 = septic shock regardless of BP; (3) Begin broad-spectrum antibiotics within 1 hour; (4) 30mL/kg crystalloid bolus if hypotensive or lactate ≥4; (5) Vasopressors (Norepinephrine first-line) if MAP <65 despite fluids. Cover early warning signs: new confusion in elderly, tachycardia out of proportion to fever, urine output <0.5mL/kg/hr.

**`fall-risk`** — Fall Risk Assessment and Prevention in the Clinical Setting
- Category: Safety
- Body: Cover the Morse Fall Scale factors and scoring: history of falls (25 points), secondary diagnosis (15), ambulatory aid use (15), IV line (20), gait (0-20), mental status (0-15). Score ≥45 = high risk. Cover the most dangerous medications for fall risk: opioids (sedation, orthostasis), benzodiazepines (sedation, confusion), antihypertensives and diuretics (orthostasis), anticonvulsants (sedation, ataxia), insulin (hypoglycemia → confusion). Cover environmental interventions: bed in lowest position, call light within reach, non-slip footwear, clutter-free path to bathroom, adequate lighting at night, bed alarm. Cover patient populations requiring extra vigilance: post-op day 1, orthostatic hypotension, Parkinson's disease, dementia, age >75, first ambulation after prolonged bedrest.

**`medication-high-alert`** — High-Alert Medications: Why Extra Vigilance Matters
- Category: Medication Safety
- Body: Explain the Institute for Safe Medication Practices (ISMP) high-alert medication concept — these drugs cause the greatest harm when errors occur, not necessarily the most errors. Cover each class: Insulin (always verify dose and type with a second nurse; sliding scale vs. basal vs. bolus; hypoglycemia protocol); Heparin (weight-based dosing, aPTT monitoring, antidote = Protamine sulfate); Warfarin (INR monitoring, drug and food interactions, antidote = Vitamin K + FFP for urgent reversal); IV Potassium Chloride (NEVER give as IV push — fatal dysrhythmia; always administer via pump with concentration limits); Digoxin (narrow therapeutic index 0.5–2.0 ng/mL; toxicity signs: nausea, visual changes, bradycardia; hold if HR <60); Opioids (respiratory depression, sedation scoring, Narcan availability); Carbidopa-Levodopa (timing critical for PD patients). Include a reference table.

**`orthostatic-hypotension`** — Orthostatic Hypotension: Assessment and Nursing Response
- Category: Cardiovascular
- Body: Define orthostatic hypotension: a drop in systolic BP ≥20mmHg or diastolic BP ≥10mmHg within 3 minutes of standing. Explain the assessment protocol: measure BP lying down → sitting → standing, with 1–2 minutes between each position. Document all three readings. Explain the physiology: normally, standing causes pooling of blood in the legs → baroreceptors detect drop → sympathetic nervous system compensates with vasoconstriction and increased HR. In orthostatic hypotension, this compensation fails. Common causes in hospitalized patients: dehydration, prolonged bedrest, autonomic dysfunction (Parkinson's, diabetes), antihypertensives, diuretics, alpha-blockers, opioids. Nursing interventions: dangle legs at bedside before standing, have patient stand slowly and hold onto fixed support, do not ambulate if systolic <90 or if patient is symptomatic, increase oral fluids if not contraindicated, notify provider if recurrent or symptomatic.

**`dysphagia-aspiration`** — Dysphagia and Aspiration Risk: Assessment and Prevention
- Category: Safety
- Body: Explain the swallowing mechanism and where it can fail (oropharyngeal vs. esophageal dysphagia). Cover high-risk populations: stroke, Parkinson's disease, dementia, head and neck cancer, prolonged intubation, post-anesthesia (first 4–6 hours after extubation), any patient with altered mental status. Cover the bedside swallowing screen (not a formal SLP evaluation): observe for coughing or choking with small sips of water, wet/gurgly voice quality after swallowing, throat clearing, drooling. If any sign present → NPO and formal SLP consult. Cover aspiration precautions: HOB ≥45° during and 30–60 minutes after oral intake, small bites and sips, thickened liquids per SLP recommendation (nectar-thick vs. honey-thick vs. pureed), oral hygiene q4h (colonized oral bacteria are a major aspiration pneumonia source), minimize sedation. Cover silent aspiration — common in elderly and neurologically impaired — no coughing does not mean no aspiration is occurring.

**`skin-integrity`** — Pressure Injury Prevention and Staging
- Category: Skin Integrity
- Body: Explain the Braden Scale risk factors: sensory perception, moisture, activity, mobility, nutrition, friction/shear — total score ≤18 = at risk, ≤12 = high risk. Cover the four standard pressure injury stages: Stage 1 (non-blanchable erythema over intact skin), Stage 2 (partial thickness loss — open blister or shallow crater), Stage 3 (full thickness skin loss — subcutaneous tissue visible), Stage 4 (full thickness, muscle/bone/tendon visible). Cover unstageable (covered with eschar — cannot determine depth) and deep tissue injury (purple/maroon intact skin over deep tissue damage). Nursing interventions: reposition q2h minimum, offloading devices (foam wedges, heel boots), moisture barriers for incontinence, keep skin dry and clean, nutritional support (protein critical for healing), do not massage over bony prominences (damages underlying tissue). Cover documentation requirements: stage, size (L×W×D in cm), wound bed description, periwound skin, drainage, treatment applied.

**`pain-assessment`** — Pain Assessment Beyond the Number
- Category: Assessment
- Body: Explain that a pain scale number is the starting point, not the complete picture. Cover OLDCART: Onset, Location, Duration, Character, Aggravating factors, Relieving factors, Treatment tried. Cover special populations requiring modified assessment: non-verbal patients use CPOT (Critical Care Pain Observation Tool) or FLACC (pediatric); dementia patients use PAINAD; patients may minimize pain due to fear of addiction, cultural norms, or wanting to be a "good patient." Cover pain reassessment timing: 30–60 minutes after pharmacological intervention, 1 hour after non-pharmacological. Cover multimodal analgesia principles: combining opioids with non-opioids (acetaminophen, NSAIDs if appropriate) and non-pharmacological approaches (positioning, ice, distraction, relaxation) reduces opioid requirements and side effects. Opioid precautions: assess sedation level (POSS scale) before each dose; hold if POSS ≥3 or respiratory rate <10.

**`aki-monitoring`** — Acute Kidney Injury: Recognition and Nursing Priorities
- Category: Renal
- Body: Cover KDIGO AKI criteria: rise in creatinine ≥0.3mg/dL within 48 hours, or ≥1.5× baseline within 7 days, or urine output <0.5mL/kg/hr for ≥6 hours. Explain the three categories: prerenal (decreased perfusion — dehydration, hemorrhage, heart failure → restore volume), intrinsic/intrarenal (direct kidney damage — nephrotoxins, ischemia, sepsis → remove offending agent, supportive care), postrenal (obstruction — BPH, kidney stone → relieve obstruction). Nursing priorities: strict I&O with hourly urines if indicated; daily weights (most accurate fluid balance indicator); hold nephrotoxic medications (NSAIDs, ACE inhibitors in acute phase, contrast, aminoglycosides, metformin); monitor electrolytes (hyperkalemia is the most immediately life-threatening complication — peaked T-waves on ECG, weakness); monitor fluid status (avoid both overhydration and underhydration); notify provider if urine output <30mL/hr for 2 consecutive hours.

**`dka-management`** — DKA: The Critical Potassium Rule
- Category: Endocrine — Critical
- Body: Explain DKA pathophysiology: absolute or relative insulin deficiency → glucose cannot enter cells → hyperglycemia → osmotic diuresis → dehydration; fat breakdown → ketone production → metabolic acidosis. Cover the critical potassium rule: in DKA, total body potassium is DEPLETED (lost through osmotic diuresis) BUT serum potassium may appear normal or HIGH because acidosis causes K⁺ to shift from intracellular to extracellular. When insulin is given, K⁺ shifts BACK into cells — serum potassium drops rapidly. Rule: NEVER start insulin if K⁺ <3.5 mEq/L — replace first, then begin insulin. Check potassium every 1–2 hours during treatment. Cover the DKA treatment triad: fluids (0.9% NS initially, then 0.45% NS), insulin (regular insulin drip — transition to SubQ only when anion gap closes and patient can eat), potassium replacement (add to IVF per protocol). Cover resolution criteria: blood glucose <200, bicarbonate ≥15, anion gap ≤12, pH >7.3.

**`vital-signs-interpretation`** — Interpreting Vital Signs as a Clinical Pattern
- Category: Assessment
- Body: Teach students to read vital signs as a constellation, not as individual numbers. Cover each vital sign in clinical context: BP — consider baseline (a BP of 100/60 may be normal for one patient and hypotensive shock in another who runs 160/90); HR — tachycardia is compensation (pain, hypovolemia, fever, hypoxia, anxiety, medication effect — find the cause, don't just treat the number); RR — most undervalued vital sign; RR ≥20 is one of the earliest signs of deterioration and sepsis; SpO₂ — unreliable in poor perfusion, cold extremities, nail polish, CO poisoning, and severe anemia; Temp — fever = infection/inflammation, but elderly and immunocompromised patients may be septic without fever (hypothermia can be an ominous sign). Cover the concept of early warning scores (NEWS2): how combining vital sign derangements gives a more accurate picture of deterioration risk than any single parameter. Include a clinical scenario: patient with HR 108, RR 22, temp 38.2°C, BP 100/60 — walk through pattern recognition leading to sepsis concern.

---

## SITE STRUCTURE

### Pages

---

### `/` — Home

- Hero section with subtle grid background texture, bold headline: **"Master Clinical Judgment"**, subheading explaining this is a structured learning tool based on the NCLEX Next Generation Clinical Judgment Model
- Tutorial trigger: `[? NGN Model]` → fires `ngn-model` lightbox tutorial
- Short "What is the Clinical Concept Map?" section (2–3 paragraphs)
- Visual 5-step flow diagram (pure CSS/HTML — no image files): horizontal steps connected by arrows, each step in its `--color-step-N` color
- Tutorial trigger beside the flow diagram: `[? Why This Framework?]` → fires `feedback-loop` tutorial
- "Start Learning" CTA button → `/how-to-use`
- Grid of cards linking to all 5 case studies
- Prominent card linking to the Concept Map Builder → `/builder`

---

### `/how-to-use` — How to Use the Concept Map

A detailed step-by-step guide. Each step section includes: name, plain-language explanation, clinical reasoning goal, what to write, common mistakes, and a tip box.

**Step 0 — Disease Process / Pathophysiology / Risk Factors**
- Research your assigned patient's primary diagnosis before or during clinical
- List 5 items: disease mechanism, progression, key risk factors
- Connect to YOUR patient — not a generic textbook entry
- Tutorial trigger: `[? Why Pathophysiology First?]` → fires `pathophysiology-why`

**Step 1 — Recognizing Cues** (NGN Step 1)
- Collect objective data (vitals, labs, diagnostics, physical exam) and subjective data (patient complaints, pain, history)
- Note findings outside normal range
- Check the MAR — medications are cues
- Tutorial trigger: `[? Objective vs. Subjective]` → fires `objective-vs-subjective`
- Tutorial trigger: `[? Reading the MAR as a Cue]` → fires `mar-as-cue`

**Step 2 — Analyzing Cues** (NGN Step 2)
- Split into Supporting (confirms the diagnosis) and Concerning (abnormal, unexpected, worsening)
- A finding can appear in both columns
- Tutorial trigger: `[? Supporting vs. Concerning]` → fires `supporting-vs-concerning`

**Step 3 — Prioritizing Hypotheses** (NGN Step 3)
- Rank top 3 nursing diagnoses by urgency
- Use ABCs + Maslow's hierarchy
- NANDA format: "Problem r/t Etiology AEB Defining Characteristics"
- Tutorial trigger: `[? ABC Priority Framework]` → fires `abc-priority`
- Tutorial trigger: `[? NANDA Format Guide]` → fires `nanda-format`

**Step 4 — Taking Actions / SMART Planning** (NGN Step 4)
- 5 interventions per diagnosis, each with a SMART goal written from the patient's perspective
- Tutorial trigger: `[? How to Write SMART Goals]` → fires `smart-goals`

**Step 5 — Evaluating Outcomes** (NGN Step 5)
- Met / Partially Met / Not Met with objective evidence
- Tutorial trigger: `[? Writing Objective Evaluations]` → fires `evaluation-evidence`

**Step 6 — The Feedback Loop**
- Evaluation feeds back into recognition — reassess, revise, repeat
- Tutorial trigger: `[? The Reassessment Loop]` → fires `feedback-loop`

---

### `/case-studies` — Case Studies Index

Grid of 5 cards, each with patient summary and link.

---

### `/case-studies/pneumonia` — Case Study 1: Community-Acquired Pneumonia

**Patient:** Maria G., 68F. Admitted from ED: shortness of breath, productive cough, fever 101.8°F. PMH: Type 2 diabetes, hypertension. Meds: Metformin, Lisinopril. O₂ sat 88% RA. CXR: right lower lobe infiltrate. WBC 14,200. ABGs: pH 7.32, PaCO₂ 50, PaO₂ 58.

Tutorial trigger at top of page: `[? ABG Interpretation Guide]` → fires `abg-interpretation`
Tutorial trigger beside O₂ sat: `[? Understanding O₂ Targets]` → fires `oxygen-targets`

**Disease Process / Pathophysiology / Risk Factors:**
1. Bacterial infection causes alveolar consolidation — air spaces fill with inflammatory exudate blocking O₂ diffusion
2. Consolidation creates a V/Q mismatch — perfusion continues but ventilation is impaired → hypoxemia
3. Inflammatory response triggers systemic effects: fever, tachycardia, leukocytosis, increased metabolic demand
4. Impaired mucociliary clearance → secretion retention → further obstruction of airways
5. Risk factors: age 68 (reduced immune response), Type 2 diabetes (impaired neutrophil function), community exposure

**Recognizing Cues:**

| Finding | Type | Value | Normal Range | Status |
|---------|------|-------|--------------|--------|
| O₂ saturation | Objective | 88% | 95–100% | Critical |
| Temperature | Objective | 101.8°F | 97.8–99.1°F | Abnormal |
| WBC | Objective | 14,200/µL | 4,500–11,000/µL | Abnormal |
| pH | Objective | 7.32 | 7.35–7.45 | Abnormal |
| PaCO₂ | Objective | 50 mmHg | 35–45 mmHg | Abnormal |
| PaO₂ | Objective | 58 mmHg | 80–100 mmHg | Critical |
| CXR finding | Objective | RLL infiltrate | Clear | Abnormal |
| Chief complaint | Subjective | Shortness of breath | N/A | Concerning |
| Sputum character | Objective | Productive cough | None | Abnormal |

**Analyzing Cues:**
- Supporting: fever + elevated WBC (infection response), infiltrate on CXR (consolidation), productive cough (secretion), SpO₂ 88% (impaired gas exchange consistent with pneumonia), PMH diabetes (risk factor)
- Concerning: O₂ sat 88% is critically low and requires immediate intervention; ABG shows respiratory acidosis (pH 7.32, PaCO₂ 50) indicating the patient is not compensating; PaO₂ 58 = severe hypoxemia; new onset confusion reported by family (not yet assessed — possible hypoxic encephalopathy)

**Priority Diagnoses:**
1. **Impaired Gas Exchange** r/t alveolar consolidation and V/Q mismatch AEB O₂ sat 88%, PaO₂ 58, pH 7.32, PaCO₂ 50
2. **Ineffective Airway Clearance** r/t increased secretions and mucosal inflammation AEB productive cough, crackles bilateral lung bases, RR 26
3. **Hyperthermia** r/t active infectious process AEB temp 101.8°F, diaphoresis, elevated WBC 14,200

**Interventions and SMART Goals** (5 per diagnosis — write out each):
- Diagnosis 1: O₂ via nasal cannula titrated to sat ≥92–95%; HOB ≥45°; bronchodilator nebulizer treatment; monitor ABGs per order; position in high Fowler's and teach incentive spirometry — SMART goals for each targeting measurable improvement in sat, RR, and ABG values within specified timeframes
- Diagnosis 2: Encourage coughing and deep breathing q2h; chest physiotherapy if ordered; adequate hydration to thin secretions; suction if unable to clear; oral hygiene q4h
- Diagnosis 3: Antipyretics per order with reassessment 30 minutes post-dose; cooling measures; monitor I&O for dehydration; blood cultures before antibiotics

**Evaluation:** After 4 hours: O₂ sat improved to 94% on 2L NC after repositioning and nebulizer — Diagnosis 1 goal partially met (target 95% not yet reached); afebrile after Tylenol — Diagnosis 3 goal met; sputum production ongoing — Diagnosis 2 partially met, will continue chest physiotherapy

---

### `/case-studies/chf` — Case Study 2: Acute Decompensated Heart Failure

**Patient:** James T., 74M. 3-day worsening dyspnea, bilateral leg edema +3, weight gain 8 lbs in 5 days. PMH: HFrEF (EF 35%), CKD Stage 3, atrial fibrillation. Meds: Furosemide (poor adherence), Carvedilol, Warfarin, Lisinopril. Vitals: BP 158/96, HR 98 irregular, RR 24, O₂ sat 90% RA. BNP 1,840. Creatinine 2.1 (baseline 1.6).

Tutorial trigger: `[? Orthostatic Hypotension]` → fires `orthostatic-hypotension`
Tutorial trigger beside labs: `[? AKI Monitoring]` → fires `aki-monitoring`

**Disease Process** (full walkthrough — same structure as Case 1):
Reduced ejection fraction (EF 35%) → decreased cardiac output → activation of RAAS and sympathetic nervous system → fluid and sodium retention → volume overload → pulmonary edema and peripheral edema; rising creatinine signals cardiorenal syndrome development from reduced renal perfusion

**Recognizing Cues:** Table of all vitals, labs, and subjective findings — BNP 1,840 (normal <100), creatinine 2.1 vs baseline 1.6, O₂ sat 90%, +3 bilateral pitting edema, irregular HR, weight gain 8 lbs/5 days

**Analyzing Cues:** Supporting vs. Concerning (detail as in Case 1 format)

**Priority Diagnoses:**
1. **Excess Fluid Volume** r/t compromised cardiac regulatory mechanisms AEB +3 pitting edema, weight gain 8 lbs, BNP 1,840, crackles
2. **Decreased Cardiac Output** r/t altered contractility (EF 35%) AEB irregular HR 98, O₂ sat 90%, dyspnea, elevated BNP
3. **Activity Intolerance** r/t imbalance between O₂ supply and demand AEB dyspnea on exertion, O₂ sat drop with movement, inability to perform ADLs

**Interventions and SMART Goals**, **Evaluation** (full detail — follow Case 1 format)

---

### `/case-studies/sepsis` — Case Study 3: Sepsis Secondary to UTI

**Patient:** Dorothy M., 82F. LTC transfer. Altered mental status (new), temp 38.9°C, HR 118, BP 88/54, RR 22, O₂ sat 92%. UA: positive nitrites, leukocyte esterase, WBC >50. Blood cultures ×2 drawn. Lactate 3.2 mmol/L. PMH: dementia (baseline A&Ox1), DM2, osteoporosis. Meds: Donepezil, Metformin (held).

Tutorial trigger at top: `[? Recognizing Sepsis]` → fires `sepsis-bundle`
Tutorial trigger beside mental status change: `[? Vital Signs as a Pattern]` → fires `vital-signs-interpretation`

Full concept map walkthrough following Case 1/2 structure:

**Pathophysiology:** UTI source → bacterial invasion → systemic inflammatory response → cytokine cascade → vasodilation and vascular permeability → distributive shock → end-organ hypoperfusion; Sepsis-3 criteria met (suspected infection + organ dysfunction evidenced by AMS)

**Priority Diagnoses:**
1. **Ineffective Tissue Perfusion (systemic)** r/t distributive shock AEB MAP ~65, lactate 3.2, AMS from baseline
2. **Risk for Septic Shock** r/t uncontrolled infectious process AEB hemodynamic instability, lactate 3.2, HR 118
3. **Impaired Verbal Communication** r/t dementia and acute illness AEB inability to report symptoms, A&Ox1 baseline

Interventions include the complete sepsis 1-hour bundle with rationale for each element. Evaluation notes: after 30mL/kg IVF and broad-spectrum antibiotics, BP improved to 100/62, lactate 2.1 at recheck — monitoring for cardiorenal response to fluids given baseline dementia and advanced age.

---

### `/case-studies/copd` — Case Study 4: Acute COPD Exacerbation

**Patient:** Harold B., 71M. 2-day worsening dyspnea, thick yellow-green sputum, unable to complete sentences. PMH: COPD (GOLD Stage III), 45 pack-year history (quit 3 years ago), cor pulmonale, GERD. Home meds: Tiotropium inhaler, Albuterol PRN, Fluticasone/Salmeterol combo, Omeprazole. Currently using pursed-lip breathing. Vitals: BP 144/88, HR 108, RR 28, Temp 38.1°C, O₂ sat 84% RA (home baseline ~90%). ABGs: pH 7.30, PaCO₂ 62 (chronic baseline ~52), PaO₂ 52, HCO₃ 30. CXR: hyperinflation, flattened diaphragm. WBC 13,800.

Tutorial trigger (CRITICAL — display prominently at top of page in a red-bordered callout):
`[⚠ CRITICAL: O₂ Administration in COPD — Read Before Proceeding]` → fires `copd-hypoxic-drive`

Tutorial trigger beside ABGs: `[? ABG Interpretation Guide]` → fires `abg-interpretation`
Tutorial trigger beside O₂ sat target: `[? O₂ Targets by Condition]` → fires `oxygen-targets`

**CRITICAL TEACHING CALLOUT** (render as a prominent red alert box on the page, not just a tutorial trigger):

> **O₂ Target for COPD Exacerbation: 88–92% — NOT the standard ≥95%**
> Administering high-flow O₂ to a patient relying on hypoxic drive can suppress respiratory effort and precipitate acute CO₂ retention and respiratory failure. Use a Venturi mask to precisely control FiO₂. Monitor serial ABGs for rising PaCO₂.

**Disease Process:**
1. Chronic airway inflammation → alveolar wall destruction (emphysema) → air trapping → hyperinflation → flattened diaphragm → reduced respiratory mechanics
2. V/Q mismatch from destroyed alveolar-capillary membrane → chronic hypoxemia and hypercapnia
3. Acute exacerbation: viral or bacterial trigger → increased airway inflammation → bronchospasm + mucus hypersecretion → acute-on-chronic respiratory acidosis
4. Cor pulmonale: chronic hypoxemia → pulmonary vasoconstriction → pulmonary hypertension → right ventricular hypertrophy
5. Risk factors: 45 pack-year history, GOLD Stage III (severe airflow limitation, FEV1 30–50% predicted), male sex, age 71, prior exacerbations (strongest predictor of future exacerbations)

**Recognizing Cues:** Full table — all ABGs with personal baseline comparison (PaCO₂ 62 vs personal baseline 52 is the critical number — rising above baseline signals decompensation), O₂ sat 84%, WBC 13,800, RR 28, HR 108, temp 38.1, pursed-lip breathing, unable to complete sentences

**Analyzing Cues:**
- Supporting: known COPD, pursed-lip breathing (learned compensatory mechanism), barrel chest and hyperinflation on CXR, yellow-green sputum (infection trigger), WBC 13,800, worsening from personal baseline
- Concerning: O₂ sat 84% (critically low even for COPD — action required); acute respiratory acidosis pH 7.30 (not just chronic compensation); PaCO₂ rising ABOVE personal baseline (62 vs 52 — this is the alarm); RR 28 and unable to complete sentences (impending respiratory fatigue); cor pulmonale — right heart already stressed

**Priority Diagnoses:**
1. **Impaired Gas Exchange** r/t V/Q mismatch and acute-on-chronic alveolar hypoventilation AEB pH 7.30, PaCO₂ 62 (above personal baseline), O₂ sat 84%, PaO₂ 52
2. **Ineffective Airway Clearance** r/t excessive mucus production and bronchospasm AEB RR 28, yellow-green sputum, wheezing, inability to complete sentences
3. **Activity Intolerance** r/t hypoxemia and increased work of breathing AEB use of accessory muscles, O₂ sat drop, inability to complete sentences at rest

**Interventions and SMART Goals:**

Diagnosis 1:
- Administer controlled O₂ via Venturi mask 24–28% FiO₂; titrate to target sat 88–92% — **SMART:** Patient will maintain O₂ sat 88–92% within 30 minutes without clinical signs of CO₂ retention
- Position HOB 45°, encourage pursed-lip breathing — **SMART:** Patient will demonstrate pursed-lip breathing technique and report dyspnea ≤5/10 within 1 hour
- Monitor serial ABGs q2–4h; report PaCO₂ rising above personal baseline of 52 to provider — **SMART:** PaCO₂ will remain at or below patient's personal baseline of 52 within 4 hours of treatment
- Administer bronchodilators as ordered (albuterol + ipratropium nebulization) — **SMART:** Patient will demonstrate improved bilateral air entry on auscultation within 20 minutes of nebulizer treatment
- Prepare for BiPAP if PaCO₂ continues rising or RR exceeds 30; notify provider — **SMART:** Patient will not require intubation; respiratory effort will stabilize within 2 hours

Diagnosis 2 and 3: (5 interventions + SMART goals each — write out fully)

**Evaluation:** After 2 hours of controlled O₂ + bronchodilators + IV corticosteroids: O₂ sat 90%, RR 22, patient speaking in short sentences — Diagnosis 1 goal partially met; PaCO₂ unchanged at 62 (not worsening — reassess in 2h; BiPAP not yet required); Diagnosis 2 partially met; Diagnosis 3 unchanged — patient education on energy conservation initiated

---

### `/case-studies/parkinsons` — Case Study 5: Parkinson's Disease — Acute Hospitalization

**Patient:** Eleanor V., 78F. Admitted for elective right hip arthroplasty. PMH: Parkinson's disease (Hoehn & Yahr Stage 3 — bilateral disease, postural instability, independent but limited), hypertension, chronic constipation. Home meds: Carbidopa-Levodopa 25/100mg q6h (6am, 12pm, 6pm, midnight), Pramipexole, Lisinopril, Colace. Post-op day 1: BP 102/64 (orthostatic drop to 88/58 on standing), HR 78, RR 16, O₂ sat 96%, Temp 37.2°C. Reports freezing episodes when walking to bathroom. Morning Carbidopa-Levodopa dose held by floor nurse per NPO order that was not updated post-op. Patient now showing increased rigidity, worsened masked facies, new fine resting tremor left hand. Tearful: "I can't move like I could yesterday."

Tutorial trigger (CRITICAL — display as red-bordered callout at top):
`[⚠ CRITICAL: Parkinson's Disease in the Hospital]` → fires `parkinsons-hospital`

Tutorial trigger beside medications: `[? High-Alert Medications]` → fires `medication-high-alert`
Tutorial trigger beside orthostatic vitals: `[? Orthostatic Hypotension]` → fires `orthostatic-hypotension`
Tutorial trigger beside dysphagia concern: `[? Dysphagia and Aspiration Risk]` → fires `dysphagia-aspiration`
Tutorial trigger beside fall risk: `[? Fall Risk Assessment]` → fires `fall-risk`

**CRITICAL TEACHING CALLOUT** (red alert box on the page):

> **IMMEDIATE ACTION REQUIRED: Carbidopa-Levodopa dose was held in error.**
> NPO orders almost never apply to Parkinson's medications. Contact the provider NOW to reinstate the scheduled dose. Even a 60-minute delay can cause a severe "off" episode with rigidity, immobility, dysphagia, and aspiration risk. Do NOT administer Haloperidol, Metoclopramide, Prochlorperazine, or Promethazine — these block dopamine receptors and will acutely worsen symptoms. Use Ondansetron for nausea.

**Disease Process:**
1. Degeneration of dopaminergic neurons in the substantia nigra pars compacta → loss of dopamine → dopamine/acetylcholine imbalance in the basal ganglia → impaired initiation and control of voluntary movement
2. Cardinal motor features: resting tremor, rigidity (cogwheel), bradykinesia, postural instability (Hoehn & Yahr Stage 3)
3. Non-motor features: autonomic dysfunction → orthostatic hypotension, constipation, drooling; dysphagia from oropharyngeal muscle rigidity; depression and anxiety
4. Hospitalization risk: abrupt reduction in dopaminergic medication (whether from NPO orders, absorption changes, or care team unfamiliarity) precipitates "off" episodes — acutely worsened motor function that can mimic sepsis or produce aspiration crisis
5. Risk factors: age >60, Hoehn & Yahr Stage 3, female sex, medication non-adherence risk in hospital setting, post-operative anesthesia effects on swallowing

**Recognizing Cues:** Full table — orthostatic BP readings (lying/sitting/standing all three values), held medication dose (document on MAR), motor exam findings (tremor, rigidity, bradykinesia grade), swallowing assessment status (NOT completed — flag as missing), fall risk score, tearful affect and expressive changes

**Analyzing Cues:**
- Supporting: known Stage 3 PD, orthostatic hypotension (expected non-motor feature), freezing consistent with off-state, masked facies at baseline
- Concerning: held Carbidopa-Levodopa — MEDICATION ERROR requiring immediate action; worsened rigidity and new tremor since admission (off-episode developing); orthostatic drop to 88/58 (fall/injury risk); tearful + expressive changes (screen for depression and PD psychosis); swallowing assessment NOT documented (aspiration risk — post-op day 1)

**Priority Diagnoses:**
1. **Risk for Falls** r/t orthostatic hypotension, freezing episodes, and postural instability AEB BP drop to 88/58 on standing, Hoehn & Yahr Stage 3, patient-reported freezing
2. **Impaired Physical Mobility** r/t medication-induced off-state and disease progression AEB rigidity, worsened tremor, freezing, tearful report of functional loss
3. **Risk for Aspiration** r/t oropharyngeal muscle rigidity and dysphagia AEB PD Stage 3, post-op day 1, swallowing assessment not completed

**Interventions and SMART Goals:** (5 per diagnosis — fully written out)

Diagnosis 1 (Falls): Reinstate Carbidopa-Levodopa immediately; high fall risk protocol (bed alarm, non-slip footwear, call light, hourly rounding, bed lowest position); visual floor cue tape + rhythmic counting for freezing; orthostatic vitals before every ambulation; PT consult within 24 hours

Diagnosis 2 (Mobility): Advocate for strict PD medication timing — communicate to entire team that NPO does not apply; cluster care for rest; allow extra time for all ADLs — do not rush; adaptive equipment (raised toilet seat, grab bars, weighted utensils); OT consult

Diagnosis 3 (Aspiration): NPO until SLP evaluation; HOB ≥45° during and 30–60 minutes after oral intake; medications in appropriate form (verify which can be crushed — NEVER crush extended-release formulations); oral hygiene q4h; educate patient and family on aspiration signs; Ondansetron only for nausea — document contraindicated antiemetics in chart

**Evaluation:** After Carbidopa-Levodopa reinstated on schedule: rigidity decreased, tremor reduced within 2 hours of first dose. SLP evaluation completed — mild dysphagia confirmed; mechanically soft diet with nectar-thick liquids ordered. Zero falls during shift. Patient reports "more like myself" — mood improved. Orthostatic hypotension persists; provider notified; Midodrine ordered. Diagnosis 1 and 2 partially met; Diagnosis 3 goal met (SLP evaluation completed, diet modified).

---

## CONCEPT MAP BUILDER — `/builder`

This is the core interactive utility of the site. It is a fully client-side, single-page tool (no server, no database) that allows a student to fill out a complete clinical concept map for a real patient during or after clinical, then print it as a polished PDF to submit as an assignment.

Every section of the form includes contextual suggestion panels that help the student make informed, clinically accurate selections based on what they have already entered elsewhere in the form. All suggestions are pre-written, evidence-based, and triggered by the student's inputs — no external API calls, no network required at runtime. All suggestion logic is bundled JavaScript.

A **Tutorial Trigger** appears beside every major section label in the builder. Each fires the corresponding lightbox from the tutorial system defined above.

---

### Layout

- **Desktop (≥1024px):** Three-panel layout — Form (left, ~45%), Live Preview (center, ~35%), Knowledge Panel (right, ~20%)
- **Tablet (768–1023px):** Two panels — Form (left), Knowledge Panel (collapsible right sidebar via toggle button)
- **Mobile (<768px):** Single column — Form → Preview (collapsed by default, expandable) → sticky "Print to PDF" button at bottom
- Knowledge Panel accessible via a floating "Reference ☰" button on narrower screens

---

### GLOBAL SUGGESTION ENGINE

Build a client-side suggestion engine in vanilla JS using a bundled data object (`window.ClinicalData`) that maps conditions to suggested content across every tab.

**How it works:**
1. Student enters primary diagnosis in Tab 0 → engine fuzzy-matches against the condition list → pre-loads condition-specific suggestions throughout all tabs
2. Each tab has "Suggest" buttons and inline suggestion chips that open a popover showing pre-written options the student can click to insert
3. Suggestions are additive — clicking inserts into the field; student can edit freely
4. Tab 4 (interventions) suggestions filter by the specific nursing diagnosis selected in Tab 3
5. A subtle badge appears on tab labels when condition-matched content is ready

**`window.ClinicalData` must include fully pre-written content for these conditions:**

Pneumonia, CHF / Heart Failure, Sepsis, COPD, Parkinson's Disease, Stroke/CVA, DKA, AKI / Acute Kidney Injury, Post-op complications, DVT/PE, Hypertension, Atrial Fibrillation, Diabetes Type 2, Myocardial Infarction, Cellulitis/Wound Infection, Urinary Tract Infection, Cirrhosis/Liver Failure, Pancreatitis, Asthma, Pneumothorax

**For each condition store:**
- `pathophysiology[]` — 5 pre-written bullet points
- `riskFactors[]` — 5 pre-written bullet points
- `cues[]` — `{ finding, type, normalRange, significanceHint }`
- `supportingData[]` — 5 strings
- `concerningData[]` — 5 strings
- `diagnoses[]` — `{ nanda, relatedTo, aeb, priority }`
- `interventions{}` — keyed by NANDA label, 5 intervention+goal pairs each
- `evaluationFindings{}` — keyed by NANDA label, 5 example evaluation strings

---

### Tab 0 — Patient Info Header

**Fields:**
- Patient initials (text, required)
- Age (number)
- Sex (select: Male / Female / Other)
- Admission date (date picker)
- Primary diagnosis (text with autocomplete — dropdown of matched condition names from `window.ClinicalData` as student types; selecting activates condition-specific suggestions throughout all tabs)
- Secondary diagnoses (comma-separated text — also influences suggestions and alert logic)
- Student name (text, required)
- Clinical site / course name (text)
- Date of concept map (date picker, defaults to today)

**Tutorial trigger beside "Primary Diagnosis":** `[? NGN Model Overview]` → fires `ngn-model`

**Smart Alert System — fires based on diagnosis combination:**

Display a prominently styled alert box for any of these conditions:

| Condition | Alert Text |
|-----------|-----------|
| COPD | "O₂ target for COPD exacerbation is 88–92%. Do NOT titrate to standard ≥95% target." + tutorial trigger → `copd-hypoxic-drive` |
| Parkinson's Disease | "Carbidopa-Levodopa timing is critical. Confirm all PD medications are on strict schedule — NPO orders do not apply. Avoid all dopamine-blocking antiemetics." + tutorial trigger → `parkinsons-hospital` |
| Sepsis | "Sepsis 1-hour bundle: blood cultures ×2 before antibiotics, lactate, IVF 30mL/kg, broad-spectrum abx, vasopressors if MAP <65." + tutorial trigger → `sepsis-bundle` |
| DKA | "Monitor potassium closely — insulin drives K⁺ into cells. Hold insulin if K⁺ <3.5. Replace before starting drip." + tutorial trigger → `dka-management` |
| AKI | "Review all medications for nephrotoxicity. Avoid NSAIDs, contrast, aminoglycosides. Monitor I&O and daily weights." + tutorial trigger → `aki-monitoring` |
| Any anticoagulant in meds | "Bleeding precautions: fall prevention, soft toothbrush, avoid IM injections. Know reversal agents." + tutorial trigger → `medication-high-alert` |
| Age ≥65 | "Older adult considerations: atypical presentations, polypharmacy risk, delirium risk, pressure injury prevention, fall risk." + tutorial triggers → `fall-risk`, `skin-integrity` |

---

### Tab 1 — Disease Process / Pathophysiology / Risk Factors

Five text area fields labeled 1–5.

**Tutorial trigger at tab header:** `[? Why Pathophysiology First?]` → fires `pathophysiology-why`

**Condition-Matched Suggestion Panel (shows when diagnosis is set):**
- Panel labeled "Suggested for [Diagnosis]" with toggle between Pathophysiology and Risk Factors views
- 5 pre-written bullets from `ClinicalData`, each with checkbox and "Insert" button
- Text is editable after insertion

**Manual condition selector:** If no Tab 0 diagnosis, show a dropdown: "Load suggestions for condition:"

**Collapsible Body Systems Quick Reference:**
A table of system → core mechanism → 2–3 sentinel conditions + one-sentence mechanism each:

| System | Core Mechanism | Key Conditions |
|--------|----------------|----------------|
| Respiratory | V/Q mismatch, diffusion impairment, obstruction | Pneumonia, COPD, PE |
| Cardiac | Reduced CO, volume overload, ischemia | CHF, MI, Dysrhythmia |
| Neurological | Neuronal death, demyelination, neurotransmitter deficit | Stroke, Parkinson's, Seizure |
| Renal | GFR reduction, fluid/electrolyte dysregulation | AKI, CKD, UTI |
| GI | Inflammation, obstruction, malabsorption | Pancreatitis, Cirrhosis, Ileus |
| Endocrine | Hormone excess or deficiency, cellular substrate failure | DKA, Hypoglycemia, Thyroid storm |
| Hematology | Clot formation, bleeding, immune dysregulation | DVT/PE, Sepsis, Sickle Cell |
| Musculoskeletal | Inflammation, fracture, mobility impairment | Post-op, Arthritis, Osteomyelitis |

---

### Tab 2 — Recognizing Cues

Dynamic table: **Finding | Type | Value/Description | Normal Range | Status**

Add-row button. Minimum 5 rows on load.

**Tutorial trigger at tab header:** `[? Objective vs. Subjective Data]` → fires `objective-vs-subjective`
**Tutorial trigger beside MAR section:** `[? Reading the MAR as a Cue]` → fires `mar-as-cue`

**Cue Suggestion Panel:**
"Load Suggested Cues" button opens a drawer with all `ClinicalData[condition].cues` as a checklist. Each row shows finding name, expected range, and a field for actual patient value. "Add Selected Cues" inserts checked items as pre-filled rows with normal ranges populated.

**Inline Normal Range Lookup:**
Each "Normal Range" cell has a "?" button → tooltip showing standard normal range. Bundled JS object — no network call. Covers:

- Vital signs (BP, HR, RR, Temp, SpO₂, MAP with formula hint)
- BMP and CMP
- CBC with differential
- ABGs (with COPD baseline shift note)
- Cardiac markers (Troponin I/T, BNP, pro-BNP, CK-MB)
- Coagulation (PT, INR, aPTT, Anti-Xa)
- Urinalysis normals
- Thyroid (TSH, Free T4)
- Liver function (AST, ALT, GGT, ALP, Total/Direct Bilirubin, Albumin, Total Protein)
- Renal (BUN, Creatinine, BUN/Creatinine ratio, eGFR, Uric Acid)
- Magnesium, Phosphorus, Calcium (total and ionized)
- Lactate, HbA1c, D-dimer, ESR, CRP

**Auto-Status Flag:** When a numeric value is entered and the field name matches a known lab (fuzzy match), auto-suggest a status based on the value vs. bundled normal range. Show as a colored suggestion chip the student can accept or override.

**ABG Interpreter Widget** (collapsible mini-tool within Tab 2):

Label: "ABG Interpreter"
Inputs: pH, PaCO₂, PaO₂, HCO₃, O₂ sat
On "Interpret" button:
- Primary disturbance
- Compensation status (Uncompensated / Partially Compensated / Fully Compensated)
- Likely clinical cause (1–2 sentences from bundled text)
- Suggested nursing priority
- COPD baseline note if COPD is in the patient's diagnosis fields

All logic is pure JS arithmetic — no API.

Tutorial trigger beside ABG widget: `[? Full ABG Interpretation Guide]` → fires `abg-interpretation`
Tutorial trigger beside O₂ sat field: `[? O₂ Targets by Condition]` → fires `oxygen-targets`
Tutorial trigger beside vital signs: `[? Interpreting Vital Signs as a Pattern]` → fires `vital-signs-interpretation`

---

### Tab 3 — Analyzing Cues

Two columns: **Supporting | Concerning**. Dynamic rows with add/remove buttons.

**Tutorial trigger at tab header:** `[? Supporting vs. Concerning Data]` → fires `supporting-vs-concerning`

**Cue Sorter:**
"Sort My Cues" button reads all cues from Tab 2 and displays each as a draggable chip in a neutral "unsorted" row. Student drags into Supporting or Concerning column. Fallback for touch/mobile: "S" and "C" buttons on each chip. "Populate from sorted chips" fills the column text areas.

**Condition-Matched Suggestions:**
Collapsible panels: "Suggested Supporting Data for [Condition]" and "Suggested Concerning Data for [Condition]" with checkboxes and Insert buttons.

**Tip Box (always visible):**
> "A finding may appear in BOTH columns — Supporting confirms the diagnosis; Concerning flags a complication, deterioration, or unexpected deviation from the expected disease course."

---

### Tab 4 — Prioritizing Hypotheses

Three diagnosis slots: Priority 1, 2, 3.

Each slot:
- NANDA dropdown (40+ diagnoses — see full list below)
- "Related to" text field
- "As evidenced by" text field
- "Build Diagnosis" button → assembles formatted NANDA string as preview
- Priority rationale field (1–2 sentences)

**Tutorial trigger at tab header:** `[? ABC Priority Framework]` → fires `abc-priority`
**Tutorial trigger beside NANDA dropdown:** `[? NANDA Format Guide]` → fires `nanda-format`

**NANDA Dropdown — required entries:**

Impaired Gas Exchange, Ineffective Airway Clearance, Ineffective Breathing Pattern, Decreased Cardiac Output, Excess Fluid Volume, Deficient Fluid Volume, Activity Intolerance, Acute Pain, Chronic Pain, Impaired Physical Mobility, Risk for Falls, Risk for Infection, Risk for Aspiration, Impaired Skin Integrity, Impaired Tissue Integrity, Ineffective Tissue Perfusion, Hyperthermia, Hypothermia, Deficient Knowledge, Noncompliance, Anxiety, Fear, Hopelessness, Powerlessness, Disturbed Body Image, Impaired Verbal Communication, Social Isolation, Caregiver Role Strain, Ineffective Coping, Ineffective Family Coping, Imbalanced Nutrition: Less Than Body Requirements, Imbalanced Nutrition: More Than Body Requirements, Constipation, Diarrhea, Urinary Retention, Impaired Urinary Elimination, Disturbed Sleep Pattern, Fatigue, Self-Care Deficit, Risk for Unstable Blood Glucose, Risk for Bleeding, Risk for Shock, Risk for Decreased Cardiac Tissue Perfusion, Acute Confusion, Chronic Confusion, Grieving, Risk for Suicide, Ineffective Health Management, Readiness for Enhanced Knowledge

**Diagnosis Suggestion Panel:**
Shows top 5 diagnoses from `ClinicalData[condition].diagnoses`, each with pre-filled NANDA label, related-to, AEB (pulled from cues entered in Tab 2 or condition defaults), suggested priority order, and one-sentence rationale. "Use This Diagnosis" populates the slot.

**Priority Framework Helper (collapsible, always accessible):**
- ABC rule with examples
- Maslow tier list mapped to nursing diagnosis categories
- "Actual vs. Risk" rule with examples
- "Acute vs. Chronic" rule
- Five worked priority ordering scenarios with rationales

**NANDA Format Validator:**
On "Build Diagnosis" click:
- Green check: all three parts present and minimum length met
- Amber warning: "related to" too vague or generic
- Red warning: "as evidenced by" does not reference an observable finding

---

### Tab 5 — Taking Actions / SMART Planning

Three accordion sections (one per diagnosis, auto-labeled from Tab 4). Each section: 5 rows × (Intervention + SMART Goal + Evaluation Status).

**Tutorial trigger at tab header:** `[? How to Write SMART Goals]` → fires `smart-goals`

**Intervention Suggestion Panel (per diagnosis):**
"Load Suggestions" button in each accordion header opens a drawer with 5–8 pre-written interventions from `ClinicalData[condition].interventions[nandaLabel]`.

Each suggestion shows:
- Intervention text
- Paired SMART goal
- Evidence badge: **Routine Practice** / **Evidence-Based** / **Critical Priority**
- "Insert" button

Interventions filtered by BOTH condition (Tab 0) AND specific NANDA diagnosis (Tab 4).

**SMART Goal Builder Helper (collapsible, one per accordion):**

Fill-in-the-blank template:
> "Patient will **[action verb]** **[measurable outcome]** **[timeframe]** as evidenced by **[objective measure]**."

Clickable word banks for each slot:
- **Action verbs:** maintain, demonstrate, verbalize, achieve, tolerate, ambulate, consume, report, exhibit, show improvement in, remain free of, deny...
- **Measurable outcomes (condition-filtered):** O₂ sat ≥95%, pain ≤3/10, ambulate 20 feet, void ≥30mL/hr, weight loss 1–2 lbs/day (CHF), BG 80–180 (DM), sat 88–92% (COPD)...
- **Timeframes:** by end of shift, within 4 hours, within 24 hours, prior to discharge, within 30 minutes of intervention...
- **Objective measures:** vital sign value, lab value, patient verbalization, return demonstration, pain scale score, weight, urine output...

Clicking any word bank item inserts it at the appropriate position in the goal template.

**Intervention Quality Checker:**
"Check My Interventions" button at bottom of each accordion:
- Flags "monitor [patient/vitals]" with no follow-up action → warns: "Add what you will do with the finding"
- Flags goal written in nurse's perspective ("nurse will" / "I will") → warns: "SMART goals must be from the patient's perspective"
- Flags goal with no timeframe → warns: "Add a timeframe (by end of shift, within 4 hours, etc.)"
- Flags goal with no measurable value → warns: "Add a measurable value or observable behavior"

Inline warning labels under each flagged field. Student can dismiss each warning.

Tutorial trigger beside COPD O₂ goals: `[? O₂ Targets by Condition]` → fires `oxygen-targets`
Tutorial trigger beside PD interventions: `[? Parkinson's in the Hospital]` → fires `parkinsons-hospital`
Tutorial trigger beside sepsis interventions: `[? Sepsis Recognition and Bundle]` → fires `sepsis-bundle`
Tutorial trigger beside fall prevention: `[? Fall Risk Assessment]` → fires `fall-risk`
Tutorial trigger beside skin integrity: `[? Pressure Injury Prevention]` → fires `skin-integrity`
Tutorial trigger beside pain interventions: `[? Pain Assessment]` → fires `pain-assessment`

---

### Tab 6 — Evaluating Outcomes

Three accordion sections (one per diagnosis).

Each section:
- Outcome status: Met / Partially Met / Not Met (syncs to Tab 5 evaluation status fields)
- Five evaluation finding text fields (objective evidence)
- "Revised plan" text area (required if Not Met)

**Tutorial trigger at tab header:** `[? Writing Objective Evaluations]` → fires `evaluation-evidence`
**Tutorial trigger beside "Revised Plan" field:** `[? The Reassessment Loop]` → fires `feedback-loop`

**Evaluation Suggestion Panel (per diagnosis):**
When outcome status is selected, shows 3–5 example evaluation statements from `ClinicalData[condition].evaluationFindings[nandaLabel]` appropriate to that status level. Each has an Insert button.

**Evaluation Quality Checker:**
"Check Evaluations" button flags:
- Purely subjective finding with no objective support ("patient feels better" → warn: "Add an objective measurement")
- "Not Met" with empty revised plan → warn: "A Not Met goal requires a revised plan of care"
- Evaluation finding that does not logically address the SMART goal (heuristic check)

---

### Tab 7 — Reflection (Optional)

Free-text area. Label: "What would you do differently? What did you learn from this patient?"

**Reflection Prompt Suggestions (collapsible panel):**
- "One thing I would change about my prioritization is..."
- "The most unexpected finding in this case was..."
- "I consulted [discipline] because..."
- "My patient teaching focused on... because..."
- "The intervention that had the most visible impact was..."
- "Next time I care for a patient with [condition], I will remember to..."

---

### Live Preview Panel

Right panel renders a real-time print-ready preview:
- Updates on every keystroke (debounced 300ms)
- Clean white card layout
- All sections organized as they appear when printed
- `@media print` suppresses ALL chrome (nav, sidebar, buttons, form tabs) and renders only the concept map content:
  - Page breaks between major sections
  - Black text on white background
  - Student name, patient initials, date in header on every page
  - Footer on last page: "Generated with Clinical Concept Map Builder"
  - Font: DM Sans 11pt body, DM Serif Display headings

---

### Print Button

Prominent "Print / Save as PDF" button:
- Calls `window.print()`
- Tooltip: "In the print dialog, select 'Save as PDF' as the destination to generate a PDF file for submission"

---

### Auto-Save

- `localStorage` auto-save every 5 seconds
- On load: check for saved data → "Restore your previous session?" (Accept / Clear)
- Manual "Clear all / Start over" button with confirmation dialog

---

### Knowledge Panel — Pinned Reference Sidebar

Collapsible sidebar. All sections individually collapsible. Content:

**Normal Lab Values** — full table (always-visible companion to Tab 2 lookup)

**ABG Interpretation Guide**
- Step-by-step: pH → PaCO₂ → HCO₃ → compensation
- Full table: all 4 disturbances with directions, common causes, compensation patterns
- Tutorial trigger: `[? Full ABG Tutorial]` → fires `abg-interpretation`

**Common Diagnoses by Body System**
Respiratory, Cardiac, Neuro, Renal, GI, MSK, Psych, Endocrine — 4–6 most common NANDA diagnoses each

**Priority Frameworks**
- ABC with examples
- Maslow mapped to nursing diagnoses
- Actual vs. Risk, Acute vs. Chronic rules
- Tutorial trigger: `[? Priority Framework Deep Dive]` → fires `abc-priority`

**NANDA Format Reminder**
- Template + 5 worked examples
- Tutorial trigger: `[? NANDA Format Guide]` → fires `nanda-format`

**Medication Safety Flags**

| Drug / Class | Why High Alert | Key Nursing Considerations |
|---|---|---|
| Insulin | Hypoglycemia, dosing errors | Verify type and dose with second nurse; hypoglycemia protocol |
| Heparin/Warfarin | Bleeding | aPTT/INR monitoring; antidotes: Protamine (Heparin), Vit K + FFP (Warfarin) |
| Digoxin | Narrow therapeutic window | Therapeutic range 0.5–2.0 ng/mL; hold if HR <60; toxicity: nausea, visual changes |
| IV KCl | Fatal if given as push | NEVER IV push; always pump with concentration limits |
| Opioids | Respiratory depression | POSS sedation score before each dose; Narcan available |
| Carbidopa-Levodopa | Timing critical in PD | Strict schedule; NPO does not apply; no dopamine-blocking antiemetics |
| Anticoagulants | Bleeding risk | Know reversal agents for each; bleeding precautions |
| Antipsychotics | Contraindicated in PD | Block dopamine → acute PD crisis; use Quetiapine (low dose) if required |

Tutorial trigger: `[? High-Alert Medications]` → fires `medication-high-alert`

**Condition-Specific O₂ Targets**

| Population | Target SpO₂ | Notes |
|---|---|---|
| Standard adult | ≥95% | Default |
| COPD exacerbation | 88–92% | Hypoxic drive; Venturi mask |
| MI/ACS | ≥94% | Hyperoxia causes coronary vasoconstriction |
| CO poisoning | 100% NRB | Pulse ox reads falsely normal |
| Post-cardiac arrest | 94–99% | Avoid hyperoxia — reperfusion injury |
| Neonates | 95–98% | Retinopathy of prematurity risk >99% |

Tutorial trigger: `[? O₂ Targets Explained]` → fires `oxygen-targets`

**Sepsis Quick Reference**
- SIRS criteria, Sepsis-3 (SOFA basics), 1-hour bundle
- Atypical presentations: elderly and immunocompromised
- Tutorial trigger: `[? Sepsis Deep Dive]` → fires `sepsis-bundle`

**Fall Risk and Safety**
- Morse Fall Scale factors and scoring
- High-risk medication categories
- Environmental safety checklist
- Tutorial trigger: `[? Fall Risk Assessment]` → fires `fall-risk`

**Contraindicated Drug Classes by Condition**

| Condition | Contraindicated Class | Reason | Safe Alternative |
|---|---|---|---|
| Parkinson's Disease | Dopamine-blocking antiemetics (Haloperidol, Metoclopramide, Prochlorperazine, Promethazine) | Block dopamine → acute motor crisis | Ondansetron; low-dose Quetiapine |
| Renal Failure | NSAIDs, IV contrast without pre-hydration, aminoglycosides | Nephrotoxic | Alternative analgesia; N-acetylcysteine pre-contrast |
| Hepatic Failure | High-dose acetaminophen, metformin, hepatically-cleared sedatives | Impaired clearance → toxicity | Dose-adjusted alternatives |
| Myasthenia Gravis | Fluoroquinolones, aminoglycosides, beta-blockers, NMBs | Worsen neuromuscular blockade | Alternatives per pharmacist |

---

## COMPONENTS TO BUILD

- `Layout.astro` — shared layout: `<head>`, Google Fonts, nav, footer, lightbox overlay HTML, tutorial JS bundle
- `Navbar.astro` — sticky top nav: Home, How to Use, Case Studies (dropdown: all 5 cases), Builder (highlighted); mobile hamburger
- `TutorialLightbox.astro` — global lightbox component: overlay div, modal structure, close handlers; included once in Layout
- `TutorialTrigger.astro` — reusable trigger button (props: `key`, `label`, `variant`: default | warning | critical)
- `StepCard.astro` — step card (props: stepNumber, title, color, description)
- `ConceptMapFlow.astro` — CSS-only 5-step horizontal flow diagram with arrows
- `CaseStudyLayout.astro` — case study page layout: patient info sidebar, concept map sections
- `DiagnosisBlock.astro` — nursing diagnosis + interventions + SMART goal + evaluation
- `TipBox.astro` — callout box (props: `type`: tip | warning | critical)
- `DataTable.astro` — cue table (value, normal range, status)
- `BuilderForm.astro` — complete builder tool (can be split into tab sub-components)
- `KnowledgePanel.astro` — collapsible reference sidebar for builder page
- `PrintPreview.astro` — live preview panel

**JS modules to bundle (no CDN calls at runtime):**
- `/src/scripts/tutorials.js` — `window.ClinicalTutorials` object (all tutorial content)
- `/src/scripts/clinical-data.js` — `window.ClinicalData` object (all suggestion engine content)
- `/src/scripts/lightbox.js` — lightbox open/close/keyboard logic
- `/src/scripts/builder.js` — form logic, autosave, suggestion engine, quality checkers, ABG interpreter, print handler
- `/src/scripts/normal-ranges.js` — `window.NormalRanges` object (all lab normals for tooltip lookup)

---

## ADDITIONAL REQUIREMENTS

- All pages: proper `<title>` and `<meta description>` tags
- Semantic HTML throughout: `<main>`, `<article>`, `<section>`, `<aside>`
- Fully mobile responsive: test at 375px, 768px, 1280px
- No external JS frameworks — Astro static with vanilla JS only
- Smooth scroll navigation between sections
- "Back to top" button on long pages
- Footer: "Clinical Concept Map Builder — A teaching tool for nursing students" + link to `/builder`
- `404.astro` page
- Comments in each component explaining props and usage
- Builder works completely offline after first load — all JS inline or bundled, zero CDN calls at runtime
- `@media print` suppresses ALL chrome and renders ONLY concept map content in assignment-ready format
- Lightbox system must be fully keyboard accessible (Escape to close, focus trap while open, focus returns to trigger on close)
- All tutorial trigger buttons must have `aria-label` and `aria-haspopup="dialog"` attributes
- Tutorial lightboxes must have `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to the tutorial title
```
