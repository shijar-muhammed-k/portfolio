
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
  const track = document.querySelector('.skills-horizontal-track') || document.getElementById('skills');
  if (!slider || !track) return;

  let ticking = false;

  function updateScroll() {
    ticking = false;
    if (window.innerWidth <= 900) {
      slider.style.transform = '';
      return;
    }

    const rect = track.getBoundingClientRect();
    const trackHeight = track.offsetHeight;
    const windowHeight = window.innerHeight;

    // Start horizontal translation when section hits sticky position (80px top nav height)
    const stickyStart = 80;
    const scrollDistance = -rect.top + stickyStart;
    const maxScroll = trackHeight - windowHeight + stickyStart;

    if (maxScroll <= 0) return;

    let fraction = scrollDistance / maxScroll;
    fraction = Math.min(Math.max(fraction, 0), 1);

    // Scrollable distance left of the screen width bounds
    const maxTranslate = slider.scrollWidth - window.innerWidth + 80;
    if (maxTranslate > 0) {
      const translateX = -fraction * maxTranslate;
      slider.style.transform = `translateX(${translateX}px)`;
    }
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateScroll);
  updateScroll();
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

    // Extended project details lookup
    const projectDetailsMap = {
      'Reverse Vending Collector (RVC)': {
        desc: 'Refactored Angular management systems using Standalone Components, reusable components and Reactive Forms. Developed scalable Angular dashboards and management interfaces for monitoring operational data with optimized caching strategies and standardized reusable UI services.',
        bullets: [
          'Refactored Angular management systems using Standalone Components, reusable components and Reactive Forms.',
          'Developed scalable Angular dashboards and management interfaces for monitoring operational data.',
          'Implemented optimized caching strategies to reduce redundant API requests and improve application responsiveness.',
          'Integrated frontend workflows with REST APIs for real-time operational data.',
          'Improved maintainability by standardizing reusable UI components and application-level services.'
        ]
      },
      'SRNPack (Statiegeld Nederlands)': {
        desc: 'Enterprise monitoring dashboards for operational reporting and system monitoring in the Netherlands circular recycling ecosystem. Optimized API integration and frontend data handling to minimize redundant server requests.',
        bullets: [
          'Developed scalable Angular monitoring dashboards for operational reporting and system monitoring.',
          'Optimized API integration and frontend data handling to reduce unnecessary server requests.',
          'Created reusable Angular data modules and UI components for consistent functionality across deployments.',
          'Implemented responsive interfaces and reusable form-based workflows.',
          'Worked with backend APIs to support data-driven operational workflows and reporting.'
        ]
      },
      'SmartLearn LMS': {
        desc: 'Feature-rich enterprise Learning Management System built with Angular and REST APIs, supporting multi-tier role-based access control and real-time user management.',
        bullets: [
          'Developed a feature-rich Learning Management System using Angular and REST APIs.',
          'Implemented role-based access control (RBAC) and secure application workflows.',
          'Developed reusable Angular components, Reactive Forms, services and route guards.',
          'Integrated frontend functionality with backend APIs for user management, course management and reporting.',
          'Designed responsive interfaces for different user roles and screen sizes.'
        ]
      },
      'StreamItNow': {
        desc: 'High-traffic live streaming web application for content creators and online events, with custom video canvas rendering and Picture-in-Picture support.',
        bullets: [
          'Developed Angular-based web application functionality for a streaming platform supporting content creators and online events.',
          'Integrated frontend applications with REST APIs for event management, user workflows and payment functionality.',
          'Implemented reusable UI components and responsive layouts.',
          'Worked on live-streaming functionality including Canvas rendering and Picture-in-Picture (PiP).',
          'Optimized frontend workflows to improve usability and performance during high-traffic events.'
        ]
      }
    };

    // Resolve description & bullet text
    let descText = card.querySelector('p')?.textContent || '';
    let bulletsHTML = '';

    const matchedKey = Object.keys(projectDetailsMap).find(k => name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase()));
    if (matchedKey && projectDetailsMap[matchedKey]) {
      const match = projectDetailsMap[matchedKey];
      descText = match.desc;
      if (match.bullets && match.bullets.length > 0) {
        bulletsHTML = `
          <div class="modal-info-panel" style="margin-top: 16px;">
            <div class="modal-info-title">⚡ Key Engineering Highlights</div>
            <ul style="margin: 0; padding-left: 20px; color: var(--dark-text-muted); font-size: 0.9rem; line-height: 1.6;">
              ${match.bullets.map(b => `<li style="margin-bottom: 6px;">${b}</li>`).join('')}
            </ul>
          </div>
        `;
      }
    } else if (!descText) {
      const gridCard = document.querySelector(`.project-card[data-name="${name}"]`);
      if (gridCard) {
        descText = gridCard.querySelector('p')?.textContent || '';
      }
    }

    // Resolve tags
    let tagsHTML = '';
    const tagElements = card.querySelectorAll('.tag, .slide-info span');
    if (tagElements.length > 0) {
      tagElements.forEach(t => {
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
    const monogramEl = card.querySelector('.project-logo-monogram');
    if (logoImg) {
      const artAlt = logoImg.alt || 'Logo';
      const needFilter = artAlt === 'WB' || artAlt === 'TNF' || artAlt === 'FF' || artAlt === 'WD';
      logoHTML = `<img src="${logoImg.src}" alt="${artAlt}" style="${needFilter ? 'filter: invert(1);' : ''}">`;
    } else if (monogramEl) {
      logoHTML = `<div class="modal-logo-initials">${monogramEl.textContent.trim()}</div>`;
    } else {
      logoHTML = `<div class="modal-logo-initials">${name.substring(0, 3)}</div>`;
    }

    let statusBadge = '';
    let explanationHTML = '';

    if (isPrivate) {
      statusBadge = '<span class="modal-status-badge private">Enterprise / NDA Protected</span>';
      explanationHTML = `
        <div class="modal-info-panel">
          <div class="modal-info-title">🔒 Enterprise Project</div>
          <div class="modal-info-text">
            This project is part of proprietary client/enterprise solutions. Source code, production endpoints, and customer data are secured under non-disclosure. Reach out to discuss architectural patterns, state strategies, and performance gains.
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
      statusBadge = '<span class="modal-status-badge private">Showcase Project</span>';
      explanationHTML = `
        <div class="modal-info-panel">
          <div class="modal-info-title">📂 Technical Walkthrough</div>
          <div class="modal-info-text">
            Interested in a detailed walkthrough of this project's architecture, UI state models, or REST integration patterns? Let's connect!
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
      ${bulletsHTML}
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