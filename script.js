// Optimized initialization - batch DOM queries and use native features
// Prevent service worker registration in webview contexts
if ('serviceWorker' in navigator) {
  // Only register service workers in valid contexts (not in webviews/iframes)
  if (window.self === window.top && document.readyState !== 'uninitialized') {
    // Service worker registration would go here if needed
    // Currently not using service workers
  }
}

// Ensure document is ready before initialization
function initializeApp() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
    return;
  }
  
  // Document is ready, initialize all features
  try {
    setupMobileNav();
    setupContactForm();
    setupCalendar();
    setupScrollAnimations();
    setupParallaxEffect();
    setupSmoothScroll();
    setupActiveNavState();
    setupBackToTop();
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

// Start initialization
initializeApp();

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
  if (!calendarGrid || !detailsContainer) {
    return;
  }
  
  try {
    const classSchedule = buildSchedule();
    renderCalendar(calendarGrid, classSchedule, detailsContainer);
  } catch (error) {
    console.error('Error rendering calendar:', error);
    // Fallback: render empty calendar
    renderCalendar(calendarGrid, {}, detailsContainer);
  }
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
  
  // Add animation to testimonial cards
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  testimonialCards.forEach((card, index) => {
    card.classList.add('animate-card');
    card.style.animationDelay = `${index * 100}ms`;
    observer.observe(card);
  });
  
  // Add animation to testimonial stats
  const testimonialStats = document.querySelectorAll('.testimonial-stat');
  testimonialStats.forEach((stat, index) => {
    stat.classList.add('animate-card');
    stat.style.animationDelay = `${index * 150}ms`;
    observer.observe(stat);
  });
}

function renderCalendar(grid, schedule, detailsContainer) {
  if (!grid) {
    console.error('Calendar grid element not found');
    return;
  }
  
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // Current month (0-indexed)
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Update the month header
  const monthHeader = document.querySelector('.calendar-month-header');
  if (monthHeader) {
    const strongEl = monthHeader.querySelector('strong');
    if (strongEl) {
      strongEl.textContent = monthName;
    } else {
      monthHeader.innerHTML = `<strong>${monthName}</strong>`;
    }
  }
  
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Clear grid - CSS will handle the grid display
  grid.innerHTML = '';
  // Ensure grid class is applied
  grid.classList.add('calendar-grid');

  // Add weekday headers
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  weekdays.forEach((w) => {
    const el = document.createElement('div');
    el.className = 'calendar-weekday';
    el.textContent = w;
    el.style.display = 'block';
    grid.appendChild(el);
  });

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day empty';
    empty.style.display = 'flex';
    grid.appendChild(empty);
  }

  // Add days of the month
  const monthStr = String(month + 1).padStart(2, '0');
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${monthStr}-${String(day).padStart(2, '0')}`;
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    dayEl.style.display = 'flex';
    dayEl.style.flexDirection = 'column';
    dayEl.style.alignItems = 'center';
    
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
      // Remove selected class from all days (excluding empty cells)
      document.querySelectorAll('.calendar-day:not(.empty)').forEach(d => d.classList.remove('selected'));
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
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed month for comparison
  
  // Build a weekly recurring schedule for the current month
  const schedule = {};
  
  // Monday classes (Monday = 1)
  for (let week = 0; week < 4; week++) {
    const monday = getNextWeekday(now, 1, week);
    // Only include dates that fall within the current month
    if (monday.getMonth() === currentMonth) {
      const dateKey = formatDateKey(monday);
      schedule[dateKey] = [
        { name: 'Beginner Fundamentals', difficulty: 'beginner', time: '6:00 PM' },
      ];
    }
  }
  
  // Wednesday classes (Wednesday = 3)
  for (let week = 0; week < 4; week++) {
    const wednesday = getNextWeekday(now, 3, week);
    if (wednesday.getMonth() === currentMonth) {
      const dateKey = formatDateKey(wednesday);
      if (!schedule[dateKey]) schedule[dateKey] = [];
      schedule[dateKey].push({ name: 'Intermediate Technique', difficulty: 'intermediate', time: '7:00 PM' });
    }
  }
  
  // Friday classes (Friday = 5)
  for (let week = 0; week < 4; week++) {
    const friday = getNextWeekday(now, 5, week);
    if (friday.getMonth() === currentMonth) {
      const dateKey = formatDateKey(friday);
      if (!schedule[dateKey]) schedule[dateKey] = [];
      schedule[dateKey].push({ name: 'Advanced Training', difficulty: 'advanced', time: '6:30 PM' });
    }
  }
  
  // Saturday classes (Saturday = 6)
  for (let week = 0; week < 4; week++) {
    const saturday = getNextWeekday(now, 6, week);
    if (saturday.getMonth() === currentMonth) {
      const dateKey = formatDateKey(saturday);
      if (!schedule[dateKey]) schedule[dateKey] = [];
      schedule[dateKey].push({ name: 'Kids Climbing Camp', difficulty: 'beginner', time: '10:00 AM' });
    }
  }
  
  // Sunday classes (Sunday = 0)
  for (let week = 0; week < 4; week++) {
    const sunday = getNextWeekday(now, 0, week);
    if (sunday.getMonth() === currentMonth) {
      const dateKey = formatDateKey(sunday);
      if (!schedule[dateKey]) schedule[dateKey] = [];
      schedule[dateKey].push({ name: 'Family Climbing Day', difficulty: 'beginner', time: '2:00 PM' });
    }
  }
  
  return schedule;
}

function getNextWeekday(date, targetDay, weekOffset) {
  // Create date for the first day of the month
  const result = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDay = result.getDay();
  
  // Calculate days to add to reach the target weekday
  let daysToAdd = (targetDay - firstDay + 7) % 7;
  
  // If the first day IS the target day, daysToAdd will be 0
  // For week 0, we want day 1 (the first day of month)
  // For week 1+, we want the next occurrence (7 days later)
  if (daysToAdd === 0 && weekOffset === 0) {
    // Week 0, first day is the target day
    daysToAdd = 0;
  } else if (daysToAdd === 0 && weekOffset > 0) {
    // Week 1+, first day is target day, so next occurrence is 7 days later
    daysToAdd = 7 * weekOffset;
  } else {
    // First day is not target day, calculate normally
    daysToAdd = daysToAdd + (weekOffset * 7);
  }
  
  result.setDate(1 + daysToAdd);
  return result;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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


