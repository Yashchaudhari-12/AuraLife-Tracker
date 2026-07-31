/**
 * Auth UI & Account Management Controller
 * With live sync status indicator
 */

import { CloudStorage } from './cloud-storage.js';

export const AuthUI = {
    init(onSyncCompleted) {
        this.bindAuthEvents(onSyncCompleted);

        CloudStorage.init(
            (user) => this.renderAuthStatus(user),
            (cloudData) => {
                if (onSyncCompleted) onSyncCompleted();
            },
            (status, errorMsg) => this.updateSyncIndicator(status, errorMsg)
        );
    },

    updateSyncIndicator(status, errorMsg) {
        const el = document.getElementById('sync-status-indicator');
        if (!el) return;
        const configs = {
            syncing: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.35)', dot: '#fbbf24', text: '#fde68a', label: '↻ Syncing...' },
            synced:  { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)',  dot: '#10b981', text: '#34d399', label: '✓ Synced'    },
            error:   { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.3)',   dot: '#ef4444', text: '#f87171', label: '✗ Sync error' },
            offline: { bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.3)', dot: '#9ca3af', text: '#d1d5db', label: '○ Offline'   },
        };
        const c = configs[status] || configs.offline;
        el.style.display = 'flex';
        el.style.background = c.bg;
        el.style.border = `1px solid ${c.border}`;
        el.innerHTML = `<span style="width:7px;height:7px;border-radius:50%;background:${c.dot};flex-shrink:0;${status==='syncing'?'animation:pulse 1s infinite':''}"></span><span style="color:${c.text};font-weight:600;">${c.label}</span>`;
        if (errorMsg && status === 'error') {
            el.title = errorMsg;
        }
        // Auto-hide after 4s if synced
        if (status === 'synced') {
            setTimeout(() => { el.style.display = 'none'; }, 4000);
        }
    },

    bindAuthEvents(onSyncCompleted) {
        document.getElementById('btn-open-auth')?.addEventListener('click', () => {
            window.appUI.openModal('modal-auth');
        });

        const prefillConfig = () => {
            const saved = localStorage.getItem('auralife_firebase_config');
            if (saved) {
                try {
                    const cfg = JSON.parse(saved);
                    const apiEl = document.getElementById('cfg-api-key');
                    const authEl = document.getElementById('cfg-auth-domain');
                    const projEl = document.getElementById('cfg-project-id');
                    if (cfg.apiKey && apiEl) apiEl.value = cfg.apiKey;
                    if (cfg.authDomain && authEl) authEl.value = cfg.authDomain;
                    if (cfg.projectId && projEl) projEl.value = cfg.projectId;
                } catch(e) {}
            }
        };

        prefillConfig();

        document.getElementById('btn-open-cloud-config')?.addEventListener('click', () => {
            prefillConfig();
            window.appUI.openModal('modal-cloud-config');
        });

        // Tab toggle between Login and Sign Up inside Auth Modal
        document.getElementById('tab-auth-login')?.addEventListener('click', () => {
            document.getElementById('tab-auth-login').classList.add('active');
            document.getElementById('tab-auth-register').classList.remove('active');
            document.getElementById('form-auth-login').style.display = 'block';
            document.getElementById('form-auth-register').style.display = 'none';
        });

        document.getElementById('tab-auth-register')?.addEventListener('click', () => {
            document.getElementById('tab-auth-register').classList.add('active');
            document.getElementById('tab-auth-login').classList.remove('active');
            document.getElementById('form-auth-register').style.display = 'block';
            document.getElementById('form-auth-login').style.display = 'none';
        });

        // Login Submit
        document.getElementById('form-auth-login')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('field-login-email').value;
            const pass = document.getElementById('field-login-pass').value;
            const btn = e.target.querySelector('[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Signing in...';
            try {
                await CloudStorage.login(email, pass);
                window.appUI.closeModal('modal-auth');
                window.appUI.showToast('Signed in! Syncing your data...', 'success');
            } catch (err) {
                window.appUI.showToast(`Login failed: ${err.message}`, 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Sign In';
            }
        });

        // Register Submit
        document.getElementById('form-auth-register')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('field-reg-email').value;
            const pass = document.getElementById('field-reg-pass').value;
            const btn = e.target.querySelector('[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Creating account...';
            try {
                await CloudStorage.register(email, pass);
                window.appUI.closeModal('modal-auth');
                window.appUI.showToast('Account created & data synced to cloud!', 'success');
            } catch (err) {
                window.appUI.showToast(`Registration failed: ${err.message}`, 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Create Account';
            }
        });

        // Logout
        document.getElementById('btn-auth-logout')?.addEventListener('click', async () => {
            await CloudStorage.logout();
            window.appUI.showToast('Signed out.', 'info');
        });

        // Save Custom Firebase Config
        document.getElementById('form-cloud-config')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const apiKey = document.getElementById('cfg-api-key').value.trim();
            const authDomain = document.getElementById('cfg-auth-domain').value.trim();
            const projectId = document.getElementById('cfg-project-id').value.trim();

            if (!apiKey || !projectId) {
                window.appUI.showToast('API Key and Project ID are required.', 'error');
                return;
            }

            const config = { apiKey, authDomain, projectId };
            localStorage.setItem('auralife_firebase_config', JSON.stringify(config));
            window.appUI.closeModal('modal-cloud-config');
            window.appUI.showToast('Firebase credentials saved! Reloading...', 'success');
            setTimeout(() => window.location.reload(), 1500);
        });
    },

    renderAuthStatus(user) {
        const container = document.getElementById('header-auth-pill');
        if (!container) return;

        if (user) {
            container.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); padding: 6px 12px; border-radius: 999px; flex-wrap: wrap;">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; flex-shrink:0;"></span>
                    <span style="color: #34d399; font-weight: 600;">☁️ ${user.email}</span>
                    <button id="btn-sync-now" class="btn btn-sm" style="padding: 2px 8px; font-size: 10px; background: rgba(6,182,212,0.2); border: 1px solid rgba(6,182,212,0.3); color: #67e8f9;">↻ Sync</button>
                    <button id="btn-auth-logout" class="btn btn-sm btn-danger" style="padding: 2px 8px; font-size: 10px;">Logout</button>
                </div>
            `;
            document.getElementById('btn-auth-logout')?.addEventListener('click', async () => {
                await CloudStorage.logout();
                window.appUI.showToast('Signed out.', 'info');
            });
            document.getElementById('btn-sync-now')?.addEventListener('click', async () => {
                window.appUI.showToast('Syncing data...', 'info');
                await CloudStorage.syncAllDataToCloud();
            });
        } else {
            const syncEl = document.getElementById('sync-status-indicator');
            if (syncEl) syncEl.style.display = 'none';

            container.innerHTML = `
                <button class="btn btn-secondary btn-sm" id="btn-open-auth">
                    ☁️ Sign In / Cloud Sync
                </button>
            `;
            document.getElementById('btn-open-auth')?.addEventListener('click', () => {
                window.appUI.openModal('modal-auth');
            });
        }
    }
};
