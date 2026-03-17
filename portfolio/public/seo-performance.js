// SEO Performance Optimization Script
// Core Web Vitals and Performance Enhancements

// Lazy Loading Implementation for Images
const lazyImageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        lazyImageObserver.unobserve(img);
      }
    }
  });
}, {
  rootMargin: '50px 0px',
  threshold: 0.01
});

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', () => {
  // Observe all images with lazy loading
  document.querySelectorAll('img[data-src]').forEach(img => {
    lazyImageObserver.observe(img);
  });

  // Preload critical resources
  preloadCriticalResources();
  
  // Optimize font loading
  optimizeFontLoading();
  
  // Add proper image dimensions for CLS
  addImageDimensions();
});

function preloadCriticalResources() {
  // Preload critical CSS
  const criticalCSS = document.createElement('link');
  criticalCSS.rel = 'preload';
  criticalCSS.href = '/src/index.css';
  criticalCSS.as = 'style';
  criticalCSS.onload = function() {
    this.rel = 'stylesheet';
  };
  document.head.appendChild(criticalCSS);

  // Preload hero image
  const heroImage = document.createElement('link');
  heroImage.rel = 'preload';
  heroImage.as = 'image';
  heroImage.href = '/SachinProf.jpg';
  document.head.appendChild(heroImage);
}

function optimizeFontLoading() {
  // Add font-display: swap for better loading
  const fontDisplayStyle = document.createElement('style');
  fontDisplayStyle.textContent = `
    @font-face {
      font-family: 'FontAwesome';
      src: url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
      font-display: swap;
    }
  `;
  document.head.appendChild(fontDisplayStyle);
}

function addImageDimensions() {
  // Add width/height attributes to prevent layout shifts
  document.querySelectorAll('img:not([width]):not([height])').forEach(img => {
    if (img.naturalWidth && img.naturalHeight) {
      img.setAttribute('width', img.naturalWidth);
      img.setAttribute('height', img.naturalHeight);
    }
  });
}

// Core Web Vitals Monitoring
function reportWebVitals() {
  if (window.gtag) {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      gtag('event', 'LCP', {
        event_category: 'Web Vitals',
        value: Math.round(lastEntry.startTime),
        event_label: lastEntry.name
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        gtag('event', 'FID', {
          event_category: 'Web Vitals',
          value: Math.round(entry.processingStart - entry.startTime),
          event_label: entry.name
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      if (clsValue > 0.1) {
        gtag('event', 'CLS', {
          event_category: 'Web Vitals',
          value: Math.round(clsValue * 1000),
          event_label: 'Layout Shift'
        });
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  reportWebVitals();
}

// SEO-friendly URL handling
function updateCanonicalURL(newPath) {
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    canonicalLink.href = `https://thesachinbansal.in${newPath}`;
  }
  
  // Update Open Graph URL
  const ogURL = document.querySelector('meta[property="og:url"]');
  if (ogURL) {
    ogURL.content = `https://thesachinbansal.in${newPath}`;
  }
}

// Smooth scroll for better UX
function smoothScrollTo(element) {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

// Export for use in components
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    updateCanonicalURL,
    smoothScrollTo,
    lazyImageObserver
  };
}
