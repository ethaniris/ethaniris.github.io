// ===== Smooth Scroll Animation Observer =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all elements that should fade in on scroll
document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.fade-in-on-scroll');
    fadeElements.forEach(el => fadeInObserver.observe(el));
});

// ===== Situation Cards Animation =====
const situationCards = document.querySelectorAll('.situation-card');
const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, { threshold: 0.2 });

situationCards.forEach(card => cardObserver.observe(card));

// ===== Reveal Text Animation =====
const revealTexts = document.querySelectorAll('.reveal-text');
const textObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = `revealText 1s ease-out forwards`;
            if (entry.target.classList.contains('delay-1')) {
                entry.target.style.animationDelay = '0.5s';
            }
        }
    });
}, { threshold: 0.5 });

revealTexts.forEach(text => textObserver.observe(text));

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            document.body.classList.remove('nav-open');
            const header = document.querySelector('.site-header');
            if (header) {
                header.classList.remove('open');
                const toggle = header.querySelector('.nav-toggle');
                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'false');
                }
            }
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Mobile Navigation Toggle =====
const navToggle = document.querySelector('.nav-toggle');
const siteHeader = document.querySelector('.site-header');
const navOverlay = document.querySelector('.nav-overlay');

function closeNav() {
    if (!siteHeader) return;
    siteHeader.classList.remove('open');
    document.body.classList.remove('nav-open');
    if (navToggle) {
        navToggle.setAttribute('aria-expanded', 'false');
    }
}

if (navToggle && siteHeader) {
    navToggle.addEventListener('click', () => {
        const isOpen = siteHeader.classList.toggle('open');
        document.body.classList.toggle('nav-open', isOpen);
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
}

if (navOverlay) {
    navOverlay.addEventListener('click', closeNav);
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeNav();
    }
});

// ===== Parallax Effect for Hero Section =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    const heroBg = document.querySelector('.hero-bg');
    
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
    }
    
    if (heroBg && scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// ===== Ingredient Cards Hover Effect =====
const ingredientCards = document.querySelectorAll('.ingredient-card');
ingredientCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-15px) scale(1.05)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ===== CTA Button Ripple Effect =====
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', function(e) {
        // Prevent default for demo purposes
        e.preventDefault();
        
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.6)';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.pointerEvents = 'none';
        
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.transform = 'translate(-50%, -50%)';
        
        this.appendChild(ripple);
        
        // Animate ripple
        ripple.animate([
            { width: '20px', height: '20px', opacity: 1 },
            { width: '300px', height: '300px', opacity: 0 }
        ], {
            duration: 600,
            easing: 'ease-out'
        }).onfinish = () => ripple.remove();
        
        // In production, you would redirect to purchase page
        // window.location.href = 'purchase-page-url';
        
        // For demo, show alert
        setTimeout(() => {
            alert('即將前往購買頁面...\n（此為展示版本）');
        }, 300);
    });
}

// ===== Number Counter Animation (for future use) =====
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = Math.floor(target);
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// ===== Privacy Icons Animation =====
const privacyIcons = document.querySelectorAll('.privacy-icon');
const iconObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
            }, index * 200);
        }
    });
}, { threshold: 0.3 });

privacyIcons.forEach(icon => iconObserver.observe(icon));

// ===== Audience Cards Stagger Animation =====
const audienceCards = document.querySelectorAll('.audience-card');
const audienceObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 200);
        }
    });
}, { threshold: 0.2 });

audienceCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    audienceObserver.observe(card);
});

// ===== Japan Features Animation =====
const japanFeatures = document.querySelectorAll('.japan-feature');
const japanObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 300);
        }
    });
}, { threshold: 0.3 });

japanFeatures.forEach(feature => {
    feature.style.opacity = '0';
    feature.style.transform = 'translateY(30px)';
    feature.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    japanObserver.observe(feature);
});

// ===== Tech Features Stagger Animation =====
const techFeatures = document.querySelectorAll('.tech-features li');
const techObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }, index * 150);
        }
    });
}, { threshold: 0.5 });

techFeatures.forEach(feature => {
    feature.style.opacity = '0';
    feature.style.transform = 'translateX(-20px)';
    feature.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    techObserver.observe(feature);
});

// ===== Ingredient Cards Stagger Animation =====
const ingredientCardsAnim = document.querySelectorAll('.ingredient-card');
const ingredientObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
            }, index * 150);
        }
    });
}, { threshold: 0.2 });

ingredientCardsAnim.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px) scale(0.9)';
    card.style.transition = 'opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    ingredientObserver.observe(card);
});

// ===== Performance Optimization: Throttle Scroll Events =====
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttle to scroll events
const throttledScroll = throttle(() => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    const heroBg = document.querySelector('.hero-bg');
    
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
    }
    
    if (heroBg && scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
}, 16);

window.addEventListener('scroll', throttledScroll);

// ===== Loading Animation =====
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 100);
});

console.log('🌟 AGAIN - 找回狀態，再來一次 🌟');
