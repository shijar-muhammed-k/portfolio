
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
// 5.5. Project Categorization & Filtering
// ==========================================
(function setupProjectFiltering() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const projectCards = document.querySelectorAll('.project-card');

  if (!filterTabs.length || !projectCards.length) return;

  function updateStagger() {
    if (window.innerWidth <= 900) {
      projectCards.forEach(c => c.classList.remove('stagger-even'));
      return;
    }
    const visibleCards = Array.from(projectCards).filter(c => !c.classList.contains('is-hidden'));
    visibleCards.forEach((card, idx) => {
      if (idx % 2 === 1) {
        card.classList.add('stagger-even');
      } else {
        card.classList.remove('stagger-even');
      }
    });
  }

  // Initial stagger alignment
  updateStagger();
  window.addEventListener('resize', updateStagger);

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterCategory = tab.dataset.filter || 'all';

      projectCards.forEach(card => {
        const cardCategory = card.dataset.category;
        if (filterCategory === 'all' || cardCategory === filterCategory) {
          card.classList.remove('is-hidden');
        } else {
          card.classList.add('is-hidden');
        }
      });

      updateStagger();
    });
  });
})();


// ==========================================
// 6. Project Cards Details & Modals
// ==========================================
(function setupProjectModals() {
  const modalOverlay = document.getElementById('project-modal');
  const modalBody = modalOverlay?.querySelector('.modal-body-content');
  const modalCloseBtn = modalOverlay?.querySelector('.modal-close-btn');

  if (!modalOverlay || !modalBody) return;

  // Extended project details lookup for all production & case-study projects
  const projectDetailsMap = {
    'Reverse Vending Collector (RVC)': {
      category: 'Enterprise Application',
      stack: ['Angular 18+', 'Standalone Components', 'Signals', 'Reactive Forms', 'REST APIs', 'TypeScript'],
      status: 'Enterprise · Active',
      statusType: 'enterprise',
      problem: 'Managing and monitoring dispersed fleets of automated reverse vending recycling machines required low-latency operational dashboards, real-time telemetry, and resilient client-side state.',
      bullets: [
        'Refactored enterprise Angular management architecture using Standalone Components and reactive Signals, streamlining change detection performance and dependency injection.',
        'Engineered high-throughput operational monitoring dashboards with dynamic multi-parameter filtering and live status tracking.',
        'Implemented client-side caching strategies and HTTP interceptors to eliminate redundant polling requests and decrease network overhead.',
        'Developed reusable Reactive Forms with strict validation schemas for machine telemetry, device configuration, and firmware tracking.',
        'Standardized shared UI services and layout modules across multiple enterprise management sub-applications.'
      ]
    },
    'SRNPack (Statiegeld Nederlands)': {
      category: 'Enterprise Application',
      stack: ['Angular', 'RxJS', 'REST APIs', 'Enterprise Dashboards', 'Performance Profiling'],
      status: 'Enterprise · Active',
      statusType: 'enterprise',
      problem: 'Operational reporting and audit tracking for the national deposit return recycling network in the Netherlands, processing millions of packaging records requiring real-time visibility.',
      metric: 'Verified 37.5% reduction in DOMContentLoaded (lowered from 4.0s to 2.5s) via route-level code splitting, asset payload optimization, and RxJS subscription optimization.',
      bullets: [
        'Achieved verified 37.5% reduction in DOMContentLoaded (lowered from 4.0s to 2.5s) through stream restructuring, targeted lazy loading, and asset payload optimization.',
        'Developed scalable enterprise monitoring dashboards for operational reporting and real-time state metrics across the national recycling network.',
        'Streamlined data handling using RxJS pipelines (switchMap, debounceTime, shareReplay) to eliminate duplicate server requests under heavy concurrent reporting.',
        'Created standardized, reusable Angular data table modules and form workflows deployed across multiple operational hubs.',
        'Integrated complex backend REST API contracts to reliably deliver multi-region auditing telemetry.'
      ]
    },
    'SmartLearn LMS': {
      category: 'Enterprise Application',
      stack: ['Angular', 'Reactive Forms', 'Route Guards', 'RBAC', 'REST APIs', 'TypeScript'],
      status: 'Enterprise LMS',
      statusType: 'enterprise',
      problem: 'Educational institutions and corporate training entities needed a secure, role-delineated learning management system for curriculum delivery, assessment tracking, and administrative governance.',
      bullets: [
        'Engineered multi-tier Role-Based Access Control (RBAC) supporting Administrators, Instructors, and Students with fine-grained route guards.',
        'Built complex Reactive Forms for course creation, assignment evaluation, and assessment submission with dynamic validation rules.',
        'Implemented HTTP Interceptors for seamless JWT token attachment, automated token refreshing, and centralized error handling.',
        'Designed responsive, accessible desktop and tablet interfaces ensuring consistent accessibility across interactive study modules.',
        'Integrated frontend functionality with backend RESTful APIs for user provisioning, course catalog management, and student performance reporting.'
      ]
    },
    'StreamItNow': {
      category: 'Enterprise Application',
      stack: ['Angular', 'HTML5 Canvas', 'Picture-in-Picture (PiP)', 'REST APIs', 'Payment Gateways'],
      status: 'Live Streaming',
      statusType: 'enterprise',
      problem: 'High-traffic live video streaming platform requiring low-latency interactive overlays, continuous playback during user navigation, and integrated pay-per-view monetization.',
      bullets: [
        'Engineered HTML5 Canvas rendering engine for dynamic video watermarking, interactive branding, and graphic overlays during live broadcasts.',
        'Implemented native Picture-in-Picture (PiP) APIs allowing continuous, uninterrupted video playback while users browse schedules and chats.',
        'Optimized high-concurrency client state handling and event-driven data flows to prevent UI frame drops during spike traffic events.',
        'Integrated secure payment gateway workflows for real-time ticket purchases, subscription passes, and creator tipping.',
        'Built modular, reusable video control UI components and responsive viewer layouts across mobile and desktop viewports.'
      ]
    },
    'Visitor Registration & Management System': {
      category: 'Enterprise Application',
      stack: ['Angular', 'Django REST Framework', 'PostgreSQL', 'Docker', 'Role-Based Access'],
      status: 'Enterprise · Completed',
      statusType: 'completed',
      problem: 'Enterprise facilities required a secure, digital on-premise visitor registration and compliance tracking system to replace paper visitor logs and ensure physical facility security standards.',
      bullets: [
        'Developed responsive Angular visitor registration interface with multi-step visitor onboarding, dynamic host lookup, and digital badge generation.',
        'Implemented secure Django REST Framework backend APIs for visitor identity verification, check-in/check-out timestamps, and NDA acknowledgment.',
        'Designed normalized PostgreSQL database schema with indexed audit logs, security compliance tracking, and visit history queries.',
        'Configured containerized Docker environment ensuring consistent production deployment, volume persistence, and simplified database backups.',
        'Integrated role-based security ensuring receptionist, security personnel, and facility administrator permission delineation.'
      ]
    },
    'IndApp': {
      category: 'Full-Stack Application',
      stack: ['Angular', 'Django REST Framework', 'PostgreSQL', 'Docker', 'Nginx', 'JWT & RBAC'],
      status: 'Full-Stack Platform',
      statusType: 'fullstack',
      problem: 'Organizations required a unified, secure platform for business registration, verified approvals, enterprise directory search, community interaction, and cross-organization financial referral requests.',
      bullets: [
        'Full-Stack Architecture: Engineered scalable Angular frontend application integrated with robust Django REST Framework backend and PostgreSQL database.',
        'Authentication & Authorization: Implemented multi-role authentication and authorization with role-based privileges, secure password creation flows, and zone-based administrative hierarchy.',
        'Business Onboarding & Approvals: Developed multi-step business registration and administrative approval workflows with document verification states.',
        'Product Management & Search: Built comprehensive product catalog management with full-text search, category filtering, and inventory tracking.',
        'Community & Social Engagement: Engineered interactive community feed supporting posts, media uploads, likes, and nested threaded comments.',
        'Business Referrals & Loan Requests: Built secure financial referral workflows and institutional loan request application tracking.',
        'DevOps & Containerization: Configured containerized Docker development and deployment environments with Nginx reverse proxy, static file routing, and SSL termination.'
      ]
    },
    'VEB — Business and RFQ Management Platform': {
      category: 'Full-Stack Application',
      stack: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Docker Compose', 'REST APIs'],
      status: 'In Development / Prototype',
      statusType: 'in-progress',
      problem: 'B2B organizations need a centralized digital platform to manage organizational profiles and streamline Request for Quotation (RFQ) procurement workflows.',
      bullets: [
        'Architecture & Data Modeling: Designing relational PostgreSQL schemas using Django ORM to model multi-tier organizations, vendors, and RFQ document lifecycles.',
        'RFQ Workflows: Developing structured RFQ submission, quotation bidding, status tracking, and vendor response pipelines.',
        'Database Engineering: Handled schema migrations, data consistency constraints, and resolved complex database migration dependency conflicts.',
        'Containerized Development: Set up isolated, reproducible multi-container environments using Docker and Docker Compose for Django, PostgreSQL, and background task workers.',
        'Backend API Design: Created modular RESTful endpoints adhering to REST principles with structured JSON error responses.'
      ]
    },
    'Stock Checker — Inventory Management System': {
      category: 'Full-Stack Application',
      stack: ['Angular', 'Firebase', 'Excel Import/Export (XLSX)', 'Reactive Forms'],
      status: 'Completed Project',
      statusType: 'completed',
      problem: 'Multi-vendor retail operations needed a flexible, real-time inventory tracking system capable of ingesting vendor spreadsheets across diverse formats and synchronizing stock counts instantly.',
      bullets: [
        'Client-Side Spreadsheet Processing: Engineered robust Excel file parsing and export engine supporting multiple spreadsheet formats (.xlsx, .xls, .csv) with schema validation and error flagging.',
        'Multi-Vendor Catalog: Built dynamic product categorization, SKU search, vendor filtering, and real-time stock alert thresholds.',
        'Cloud Real-Time Database: Integrated Firebase for live synchronization of inventory updates across multiple concurrent terminal sessions.',
        'User & Role Management: Implemented role-based access for warehouse staff, store managers, and vendors to prevent unauthorized stock alterations.',
        'Reactive UI: Built with Angular Reactive Forms, custom debounced search pipelines, and responsive data tables.'
      ]
    },
    'Fund Transfer Platform': {
      category: 'Full-Stack Application',
      stack: ['Angular', 'Flask', 'Python', 'MySQL', 'REST APIs', 'Ledger Security'],
      status: 'Financial Web App',
      statusType: 'fullstack',
      problem: 'Secure internal fund movements, wallet-based transfers, and auditable financial transactions requiring strict data integrity and administrative transparency.',
      bullets: [
        'Engineered Angular financial dashboard with transaction wizards, dynamic validation, and real-time transfer confirmation dialogs.',
        'Built Python/Flask RESTful backend services implementing atomic database transactions in MySQL to guarantee balance integrity.',
        'Designed double-entry transaction ledgers ensuring complete mathematical auditability and tamper detection.',
        'Implemented administrative dispute investigation interfaces, statement generation, and filtered transaction export.',
        'Applied role-based authorization ensuring separation of duty between customer wallets and administrative treasury functions.'
      ]
    },
    'TrackNFit': {
      category: 'Full-Stack Application',
      stack: ['Angular', 'Django', 'WebRTC', 'MySQL', 'REST APIs'],
      status: 'HealthTech App',
      statusType: 'fullstack',
      problem: 'Fitness centers and independent personal trainers required a unified platform to manage client schedules, track training progress, and conduct live one-on-one virtual coaching sessions.',
      bullets: [
        'Integrated WebRTC peer-to-peer real-time video streaming for interactive live coaching sessions directly inside the browser without third-party plugins.',
        'Developed Django REST Framework backend APIs for appointment booking, workout regimen assignments, and biometric progress logging.',
        'Implemented MySQL relational schemas storing client health histories, trainer availability schedules, and session logs.',
        'Built responsive Angular client portal featuring interactive calendars, workout charts, and push notifications.',
        'Handled video stream renegotiation, connection fallback states, and microphone/camera permission flows.'
      ]
    },
    'ForgeFit': {
      category: 'Websites & E-Commerce',
      stack: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Web Performance'],
      status: 'Live Production',
      statusType: 'live',
      url: 'https://forgefit.app',
      problem: 'A modern fitness SaaS platform required a high-converting, blazing-fast landing page to drive pre-launch user acquisition and capture verified early sign-ups.',
      bullets: [
        'Developed responsive, accessible landing page using modern React and TypeScript architecture.',
        'Focused on Core Web Vitals optimization, achieving sub-second First Contentful Paint (FCP) and optimal Cumulative Layout Shift (CLS).',
        'Built seamless, validated email capture workflow integrated with mailing list APIs.',
        'Implemented modern micro-animations, accessible contrast ratios, and responsive mobile-first typography.',
        'Verified production deployment with SSL/TLS and global edge CDN caching.'
      ]
    },
    'ShopizStore': {
      category: 'Websites & E-Commerce',
      stack: ['Shopify', 'Liquid', 'JavaScript', 'E-Commerce Architecture'],
      status: 'Live Production',
      statusType: 'live',
      url: 'https://www.shopizstore.com/',
      problem: 'Consumer tech accessories brand needed a high-performance e-commerce storefront with intuitive navigation across hundreds of phone cases, desk pads, and accessories.',
      bullets: [
        'Developed custom Shopify Liquid theme templates optimized for high conversion and quick mobile checkout.',
        'Built faceted product filtering (device model, color, material) with instant client-side updates.',
        'Integrated payment gateways, inventory management hooks, and automated shipping calculations.',
        'Optimized image assets and responsive picture elements to ensure fast page load times over mobile networks.',
        'Customized cart drawer and cross-sell recommendation engines to increase average order value (AOV).'
      ]
    },
    'Woodsman Decor': {
      category: 'Websites & E-Commerce',
      stack: ['WordPress', 'WooCommerce', 'PHP', 'MySQL', 'Custom CSS'],
      status: 'Live Production',
      statusType: 'live',
      url: 'https://woodsmandecor.com/',
      problem: 'Luxury bespoke furniture brand needed a digital showroom and e-commerce experience reflecting high-end artisanal craftsmanship for the Indian interior design market.',
      bullets: [
        'Developed custom WooCommerce showroom templates showcasing complex furniture dimensions, wood finishes, and custom order requests.',
        'Engineered high-resolution responsive image galleries with optimized lazy loading to maintain page performance.',
        'Configured secure payment gateway integration, GST invoice generation, and courier tracking updates.',
        'Customized PHP hooks and filters for tailored product attributes and customer quote inquiries.',
        'Maintained ongoing performance tuning, caching policies, and database cleanup.'
      ]
    },
    'Woodsman Decor Bali': {
      category: 'Websites & E-Commerce',
      stack: ['React', 'REST APIs', 'CSS Architecture', 'Responsive UI'],
      status: 'Prototype / Showcase',
      statusType: 'prototype',
      problem: 'An international sustainable furniture brand based in Bali, Indonesia required a modern web showcase to present eco-friendly teak and rattan collections to global interior designers.',
      bullets: [
        'Built modern React application featuring curated collection lookbooks and material provenance storytelling.',
        'Created modular layout components with fluid typography and bespoke brand aesthetic styling.',
        'Integrated RESTful product catalog feeds for real-time dimension and finish specifications.',
        'Implemented mobile-first touch carousels and full-screen gallery inspection modes.',
        'Designed lightweight architecture ensuring smooth rendering across global networks.'
      ]
    },
    'Tryon Fitness': {
      category: 'Websites & E-Commerce',
      stack: ['React', 'Modern UI/UX', 'Interactive Components'],
      status: 'Prototype / Showcase',
      statusType: 'prototype',
      problem: 'Premium boutique fitness clubs needed a digital experience communicating facility amenities, instructor credentials, and tier-based membership options.',
      bullets: [
        'Built modern React layout system prioritizing interactive member engagement and tour scheduling.',
        'Developed dynamic membership tier comparison component with interactive perk toggling.',
        'Implemented responsive class schedule views with trainer profiles and difficulty filters.',
        'Styled with fluid dark-mode visual hierarchy and modern glassmorphism UI elements.',
        'Optimized layout for mobile devices, enabling swift class booking navigation.'
      ]
    },
    'RisingRomp': {
      category: 'Websites & E-Commerce',
      stack: ['Shopify', 'Liquid', 'E-Commerce Merchandising', 'CSS3'],
      status: 'Active Store / Prototype',
      statusType: 'prototype',
      problem: 'Automotive and tech lifestyle brand needed an energetic, mobile-first storefront to showcase specialized automotive gear and premium phone accessories.',
      bullets: [
        'Engineered custom product discovery templates on Shopify with automotive model compatibility search.',
        'Implemented customer review collection widgets and verified buyer badge styling.',
        'Customized theme Liquid logic to support bundle discounts and promotional countdowns.',
        'Streamlined mobile checkout funnel, reducing abandonment rates on mobile devices.',
        'Configured Google Analytics and Meta pixel tracking for marketing campaign attribution.'
      ]
    }
  };

  // Intercept click events anywhere on document to cover cards
  document.addEventListener('click', (e) => {
    // If the click was directly on an external link action, let default anchor behavior open it
    const directLink = e.target.closest('.card-external-link');
    if (directLink) {
      return;
    }

    const card = e.target.closest('.project-card');
    if (!card) return;

    const name = card.dataset.name || card.querySelector('h3, h4')?.textContent?.trim() || 'Project';
    const cardUrl = card.dataset.url;
    const isPrivate = card.dataset.private === 'true';
    const isOnProgress = card.dataset.onprogress === 'true';

    // Extended project details lookup
    let matchedData = null;
    const matchedKey = Object.keys(projectDetailsMap).find(k => 
      name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase())
    );
    if (matchedKey && projectDetailsMap[matchedKey]) {
      matchedData = projectDetailsMap[matchedKey];
    }

    const categoryText = matchedData?.category || card.dataset.category || 'Engineering Project';
    const descText = matchedData?.problem || card.querySelector('p')?.textContent || '';
    const liveUrl = matchedData?.url || cardUrl;

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

    // Resolve Status Badge
    let statusBadge = '';
    if (liveUrl && !isPrivate && !isOnProgress) {
      statusBadge = '<span class="modal-status-badge private" style="background: rgba(230, 62, 72, 0.15); color: #ff8b92; border-color: rgba(230, 62, 72, 0.3);">🟢 Live Production</span>';
    } else if (isPrivate) {
      statusBadge = '<span class="modal-status-badge private">🔒 Enterprise / NDA Protected</span>';
    } else if (isOnProgress) {
      statusBadge = '<span class="modal-status-badge in-progress">🚧 In Development / Active Build</span>';
    } else {
      statusBadge = '<span class="modal-status-badge private">✦ Showcase Project</span>';
    }

    // Bullets HTML
    let bulletsHTML = '';
    if (matchedData?.bullets && matchedData.bullets.length > 0) {
      bulletsHTML = `
        <div class="modal-info-panel" style="margin-top: 16px;">
          <div class="modal-info-title">⚡ Key Engineering Contributions</div>
          <ul style="margin: 0; padding-left: 20px; color: var(--dark-text-muted); font-size: 0.9rem; line-height: 1.65;">
            ${matchedData.bullets.map(b => `<li style="margin-bottom: 7px;">${b}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // Metric HTML (e.g., SRNPack verified DOMContentLoaded)
    let metricHTML = '';
    if (matchedData?.metric) {
      metricHTML = `
        <div class="modal-info-panel" style="border-color: rgba(44, 209, 120, 0.3); background: rgba(44, 209, 120, 0.05); margin-top: 16px;">
          <div class="modal-info-title" style="color: #2cd178;">📈 Verified Performance Metric</div>
          <div class="modal-info-text" style="color: var(--dark-text-main); font-size: 0.92rem; font-weight: 600;">
            ${matchedData.metric}
          </div>
        </div>
      `;
    }

    // Resolve Tags
    let tagsHTML = '';
    if (matchedData?.stack && matchedData.stack.length > 0) {
      tagsHTML = matchedData.stack.map(tag => `<span class="modal-tag">${tag}</span>`).join('');
    } else {
      const tagElements = card.querySelectorAll('.tag');
      tagElements.forEach(t => {
        tagsHTML += `<span class="modal-tag">${t.textContent.trim()}</span>`;
      });
    }

    // Footer Buttons
    let footerBtnsHTML = '';
    if (liveUrl) {
      footerBtnsHTML = `
        <a href="${liveUrl}" target="_blank" rel="noopener" class="btn btn-primary modal-live-action-btn">Visit Live Website ↗</a>
        <button class="btn btn-outline modal-contact-btn">Discuss Architecture</button>
        <button class="btn btn-outline modal-cancel-btn">Back to Portfolio</button>
      `;
    } else {
      footerBtnsHTML = `
        <button class="btn btn-primary modal-contact-btn">Discuss Architecture & Details</button>
        <button class="btn btn-outline modal-cancel-btn">Back to Portfolio</button>
      `;
    }

    modalBody.innerHTML = `
      <div class="modal-header-section">
        <div class="modal-logo">
          ${logoHTML}
        </div>
        <div class="modal-header-text">
          <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--coral); font-weight: 700; margin-bottom: 4px;">
            ${categoryText}
          </div>
          <h3>${name.toUpperCase()}</h3>
          ${statusBadge}
        </div>
      </div>
      <div class="modal-desc">
        <strong style="color: var(--dark-text-main); display: block; margin-bottom: 6px;">Business Problem & Scope:</strong>
        ${descText}
      </div>
      ${metricHTML}
      ${bulletsHTML}
      <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--dark-text-muted); font-weight: 700; margin-bottom: 10px;">
        Technology Stack:
      </div>
      <div class="modal-tags">
        ${tagsHTML}
      </div>
      <div class="modal-footer-btns">
        ${footerBtnsHTML}
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