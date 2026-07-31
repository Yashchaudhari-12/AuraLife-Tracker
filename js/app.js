/**
 * AuraLife Main Application Entry Point
 * Independent Core UI + Asynchronous Cloud Sync
 */

import { UIController } from './ui.js';
import { Storage } from './storage.js';
import { DataMigration } from './migration.js';

// Run Data Migration if needed
DataMigration.runIfNeeded();

// 1. Instantly attach UIController to window so all button clicks work immediately
window.appUI = UIController;
window.appStorage = Storage;

// 2. Initialize UI immediately
try {
    UIController.init();
    console.log('✨ AuraLife Core UI initialized successfully.');
} catch (e) {
    console.error('Error initializing UIController:', e);
}

// 3. Asynchronously load Cloud Sync in background (will never block core UI)
async function loadCloudServices() {
    try {
        const { CloudStorage } = await import('./cloud-storage.js');
        const { AuthUI } = await import('./auth-ui.js');

        window.appCloud = CloudStorage;

        // Global helpers for debugging
        window.syncNow = () => CloudStorage.syncAllDataToCloud();
        window.diagnoseFirebase = () => CloudStorage._diagnose();

        AuthUI.init(() => {
            UIController.renderAll();
        });
        console.log('☁️ Cloud Sync Services Loaded.');
    } catch (err) {
        console.warn('Running in Local Mode (Cloud modules deferred):', err);
    }
}

// Load cloud services after page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCloudServices);
} else {
    loadCloudServices();
}
