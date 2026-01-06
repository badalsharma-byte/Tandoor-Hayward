// ============================================
// DEPENDENCIES SETUP
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Check if GSAP is loaded
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error('GSAP or ScrollTrigger not loaded. Animations disabled.');
        document.body.classList.add('no-animations'); // Optional: Add CSS to ensure visibility
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ============================================
    // LENIS SMOOTH SCROLL
    // ============================================
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            smoothTouch: false,
        });

        // Request animation frame loop for Lenis
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Integrate Lenis with GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);

        // Add lenis class to html for CSS hooks
        document.documentElement.classList.add('lenis');
    } else {
        console.warn('Lenis not loaded. Smooth scroll disabled.');
    }

    // ============================================
    // REUSABLE UTILS
    // ============================================
    function splitTextIntoLetters(element) {
        if (!element) return;

        // Get innerHTML to preserve <br> tags
        const originalContent = element.innerHTML;
        // Split by <br> tags (case insensitive, handling optional space and self-closing slash)
        const lines = originalContent.split(/<br\s*\/?>/i);

        element.innerHTML = '';

        const emphasisWords = ['AUTHENTIC', 'INDIAN', 'FLAVORS', 'FRESH', 'DAILY', 'WE’D', 'LOVE', 'TO', 'HEAR', 'FROM', 'YOU'];

        lines.forEach((line, lineIndex) => {
            // Skip empty lines if any (though usually we want to preserve empty lines if they were explicit breaks, but split might create empty strings for adjacent breaks)
            // For this specific case, we just process the text.

            const words = line.trim().split(/\s+/);

            words.forEach((word) => {
                // Skip empty words resulting from trim/split
                if (!word) return;

                const wordSpan = document.createElement('span');
                wordSpan.className = 'word';

                // Clean word for comparison (remove punctuation)
                const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toUpperCase();

                if (emphasisWords.includes(cleanWord)) {
                    wordSpan.classList.add('emphasis');
                }

                for (let i = 0; i < word.length; i++) {
                    const letter = document.createElement('span');
                    letter.className = 'letter';
                    letter.textContent = word[i];
                    wordSpan.appendChild(letter);
                }

                // Add space after word
                const space = document.createTextNode(' ');
                element.appendChild(wordSpan);
                element.appendChild(space);
            });

            // If not the last line, append a <br> to restore the line break
            if (lineIndex < lines.length - 1) {
                element.appendChild(document.createElement('br'));
            }
        });
    }

    // ============================================
    // HEADER LOGIC
    // ============================================
    const header = document.querySelector('.header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu-container');
    const menuOverlay = document.querySelector('.menu-overlay');
    const body = document.body;

    // Header Scroll Effect
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Mobile Menu
    function openMenu() {
        if (menuToggle) menuToggle.classList.add('active');
        if (mobileMenu) mobileMenu.classList.add('active');
        if (menuOverlay) menuOverlay.classList.add('active');
        if (body) body.style.overflow = 'hidden';
    }

    function closeMenu() {
        if (menuToggle) menuToggle.classList.remove('active');
        if (mobileMenu) mobileMenu.classList.remove('active');
        if (menuOverlay) menuOverlay.classList.remove('active');
        if (body) body.style.overflow = '';
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            if (menuToggle.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

    document.querySelectorAll('.mobile-nav-list a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuToggle && menuToggle.classList.contains('active')) {
            closeMenu();
        }
    });

    // ============================================
    // HERO SECTION ANIMATIONS
    // ============================================
    const heroHeading = document.querySelector('.hero-heading[data-animate="true"]');
    if (heroHeading) {
        splitTextIntoLetters(heroHeading);

        const heroTimeline = gsap.timeline({ delay: 0.5 });

        // 1. Eyebrow
        if (document.querySelector('.hero-eyebrow')) {
            heroTimeline.from('.hero-eyebrow', {
                opacity: 0,
                y: 20,
                duration: 0.8,
                ease: 'power3.out'
            });
        }

        // 2. Letters - SUBTLE REVEAL
        const letters = heroHeading.querySelectorAll('.letter');
        if (letters.length > 0) {
            letters.forEach((letter, index) => {
                setTimeout(() => {
                    letter.classList.add('revealed');
                }, index * 60); // Slowed down from 30ms
            });
        }

        // 3. Description + CTAs
        if (document.querySelector('.hero-left')) {
            heroTimeline.from('.hero-left', {
                opacity: 0,
                y: 20,
                duration: 1,
                ease: 'power3.out'
            }, '-=0.5');
        }

        // 4. Reviews
        if (document.querySelector('.hero-reviews')) {
            heroTimeline.from('.hero-reviews', {
                opacity: 0,
                y: 20,
                duration: 1,
                ease: 'power3.out'
            }, '-=0.7');
        }
    }

    // ============================================
    // ABOUT SECTION PINNING - PIN AT CONTENT POSITION
    // ============================================
    const aboutSection = document.querySelector('.about-section');
    if (aboutSection) {
        ScrollTrigger.create({
            trigger: '.about-section',
            start: 'top top-=20vh',  // Start when content (at 20vh) reaches viewport top
            end: 'bottom top+=80%',
            pin: '.about-content',
            pinSpacing: false,
            markers: false
        });
    }

    // ============================================
    // GENERIC SCROLL ANIMATIONS
    // ============================================
    const animatedHeadings = document.querySelectorAll('[data-animate="true"]:not(.hero-heading)');

    if (animatedHeadings.length > 0) {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const letters = entry.target.querySelectorAll('.letter');
                    letters.forEach((letter, index) => {
                        setTimeout(() => {
                            letter.classList.add('revealed');
                        }, index * 50); // Slowed down from 25ms
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedHeadings.forEach(heading => {
            splitTextIntoLetters(heading);
            observer.observe(heading);
        });
    }

    // ============================================
    // GENERAL UTILS
    // ============================================

    // Video Optimization
    document.querySelectorAll('video').forEach(video => {
        video.play().catch(err => console.log('Video play prevented:', err));
    });

    // Smooth Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                if (lenis) {
                    lenis.scrollTo(target, { offset: -100, duration: 1.5 });
                } else {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Newsletter Form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.querySelector('.newsletter-input');
            if (emailInput) {
                alert(`Thanks for subscribing with ${emailInput.value}! (This is a demo)`);
                emailInput.value = '';
            }
        });
    }

    // Accessibility: Reduced Motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.globalTimeline.clear();
        ScrollTrigger.getAll().forEach(st => st.kill());
        document.querySelectorAll('.letter').forEach(l => l.style.opacity = 1);
        gsap.set(['.hero-eyebrow', '.hero-left', '.hero-reviews'], { opacity: 1 });
    }

    // ============================================
    // FLOATING ORDER BUTTON
    // ============================================
    // ============================================
    // SCROLL TO TOP BUTTON
    // ============================================
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        // Visibility Toggle
        ScrollTrigger.create({
            trigger: 'body',
            start: 'top -200px', // Show after scrolling down 200px
            onUpdate: (self) => {
                if (self.direction === 1) { // Scrolling down
                    scrollTopBtn.classList.add('visible');
                } else if (self.scroll() < 100) { // At top
                    scrollTopBtn.classList.remove('visible');
                }
            }
        });

        // Click Handler
        scrollTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (lenis) {
                lenis.scrollTo(0, { duration: 1.5 });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // ============================================
    // ORDER & DELIVERY CARDS ANIMATION
    // ============================================
    const pickupCard = document.getElementById('pickup-card');
    const deliveryCard = document.getElementById('delivery-card');

    if (pickupCard && deliveryCard) {
        gsap.to('#pickup-card', {
            scrollTrigger: {
                trigger: '.order-delivery-section',
                start: 'top 70%',
                end: 'top 30%',
                toggleActions: 'play none none reverse'
            },
            x: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            onComplete: () => pickupCard.classList.add('visible')
        });

        gsap.to('#delivery-card', {
            scrollTrigger: {
                trigger: '.order-delivery-section',
                start: 'top 70%',
                end: 'top 30%',
                toggleActions: 'play none none reverse'
            },
            x: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            delay: 0.2,
            onComplete: () => deliveryCard.classList.add('visible')
        });
    }

    // ============================================
    // PROMOTIONAL POPUP WITH LA TIMEZONE SCHEDULING
    // ============================================
    const promoPopup = {
        overlay: document.getElementById('promoPopupOverlay'),
        closeBtn: document.getElementById('promoPopupClose'),
        title: document.getElementById('promoPopupTitle'),
        message: document.getElementById('promoPopupMessage'),
        cta: document.getElementById('promoPopupCta'),

        // Configuration - Can be set dynamically from backend
        config: {
            enabled: true,
            title: 'Special Offer!',
            message: 'Get 15% off your first online order! Use code: WELCOME15',
            ctaText: 'Order Now',
            ctaLink: 'order.php',
            delaySeconds: 5,
            // Schedule in LA timezone (America/Los_Angeles)
            schedule: {
                // Days: 0 = Sunday, 1 = Monday, ... 6 = Saturday
                days: [0, 1, 2, 3, 4, 5, 6], // All days
                startHour: 10,  // 10 AM LA time
                endHour: 21     // 9 PM LA time
            },
            showOncePerSession: true
        },

        init() {
            if (!this.overlay || !this.config.enabled) return;

            // Check if already shown this session
            if (this.config.showOncePerSession && sessionStorage.getItem('promoPopupShown')) {
                return;
            }

            // Check LA timezone schedule
            if (!this.isWithinSchedule()) {
                return;
            }

            // Update content
            this.updateContent();

            // Show popup after delay
            setTimeout(() => this.show(), this.config.delaySeconds * 1000);

            // Event listeners
            this.closeBtn?.addEventListener('click', () => this.hide());
            this.overlay?.addEventListener('click', (e) => {
                if (e.target === this.overlay) this.hide();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.hide();
            });
        },

        isWithinSchedule() {
            // Get current time in Los Angeles timezone
            const laTime = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
            const laDate = new Date(laTime);
            const currentDay = laDate.getDay();
            const currentHour = laDate.getHours();

            const { days, startHour, endHour } = this.config.schedule;

            // Check if current day is in schedule
            if (!days.includes(currentDay)) return false;

            // Check if current hour is within range
            return currentHour >= startHour && currentHour < endHour;
        },

        updateContent() {
            if (this.title) this.title.textContent = this.config.title;
            if (this.message) this.message.textContent = this.config.message;
            if (this.cta) {
                this.cta.textContent = this.config.ctaText;
                this.cta.href = this.config.ctaLink;
            }
        },

        show() {
            this.overlay?.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (this.config.showOncePerSession) {
                sessionStorage.setItem('promoPopupShown', 'true');
            }
        },

        hide() {
            this.overlay?.classList.remove('active');
            document.body.style.overflow = '';
        },

        // Method to update config dynamically (can be called from backend)
        setConfig(newConfig) {
            this.config = { ...this.config, ...newConfig };
            this.updateContent();
        }
    };

    // Initialize popup
    promoPopup.init();

    // Expose to global scope for backend integration
    window.tandoorPromoPopup = promoPopup;

    // ============================================
    // TESTIMONIAL INFINITE SCROLL
    // ============================================
    const marqueeTrack = document.querySelector('.testimonial-track');
    if (marqueeTrack) {
        const marqueeContent = marqueeTrack.innerHTML;
        // Duplicate content to ensure seamless loop
        marqueeTrack.innerHTML += marqueeContent;

        // If screen is very wide, duplicate again to be safe
        if (window.innerWidth > 1600) {
            marqueeTrack.innerHTML += marqueeContent;
        }

        const marqueeTween = gsap.to(marqueeTrack, {
            xPercent: -50, // Move by 50% of the total width (which is exactly one set of items)
            repeat: -1,
            duration: 40, // Adjust speed here (higher = slower)
            ease: 'linear'
        });

        // Pause on hover
        const marqueeContainer = document.querySelector('.testimonial-marquee');
        if (marqueeContainer) {
            marqueeContainer.addEventListener('mouseenter', () => marqueeTween.pause());
            marqueeContainer.addEventListener('mouseleave', () => marqueeTween.play());

            // Touch events for mobile
            marqueeContainer.addEventListener('touchstart', () => marqueeTween.pause());
            marqueeContainer.addEventListener('touchend', () => marqueeTween.play());
        }
    }
});
