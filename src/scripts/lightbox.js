window.LightboxModule = (function() {
  function init() {
    var overlay = document.getElementById('tutorial-overlay');
    if (!overlay) return;

    function openTutorial(key) {
      var tutorial = window.ClinicalTutorials && window.ClinicalTutorials[key];
      if (!tutorial) { console.warn('Tutorial not found:', key); return; }
      document.getElementById('tutorial-title').textContent = tutorial.title;
      var cat = document.getElementById('tutorial-category');
      cat.textContent = tutorial.category;
      cat.style.background = tutorial.categoryColor || '#2E86AB';
      document.getElementById('tutorial-body').innerHTML = tutorial.body;
      document.getElementById('tutorial-source').textContent = tutorial.source || '';
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      var closeBtn = overlay.querySelector('.tutorial-close');
      if (closeBtn) closeBtn.focus();
    }

    function closeTutorial() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      if (window._lastTutorialTrigger) window._lastTutorialTrigger.focus();
    }

    document.addEventListener('click', function(e) {
      var trigger = e.target.closest('[data-tutorial]');
      if (trigger) {
        window._lastTutorialTrigger = trigger;
        openTutorial(trigger.dataset.tutorial);
      }
    });

    var closeBtn = overlay.querySelector('.tutorial-close');
    if (closeBtn) closeBtn.addEventListener('click', closeTutorial);
    var closeBtnBottom = overlay.querySelector('.tutorial-close-btn');
    if (closeBtnBottom) closeBtnBottom.addEventListener('click', closeTutorial);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeTutorial(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeTutorial(); });
  }

  return { init: init };
})();

document.addEventListener('DOMContentLoaded', function() { LightboxModule.init(); });
