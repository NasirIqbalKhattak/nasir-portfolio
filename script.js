// Smooth scroll for internal navigation
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const href = a.getAttribute('href');
  if (href === '#' || href === '') return;
  const el = document.querySelector(href);
  if (el) {
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', href);
  }
});

// Reveal elements on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// small entrance for logo
window.addEventListener('load', () => {
  const logo = document.querySelector('.logo img');
  if (logo) {
    logo.style.transform = 'translateY(-6px)';
    setTimeout(() => { logo.style.transform = ''; }, 800);
  }
});

// Mobile nav toggle
const menuToggle = document.getElementById('menu-toggle');
const headerInner = document.querySelector('.header-inner');
if (menuToggle && headerInner) {
  menuToggle.addEventListener('click', () => {
    const open = headerInner.classList.toggle('nav-open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Close menu when a link is clicked
  document.querySelectorAll('.links-list a').forEach(a => {
    a.addEventListener('click', () => {
      if (headerInner.classList.contains('nav-open')) {
        headerInner.classList.remove('nav-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!headerInner.contains(e.target) && headerInner.classList.contains('nav-open')) {
      headerInner.classList.remove('nav-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// Open Gmail compose when clicking email links (fallback keeps mailto)
document.querySelectorAll('.email-link').forEach(a => {
  a.addEventListener('click', (e) => {
    // prefer Gmail web compose in new tab
    const email = a.dataset.email || a.getAttribute('href').replace('mailto:', '');
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
    // Try to open Gmail in new tab; if popup blocked user can still use mailto
    window.open(gmailUrl, '_blank');
    e.preventDefault();
  });
});

// Phone popover: show WhatsApp or Call options
let activePopover = null;
function createPopover() {
  const pop = document.createElement('div');
  pop.className = 'phone-popover hidden';
  pop.innerHTML = `
    <button class="whatsapp" type="button">Message (WhatsApp)</button>
    <div class="sep"></div>
    <button class="call" type="button">Call</button>
  `;
  document.body.appendChild(pop);
  return pop;
}

const popover = createPopover();

document.querySelectorAll('.phone-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const phone = link.dataset.phone || link.getAttribute('href').replace('tel:', '');
    // position popover next to link
    const rect = link.getBoundingClientRect();
    popover.style.top = `${rect.bottom + window.scrollY + 8}px`;
    popover.style.left = `${Math.min(rect.left + window.scrollX, window.innerWidth - 220)}px`;
    popover.classList.remove('hidden');
    activePopover = { popover, phone };
  });
});

document.addEventListener('click', (e) => {
  if (!activePopover) return;
  const pop = activePopover.popover;
  const phone = activePopover.phone;
  if (pop.contains(e.target)) {
    if (e.target.closest('button.whatsapp')) {
      const num = phone.replace(/[^0-9+]/g, '');
      const wa = `https://wa.me/${num.replace(/^\+/, '')}`;
      window.open(wa, '_blank');
      pop.classList.add('hidden');
      activePopover = null;
      return;
    }
    if (e.target.closest('button.call')) {
      window.location.href = `tel:${phone}`;
      pop.classList.add('hidden');
      activePopover = null;
      return;
    }
  }
  // click outside -> hide
  if (!e.target.closest('.phone-link')) {
    pop.classList.add('hidden');
    activePopover = null;
  }
});
