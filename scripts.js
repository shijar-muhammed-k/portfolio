
// ==========================================
// 2. Custom Cursor Trail
// ==========================================
(function setupCustomCursor() {
  const cursorDot = document.getElementById('custom-cursor-dot');
  const cursorRing = document.getElementById('custom-cursor');
  
  if (!cursorDot || !cursorRing) return;

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;
  let isMoving = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
    
    if (!isMoving) {
      cursorRing.style.opacity = '1';
      cursorDot.style.opacity = '1';
      isMoving = true;
    }
  });

  function animateRing() {
    const easing = 0.15;
    ringX += (mouseX - ringX) * easing;
    ringY += (mouseY - ringY) * easing;
    
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Highlight cursor when hovering over interactive elements
  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    if (
      target.closest('a') || 
      target.closest('button') || 
      target.closest('.project-card') || 
      target.closest('input') || 
      target.closest('textarea') || 
      target.closest('.contact-link') ||
      target.closest('.modal-close-btn')
    ) {
      cursorRing.classList.add('hovering');
    } else {
      cursorRing.classList.remove('hovering');
    }
  });

  document.addEventListener('mouseleave', () => {
    cursorRing.style.opacity = '0';
    cursorDot.style.opacity = '0';
    isMoving = false;
  });
})();


// ==========================================
// 3. Horizontal Scroll Translation Link
// ==========================================
(function setupHorizontalScroll() {
  const slider = document.querySelector('.designs-scroll-wrapper');
  const section = document.getElementById('skills');
  if (!slider || !section) return;

  window.addEventListener('scroll', () => {
    if (window.innerWidth <= 900) {
      slider.style.transform = '';
      return;
    }

    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight;
    const windowHeight = window.innerHeight;

    // Start horizontal translation when section hits sticky position (80px top)
    const stickyStart = 80;
    const scrollDistance = -rect.top + stickyStart;
    const maxScroll = sectionHeight - windowHeight + stickyStart;

    let fraction = scrollDistance / maxScroll;
    fraction = Math.min(Math.max(fraction, 0), 1);

    // Scrollable distance left of the screen width bounds
    const maxTranslate = slider.scrollWidth - window.innerWidth + 80;
    if (maxTranslate > 0) {
      const translateX = -fraction * maxTranslate;
      slider.style.transform = `translateX(${translateX}px)`;
    }
  });
})();


// ==========================================
// 4. Dynamic 3D Card Tilt Effect
// ==========================================
(function setup3DTilt() {
  const tiltCards = document.querySelectorAll('.project-card, .design-slide-card');
  
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((centerY - y) / centerY) * 6; // max 6 deg
      const rotateY = ((x - centerX) / centerX) * 6;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.015)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });
})();


// ==========================================
// 5. Global Toast Utility
// ==========================================
function showToast(message, type = 'success', timeout = 3200) {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = message;
  t.addEventListener('click', () => t.remove());
  document.body.appendChild(t);
  
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 300);
  }, timeout);
}


// ==========================================
// 6. Project Cards Details & Modals
// ==========================================
(function setupProjectModals() {
  const modalOverlay = document.getElementById('project-modal');
  const modalBody = modalOverlay?.querySelector('.modal-body-content');
  const modalCloseBtn = modalOverlay?.querySelector('.modal-close-btn');

  if (!modalOverlay || !modalBody) return;

  // Intercept click events anywhere on document to cover cards
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.project-card');
    if (!card) return;

    const name = card.dataset.name || card.querySelector('h3, h4')?.textContent || 'Project';
    const url = card.dataset.url;
    const isPrivate = card.dataset.private === 'true';
    const isOnProgress = card.dataset.onprogress === 'true';

    // Redirect to live URL if applicable and normal
    if (url && !isPrivate && !isOnProgress) {
      showToast(`Opening ${name} — opens in a new tab`, 'success', 1500);
      window.open(url, '_blank', 'noopener');
      return;
    }

    // Resolve description text
    let descText = card.querySelector('p')?.textContent || '';
    if (!descText) {
      const gridCard = document.querySelector(`.project-card[data-name="${name}"]`);
      if (gridCard) {
        descText = gridCard.querySelector('p')?.textContent || '';
      } else {
        // Mock default copy for slide items
        if (name.includes('Woodsman Decor Bali')) {
          descText = 'A modern web platform built for an international sustainable furniture brand in Bali. Developed to deliver a premium showcase with custom layout components.';
        } else if (name.includes('Tryon Fitness')) {
          descText = 'A premium digital experience and layout system designed for high-end fitness clubs, prioritizing custom interactions and bookings.';
        } else if (name.includes('Woodsman Decor')) {
          descText = 'A premium e-commerce and furniture showroom website tailored for the Indian luxury interior design market.';
        } else {
          descText = 'A digital layout concept designed to elevate usability, focus visual structure, and simplify core client requirements.';
        }
      }
    }

    // Resolve tags
    let tagsHTML = '';
    const tagElements = card.querySelectorAll('.tag, .slide-info span');
    if (tagElements.length > 0) {
      tagElements.forEach(t => {
        // Clean tag strings if they come from the slider description
        const tags = t.textContent.split('·').map(str => str.trim());
        tags.forEach(tag => {
          if (tag && !tag.includes('In Development') && !tag.includes('In Progress') && !tag.includes('NDA')) {
            tagsHTML += `<span class="modal-tag">${tag}</span>`;
          }
        });
      });
    }

    // Resolve Logo
    let logoHTML = '';
    const logoImg = card.querySelector('.project-logo img, .slide-img-box img');
    if (logoImg) {
      const artAlt = logoImg.alt || 'Logo';
      const needFilter = artAlt === 'WB' || artAlt === 'TNF' || artAlt === 'FF' || artAlt === 'WD';
      logoHTML = `<img src="${logoImg.src}" alt="${artAlt}" style="${needFilter ? 'filter: invert(1);' : ''}">`;
    } else {
      logoHTML = `<div class="modal-logo-initials">${name.substring(0, 2)}</div>`;
    }

    let statusBadge = '';
    let explanationHTML = '';

    if (isPrivate) {
      statusBadge = '<span class="modal-status-badge private">NDA Protected</span>';
      explanationHTML = `
        <div class="modal-info-panel">
          <div class="modal-info-title">🔒 Corporate Client Project</div>
          <div class="modal-info-text">
            This project is protected under non-disclosure terms. The source code, repository layout, and live environment credentials are kept private. For discussions on technical patterns used, feel free to reach out.
          </div>
        </div>
      `;
    } else if (isOnProgress) {
      statusBadge = '<span class="modal-status-badge in-progress">In Development</span>';
      explanationHTML = `
        <div class="modal-info-panel">
          <div class="modal-info-title">🚧 Active Build</div>
          <div class="modal-info-text">
            This platform is currently undergoing visual layout polishing and final system configurations. A public URL will be published as soon as the initial launch phase concludes!
          </div>
        </div>
      `;
    } else {
      statusBadge = '<span class="modal-status-badge private">Protected Prototype</span>';
      explanationHTML = `
        <div class="modal-info-panel">
          <div class="modal-info-title">📂 Concept Mockup</div>
          <div class="modal-info-text">
            This system design is hosted internally. If you would like to request a screen walkthrough or code outline, click below.
          </div>
        </div>
      `;
    }

    modalBody.innerHTML = `
      <div class="modal-header-section">
        <div class="modal-logo">
          ${logoHTML}
        </div>
        <div class="modal-header-text">
          <h3>${name.toUpperCase()}</h3>
          ${statusBadge}
        </div>
      </div>
      <div class="modal-desc">${descText}</div>
      ${explanationHTML}
      <div class="modal-tags">
        ${tagsHTML}
      </div>
      <div class="modal-footer-btns">
        <button class="btn btn-primary modal-contact-btn">Send a Message</button>
        <button class="btn btn-outline modal-cancel-btn">Back to Portfolio</button>
      </div>
    `;

    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Hook modal control elements
    const contactBtn = modalBody.querySelector('.modal-contact-btn');
    if (contactBtn) {
      contactBtn.addEventListener('click', () => {
        closeModal();
        setTimeout(() => {
          const contactSec = document.getElementById('contact');
          if (contactSec) {
            const offsetPosition = contactSec.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
          }
        }, 300);
      });
    }

    const cancelBtn = modalBody.querySelector('.modal-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeModal);
    }
  });

  function closeModal() {
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  modalCloseBtn?.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });
})();


// ==========================================
// 7. Smooth Scroll Anchor Links
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  });
});


// ==========================================
// 8. Mobile Menu Navigation
// ==========================================
(function setupMobileNav(){
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.getElementById('primary-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', (e) => {
    const isOpen = nav.classList.toggle('open');
    nav.setAttribute('aria-hidden', (!isOpen).toString());
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      if (nav.classList.contains('open')) {
        nav.classList.remove('open');
        nav.setAttribute('aria-hidden', 'true');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!nav.classList.contains('open')) return;
    const target = e.target;
    if (!nav.contains(target) && !toggle.contains(target)) {
      nav.classList.remove('open');
      nav.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();


// ==========================================
// 9. Navigation Height Scroll State
// ==========================================
(function setupNavState() {
  const header = document.querySelector('.nav');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
})();


// ==========================================
// 10. Contact Form Submissions Intercept
// ==========================================
(function setupContactSubmit() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    const action = (this.getAttribute('action') || '').trim();

    if (action && action.includes('formspree.io')) {
      e.preventDefault();

      const btn = this.querySelector('button[type="submit"]');
      const originalText = btn ? btn.innerText : 'Lets Connect';
      if (btn) { btn.innerText = 'Sending...'; btn.disabled = true; }

      const formData = new FormData(this);

      try {
        const res = await fetch(action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });

        if (res.ok) {
          showToast('Message sent! I will review details and get back to you.', 'success');
          this.reset();
        } else {
          let errText = 'Failed to submit message';
          try {
            const j = await res.json();
            if (j && j.error) errText = j.error;
          } catch (_) {}
          showToast(errText, 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Network error — please try again later.', 'error');
      } finally {
        if (btn) { btn.innerText = originalText; btn.disabled = false; }
      }
      return;
    }

    // Default Fallback
    e.preventDefault();
    showToast('Form Configuration is loading...', 'info');
  });
})();


// ==========================================
// 11. Intersection Observer Scroll Animations
// ==========================================
(function setupAnimations() {
  const observerOptions = {
    threshold: 0.05,
    rootMargin: "0px 0px -20px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show-element');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.hidden-element').forEach((el) => {
    observer.observe(el);
  });
})();