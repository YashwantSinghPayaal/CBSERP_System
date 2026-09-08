import gsap from 'gsap';

// Page entrance fade & slide up animation
export const animatePageEntrance = (target) => {
  if (!target) return;
  gsap.fromTo(
    target,
    { opacity: 0, y: 24, scale: 0.99 },
    { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }
  );
};

// Staggered child elements entrance
export const animateStaggerList = (containerRef, childSelector = '.animate-item') => {
  if (!containerRef || !containerRef.current) return;
  const items = containerRef.current.querySelectorAll(childSelector);
  if (items.length === 0) return;

  gsap.fromTo(
    items,
    { opacity: 0, y: 20, scale: 0.96 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      stagger: 0.08,
      ease: 'back.out(1.2)'
    }
  );
};

// Number count-up animation for metrics/stats
export const animateCountUp = (targetRef, finalValue, duration = 1.2) => {
  if (!targetRef || !targetRef.current) return;
  const obj = { value: 0 };
  gsap.to(obj, {
    value: finalValue,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      if (targetRef.current) {
        targetRef.current.textContent = Math.round(obj.value).toLocaleString();
      }
    }
  });
};

// Modal entrance popup
export const animateModalEntrance = (overlayRef, cardRef) => {
  if (!overlayRef || !cardRef) return;
  gsap.fromTo(overlayRef, { opacity: 0 }, { opacity: 1, duration: 0.25 });
  gsap.fromTo(
    cardRef,
    { opacity: 0, scale: 0.85, y: -20 },
    { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.5)' }
  );
};

// Card hover pulse effect
export const animateCardHover = (e, isHovered) => {
  gsap.to(e.currentTarget, {
    scale: isHovered ? 1.02 : 1,
    y: isHovered ? -4 : 0,
    duration: 0.25,
    ease: 'power2.out'
  });
};
