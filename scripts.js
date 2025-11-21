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

// 2. Form Handling
const contactForm = document.getElementById('contact-form');
if(contactForm) {
  contactForm.addEventListener('submit', function(e){
    e.preventDefault();
    
    // Basic validation simulation
    const btn = this.querySelector('button');
    const originalText = btn.innerText;
    
    btn.innerText = 'Sending...';
    btn.disabled = true;

    // Simulate network request
    setTimeout(() => {
      alert(`Thanks! I've received your message and will get back to you at ${this.email.value}.`);
      this.reset();
      btn.innerText = 'Message Sent';
      btn.style.backgroundColor = '#10b981'; // Green success
      btn.style.borderColor = '#10b981';
      
      setTimeout(() => {
        btn.innerText = originalText;
        btn.disabled = false;
        btn.style.backgroundColor = ''; // Reset to CSS default
        btn.style.borderColor = '';
      }, 3000);
    }, 1500);
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