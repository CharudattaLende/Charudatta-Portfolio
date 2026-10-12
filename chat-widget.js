/**
 * VerbiTech Portfolio AI Assistant - Client Controller
 * Renders the floating launcher, chat interface, project cards, and safe navigation actions.
 */

(function () {
  'use strict';

  // API endpoint configuration (can be overridden via window.VERBITECH_API_URL)
  const API_ENDPOINT = window.VERBITECH_API_URL || 'http://localhost:8000/api/chat';

  // Allowlisted section targets
  const SAFE_NAV_TARGETS = new Set([
    '#hero',
    '#about',
    '#projects',
    '#journey',
    '#credentials',
    '#contact'
  ]);

  // Initial starter suggestions
  const STARTER_QUICK_REPLIES = [
    '✦ Show Projects',
    '✦ Tell me about VerbiTech',
    '✦ Contact Charudatta',
    '✦ Where is your resume?'
  ];

  let isOpen = false;
  let conversationHistory = [];
  let isSending = false;

  // DOM Elements
  let launcherBtn = null;
  let chatWindow = null;
  let messagesContainer = null;
  let chatInput = null;
  let sendBtn = null;

  function init() {
    createWidgetDOM();
    bindEvents();
    renderWelcomeMessage();
  }

  function createWidgetDOM() {
    // 1. Launcher Button
    launcherBtn = document.createElement('button');
    launcherBtn.id = 'verbitech-launcher';
    launcherBtn.className = 'verbitech-launcher';
    launcherBtn.setAttribute('aria-label', 'Open VerbiTech Portfolio Assistant');
    launcherBtn.innerHTML = `
      <span class="verbitech-sparkle" aria-hidden="true">✦</span>
      <span class="verbitech-label">Ask VerbiTech</span>
    `;
    document.body.appendChild(launcherBtn);

    // 2. Chat Window
    chatWindow = document.createElement('div');
    chatWindow.id = 'verbitech-chat-window';
    chatWindow.className = 'verbitech-window';
    chatWindow.setAttribute('role', 'dialog');
    chatWindow.setAttribute('aria-label', 'VerbiTech Assistant Chat');
    chatWindow.innerHTML = `
      <div class="verbitech-header">
        <div class="verbitech-header-left">
          <div class="verbitech-avatar" aria-hidden="true">V</div>
          <div class="verbitech-header-title">
            <h4>VerbiTech AI <span class="verbitech-status-dot" title="Active"></span></h4>
            <span>Portfolio Assistant</span>
          </div>
        </div>
        <button class="verbitech-header-close" id="verbitech-close" aria-label="Close Chat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="verbitech-messages" id="verbitech-messages" role="log" aria-live="polite"></div>

      <div class="verbitech-footer">
        <div class="verbitech-input-row">
          <input
            type="text"
            class="verbitech-input"
            id="verbitech-input"
            placeholder="Ask about projects, skills, or contact..."
            aria-label="Ask VerbiTech a question"
            autocomplete="off"
          />
          <button class="verbitech-send-btn" id="verbitech-send" aria-label="Send message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        <div class="verbitech-footer-caption">Grounded by VerbiTech Engine · Verified Portfolio Facts</div>
      </div>
    `;
    document.body.appendChild(chatWindow);

    messagesContainer = chatWindow.querySelector('#verbitech-messages');
    chatInput = chatWindow.querySelector('#verbitech-input');
    sendBtn = chatWindow.querySelector('#verbitech-send');
  }

  function bindEvents() {
    launcherBtn.addEventListener('click', toggleChat);
    chatWindow.querySelector('#verbitech-close').addEventListener('click', closeChat);

    sendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      } else if (e.key === 'Escape') {
        closeChat();
      }
    });

    // Close on clicking outside if open
    document.addEventListener('click', (e) => {
      if (isOpen && !chatWindow.contains(e.target) && !launcherBtn.contains(e.target)) {
        closeChat();
      }
    });
  }

  function toggleChat() {
    isOpen ? closeChat() : openChat();
  }

  function openChat() {
    isOpen = true;
    chatWindow.classList.add('open');
    chatInput.focus();
  }

  function closeChat() {
    isOpen = false;
    chatWindow.classList.remove('open');
  }

  function renderWelcomeMessage() {
    const welcomeHtml = `
      Hi! I'm <strong>VerbiTech</strong>, Charudatta's custom decoder Transformer assistant.
      I can help you explore his verified projects, technical stack in MERN and Data Engineering,
      credentials, or connect with him directly.
    `;
    appendAssistantMessage(welcomeHtml, [], [], STARTER_QUICK_REPLIES);
  }

  function formatMarkdown(text) {
    if (!text) return '';
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Bullet points
    formatted = formatted.replace(/^• (.*$)/gim, '<div style="margin-left: 0.5rem;">• $1</div>');
    formatted = formatted.replace(/^- (.*$)/gim, '<div style="margin-left: 0.5rem;">• $1</div>');
    // Line breaks
    formatted = formatted.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');

    return formatted;
  }

  function appendUserMessage(text) {
    const msgEl = document.createElement('div');
    msgEl.className = 'verbitech-msg user';
    msgEl.innerHTML = `<div class="verbitech-bubble">${formatMarkdown(text)}</div>`;
    messagesContainer.appendChild(msgEl);
    scrollToBottom();
  }

  function appendAssistantMessage(text, actions = [], projectCards = [], quickReplies = []) {
    const msgEl = document.createElement('div');
    msgEl.className = 'verbitech-msg assistant';

    let contentHtml = `<div class="verbitech-bubble">${formatMarkdown(text)}`;

    // Render Project Cards
    if (projectCards && projectCards.length > 0) {
      contentHtml += `<div class="verbitech-cards-container">`;
      projectCards.forEach((card) => {
        contentHtml += `
          <div class="verbitech-project-card">
            <div class="verbitech-card-header">
              <span class="verbitech-card-title">${card.title}</span>
              <span class="verbitech-card-badge">${card.status}</span>
            </div>
            <div class="verbitech-card-desc">${card.description || ''}</div>
            <div class="verbitech-card-tags">
              ${(card.tags || []).map((t) => `<span class="verbitech-card-tag">${t}</span>`).join('')}
            </div>
            <div class="verbitech-card-links">
              ${card.link ? `<a href="${card.link}" target="_blank" rel="noopener noreferrer" class="verbitech-btn-sm verbitech-btn-primary">Live Demo ↗</a>` : ''}
              ${card.github ? `<a href="${card.github}" target="_blank" rel="noopener noreferrer" class="verbitech-btn-sm verbitech-btn-outline">GitHub ↗</a>` : ''}
            </div>
          </div>
        `;
      });
      contentHtml += `</div>`;
    }

    // Render Actions
    if (actions && actions.length > 0) {
      contentHtml += `<div class="verbitech-actions">`;
      actions.forEach((act) => {
        if (act.type === 'navigate') {
          contentHtml += `<button class="verbitech-action-btn" data-target="${act.target}">${act.label} ↓</button>`;
        } else if (act.type === 'link') {
          contentHtml += `<a href="${act.target}" target="_blank" rel="noopener noreferrer" class="verbitech-action-btn">${act.label} ↗</a>`;
        } else if (act.type === 'contact') {
          contentHtml += `<a href="${act.target}" class="verbitech-action-btn">${act.label} ✉</a>`;
        }
      });
      contentHtml += `</div>`;
    }

    contentHtml += `</div>`; // Close bubble

    // Render Quick Replies
    if (quickReplies && quickReplies.length > 0) {
      contentHtml += `<div class="verbitech-quick-replies">`;
      quickReplies.forEach((chip) => {
        contentHtml += `<button class="verbitech-chip" data-query="${chip}">${chip}</button>`;
      });
      contentHtml += `</div>`;
    }

    msgEl.innerHTML = contentHtml;
    messagesContainer.appendChild(msgEl);

    // Bind action navigation buttons
    msgEl.querySelectorAll('button[data-target]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        handleNavigationAction(target);
      });
    });

    // Bind quick replies
    msgEl.querySelectorAll('button[data-query]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query').replace(/^✦\s*/, '');
        chatInput.value = query;
        handleSendMessage();
      });
    });

    scrollToBottom();
  }

  function showTypingIndicator() {
    const typingEl = document.createElement('div');
    typingEl.id = 'verbitech-typing-indicator';
    typingEl.className = 'verbitech-msg assistant';
    typingEl.innerHTML = `
      <div class="verbitech-typing">
        <span class="verbitech-typing-dot"></span>
        <span class="verbitech-typing-dot"></span>
        <span class="verbitech-typing-dot"></span>
      </div>
    `;
    messagesContainer.appendChild(typingEl);
    scrollToBottom();
  }

  function hideTypingIndicator() {
    const el = document.getElementById('verbitech-typing-indicator');
    if (el) el.remove();
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function handleNavigationAction(targetSelector) {
    if (!SAFE_NAV_TARGETS.has(targetSelector)) {
      console.warn('Blocked unallowlisted navigation target:', targetSelector);
      return;
    }

    const targetEl = document.querySelector(targetSelector);
    if (!targetEl) return;

    // Use Lenis smooth scroll if active
    if (window.lenis && typeof window.lenis.scrollTo === 'function') {
      window.lenis.scrollTo(targetEl, { offset: -70, duration: 1.2 });
    } else {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }

    // Highlight target section subtly
    targetEl.classList.add('nav-target-highlight');
    setTimeout(() => {
      targetEl.classList.remove('nav-target-highlight');
    }, 2000);
  }

  async function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text || isSending) return;

    chatInput.value = '';
    isSending = true;
    sendBtn.disabled = true;

    appendUserMessage(text);
    conversationHistory.push({ role: 'user', content: text });
    showTypingIndicator();

    try {
      // 1. Attempt query to FastAPI backend
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: conversationHistory.slice(-6)
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      hideTypingIndicator();

      // Transparent source attribution
      const captionEl = chatWindow.querySelector('.verbitech-footer-caption');
      if (captionEl) {
        if (data.generation_source === 'verbitech_model') {
          captionEl.textContent = 'Generated by VerbiTech Transformer · Step 2000';
        } else if (data.generation_source === 'deterministic_rule') {
          captionEl.textContent = 'Verified Portfolio Action · Safe Allowlist';
        } else {
          captionEl.textContent = 'Grounded Portfolio Facts · Model Connection Pending';
        }
      }

      appendAssistantMessage(
        data.reply,
        data.actions || [],
        data.project_cards || [],
        data.quick_replies || []
      );
      conversationHistory.push({ role: 'assistant', content: data.reply });

    } catch (err) {
      console.warn('FastAPI backend request failed, executing grounded client fallback:', err.message);
      hideTypingIndicator();

      const captionEl = chatWindow.querySelector('.verbitech-footer-caption');
      if (captionEl) {
        captionEl.textContent = 'Offline Grounded Facts · Model Connection Pending';
      }
      
      // 2. Client-side Grounded Fallback using window.PORTFOLIO_DATA
      executeClientGroundedFallback(text);
    } finally {
      isSending = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  }

  function executeClientGroundedFallback(query) {
    const data = window.PORTFOLIO_DATA || {};
    const q = query.toLowerCase().trim();
    const socials = data.contact?.socials || data.profile?.socials || {};

    let reply = '';
    let actions = [];
    let cards = [];
    let quickReplies = ['Show projects', 'Tell me about VerbiTech', 'Contact Charudatta'];

    // 1. Resume Request
    if (q.includes('resume') || q.includes('cv')) {
      const resumeUrl = data.profile?.resumeUrl;
      if (resumeUrl) {
        reply = "Here is Charudatta's verified resume. You can open or download it below.";
        actions.push({ type: 'link', target: resumeUrl, label: 'Open Resume' });
      } else {
        reply = "Charudatta's resume is currently being updated and will be available soon. In the meantime, you can review his verified credentials, education, projects, or reach out to him directly.";
        actions.push({ type: 'navigate', target: '#credentials', label: 'View Credentials' });
        if (socials.email) {
          actions.push({ type: 'contact', target: `mailto:${socials.email}`, label: 'Email Charudatta' });
        }
      }
      quickReplies = ['Show projects', 'View credentials', 'Contact Charudatta'];
    }
    // 2. Show Projects
    else if (q.includes('project') || q === 'projects') {
      reply = "Here are Charudatta's key projects, including active deployments and platforms in development:";
      actions.push({ type: 'navigate', target: '#projects', label: 'View Projects in Portfolio' });

      if (data.featuredProject) {
        cards.push({
          id: data.featuredProject.id || 'project-chat-app',
          title: data.featuredProject.headline || 'Chat App',
          status: 'Live / Deployed',
          description: data.featuredProject.description,
          tags: data.featuredProject.tags || [],
          link: data.featuredProject.liveUrl,
          github: data.featuredProject.githubUrl
        });
      }
      if (data.projectsGrid) {
        data.projectsGrid.forEach((p) => {
          cards.push({
            id: p.id,
            title: p.title,
            status: p.status,
            description: p.description,
            tags: p.tags || [],
            link: p.link,
            github: p.github
          });
        });
      }
      quickReplies = ['Tell me about ShopSphere', 'Tell me about Chat App', 'Contact Charudatta'];
    }
    // 3. VerbiTech
    else if (q.includes('verbitech')) {
      reply = "VerbiTech is Charudatta's custom decoder-only Transformer language model. It acts as his portfolio assistant, delivering grounded responses and safe actions based on verified facts.";
      actions.push({ type: 'navigate', target: '#projects', label: 'Explore Projects' });
      if (socials.github) {
        actions.push({ type: 'link', target: socials.github, label: 'GitHub Profile' });
      }
      quickReplies = ['Show projects', 'Tell me about ShopSphere', 'Contact Charudatta'];
    }
    // 4. Contact
    else if (q.includes('contact') || q.includes('email') || q.includes('reach out')) {
      reply = `You can reach Charudatta directly via email at ${socials.email || 'charudatta.lende.dev@gmail.com'} or connect on LinkedIn and GitHub.`;
      if (socials.email) {
        actions.push({ type: 'contact', target: `mailto:${socials.email}`, label: 'Send Email' });
      }
      if (socials.linkedin) {
        actions.push({ type: 'link', target: socials.linkedin, label: 'LinkedIn' });
      }
      actions.push({ type: 'navigate', target: '#contact', label: 'Go to Contact Section' });
    }
    // 5. LinkedIn
    else if (q.includes('linkedin')) {
      reply = `Connect with Charudatta on LinkedIn: ${socials.linkedin}`;
      if (socials.linkedin) {
        actions.push({ type: 'link', target: socials.linkedin, label: 'Open LinkedIn Profile' });
      }
    }
    // 6. GitHub
    else if (q.includes('github')) {
      reply = `Explore Charudatta's GitHub repositories: ${socials.github}`;
      if (socials.github) {
        actions.push({ type: 'link', target: socials.github, label: 'Open GitHub Profile' });
      }
    }
    // 7. Specific Project
    else if (q.includes('shopsphere') || q.includes('chat app')) {
      const match = q.includes('shopsphere') ? 'ShopSphere' : 'Chat App';
      reply = `**${match}** is featured in Charudatta's portfolio. Check out its details below:`;
      if (match === 'Chat App' && data.featuredProject) {
        cards.push({
          id: data.featuredProject.id || 'project-chat-app',
          title: 'Chat App',
          status: 'Live / Deployed',
          description: data.featuredProject.description,
          tags: data.featuredProject.tags || [],
          link: data.featuredProject.liveUrl,
          github: data.featuredProject.githubUrl
        });
      } else {
        const found = (data.projectsGrid || []).find((p) => p.title.toLowerCase().includes('shopsphere'));
        if (found) {
          cards.push(found);
        }
      }
      actions.push({ type: 'navigate', target: '#projects', label: 'View in Portfolio' });
    }
    // 8. General fallback
    else {
      reply = "I don't have verified information on that specific topic in Charudatta's portfolio. You can ask me about his projects (such as Chat App or ShopSphere), skills, education at YCCE, or how to get in touch.";
    }

    appendAssistantMessage(reply, actions, cards, quickReplies);
    conversationHistory.push({ role: 'assistant', content: reply });
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
