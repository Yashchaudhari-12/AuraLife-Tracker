/**
 * AuraLife Main Application Entry Point
 * Independent Core UI + Asynchronous Cloud Sync
 */

import { UIController } from './ui.js?v=2026080101';
import { Storage } from './storage.js?v=2026080101';
import { DataMigration } from './migration.js?v=2026080101';

DataMigration.runIfNeeded();
window.appUI = UIController;
window.appStorage = Storage;

function loadStylesheet(href) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

function setupWorkspaceShell() {
    const nav = document.querySelector('.app-container > .nav-bar');
    if (!nav || document.querySelector('.shell-sidebar-toggle')) return;
    const toggle = document.createElement('button');
    toggle.className = 'shell-sidebar-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Open navigation');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '☰';
    const scrim = document.createElement('div');
    scrim.className = 'shell-sidebar-scrim';
    scrim.setAttribute('aria-hidden', 'true');
    const closeSidebar = () => {
        document.body.classList.remove('sidebar-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation');
        toggle.textContent = '☰';
    };
    toggle.addEventListener('click', () => {
        const isOpen = document.body.classList.toggle('sidebar-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
        toggle.textContent = isOpen ? '×' : '☰';
    });
    scrim.addEventListener('click', closeSidebar);
    nav.addEventListener('click', event => { if (event.target.closest('.nav-btn')) closeSidebar(); });
    document.body.append(toggle, scrim);
}

function enhanceAccessibility() {
    document.querySelectorAll('button, input, select, textarea').forEach(control => {
        if (!control.getAttribute('aria-label') && control.title) control.setAttribute('aria-label', control.title);
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            document.querySelector('.modal-overlay.active .modal-close')?.click();
            document.body.classList.remove('sidebar-open');
        }
    });
}

loadStylesheet('css/mobile.css');
loadStylesheet('css/classy.css');
loadStylesheet('css/product-shell.css');
setupWorkspaceShell();
try {
    UIController.init();
    enhanceAccessibility();
    console.log('✨ AuraLife Core UI initialized successfully.');
} catch (e) { console.error('Error initializing UIController:', e); }

async function loadCloudServices() {
    try {
        const { CloudStorage } = await import('./cloud-storage.js');
        const { AuthUI } = await import('./auth-ui.js');
        window.appCloud = CloudStorage;
        window.syncNow = () => CloudStorage.syncAllDataToCloud();
        window.diagnoseFirebase = () => CloudStorage._diagnose();
        AuthUI.init(() => UIController.renderAll());
        console.log('☁️ Cloud Sync Services Loaded.');
    } catch (err) { console.warn('Running in Local Mode (Cloud modules deferred):', err); }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadCloudServices);
else loadCloudServices();
