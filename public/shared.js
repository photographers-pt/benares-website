console.log("Complete shared.js loaded");

// =================================
// HEADER CREATION
// =================================

function createHeader() {
  return `
    <style>
      nav a.active {
        background-color: rgba(255, 255, 255, 0.15);
        padding: 8px 16px;
        border-radius: 6px;
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      nav img {
        vertical-align: middle;
      }

      /* "THE TEAM" stands out in the menu (the text itself stays "The team") */
      nav a[href="/team/"] { text-transform: uppercase; }
      @media (min-width: 769px) { nav a[href="/team/"] { letter-spacing: 0.06em; } }
    </style>

   <header>
      <a href="/">
        <img src="/media/A00_Logo_&_title_-_light.png" alt="Club Benares" style="height: 30px;">
      </a>
      <div id="lang-switch" class="lang-switch lang-switch--header" role="group" aria-label="Idioma" translate="no">
        <button type="button" class="lang-opt" data-set-lang="pt" lang="pt" aria-pressed="false">PT</button>
        <button type="button" class="lang-opt" data-set-lang="en" lang="en" aria-pressed="false">EN</button>
        <button type="button" class="lang-opt" data-set-lang="es" lang="es" aria-pressed="false">ES</button>
      </div>
      <button class="nav-toggle" id="nav-toggle" aria-label="Abrir menu" aria-expanded="false">
        <svg class="nav-icon-burger" width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="20" height="2" rx="1" fill="currentColor"/>
          <rect y="6" width="20" height="2" rx="1" fill="currentColor"/>
          <rect y="12" width="20" height="2" rx="1" fill="currentColor"/>
        </svg>
      </button>
    </header>

    <nav aria-label="Menu principal" id="main-nav" class="active">
      <ul>
        <li><a href="/eventos/">Eventos</a></li>
        <li><a href="/cinemateca/">Cinemateca</a></li>
        <li><a href="/fototeca/">Fototeca</a></li>
        <li><a href="/team/">The team</a></li>
        <li><a href="/contactos/">Contactos</a></li>
      </ul>
    </nav>
  `;
}

// =================================
// FOOTER CREATION
// =================================

function createFooter() {
  return `
    <style>
      .shadow-toggle-btn:hover {
        background-color: rgba(255, 255, 255, 0.15) !important;
        box-shadow: 0 0 6px rgba(255, 255, 255, 0.1) !important;
        transform: none !important;
      }
      
      nav a.active {
        background-color: rgba(255, 255, 255, 0.15);
        padding: 8px 16px;
        border-radius: 6px;
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
    </style>
    <footer>
      <div class="copyright">
        &copy; 2026 Club Benares.
      </div>
      
      <div class="social-icons">
        <a href="https://www.instagram.com/thebenaresclub" target="_blank" aria-label="Instagram">
          <i class="fab fa-instagram"></i>
        </a>
        <a href="mailto:charlie@thebenaresclub.com" aria-label="Email">
          <i class="fas fa-envelope"></i>
        </a>
      </div>
    </footer>
  `;
}

// =================================
// LANGUAGE SWITCHER
// =================================

// The language logic (switcher clicks, translating text, data-lang elements,
// persistence, 'langchange' event) lives in /i18n.js with the texts in /i18n-dict.js.
// These helpers are kept for pages that still call them.

const LANGS = ['pt', 'en', 'es'];

function getCurrentLang() {
  return window.i18n ? window.i18n.lang() : (localStorage.getItem('site-lang') || 'pt');
}

function applyLang(lang) {
  if (window.i18n) window.i18n.setLang(lang);
}

// Pages should include /i18n-dict.js and /i18n.js in <head>. If one forgets, load them here
// so the language switcher in the header still works.
function ensureI18n() {
  if (window.i18n) return;
  function load(src, done) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = done;
    document.head.appendChild(s);
  }
  load('/i18n-dict.js', function () { load('/i18n.js'); });
}

// =================================
// NAV TOGGLE FUNCTIONALITY
// =================================

function initializeNavToggle() {
  const toggleBtn = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');

  if (!toggleBtn || !nav) return;

  function isMobile() { return window.innerWidth <= 768; }

  // The icon always stays a burger; state is shown by the menu itself (and aria-expanded/label).
  function openNav() {
    nav.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.setAttribute('aria-label', 'Fechar menu');
  }

  function closeNav() {
    nav.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-label', 'Abrir menu');
  }

  // Small "pop" on every tap (open and close), see .nav-toggle.is-tapped in styles.css
  function pulse() {
    toggleBtn.classList.remove('is-tapped');
    void toggleBtn.offsetWidth; // restart the animation if tapped again quickly
    toggleBtn.classList.add('is-tapped');
  }
  toggleBtn.addEventListener('animationend', function() {
    toggleBtn.classList.remove('is-tapped');
  });

  // Initial state
  if (isMobile()) {
    closeNav();
  } else {
    openNav();
  }

  toggleBtn.addEventListener('click', function() {
    pulse();
    nav.classList.contains('active') ? closeNav() : openNav();
  });

  // Close when a link is tapped on mobile
  nav.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      if (isMobile()) closeNav();
    });
  });

  // Re-open on resize to desktop
  window.addEventListener('resize', function() {
    if (!isMobile()) openNav();
  });
}

// =================================
// GITHUB STATUS FUNCTIONALITY
// =================================

async function updateGitHubStatus() {
  const owner = "TheBenaresClub";
  const repo = "TheBenaresClub.github.io";
  const toggleBtn = document.getElementById("shadow-toggle");

  if (!toggleBtn) return;

  try {
    // Check for active workflow runs
    const workflowRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=1`);
    const workflowData = await workflowRes.json();
    
    if (workflowData.workflow_runs && workflowData.workflow_runs.length > 0) {
      const latestRun = workflowData.workflow_runs[0];
      const status = latestRun.status; // queued, in_progress, completed
      const conclusion = latestRun.conclusion; // success, failure, cancelled, etc.
      
      // If workflow is running
      if (status === "queued" || status === "in_progress") {
        toggleBtn.textContent = "Building";
        toggleBtn.classList.add('github-pending');
        toggleBtn.classList.remove('github-success', 'github-failure', 'github-error');
        return;
      }
      
      // If workflow completed
      if (status === "completed") {
        if (conclusion === "success") {
          toggleBtn.textContent = "Online";
          toggleBtn.classList.add('github-success');
          toggleBtn.classList.remove('github-pending', 'github-failure', 'github-error');
        } else if (conclusion === "failure") {
          toggleBtn.textContent = "Failed";
          toggleBtn.classList.add('github-failure');
          toggleBtn.classList.remove('github-pending', 'github-success', 'github-error');
        } else {
          toggleBtn.textContent = "Unknown";
          toggleBtn.classList.remove('github-pending', 'github-success', 'github-failure', 'github-error');
        }
        return;
      }
    }
    
    // No workflows found - assume online
    toggleBtn.textContent = "Online";
    toggleBtn.classList.add('github-success');
    toggleBtn.classList.remove('github-pending', 'github-failure', 'github-error');
    
  } catch (err) {
    console.error("Error fetching GitHub status:", err);
    toggleBtn.textContent = "Error";
    toggleBtn.classList.add('github-error');
    toggleBtn.classList.remove('github-pending', 'github-success', 'github-failure');
  }
}

// =================================
// SHADOW TOGGLE FUNCTIONALITY
// =================================

let shadowsEnabled = false; // Shadows OFF by default

function toggleBoxShadows() {
  const allElements = document.querySelectorAll('*');
  const toggleBtn = document.getElementById('shadow-toggle');
  const debugItems = document.querySelectorAll('[data-debug="true"]');
  
  if (shadowsEnabled) {
    // Turn OFF shadows and hide debug items
    shadowsEnabled = false;
    
    allElements.forEach(element => {
      element.style.boxShadow = 'none';
    });
    
    debugItems.forEach(item => {
      item.style.display = 'none';
    });
    
    // Update button - keep status text
    toggleBtn.classList.add('shadows-off');
  } else {
    // Turn ON shadows and show debug items
    shadowsEnabled = true;
    
    // Apply shadows
    applyRandomBoxShadows();
    
    debugItems.forEach(item => {
      item.style.display = '';
    });
    
    // Update button - keep status text
    toggleBtn.classList.remove('shadows-off');
  }
}

// =================================
// RANDOM COLORED BOX SHADOWS
// =================================

function generateRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 40) + 60;
  const lightness = Math.floor(Math.random() * 30) + 60;
  const alpha = (Math.random() * 0.4) + 0.3;
  
  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
}

function applyRandomBoxShadows() {
  if (!shadowsEnabled) return;
  
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(element => {
    const randomColor = generateRandomColor();
    const shadowBlur = Math.floor(Math.random() * 8) + 2;
    const offsetX = (Math.random() - 0.5) * 4;
    const offsetY = (Math.random() - 0.5) * 4;
    
    element.style.boxShadow = `${offsetX}px ${offsetY}px ${shadowBlur}px ${randomColor}`;
  });
}

// =================================
// PAGE INITIALIZATION
// =================================

document.addEventListener('DOMContentLoaded', function() {

  // Insert header
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    headerContainer.innerHTML = createHeader();
    initializeNavToggle();
    ensureI18n();
  }

  // Highlight current page — never highlight anything on home "/"
  const currentPath = window.location.pathname;
  if (currentPath !== '/') {
    document.querySelectorAll('nav a').forEach(link => {
      const href = link.getAttribute('href');
      if (href && href !== '/' && currentPath.startsWith(href)) {
        link.classList.add('active');
      }
    });
  }

  // Insert footer
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    console.log("Footer container found, inserting footer");
    footerContainer.innerHTML = createFooter();
    
    // Add toggle functionality
    const toggleBtn = document.getElementById('shadow-toggle');
    if (toggleBtn) toggleBtn.addEventListener('click', toggleBoxShadows);
    updateGitHubStatus();
    setInterval(updateGitHubStatus, 60000);
  }
});
