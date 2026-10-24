'use strict';
/* ============================================================
   Jalal Khan — Portfolio logic
   - Projects: full CRUD (create / read / update / delete),
     persisted in localStorage, seeded with featured projects.
   - Auth: local demo accounts (SHA-256 hashed passwords,
     localStorage). Login unlocks Edit Mode for the CRUD tools.
   - Security: all stored data is rendered with textContent
     (never innerHTML), URLs are scheme-checked (http/https).
   ============================================================ */

/* ---------------- seed data ---------------- */
const SEED_PROJECTS = [
    {
        id: 'seed-greeting-ninja',
        title: 'greeting-ninja',
        desc: 'Zero-dependency npm library that greets WhatsApp users in their own language, detected from their phone number\u2019s country code (61 languages, 80+ country codes). MIT licensed, automated tests passing.',
        stack: 'Node.js',
        url: 'https://github.com/Jalalkhan96/greeting-ninja'
    },
    {
        id: 'seed-blood-donation',
        title: 'BloodDonationApp',
        desc: 'Blood donation app with donor/recipient flows and Firebase backend (Auth, Firestore rules and indexes included).',
        stack: 'Flutter / Dart / Firebase',
        url: 'https://github.com/Jalalkhan96/BloodDonationApp'
    },
    {
        id: 'seed-clipboard',
        title: 'Linux-Clipboard-Manager',
        desc: 'Clipboard history manager for Linux desktops with hotkeys and autostart installer. MIT licensed.',
        stack: 'Python',
        url: 'https://github.com/Jalalkhan96/Linux-Clipboard-Manager'
    },
    {
        id: 'seed-laptop-price',
        title: 'laptop-price-predictors',
        desc: 'Machine-learning model that predicts laptop prices from specifications.',
        stack: 'Python / Jupyter / CatBoost',
        url: 'https://github.com/Jalalkhan96/laptop-price-predictors'
    },
    {
        id: 'seed-voice-controller',
        title: 'abix-voice-controller',
        desc: 'Local-first, voice-controlled AI agent for the desktop, with its own test suite.',
        stack: 'Python',
        url: 'https://github.com/Jalalkhan96/abix-voice-controller'
    },
    {
        id: 'seed-collabarchive',
        title: 'collabarchive',
        desc: 'Video-processing notebooks: 4K upscale/120fps pipeline, face clip extraction, subtitle generation.',
        stack: 'Python / Jupyter',
        url: 'https://github.com/Jalalkhan96/collabarchive'
    }
];

const LS_PROJECTS = 'jk_portfolio_projects_v1';
const LS_USERS = 'jk_portfolio_users_v1';
const SS_SESSION = 'jk_portfolio_session_v1';

/* ---------------- tiny helpers ---------------- */
const $ = (sel) => document.querySelector(sel);

function loadJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

function isSafeUrl(value) {
    if (!value) return true; // empty URL is allowed (no link rendered)
    try {
        const u = new URL(value);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
        return false;
    }
}

let toastTimer = null;
function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => { el.hidden = true; }, 320);
    }, 2600);
}

/* ---------------- projects store (CRUD) ---------------- */
let projects = loadJSON(LS_PROJECTS, null);
if (!Array.isArray(projects)) {
    projects = structuredClone(SEED_PROJECTS);
    saveJSON(LS_PROJECTS, projects);
}

function persistProjects() {
    saveJSON(LS_PROJECTS, projects);
}

function createProject(data) {
    const project = { id: uid(), title: data.title, desc: data.desc, stack: data.stack, url: data.url };
    projects.unshift(project);
    persistProjects();
    return project;
}

function updateProject(id, data) {
    const p = projects.find((x) => x.id === id);
    if (!p) return null;
    p.title = data.title;
    p.desc = data.desc;
    p.stack = data.stack;
    p.url = data.url;
    persistProjects();
    return p;
}

function deleteProject(id) {
    projects = projects.filter((x) => x.id !== id);
    persistProjects();
}

function getFilteredProjects() {
    const q = ($('#projectSearch').value || '').trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) =>
        (p.title + ' ' + p.desc + ' ' + p.stack).toLowerCase().includes(q));
}

/* ---------------- rendering (textContent only — no XSS sinks) ---------------- */
const grid = $('#projectsGrid');
const emptyNote = $('#emptyNote');

function renderProjects() {
    const list = getFilteredProjects();
    grid.replaceChildren();
    emptyNote.hidden = list.length !== 0;

    for (const p of list) {
        const card = document.createElement('article');
        card.className = 'project-card reveal visible';

        const h3 = document.createElement('h3');
        if (p.url) {
            const a = document.createElement('a');
            a.href = p.url;
            a.target = '_blank';
            a.rel = 'noopener';
            a.textContent = p.title;
            h3.appendChild(a);
        } else {
            h3.textContent = p.title;
        }
        card.appendChild(h3);

        const desc = document.createElement('p');
        desc.className = 'desc';
        desc.textContent = p.desc;
        card.appendChild(desc);

        if (p.stack) {
            const chip = document.createElement('span');
            chip.className = 'stack-chip';
            chip.textContent = p.stack;
            card.appendChild(chip);
        }

        if (isAuthed()) {
            const actions = document.createElement('div');
            actions.className = 'card-actions';

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => openProjectForm(p));

            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.className = 'delete';
            delBtn.textContent = 'Delete';
            delBtn.addEventListener('click', () => {
                if (confirm('Delete project "' + p.title + '"?')) {
                    deleteProject(p.id);
                    renderProjects();
                    toast('Project deleted.');
                }
            });

            actions.append(editBtn, delBtn);
            card.appendChild(actions);
        }

        grid.appendChild(card);
    }
}

$('#projectSearch').addEventListener('input', renderProjects);

/* ---------------- project form (create / update) ---------------- */
const projectOverlay = $('#projectOverlay');
const projectForm = $('#projectForm');
let editingId = null;

function openOverlay(overlay) {
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('open'));
}

function closeOverlay(overlay) {
    overlay.classList.remove('open');
    setTimeout(() => { overlay.hidden = true; }, 220);
}

function openProjectForm(project) {
    editingId = project ? project.id : null;
    $('#projectFormTitle').textContent = project ? 'Edit Project' : 'Add Project';
    $('#projectSaveBtn').textContent = project ? 'Save Changes' : 'Save Project';
    $('#pfTitle').value = project ? project.title : '';
    $('#pfStack').value = project ? project.stack : '';
    $('#pfUrl').value = project ? project.url : '';
    $('#pfDesc').value = project ? project.desc : '';
    setMsg($('#projectMsg'), '');
    openOverlay(projectOverlay);
    $('#pfTitle').focus();
}

function readProjectForm() {
    const data = {
        title: $('#pfTitle').value.trim(),
        stack: $('#pfStack').value.trim(),
        url: $('#pfUrl').value.trim(),
        desc: $('#pfDesc').value.trim()
    };
    if (!data.title) return { error: 'Title is required.' };
    if (!data.desc) return { error: 'Description is required.' };
    if (!isSafeUrl(data.url)) return { error: 'Project URL must start with http:// or https:// (or be empty).' };
    return { data };
}

projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const { data, error } = readProjectForm();
    if (error) {
        setMsg($('#projectMsg'), error);
        return;
    }
    if (editingId) {
        updateProject(editingId, data);
        toast('Project updated.');
    } else {
        createProject(data);
        toast('Project added.');
    }
    closeOverlay(projectOverlay);
    renderProjects();
});

$('#addProjectBtn').addEventListener('click', () => openProjectForm(null));
$('#projectClose').addEventListener('click', () => closeOverlay(projectOverlay));
projectOverlay.addEventListener('click', (e) => {
    if (e.target === projectOverlay) closeOverlay(projectOverlay);
});

/* ---------------- export / import / reset ---------------- */
$('#exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'portfolio-projects.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Projects exported as JSON.');
});

$('#importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
        const parsed = JSON.parse(await file.text());
        if (!Array.isArray(parsed)) throw new Error('not an array');
        const clean = [];
        for (const item of parsed) {
            if (!item || typeof item.title !== 'string' || typeof item.desc !== 'string') {
                throw new Error('bad item');
            }
            const url = typeof item.url === 'string' ? item.url.trim() : '';
            if (!isSafeUrl(url)) throw new Error('bad url');
            clean.push({
                id: uid(),
                title: item.title.slice(0, 80),
                desc: item.desc.slice(0, 500),
                stack: typeof item.stack === 'string' ? item.stack.slice(0, 80) : '',
                url
            });
        }
        projects = clean;
        persistProjects();
        renderProjects();
        toast('Imported ' + clean.length + ' projects.');
    } catch {
        toast('Import failed: not a valid projects JSON file.');
    }
});

$('#resetBtn').addEventListener('click', () => {
    if (confirm('Reset projects to the original featured six? Your edits will be lost (export first if needed).')) {
        projects = structuredClone(SEED_PROJECTS);
        persistProjects();
        renderProjects();
        toast('Projects reset to defaults.');
    }
});

/* ---------------- auth (local demo accounts) ---------------- */
function getUsers() {
    const users = loadJSON(LS_USERS, []);
    return Array.isArray(users) ? users : [];
}

async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function currentSession() {
    try {
        return JSON.parse(sessionStorage.getItem(SS_SESSION) || localStorage.getItem(SS_SESSION) || 'null');
    } catch {
        return null;
    }
}

function isAuthed() {
    return !!currentSession();
}

function setSession(user, remember) {
    const payload = JSON.stringify({ email: user.email, username: user.username });
    if (remember) localStorage.setItem(SS_SESSION, payload);
    else sessionStorage.setItem(SS_SESSION, payload);
}

function clearSession() {
    sessionStorage.removeItem(SS_SESSION);
    localStorage.removeItem(SS_SESSION);
}

function setMsg(el, text, ok) {
    el.textContent = text;
    el.classList.toggle('ok', !!ok);
    if (text && !ok) {
        const wrapper = el.closest('.wrapper');
        if (wrapper) {
            wrapper.classList.remove('shake');
            void wrapper.offsetWidth; // restart the animation
            wrapper.classList.add('shake');
        }
    }
}

function applyAuthUI() {
    const authed = isAuthed();
    $('#editTools').hidden = !authed;
    $('#editBadge').hidden = !authed;
    $('#editHint').hidden = authed;
    const btn = $('#authBtn');
    btn.textContent = authed ? 'Logout' : 'Login';
    btn.classList.toggle('logged-in', authed);
    renderProjects();
}

$('#registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('#registerMsg');
    const username = $('#regUsername').value.trim();
    const email = $('#regEmail').value.trim().toLowerCase();
    const password = $('#regPassword').value;
    if (!username || !email || password.length < 6) {
        setMsg(msg, 'Fill all fields — password must be at least 6 characters.');
        return;
    }
    if (!$('#regAgree').checked) {
        setMsg(msg, 'Please agree to the terms and conditions.');
        return;
    }
    const users = getUsers();
    if (users.some((u) => u.email === email)) {
        setMsg(msg, 'An account with this email already exists in this browser. Log in instead.');
        return;
    }
    users.push({ username, email, passHash: await sha256(password) });
    saveJSON(LS_USERS, users);
    setMsg(msg, 'Account created. You can log in now.', true);
    setTimeout(() => {
        $('#authWrapper').classList.remove('active');
        $('#loginEmail').value = email;
    }, 700);
});

$('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('#loginMsg');
    const email = $('#loginEmail').value.trim().toLowerCase();
    const password = $('#loginPassword').value;
    const user = getUsers().find((u) => u.email === email);
    if (!user) {
        setMsg(msg, 'No account with this email in this browser. Register first.');
        return;
    }
    if (user.passHash !== await sha256(password)) {
        setMsg(msg, 'Wrong password. Try again.');
        return;
    }
    setSession(user, $('#loginRemember').checked);
    setMsg(msg, 'Welcome back, ' + user.username + '!', true);
    setTimeout(() => {
        closeOverlay($('#authOverlay'));
        applyAuthUI();
        toast('Edit mode enabled — you can add, edit and delete projects.');
    }, 500);
});

$('#forgotLink').addEventListener('click', (e) => {
    e.preventDefault();
    setMsg($('#loginMsg'),
        'Demo note: accounts live only in this browser (no email server). If the password is lost, register a new account or clear this site\u2019s data.');
});

/* ---------------- auth popup open/close + slide ---------------- */
const authOverlay = $('#authOverlay');
const authWrapper = $('#authWrapper');

$('#authBtn').addEventListener('click', () => {
    if (isAuthed()) {
        clearSession();
        applyAuthUI();
        toast('Logged out. Edit mode off.');
        return;
    }
    authWrapper.classList.remove('active');
    setMsg($('#loginMsg'), '');
    setMsg($('#registerMsg'), '');
    openOverlay(authOverlay);
});

$('#authClose').addEventListener('click', () => closeOverlay(authOverlay));
authOverlay.addEventListener('click', (e) => {
    if (e.target === authOverlay) closeOverlay(authOverlay);
});

document.querySelector('.register-link').addEventListener('click', (e) => {
    e.preventDefault();
    authWrapper.classList.add('active');
});

document.querySelector('.login-link').addEventListener('click', (e) => {
    e.preventDefault();
    authWrapper.classList.remove('active');
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (!authOverlay.hidden) closeOverlay(authOverlay);
        if (!projectOverlay.hidden) closeOverlay(projectOverlay);
    }
});

/* ---------------- typing effect ---------------- */
const ROLES = ['Software Engineer', 'Full-Stack Developer', 'WhatsApp Automation Builder', 'Flutter Developer', 'Toolmaker & Open-Source Builder'];
const typedEl = $('#typedRole');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduceMotion) {
    typedEl.textContent = ROLES[0];
} else {
    let roleIdx = 0, charIdx = 0, deleting = false;
    (function typeLoop() {
        const word = ROLES[roleIdx];
        typedEl.textContent = word.slice(0, charIdx);
        let delay = deleting ? 45 : 95;
        if (!deleting && charIdx === word.length) { delay = 1500; deleting = true; }
        else if (deleting && charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % ROLES.length; delay = 350; }
        charIdx += deleting ? -1 : 1;
        setTimeout(typeLoop, delay);
    })();
}

/* ---------------- scroll reveal ---------------- */
const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    }
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ---------------- mobile nav + footer ---------------- */
const navToggle = $('#navToggle');
const mainNav = $('#mainNav');
navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
});
mainNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
}));

$('#year').textContent = String(new Date().getFullYear());

/* ---------------- init ---------------- */
applyAuthUI();

/* ---------------- premium v3 enhancements ----------------
   Scroll progress, floating-header state, active-nav highlight,
   animated stat counters, project-card spotlight, back-to-top.
   All additive: CRUD/auth logic above is untouched. */
(function premiumV3() {
    const progress = $('#scrollProgress');
    const header = $('#siteHeader');
    const toTop = $('#toTop');
    let ticking = false;

    function onScroll() {
        const max = document.documentElement.scrollHeight - innerHeight;
        const y = window.scrollY || 0;
        if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
        if (header) header.classList.toggle('scrolled', y > 24);
        if (toTop) toTop.hidden = y < 600;
        ticking = false;
    }
    addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    if (toTop) toTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    /* active nav link */
    const navLinks = new Map();
    document.querySelectorAll('[data-nav]').forEach((a) => navLinks.set(a.dataset.nav, a));
    const navObserver = new IntersectionObserver((entries) => {
        for (const e of entries) {
            if (e.isIntersecting && navLinks.has(e.target.id)) {
                navLinks.forEach((a) => a.classList.remove('active'));
                navLinks.get(e.target.id).classList.add('active');
            }
        }
    }, { rootMargin: '-38% 0px -55% 0px' });
    ['home', 'about', 'skills', 'projects', 'contact'].forEach((id) => {
        const s = document.getElementById(id);
        if (s) navObserver.observe(s);
    });

    /* animated counters */
    const counters = document.querySelectorAll('.stat-num[data-count]');
    const runCounter = (el) => {
        const target = Number(el.dataset.count) || 0;
        if (reduceMotion) { el.textContent = String(target); return; }
        const start = performance.now(), dur = 1300;
        (function tick(now) {
            const t = Math.min((now - start) / dur, 1);
            el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
            if (t < 1) requestAnimationFrame(tick);
        })(start);
    };
    const counterObserver = new IntersectionObserver((entries) => {
        for (const e of entries) {
            if (e.isIntersecting) { runCounter(e.target); counterObserver.unobserve(e.target); }
        }
    }, { threshold: 0.5 });
    counters.forEach((el) => counterObserver.observe(el));

    /* project-card spotlight (event delegation — survives re-renders) */
    grid.addEventListener('pointermove', (e) => {
        const card = e.target.closest('.project-card');
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
})();

/* ---------------- premium v3.1: show / hide password ---------------- */
document.querySelectorAll('.pass-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.toggle);
        if (!input) return;
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.classList.toggle('on', show);
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        input.focus();
    });
});

/* ---------------- v3.2: dark / white glass theme toggle ---------------- */
(function () {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
        document.documentElement.dataset.theme = next;
        try { localStorage.setItem('jk_portfolio_theme', next); } catch (e) { /* private mode */ }
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', next === 'light' ? '#edeff4' : '#070708');
    });
})();
