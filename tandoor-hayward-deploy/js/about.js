/**
 * About Page Animations
 * Handles scroll-triggered animations for the about page
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if GSAP is loaded
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP not loaded, using fallback animations');
        // Fallback: just show all cards
        document.querySelectorAll('.philosophy-card').forEach(card => {
            card.classList.add('animate-in');
        });
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ============================================
    // PHILOSOPHY CARDS - Horizontal Stacking Animation
    // ============================================
    const philosophyCards = document.querySelectorAll('.philosophy-card');

    if (philosophyCards.length > 0) {
        // Stagger animation for cards appearing from bottom
        gsap.fromTo(philosophyCards,
            {
                opacity: 0,
                y: 80
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.philosophy-cards-container',
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }

    // ============================================
    // SECTION TITLE ANIMATIONS
    // ============================================
    const animatedTitles = document.querySelectorAll('.journey-title, .tradition-title, .philosophy-title, .people-title, .testimonial-title');

    animatedTitles.forEach(title => {
        gsap.fromTo(title,
            {
                opacity: 0,
                y: 40
            },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: title,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // ============================================
    // TESTIMONIAL MARQUEE - Infinite Scroll
    // ============================================
    const marqueeTrack = document.querySelector('.testimonial-track');

    if (marqueeTrack) {
        // Duplicate content for seamless loop
        const marqueeContent = marqueeTrack.innerHTML;
        marqueeTrack.innerHTML += marqueeContent;

        // If screen is very wide, duplicate again
        if (window.innerWidth > 1600) {
            marqueeTrack.innerHTML += marqueeContent;
        }

        // Kill any CSS animation and use GSAP instead
        marqueeTrack.style.animation = 'none';

        const marqueeTween = gsap.to(marqueeTrack, {
            xPercent: -50,
            repeat: -1,
            duration: 35,
            ease: 'linear'
        });

        // Pause on hover
        const marqueeContainer = document.querySelector('.testimonial-marquee');
        if (marqueeContainer) {
            marqueeContainer.addEventListener('mouseenter', () => marqueeTween.pause());
            marqueeContainer.addEventListener('mouseleave', () => marqueeTween.play());
            marqueeContainer.addEventListener('touchstart', () => marqueeTween.pause());
            marqueeContainer.addEventListener('touchend', () => marqueeTween.play());
        }
    }

    // ============================================
    // FADE IN ELEMENTS ON SCROLL
    // ============================================
    const fadeInElements = document.querySelectorAll('.journey-text, .tradition-subtitle, .quote-text, .people-text');

    fadeInElements.forEach(element => {
        gsap.fromTo(element,
            {
                opacity: 0,
                y: 30
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // ============================================
    // IMAGE REVEAL ANIMATIONS
    // ============================================
    const imageWrappers = document.querySelectorAll('.journey-image-wrapper, .quote-image-container');

    imageWrappers.forEach(wrapper => {
        gsap.fromTo(wrapper,
            {
                opacity: 0,
                scale: 0.95
            },
            {
                opacity: 1,
                scale: 1,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: wrapper,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
});
