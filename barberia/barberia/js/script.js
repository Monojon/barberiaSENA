// Simple UI helpers for mobile menu and small parallax
document.addEventListener('DOMContentLoaded', function () {
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu  = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-close');
  const yearSpan = document.getElementById('year');

  // year in footer
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // open
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.add('open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  }
  if (mobileClose && mobileMenu) {
    mobileClose.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  }

  // close on click outside (mobile)
  mobileMenu.addEventListener('click', function (ev) {
    if (ev.target === mobileMenu) {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });

  // small parallax: hero background movement
  const hero = document.getElementById('hero');
  if (hero) {
    window.addEventListener('scroll', function () {
      const scrolled = window.scrollY;
      // subtle translation for background
      hero.style.backgroundPosition = `center ${Math.max(-20, -scrolled * 0.12)}px`;
    });
  }
});
