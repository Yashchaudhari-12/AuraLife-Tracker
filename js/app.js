/**
 * AuraLife Main Application Entry Point
 * Independent Core UI + Asynchronous Cloud Sync
 */

import { UIController } from './ui.js';
import { Storage } from './storage.js';
import { DataMigration } from './migration.js';

DataMigration.runIfNeeded();
window.appUI = UIController;
window.appStorage = Storage;

function enhanceAccessibility() {
    document.querySelectorAll('button, input, select, textarea').forEach(control => {
        if (!control.getAttribute('aria-label') && control.title) control.setAttribute('aria-label', control.title);
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            document.querySelector('.modal-overlay.active .modal-close')?.click();
        }
    });
}

try {
    UIController.init();
    enhanceAccessibility();
    console.log('✨ AuraLife Core UI initialized successfully.');
} catch (e) {
    console.error('Error initializing UIController:', e);
}

async function loadCloudServices() {
    try {
        const { CloudStorage } = await import('./cloud-storage.js');
        const { AuthUI } = await import('./auth-ui.js');
        window.appCloud = CloudStorage;
        window.syncNow = () => CloudStorage.syncAllDataToCloud();
        window.diagnoseFirebase = () => CloudStorage._diagnose();
        AuthUI.init(() => UIController.renderAll());
        console.log('☁️ Cloud Sync Services Loaded.');
    } catch (err) {
        console.warn('Running in Local Mode (Cloud modules deferred):', err);
    }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadCloudServices);
else loadCloudServices();
