// Scroll reveal: use IntersectionObserver to trigger fade-in animations
// when elements with [data-scroll] enter the viewport.

function initScrollReveal() {
  // Find all elements marked for scroll reveal
  const revealElements = document.querySelectorAll('[data-scroll]');

  if (revealElements.length === 0) return;

  // Create observer that adds .scroll-reveal class when element enters viewport
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Element entered viewport: trigger animation
          entry.target.classList.add('scroll-reveal');
          // Stop observing this element (animation only happens once)
          observer.unobserve(entry.target);
        }
      });
    },
    {
      // Start animation when element is 10% visible
      threshold: 0.1,
    }
  );

  // Observe all reveal elements
  revealElements.forEach((element) => {
    observer.observe(element);
  });
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollReveal);
} else {
  initScrollReveal();
}
