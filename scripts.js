// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Initialize Lenis for Smooth Scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false
});

// Sync Lenis with ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Prevent FOUC
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    initAnimations();
    // Dynamic rounded favicon from square asset
    createRoundFavicon('assets/pic.png');
    // Initialize Theme Toggle
    initThemeToggle();
});

/**
 * Programmatically rounds the website favicon
 * @param {string} src - Path to the original square image
 */
function createRoundFavicon(src) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);

        const link = document.querySelector("link[rel~='icon']");
        if (link) {
            link.href = canvas.toDataURL("image/png");
        }
    };
    img.src = src;
}

function initAnimations() {
    // --- Hero Animation ---
    // Timeline to coordinate hero elements
    const heroTl = gsap.timeline({ defaults: { duration: 1, ease: 'power3.out' } });

    // Set initial states for hero elements (including new image)
    gsap.set(['.hero-greeting', '.hero-title', '.hero-description', '.hero-footer', '.hero-image-wrapper'], {
        y: 30,
        opacity: 0
    });

    heroTl.to('body', { opacity: 1, duration: 0.5 })
        .to('.hero-image-wrapper', { y: 0, opacity: 1, duration: 1.2, ease: 'power2.out' }, '-=0.5') // Image enters early? Or late? Let's say alongside greeting/title
        .to('.hero-greeting', { y: 0, opacity: 1, duration: 0.8 }, '-=1.0')
        .to('.hero-title', { y: 0, opacity: 1, duration: 1 }, '-=0.6')
        .to('.hero-description', { y: 0, opacity: 1, duration: 0.8 }, '-=0.8')
        .to('.hero-footer', { y: 0, opacity: 1, duration: 0.8 }, '-=0.6');


    // --- Header Scroll Effect ---
    // Smoothly shrink and style header on scroll
    let mm = gsap.matchMedia();

    mm.add("(min-width: 901px)", () => {
        // Desktop: Shrink to 40%
        gsap.to('.header', {
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: '+=150',
                scrub: 1,
            },
            width: '40%',
            padding: '0.8rem 2.5rem',
            background: 'var(--surface-color)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
            ease: 'none'
        });
    });

    mm.add("(max-width: 900px)", () => {
        // Mobile: Shrink to 85% instead of 40%
        gsap.to('.header', {
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: '+=100',
                scrub: 1,
            },
            width: '85%',
            padding: '0.8rem 1.5rem',
            background: 'var(--surface-color)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
            ease: 'none'
        });
    });



    // --- About Text Reveal Animation ---
    const revealText = document.querySelector('.reveal-type');
    if (revealText) {
        const text = revealText.textContent;
        const splitText = text.split(" ");
        revealText.innerHTML = "";

        splitText.forEach(word => {
            const span = document.createElement("span");
            span.textContent = word + " ";
            revealText.appendChild(span);
        });

        const spans = revealText.querySelectorAll("span");

        gsap.fromTo(spans,
            { opacity: 0.15, color: "var(--text-secondary)" },
            {
                opacity: 1,
                color: "var(--text-color)", // Highlight color
                stagger: 0.1,
                scrollTrigger: {
                    trigger: ".about-container",
                    start: "top 60%",
                    end: "bottom 60%",
                    scrub: true,
                }
            }
        );
    }

    // --- Generic Section Reveal (Excluding About which has custom animation) ---
    // Reveals section content as it enters viewport
    gsap.utils.toArray('.section:not(#about)').forEach(section => {
        const header = section.querySelector('.section-header');
        const content = section.querySelectorAll('.about-content, .skills-grid, .projects-grid, .testimonials-slider, .contact-content');

        if (header) {
            gsap.from(header, {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                y: 50,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            });
        }

        if (content.length) {
            gsap.from(content, {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                },
                y: 50,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: 'power3.out'
            });
        }
    });


    // --- Projects Stagger Animation ---
    // Specific staggered reveal for project cards
    const projects = gsap.utils.toArray('.project-card');
    if (projects.length) {
        gsap.from(projects, {
            scrollTrigger: {
                trigger: '.projects-grid',
                start: 'top 80%',
            },
            y: 100,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'back.out(1.7)'
        });
    }


    // --- Expertise Section Animations & Logic ---
    const expertiseSection = document.querySelector('.nested-expertise');
    if (expertiseSection) {

        // --- 1. Setup Tech Stack "Curved Loop" (DOM Manipulation) ---
        const techStackRow = document.querySelector('.tech-stack-row');
        let techPillWrappers = []; // To store wrappers for entrance animation

        if (techStackRow) {
            // Create track
            const track = document.createElement('div');
            track.className = 'tech-track';
            Object.assign(track.style, {
                display: 'flex',
                gap: '1.5rem',
                width: 'max-content',
                willChange: 'transform'
            });

            // Process existing pills: Wrap them and move to track
            const existingPills = Array.from(techStackRow.querySelectorAll('.tech-pill'));

            const wrapAndAppend = (pill) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'tech-pill-wrapper';
                wrapper.appendChild(pill);
                track.appendChild(wrapper);
                return wrapper;
            };

            // Original pills
            existingPills.forEach(pill => {
                techPillWrappers.push(wrapAndAppend(pill));
            });

            // Clone pills for seamless loop (Duplicate set twice)
            existingPills.forEach(pill => {
                const clone = pill.cloneNode(true);
                // We add clones to wrapper list too so they animate in? 
                // Yes, consistent look.
                techPillWrappers.push(wrapAndAppend(clone));
            });
            existingPills.forEach(pill => {
                const clone = pill.cloneNode(true);
                techPillWrappers.push(wrapAndAppend(clone));
            });

            // Clear row and append track
            techStackRow.innerHTML = '';
            techStackRow.appendChild(track);

            // Infinite Horizontal Scroll
            const singleSetWidth = track.scrollWidth / 3;
            gsap.to(track, {
                x: -singleSetWidth,
                duration: 20,
                ease: 'none',
                repeat: -1
            });

            // Sine Wave "Curved" Effect
            const allPills = track.querySelectorAll('.tech-pill');
            allPills.forEach((pill, i) => {
                gsap.to(pill, {
                    y: 8,
                    duration: 1.5,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                    delay: i * 0.1
                });
            });
        }

        // --- 2. Entrance Animations ---
        // Set initial state
        gsap.set(['.expertise-label', '.expertise-title', '.accordion-item', '.expertise-image-container'], {
            opacity: 0,
            y: 30
        });
        // Set wrappers (not inner pills) to hidden
        gsap.set('.tech-pill-wrapper', {
            opacity: 0,
            y: 30
        });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: expertiseSection,
                start: 'top 75%',
                toggleActions: 'play none none reverse'
            }
        });

        tl.to(['.expertise-label', '.expertise-title'], {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out'
        })
            .to('.accordion-item', {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            }, '-=0.4')
            .to('.expertise-image-container', {
                scale: 1,
                y: 0,
                opacity: 1,
                duration: 1,
                ease: 'power2.out'
            }, '-=0.6')
            .to('.tech-pill-wrapper', { // Animate wrappers
                y: 0,
                opacity: 1,
                duration: 0.5,
                stagger: 0.05,
                ease: 'back.out(1.5)'
            }, '-=0.4');

        // Infinite float for image
        gsap.to('.expertise-image-container', {
            y: -15,
            duration: 4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: 1
        });

        // --- Accordion Logic ---
        const accordionItems = document.querySelectorAll('.accordion-item');

        accordionItems.forEach(item => {
            const header = item.querySelector('.accordion-header');
            const body = item.querySelector('.accordion-body');
            const content = item.querySelector('.accordion-content'); // Inner wrapper for measurement

            // Initial State handling
            if (item.classList.contains('active')) {
                gsap.set(body, { height: 'auto', opacity: 1 });
                gsap.set(content, { y: 0, opacity: 1 });
            } else {
                gsap.set(body, { height: 0, opacity: 0 });
                gsap.set(content, { y: 10, opacity: 0 });
            }

            header.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');

                // Close all other items
                accordionItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        const otherBody = otherItem.querySelector('.accordion-body');
                        const otherContent = otherItem.querySelector('.accordion-content');

                        gsap.to(otherBody, {
                            height: 0,
                            opacity: 0,
                            duration: 0.4,
                            ease: 'power2.in'
                        });
                        gsap.to(otherContent, {
                            y: 10,
                            opacity: 0,
                            duration: 0.3
                        });
                    }
                });

                // Toggle current item
                if (isOpen) {
                    item.classList.remove('active');
                    gsap.to(body, {
                        height: 0,
                        opacity: 0,
                        duration: 0.4,
                        ease: 'power2.in'
                    });
                    gsap.to(content, {
                        y: 10,
                        opacity: 0,
                        duration: 0.3
                    });
                } else {
                    item.classList.add('active');
                    gsap.to(body, {
                        height: 'auto',
                        opacity: 1,
                        duration: 0.5,
                        ease: 'power2.out'
                    });
                    gsap.fromTo(content,
                        { y: 10, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.5, delay: 0.1, ease: 'power2.out' }
                    );
                }
            });
        });
    }


    // --- Navigation Active State ---
    // Highlights nav links based on scroll position
    const navLinks = gsap.utils.toArray('.nav-link');
    const sections = gsap.utils.toArray('section');

    sections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => setActiveLink(section.id),
            onEnterBack: () => setActiveLink(section.id)
        });
    });

    function setActiveLink(id) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
            }
        });
    }


    // --- Smooth Scroll to Sections ---
    // Intercepts click on nav links and scrolls smoothly
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            lenis.scrollTo(targetId, {
                offset: -70,
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });

            // Close mobile menu if open
            const nav = document.querySelector('.nav-list');
            nav.classList.remove('active'); // Assumes mobile menu logic handles this class
        });
    });
}

/**
 * Initializes the theme toggle functionality with a wave expansion effect.
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const overlay = document.querySelector('.theme-overlay');
    const root = document.documentElement;

    if (!themeToggle || !themeIcon || !overlay) return;

    // 1. Initial Load: Apply saved theme immediately without animation
    const savedTheme = localStorage.getItem('theme') || 'dark';
    root.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // 2. Click Listener: Trigger Wave Animation
    themeToggle.addEventListener('click', (e) => {
        const currentTheme = root.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

        // --- Calculate Epicentre (Button Center) ---
        const rect = themeToggle.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // --- Prepare Overlay for Wave ---
        // We set it to the NEXT theme's background color
        const nextBg = nextTheme === 'light' ? '#ffffff' : '#050505';

        gsap.set(overlay, {
            x: centerX,
            y: centerY,
            backgroundColor: nextBg,
            transformOrigin: 'center center',
            scale: 0,
            opacity: 1
        });

        // Add class to body to enable smooth color transitions on all elements
        document.body.classList.add('theme-transition');

        // --- Execute Wave Expansion ---
        // Calculate distance to furthest corner to ensure full coverage
        const maxDist = Math.max(
            Math.hypot(centerX, centerY),
            Math.hypot(window.innerWidth - centerX, centerY),
            Math.hypot(centerX, window.innerHeight - centerY),
            Math.hypot(window.innerWidth - centerX, window.innerHeight - centerY)
        );

        const tl = gsap.timeline({
            onComplete: () => {
                // Clean up
                gsap.set(overlay, { scale: 0, opacity: 0 });
                // We leave the transition class for a bit so components can settle
                setTimeout(() => {
                    document.body.classList.remove('theme-transition');
                }, 500);
            }
        });

        tl.to(overlay, {
            scale: maxDist * 1.5, // Scale significantly to avoid edges
            duration: 1.2,
            ease: "power2.inOut",
        });

        // Toggle the actual theme attribute halfway through the expansion
        setTimeout(() => {
            root.setAttribute('data-theme', nextTheme);
            localStorage.setItem('theme', nextTheme);
            updateThemeIcon(nextTheme);
        }, 600);
    });

    /**
     * Updates the SVG path of the theme icon.
     */
    function updateThemeIcon(theme) {
        if (theme === 'light') {
            // Switch to Moon (meaning "click to go Dark")
            themeIcon.innerHTML = `
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            `;
            // Optional: Adjust button background for light mode
            themeToggle.style.background = 'rgba(0,0,0,0.05)';
            themeToggle.style.borderColor = 'rgba(0,0,0,0.1)';
        } else {
            // Switch to Sun (meaning "click to go Light")
            themeIcon.innerHTML = `
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            `;
            themeToggle.style.background = 'rgba(255,255,255,0.05)';
            themeToggle.style.borderColor = 'rgba(255,255,255,0.1)';
        }
    }
}
