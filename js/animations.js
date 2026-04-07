(function() {
    'use strict';

    // Check for reduced motion preference
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Intersection Observer for reveal animations
    var observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    var revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements with reveal class
    document.querySelectorAll('.reveal-on-scroll').forEach(function(el) {
        revealObserver.observe(el);
    });

    // Staggered reveal for lists
    document.querySelectorAll('.stagger-container').forEach(function(container) {
        var items = container.querySelectorAll('.stagger-item');
        items.forEach(function(item, index) {
            item.style.transitionDelay = (index * 50) + 'ms';
        });
    });
})();
