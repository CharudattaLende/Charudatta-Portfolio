/**
 * ==========================================================================
 * CHARUDATTA LENDE PORTFOLIO CORE JAVASCRIPT
 * - Preserves hardware-accelerated 240-frame canvas scroll animation
 * - Integrates Lenis smooth scrolling with anchor links
 * - Scroll-triggered section reveals via IntersectionObserver
 * - Active navigation spy & sticky header states
 * - Interactive UI utilities (Mobile drawer, navigation)
 * ==========================================================================
 */

(function () {
  'use strict';

  /* ========================================================================
     1. 240-FRAME HARDWARE-ACCELERATED CANVAS ANIMATION (PRESERVED)
     ======================================================================== */
  const TOTAL_FRAMES = 240;
  const canvas = document.getElementById('animation-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  const frames = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let targetProgress = 0;
  let currentProgress = 0;
  let lastDrawnIndex = -1;
  let dpr = window.devicePixelRatio || 1;

  // Generate zero-padded filename for frame assets
  function getFrameUrl(index, ext = 'webp') {
    const frameNumber = String(index + 1).padStart(3, '0');
    return `ezgif-frame-${frameNumber}.${ext}`;
  }

  // Preload all 240 frames
  function initPreload() {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      // Try WebP first for superior edge fidelity and compression
      img.src = getFrameUrl(i, 'webp');
      img.onload = () => {
        loadedCount++;
        // Render first frame immediately once loaded
        if (i === 0 && lastDrawnIndex === -1) {
          drawFrame(0);
        }
      };
      // Fallback to JPG if WebP fails
      img.onerror = () => {
        if (!img.src.endsWith('.jpg')) {
          img.src = getFrameUrl(i, 'jpg');
        }
      };
      frames[i] = img;
    }
  }

  initPreload();

  // Resize canvas to physical hardware pixels for razor sharpness
  function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    canvas.width = Math.round(displayWidth * dpr);
    canvas.height = Math.round(displayHeight * dpr);

    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (lastDrawnIndex >= 0) {
      drawFrame(lastDrawnIndex);
    }
  }

  // Listen for display DPI changes (multi-monitor or zoom)
  function setupDprListener() {
    const currentDpr = window.devicePixelRatio || 1;
    const mediaQuery = window.matchMedia(`(resolution: ${currentDpr}dppx)`);
    mediaQuery.addEventListener(
      'change',
      () => {
        resizeCanvas();
        setupDprListener();
      },
      { once: true }
    );
  }
  setupDprListener();

  // Find nearest loaded frame to prevent black flash
  function getBestAvailableFrame(index) {
    if (frames[index] && frames[index].complete && frames[index].naturalWidth > 0) {
      return { img: frames[index], index };
    }
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const prev = index - offset;
      if (prev >= 0 && frames[prev] && frames[prev].complete && frames[prev].naturalWidth > 0) {
        return { img: frames[prev], index: prev };
      }
      const next = index + offset;
      if (next < TOTAL_FRAMES && frames[next] && frames[next].complete && frames[next].naturalWidth > 0) {
        return { img: frames[next], index: next };
      }
    }
    return null;
  }

  // Draw frame with aspect-ratio preserving cover and sub-pixel snapping
  function drawFrame(index) {
    const frameData = getBestAvailableFrame(index);
    if (!frameData) return;

    const img = frameData.img;
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;
    const iw = img.naturalWidth || 1280;
    const ih = img.naturalHeight || 720;

    const scale = Math.max(displayWidth / iw, displayHeight / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const rawDx = (displayWidth - dw) / 2;
    const rawDy = (displayHeight - dh) / 2;

    const dx = Math.round(rawDx * dpr) / dpr;
    const dy = Math.round(rawDy * dpr) / dpr;
    const targetDw = Math.round(dw * dpr) / dpr;
    const targetDh = Math.round(dh * dpr) / dpr;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.clearRect(0, 0, displayWidth, displayHeight);
    ctx.drawImage(img, 0, 0, iw, ih, dx, dy, targetDw, targetDh);
    lastDrawnIndex = index;
  }

  // Compute scroll progress (0.0 to 1.0)
  function updateScrollProgress() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    targetProgress = maxScroll > 0 ? Math.max(0, Math.min(1, window.scrollY / maxScroll)) : 0;
  }

  /* ========================================================================
     2. LENIS SMOOTH SCROLL INTEGRATION
     ======================================================================== */
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenis.on('scroll', () => {
      updateScrollProgress();
      handleHeaderScrollState();
      updateActiveNavLinks();
    });
  } else {
    window.addEventListener('scroll', () => {
      updateScrollProgress();
      handleHeaderScrollState();
      updateActiveNavLinks();
    }, { passive: true });
  }

  // Smooth scroll to anchor links using Lenis
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        
        // Close mobile drawer if open
        closeMobileDrawer();

        if (lenis) {
          lenis.scrollTo(targetEl, { offset: -70, duration: 1.3 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* ========================================================================
     3. RENDER LOOP WITH MOMENTUM LERP (PRESERVED)
     ======================================================================== */
  function animate(time) {
    if (lenis) {
      lenis.raf(time);
    }

    const diff = targetProgress - currentProgress;
    if (Math.abs(diff) > 0.0001) {
      currentProgress += diff * 0.12;
    } else {
      currentProgress = targetProgress;
    }

    const frameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.round(currentProgress * (TOTAL_FRAMES - 1)))
    );

    if (frameIndex !== lastDrawnIndex) {
      drawFrame(frameIndex);
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resizeCanvas);
  updateScrollProgress();
  resizeCanvas();
  requestAnimationFrame(animate);

  /* ========================================================================
     4. HEADER SCROLL STATE & ACTIVE NAVIGATION SPY
     ======================================================================== */
  const siteHeader = document.getElementById('site-header');
  function handleHeaderScrollState() {
    if (!siteHeader) return;
    if (window.scrollY > 40) {
      siteHeader.classList.add('is-scrolled');
    } else {
      siteHeader.classList.remove('is-scrolled');
    }
  }

  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNavLinks() {
    const scrollPos = window.scrollY + 180;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }

  /* ========================================================================
     5. SCROLL REVEAL VIA INTERSECTION OBSERVER
     ======================================================================== */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: reveal all immediately if IntersectionObserver unsupported
    revealElements.forEach((el) => el.classList.add('is-revealed'));
  }

  /* ========================================================================
     6. MOBILE NAVIGATION DRAWER
     ======================================================================== */
  const mobileToggleBtn = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  function toggleMobileDrawer() {
    if (!mobileToggleBtn || !mobileDrawer) return;
    const isOpen = mobileDrawer.classList.contains('is-open');
    if (isOpen) {
      closeMobileDrawer();
    } else {
      mobileDrawer.classList.add('is-open');
      mobileToggleBtn.classList.add('is-active');
      mobileToggleBtn.setAttribute('aria-expanded', 'true');
      mobileDrawer.setAttribute('aria-hidden', 'false');
    }
  }

  function closeMobileDrawer() {
    if (!mobileToggleBtn || !mobileDrawer) return;
    mobileDrawer.classList.remove('is-open');
    mobileToggleBtn.classList.remove('is-active');
    mobileToggleBtn.setAttribute('aria-expanded', 'false');
    mobileDrawer.setAttribute('aria-hidden', 'true');
  }

  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', toggleMobileDrawer);
  }

  /* ========================================================================
     7. ONE-CLICK EMAIL COPY WITH TOOLTIP FEEDBACK
     ======================================================================== */
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const copyStatusLabel = document.getElementById('copy-status');

  if (copyEmailBtn && copyStatusLabel) {
    copyEmailBtn.addEventListener('click', () => {
      const emailText = document.querySelector('.email-text')?.textContent || '';
      if (!emailText) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(emailText).then(onCopySuccess).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }

      function fallbackCopy() {
        const tempInput = document.createElement('input');
        tempInput.value = emailText;
        document.body.appendChild(tempInput);
        tempInput.select();
        try {
          document.execCommand('copy');
          onCopySuccess();
        } catch (err) {
          console.warn('Copy command failed:', err);
        }
        document.body.removeChild(tempInput);
      }

      function onCopySuccess() {
        const originalText = copyStatusLabel.textContent;
        copyStatusLabel.textContent = 'Copied! ✓';
        copyStatusLabel.style.background = 'rgba(16, 185, 129, 0.2)';
        copyStatusLabel.style.color = '#10b981';

        setTimeout(() => {
          copyStatusLabel.textContent = originalText;
          copyStatusLabel.style.background = '';
          copyStatusLabel.style.color = '';
        }, 2200);
      }
    });
  }

  /* ========================================================================
     8. OPTIONAL DATA HYDRATION / VERIFICATION
     ======================================================================== */
  if (window.PORTFOLIO_DATA) {
    // Expose helper to console for quick inspection & testing
    window.updatePortfolioSection = function (sectionKey, newData) {
      console.log(`Portfolio section [${sectionKey}] updated:`, newData);
    };
  }

})();
