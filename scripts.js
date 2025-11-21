// 1. Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      // Offset for sticky nav
      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  });
});

// 1b. Mobile navigation toggle (shows nav-links on small screens)
(function setupMobileNav(){
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.getElementById('primary-nav');
  if (!toggle || !nav) return;

  // Toggle open/close
  toggle.addEventListener('click', (e) => {
    const isOpen = nav.classList.toggle('open');
    nav.setAttribute('aria-hidden', (!isOpen).toString());
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu when a nav link is clicked (for single-page anchors)
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      if (nav.classList.contains('open')) {
        nav.classList.remove('open');
        nav.setAttribute('aria-hidden', 'true');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Close when clicking outside the nav when it's open
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

// 4. Project link handling (logos / titles)
function showToast(message, type = 'success', timeout = 3500) {
  // global toast utility (safe to call multiple times)
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

const projectsGrid = document.querySelector('.projects-grid');
if (projectsGrid) {
  projectsGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.project-card');
    if (!card) return;

    const name = card.dataset.name || card.querySelector('h3')?.textContent || 'Project';
    const url = card.dataset.url;
    const isPrivate = card.dataset.private === 'true';

    if (isPrivate) {
      showToast('Private client project — contact for details', 'error');
      return;
    }

    if (url) {
      showToast(`Opening ${name} — opens in new tab`, 'success', 1600);
      window.open(url, '_blank', 'noopener');
      return;
    }

    showToast('Link not available — coming soon', 'error');
  });
}

// Contact icon click handling (GitHub / LinkedIn)
document.querySelectorAll('a.contact-link').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = (a.getAttribute('href') || '').trim();
    const name = a.dataset.name || a.getAttribute('aria-label') || 'Link';

    // If href is not set or is '#', show informational toast
    if (!href || href === '#') {
      e.preventDefault();
      showToast(`${name} link not configured yet`, 'error');
      return;
    }

    // Otherwise open in new tab and show a toast
    e.preventDefault();
    showToast(`Opening ${name} — opens in new tab`, 'success', 1400);
    window.open(href, '_blank', 'noopener');
  });
});

// 2. Form Handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  // helper: show a small toast message
  function showToast(message, type = 'success', timeout = 3500) {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = message;
    t.addEventListener('click', () => t.remove());
    document.body.appendChild(t);
    // remove after timeout
    setTimeout(() => {
      t.style.opacity = '0';
      setTimeout(() => t.remove(), 300);
    }, timeout);
  }

  contactForm.addEventListener('submit', async function (e) {
    const action = (this.getAttribute('action') || '').trim();

    // If posting to Formspree: intercept and POST via fetch to avoid navigation
    if (action && action.includes('formspree.io')) {
      e.preventDefault();

      const btn = this.querySelector('button[type="submit"]') || this.querySelector('button');
      const originalText = btn ? btn.innerText : '';
      if (btn) { btn.innerText = 'Sending...'; btn.disabled = true; }

      // Build FormData (Formspree accepts form data) and request JSON response
      const formData = new FormData(this);

      try {
        const res = await fetch(action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });

        if (res.ok) {
          showToast('Message sent — thanks! I will get back to you shortly.', 'success');
          this.reset();
        } else {
          // Try to parse JSON error from Formspree
          let errText = 'Failed to send message';
          try { const j = await res.json(); if (j && j.error) errText = j.error; } catch(_) {}
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

    // Otherwise handle via fetch to backend API (JSON). Prevent default navigation.
    e.preventDefault();

    const btn = this.querySelector('button[type="submit"]') || this.querySelector('button');
    const originalText = btn ? btn.innerText : '';
    if (btn) { btn.innerText = 'Sending...'; btn.disabled = true; }

    const data = {
      name: this.name && this.name.value || '',
      email: this.email && this.email.value || '',
      subject: this.subject && this.subject.value || '',
      message: this.message && this.message.value || ''
    };

    if (!data.name || !data.email || !data.message) {
      showToast('Please fill name, email and message.', 'error');
      if (btn) { btn.innerText = originalText; btn.disabled = false; }
      return;
    }

    const postUrl = action || '/api/contact/';

    try {
      const res = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error('Network response not ok');

      showToast(`Thanks ${data.name}! Your message was sent.`, 'success');
      this.reset();

    } catch (err) {
      console.error(err);
      showToast('Something went wrong sending the message.', 'error');
    } finally {
      setTimeout(() => {
        if (btn) { btn.innerText = originalText; btn.disabled = false; }
      }, 1200);
    }
  });
}

// 3. Intersection Observer for Scroll Animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show-element');
      observer.unobserve(entry.target); // Only animate once
    }
  });
}, observerOptions);

document.querySelectorAll('.hidden-element').forEach((el) => {
  observer.observe(el);
});