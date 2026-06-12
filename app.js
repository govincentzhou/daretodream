/**
 * Dare To Dream Personal Website - Application Script
 * Features: Theme Toggling, Stats Counter, Timeline Filters, Video Modal Lightbox, Contact Form Validation
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initStatsCounter();
    initTimelineFilter();
    initVideoLightbox();
    initContactForm();
});

/* ==========================================================================
   THEME MANAGER
   ========================================================================== */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Force default to light mode on load (clears previous dark mode cache)
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme-preference', 'light');

    // Click handler
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme-preference', currentTheme);
        
        // Trigger subtle icon rotation animation on click
        const btnSvg = themeToggle.querySelector('svg:not(.hidden)');
        if (btnSvg) {
            btnSvg.style.transform = 'rotate(360deg)';
            setTimeout(() => { btnSvg.style.transform = ''; }, 300);
        }
    });
}

/* ==========================================================================
   INTERSECTION OBSERVER STATS COUNTER
   ========================================================================== */
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length === 0) return;

    const countUp = (element) => {
        const target = parseInt(element.getAttribute('data-target'), 10);
        const duration = 2000; // 2 seconds
        const stepTime = Math.max(Math.floor(duration / target), 15);
        let current = 0;
        
        // Calculate increment step size for larger numbers to maintain 2s duration
        const increment = Math.ceil(target / (duration / stepTime));

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = current.toLocaleString();
            }
        }, stepTime);
    };

    // Trigger animation when the stats section is scroll-revealed
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                countUp(element);
                observer.unobserve(element); // Stop observing after animation starts
            }
        });
    }, { threshold: 0.1 });

    statNumbers.forEach(num => observer.observe(num));
}

/* ==========================================================================
   TIMELINE FILTER SYSTEM
   ========================================================================== */
function initTimelineFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineLine = document.querySelector('.timeline-line');
    
    if (filterBtns.length === 0 || timelineItems.length === 0) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active state from current buttons, add to target button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            // Animate and toggle cards
            timelineItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    item.classList.remove('hide');
                    // Add smooth fade-in animation
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        item.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    item.classList.add('hide');
                }
            });

            // Adjust vertical line drawing height if items change
            if (timelineLine) {
                timelineLine.style.opacity = '0';
                setTimeout(() => {
                    timelineLine.style.transition = 'opacity 0.6s ease';
                    timelineLine.style.opacity = '1';
                }, 100);
            }
        });
    });
}

/* ==========================================================================
   THEATER MODE VIDEO LIGHTBOX
   ========================================================================== */
function initVideoLightbox() {
    const videoCards = document.querySelectorAll('.video-card');
    const lightbox = document.getElementById('video-lightbox');
    const closeBtn = document.querySelector('.lightbox-close');
    const overlay = document.querySelector('.lightbox-overlay');
    const iframeContainer = document.getElementById('lightbox-iframe-container');

    if (!lightbox || !iframeContainer) return;

    const openLightbox = (videoId) => {
        // Embed YouTube player with autoplay, modern parameters
        iframeContainer.innerHTML = `
            <iframe 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1" 
                title="YouTube Video Player" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
        
        lightbox.classList.remove('hidden');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Stop page scrolling background
    };

    const closeLightbox = () => {
        lightbox.classList.add('hidden');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Restore page scrolling
        
        // Destroy player frame immediately to stop background audio playback
        iframeContainer.innerHTML = '';
    };

    // Attach click events on video cards
    videoCards.forEach(card => {
        card.addEventListener('click', () => {
            const videoId = card.getAttribute('data-video-id');
            if (videoId) openLightbox(videoId);
        });
    });

    // Close actions
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (overlay) overlay.addEventListener('click', closeLightbox);
    
    // Close with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
            closeLightbox();
        }
    });
}

/* ==========================================================================
   CONTACT FORM HANDLER
   ========================================================================== */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const submitBtn = contactForm ? contactForm.querySelector('button[type="submit"]') : null;
    const feedback = document.getElementById('form-feedback');

    if (!contactForm || !submitBtn || !feedback) return;

    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Read inputs
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const subject = document.getElementById('contact-subject').value.trim();
        const message = document.getElementById('contact-message').value.trim();

        // Perform basic validations
        if (!name || !email || !subject || !message) {
            showFeedback('All parameters are required. Fill out fields to transmit message.', 'error');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
        feedback.classList.add('hidden');

        // Simulate secure API/SMTP pipeline latency (1.5 seconds)
        setTimeout(() => {
            // Restore button state
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');

            // Success Output & reset form fields
            showFeedback(`Message securely transmitted! Welcome to the team, ${name}. I will respond shortly.`, 'success');
            contactForm.reset();
        }, 1500);
    });

    const showFeedback = (msg, type) => {
        feedback.textContent = msg;
        feedback.className = `form-feedback ${type}`; // Apply theme colors
    };
}
