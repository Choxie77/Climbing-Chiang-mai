// Optimized initialization - batch DOM queries and use native features
document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setupContactForm();
  setupCalendar();
  setupScrollAnimations();
  setupParallaxEffect();
  setupSmoothScroll();
  setupActiveNavState();
  setupBackToTop();
});

function setupMobileNav() {
  const navToggle = document.querySelector('.nav__toggle');
  const navLinks = document.querySelector('.nav__links');
  
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', navLinks.classList.contains('is-open'));
    });
  }
}

function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const statusEl = document.getElementById('form-status');
  if (!statusEl) return;

  // Clear errors on input
  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const errorEl = document.getElementById(input.id + '-error');
      if (errorEl) {
        errorEl.textContent = '';
        input.setAttribute('aria-invalid', 'false');
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Clear previous errors
    statusEl.textContent = '';
    inputs.forEach(input => {
      const errorEl = document.getElementById(input.id + '-error');
      if (errorEl) {
        errorEl.textContent = '';
        input.setAttribute('aria-invalid', 'false');
      }
    });

    const formData = new FormData(form);
    const name = formData.get('name')?.trim() || '';
    const email = formData.get('email')?.trim() || '';
    const phone = formData.get('phone')?.trim() || '';
    const subject = formData.get('subject')?.trim() || '';
    const message = formData.get('message')?.trim() || '';

    let hasErrors = false;

    // Validate name
    if (!name) {
      const errorEl = document.getElementById('name-error');
      if (errorEl) {
        errorEl.textContent = 'Name is required.';
        document.getElementById('name').setAttribute('aria-invalid', 'true');
      }
      hasErrors = true;
    }

    // Validate email
    if (!email) {
      const errorEl = document.getElementById('email-error');
      if (errorEl) {
        errorEl.textContent = 'Email is required.';
        document.getElementById('email').setAttribute('aria-invalid', 'true');
      }
      hasErrors = true;
    } else if (!validateEmail(email)) {
      const errorEl = document.getElementById('email-error');
      if (errorEl) {
        errorEl.textContent = 'Please enter a valid email address.';
        document.getElementById('email').setAttribute('aria-invalid', 'true');
      }
      hasErrors = true;
    }

    // Validate subject
    if (!subject) {
      const errorEl = document.getElementById('subject-error');
      if (errorEl) {
        errorEl.textContent = 'Please select a subject.';
        document.getElementById('subject').setAttribute('aria-invalid', 'true');
      }
      hasErrors = true;
    }

    // Validate message
    if (!message) {
      const errorEl = document.getElementById('message-error');
      if (errorEl) {
        errorEl.textContent = 'Message is required.';
        document.getElementById('message').setAttribute('aria-invalid', 'true');
      }
      hasErrors = true;
    }

    // Validate phone (optional but must be valid if provided)
    if (phone && !/^[0-9+\-\s()]{7,}$/.test(phone)) {
      const errorEl = document.getElementById('phone-error');
      if (errorEl) {
        errorEl.textContent = 'Please enter a valid phone number.';
        document.getElementById('phone').setAttribute('aria-invalid', 'true');
      }
      hasErrors = true;
    }

    if (hasErrors) {
      statusEl.textContent = 'Please correct the errors below.';
      statusEl.className = 'form-status error';
      // Focus first error field
      const firstError = form.querySelector('[aria-invalid="true"]');
      if (firstError) {
        firstError.focus();
      }
      return;
    }

    // Success
    statusEl.textContent = 'Message sent! We will reply during business hours.';
    statusEl.className = 'form-status success';
    form.reset();
    // Focus status message for screen readers
    statusEl.focus();
    setTimeout(() => statusEl.blur(), 1000);
  });
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function setupCalendar() {
  const calendarGrid = document.getElementById('calendar-grid');
  const detailsContainer = document.getElementById('calendar-details');
  if (!calendarGrid || !detailsContainer) return;

  const classSchedule = buildSchedule();
  renderCalendar(calendarGrid, classSchedule, detailsContainer);
}

function setupScrollAnimations() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Skip animations if user prefers reduced motion
    document.querySelectorAll('.animate-on-scroll, .animate-card').forEach(el => {
      el.classList.add('animated');
    });
    return;
  }

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        if (entry.target.classList.contains('animate-on-scroll')) {
          const cards = entry.target.querySelectorAll('.animate-card');
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('animated');
            }, index * 80);
          });
        }
        // Unobserve after animation to improve performance
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Batch DOM queries for better performance
  const animateElements = document.querySelectorAll('.animate-on-scroll, .animate-card');
  animateElements.forEach(el => observer.observe(el));
  
  // Add animation classes to cards-grid items
  const cards = document.querySelectorAll('.cards-grid .card');
  cards.forEach(card => {
    card.classList.add('animate-card');
    observer.observe(card);
  });
  
  // Add animation to section headers
  const headers = document.querySelectorAll('.section__header');
  headers.forEach(header => {
    header.classList.add('animate-on-scroll');
    observer.observe(header);
  });
}

function renderCalendar(grid, schedule, detailsContainer) {
  const year = 2024;
  const month = 11; // December is 11 in JS Date zero-index
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  grid.innerHTML = '';

  // Add weekday headers
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  weekdays.forEach((w) => {
    const el = document.createElement('div');
    el.className = 'calendar-weekday';
    el.textContent = w;
    grid.appendChild(el);
  });

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day empty';
    grid.appendChild(empty);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-12-${String(day).padStart(2, '0')}`;
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = day;
    dayEl.appendChild(dayNumber);

    const classes = schedule[dateKey] || [];
    if (classes.length) {
      dayEl.classList.add('has-class');
      classes.forEach((cls) => {
        const classItem = document.createElement('div');
        classItem.className = 'calendar-class-item';
        
        const dot = document.createElement('span');
        dot.className = 'calendar-class-dot';
        if (cls.difficulty === 'beginner') {
          dot.style.background = '#22c55e';
        } else if (cls.difficulty === 'intermediate') {
          dot.style.background = '#3b82f6';
        } else if (cls.difficulty === 'advanced') {
          dot.style.background = '#f97316';
        }
        
        const name = document.createElement('span');
        name.className = 'calendar-class-name';
        name.textContent = cls.name;
        
        classItem.appendChild(dot);
        classItem.appendChild(name);
        dayEl.appendChild(classItem);
      });
    }

    dayEl.addEventListener('click', () => {
      // Remove selected class from all days
      document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
      dayEl.classList.add('selected');
      
      updateCalendarDetails(detailsContainer, dateKey, classes);
    });

    grid.appendChild(dayEl);
  }
}

function updateCalendarDetails(container, dateKey, classes) {
  if (!classes || classes.length === 0) {
    container.innerHTML = '<p class="calendar-details-text">No classes scheduled for this date.</p>';
    return;
  }

  const dateStr = formatDate(dateKey);
  const list = document.createElement('ul');
  list.className = 'calendar-details-list';
  
  // Optimize: build HTML string once instead of multiple DOM operations
  const itemsHTML = classes.map(cls => {
    const difficultyClass = `legend-dot--${cls.difficulty}`;
    return `
      <li>
        <span class="legend-dot ${difficultyClass}"></span>
        <strong>${cls.name}</strong>
        ${cls.time ? `<span style="color: var(--subtext); margin-left: auto;">${cls.time}</span>` : ''}
      </li>
    `;
  }).join('');
  
  list.innerHTML = itemsHTML;

  container.innerHTML = `
    <div style="width: 100%;">
      <strong style="display: block; margin-bottom: var(--space-3); color: var(--text);">${dateStr}</strong>
    </div>
  `;
  container.querySelector('div').appendChild(list);
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function buildSchedule() {
  return {
    '2024-12-02': [
      { name: 'Intro to Climbing', difficulty: 'beginner' },
    ],
    '2024-12-04': [
      { name: 'Lead Climbing', difficulty: 'intermediate' },
    ],
    '2024-12-07': [
      { name: 'Kids Camp', difficulty: 'beginner' },
    ],
    '2024-12-09': [
      { name: 'Technique Workshop', difficulty: 'intermediate' },
    ],
    '2024-12-11': [
      { name: 'Competition Prep', difficulty: 'advanced' },
    ],
    '2024-12-14': [
      { name: 'Family Climbing', difficulty: 'beginner' },
    ],
    '2024-12-16': [
      { name: 'Strength Training', difficulty: 'intermediate' },
    ],
    '2024-12-18': [
      { name: 'Route Setting', difficulty: 'advanced' },
    ],
    '2024-12-21': [
      { name: 'Youth Program', difficulty: 'beginner' },
    ],
    '2024-12-23': [
      { name: 'Movement Clinic', difficulty: 'intermediate' },
    ],
    '2024-12-25': [
      { name: 'Outdoor Prep', difficulty: 'advanced' },
    ],
    '2024-12-28': [
      { name: 'Safety Course', difficulty: 'beginner' },
    ],
  };
}

// Subtle parallax effect for hero image
function setupParallaxEffect() {
  const heroVisual = document.querySelector('.hero__visual');
  if (!heroVisual) return;
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;
  
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
          const heroHeight = heroSection.offsetHeight;
          if (scrolled < heroHeight) {
            const parallaxValue = scrolled * 0.3;
            heroVisual.style.transform = `translateX(-6vw) translateY(${parallaxValue}px)`;
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}

// Enhanced smooth scroll for anchor links
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Automatically set active state for current page in navigation
function setupActiveNavState() {
  const navLinks = document.querySelectorAll('.nav__links a');
  if (!navLinks.length) return;
  
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop() || 'index.html';
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    const linkPage = linkPath.split('/').pop();
    
    // Remove existing active state
    link.classList.remove('is-active');
    
    // Set active if current page matches
    if (linkPage === currentPage || 
        (currentPage === '' && linkPage === 'index.html') ||
        (currentPage === 'index.html' && linkPage === 'index.html')) {
      link.classList.add('is-active');
    }
  });
}

// Back to top button functionality
function setupBackToTop() {
  // Create back to top button
  const backToTopBtn = document.createElement('button');
  backToTopBtn.className = 'back-to-top';
  backToTopBtn.setAttribute('aria-label', 'Back to top');
  backToTopBtn.innerHTML = '↑';
  document.body.appendChild(backToTopBtn);
  
  // Show/hide button based on scroll position
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });
  
  // Scroll to top when clicked
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}


