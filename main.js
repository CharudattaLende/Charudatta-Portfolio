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
  // Seamless dual-mode framing: Laptop widescreen cover vs Mobile portrait focal framing
  function drawFrame(index) {
    const frameData = getBestAvailableFrame(index);
    if (!frameData) return;

    const img = frameData.img;
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;
    const iw = img.naturalWidth || 1280;
    const ih = img.naturalHeight || 720;

    const isPortraitMobile = displayWidth <= 768 || (displayWidth / displayHeight < 0.92);

    let scale, dw, dh, rawDx, rawDy;

    if (!isPortraitMobile) {
      // Desktop & Laptop widescreen framing: cinematic cover with subtle head bias
      scale = Math.max(displayWidth / iw, displayHeight / ih);
      dw = iw * scale;
      dh = ih * scale;
      rawDx = (displayWidth - dw) / 2;
      rawDy = Math.min(0, (displayHeight - dh) * 0.22);
    } else {
      // Mobile portrait framing: scales to show full upper body, shoulders, and ambient lights
      // exactly like on laptop instead of an extreme close-up nose/forehead crop
      const targetDw = Math.min(Math.max(displayWidth * 1.35, 480), 720);
      scale = targetDw / iw;
      dw = iw * scale;
      dh = ih * scale;
      rawDx = (displayWidth - dw) / 2;
      // Position subject comfortably in the upper hero zone
      rawDy = Math.max(25, Math.min(115, Math.round(displayHeight * 0.12)));
    }

    const dx = Math.round(rawDx * dpr) / dpr;
    const dy = Math.round(rawDy * dpr) / dpr;
    const targetDw = Math.round(dw * dpr) / dpr;
    const targetDh = Math.round(dh * dpr) / dpr;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear whole canvas to theme background color #030205
    ctx.fillStyle = '#030205';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Draw the portrait image
    ctx.drawImage(img, 0, 0, iw, ih, dx, dy, targetDw, targetDh);

    // On mobile portrait, apply feathering so edges dissolve invisibly into the dark background
    if (isPortraitMobile) {
      // Soft top dissolve
      const topGrad = ctx.createLinearGradient(0, dy, 0, dy + 50);
      topGrad.addColorStop(0, '#030205');
      topGrad.addColorStop(1, 'rgba(3, 2, 5, 0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, dy - 2, displayWidth, 54);

      // Soft bottom dissolve
      const bottomGrad = ctx.createLinearGradient(0, dy + targetDh - 80, 0, dy + targetDh + 2);
      bottomGrad.addColorStop(0, 'rgba(3, 2, 5, 0)');
      bottomGrad.addColorStop(1, '#030205');
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, dy + targetDh - 80, displayWidth, 85);
    }

    lastDrawnIndex = index;
  }

  // ==========================================================================
  // CONFIGURABLE SCROLL-TO-FRAME RESPONSIVENESS MULTIPLIERS
  // Desktop: ~1.75x frame progression per unit scroll
  // Mobile: ~1.5x frame progression per unit scroll
  // ==========================================================================
  const SCROLL_FRAME_MULTIPLIER_DESKTOP = 1.75;
  const SCROLL_FRAME_MULTIPLIER_MOBILE = 1.5;

  function getScrollFrameMultiplier() {
    return window.innerWidth <= 768 ? SCROLL_FRAME_MULTIPLIER_MOBILE : SCROLL_FRAME_MULTIPLIER_DESKTOP;
  }

  // Compute scroll progress (0.0 to 1.0) with enhanced responsiveness
  function updateScrollProgress() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) {
      targetProgress = 0;
      return;
    }
    const multiplier = getScrollFrameMultiplier();
    const rawProgress = (window.scrollY / maxScroll) * multiplier;
    targetProgress = Math.max(0, Math.min(1, rawProgress));
  }

  // Expose configuration for runtime inspection
  if (typeof window !== 'undefined') {
    window.SCROLL_FRAME_CONFIG = {
      desktopMultiplier: SCROLL_FRAME_MULTIPLIER_DESKTOP,
      mobileMultiplier: SCROLL_FRAME_MULTIPLIER_MOBILE,
      getMultiplier: getScrollFrameMultiplier
    };
  }

  /* ========================================================================
     2. DOM ELEMENTS & UI STATE HANDLERS
     ======================================================================== */
  const siteHeader = document.getElementById('site-header');
  const heroSection = document.getElementById('hero');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const mobileBottomTabs = document.querySelectorAll('.mobile-bottom-tab');
  const sections = document.querySelectorAll('section[id]');
  const mobileToggleBtn = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileDrawerBackdrop = document.getElementById('mobile-drawer-backdrop');

  function handleHeaderScrollState() {
    if (!siteHeader) return;
    if (window.scrollY > 40) {
      siteHeader.classList.add('is-scrolled');
    } else {
      siteHeader.classList.remove('is-scrolled');
    }
  }

  function handleBackgroundPortraitOpacity() {
    if (!heroSection) return;
    const heroThreshold = heroSection.offsetTop + heroSection.offsetHeight * 0.65;
    if (window.scrollY > heroThreshold) {
      document.body.classList.add('is-past-hero');
    } else {
      document.body.classList.remove('is-past-hero');
    }
  }

  function updateActiveNavLinks() {
    const scrollPos = window.scrollY + 180;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
        });
        mobileNavLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
        });
        mobileBottomTabs.forEach((tab) => {
          tab.classList.toggle('active', tab.getAttribute('href') === `#${sectionId}`);
        });
      }
    });
  }

  function toggleMobileDrawer() {
    if (!mobileToggleBtn || !mobileDrawer) return;
    const isOpen = mobileDrawer.classList.contains('is-open');
    if (isOpen) {
      closeMobileDrawer();
    } else {
      mobileDrawer.classList.add('is-open');
      if (mobileDrawerBackdrop) mobileDrawerBackdrop.classList.add('is-open');
      mobileToggleBtn.classList.add('is-active');
      mobileToggleBtn.setAttribute('aria-expanded', 'true');
      mobileDrawer.setAttribute('aria-hidden', 'false');
    }
  }

  function closeMobileDrawer() {
    if (!mobileToggleBtn || !mobileDrawer) return;
    mobileDrawer.classList.remove('is-open');
    if (mobileDrawerBackdrop) mobileDrawerBackdrop.classList.remove('is-open');
    mobileToggleBtn.classList.remove('is-active');
    mobileToggleBtn.setAttribute('aria-expanded', 'false');
    mobileDrawer.setAttribute('aria-hidden', 'true');
  }

  /* ========================================================================
     3. LENIS SMOOTH SCROLL INTEGRATION
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
      handleBackgroundPortraitOpacity();
    });
  } else {
    window.addEventListener('scroll', () => {
      updateScrollProgress();
      handleHeaderScrollState();
      updateActiveNavLinks();
      handleBackgroundPortraitOpacity();
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
     4. RENDER LOOP WITH MOMENTUM LERP (PRESERVED)
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
  handleBackgroundPortraitOpacity();
  requestAnimationFrame(animate);

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
     6. MOBILE NAVIGATION DRAWER LISTENERS
     ======================================================================== */
  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', toggleMobileDrawer);
  }

  // Close mobile drawer on Escape key or tap outside
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileDrawer();
    }
  });

  document.addEventListener('click', (e) => {
    if (
      mobileDrawer &&
      mobileDrawer.classList.contains('is-open') &&
      !mobileDrawer.contains(e.target) &&
      !mobileToggleBtn.contains(e.target)
    ) {
      closeMobileDrawer();
    }
  });

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

  // Backdrop click closes mobile drawer
  if (mobileDrawerBackdrop) {
    mobileDrawerBackdrop.addEventListener('click', closeMobileDrawer);
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

  /* ========================================================================
     9. PROGRESSIVE WEB APP (PWA) REGISTRATION & INSTALLATION
     ======================================================================== */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
          console.log('Portfolio PWA Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.warn('Portfolio PWA Service Worker failed:', error);
        });
    });
  }

  let deferredInstallPrompt = null;
  const pwaInstallButtons = document.querySelectorAll('.pwa-install-trigger');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    pwaInstallButtons.forEach((btn) => {
      btn.style.display = 'inline-flex';
    });
  });

  pwaInstallButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      console.log('User install prompt outcome:', outcome);
      if (outcome === 'accepted') {
        pwaInstallButtons.forEach((b) => (b.style.display = 'none'));
      }
      deferredInstallPrompt = null;
    });
  });

  window.addEventListener('appinstalled', () => {
    pwaInstallButtons.forEach((b) => (b.style.display = 'none'));
    console.log('Charudatta Portfolio PWA successfully installed!');
  });

})();
