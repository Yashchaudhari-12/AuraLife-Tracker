/**
 * Auth UI & Account Management Controller
 */

import { CloudStorage } from './cloud-storage.js';

export const AuthUI = {
    init(onSyncCompleted) {
        this.bindAuthEvents(onSyncCompleted);

        CloudStorage.init(
            (user) => this.renderAuthStatus(user),
            (cloudData) => {
                if (onSyncCompleted) onSyncCompleted();
            }
        );
    },

    bindAuthEvents(onSyncCompleted) {
        document.getElementById('btn-open-auth')?.addEventListener('click', () => {
            window.appUI.openModal('modal-auth');
        });

        document.getElementById('btn-open-cloud-config')?.addEventListener('click', () => {
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
            try {
                await CloudStorage.login(email, pass);
                window.appUI.closeModal('modal-auth');
                window.appUI.showToast('Successfully logged in!', 'success');
            } catch (err) {
                window.appUI.showToast(`Login failed: ${err.message}`, 'error');
            }
        });

        // Register Submit
        document.getElementById('form-auth-register')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('field-reg-email').value;
            const pass = document.getElementById('field-reg-pass').value;
            try {
                await CloudStorage.register(email, pass);
                window.appUI.closeModal('modal-auth');
                window.appUI.showToast('Account created & synced!', 'success');
            } catch (err) {
                window.appUI.showToast(`Registration failed: ${err.message}`, 'error');
            }
        });

        // Logout
        document.getElementById('btn-auth-logout')?.addEventListener('click', async () => {
            await CloudStorage.logout();
            window.appUI.showToast('Logged out of cloud account.', 'info');
        });

        // Save Custom Firebase Config
        document.getElementById('form-cloud-config')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const apiKey = document.getElementById('cfg-api-key').value.trim();
            const authDomain = document.getElementById('cfg-auth-domain').value.trim();
            const projectId = document.getElementById('cfg-project-id').value.trim();

            if (!apiKey || !projectId) return;

            const config = { apiKey, authDomain, projectId };
            localStorage.setItem('auralife_firebase_config', JSON.stringify(config));
            window.appUI.closeModal('modal-cloud-config');
            window.appUI.showToast('Firebase credentials updated! Reloading app...', 'success');
            setTimeout(() => window.location.reload(), 1500);
        });
    },

    renderAuthStatus(user) {
        const container = document.getElementById('header-auth-pill');
        if (!container) return;

        if (user) {
            container.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); padding: 6px 12px; border-radius: 999px;">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
                    <span style="color: #34d399; font-weight: 600;">☁️ ${user.email}</span>
                    <button id="btn-auth-logout" class="btn btn-sm btn-danger" style="padding: 2px 8px; font-size: 10px; margin-left: 4px;">Logout</button>
                </div>
            `;
            // Re-bind logout listener dynamically
            document.getElementById('btn-auth-logout')?.addEventListener('click', async () => {
                await CloudStorage.logout();
                window.appUI.showToast('Logged out.', 'info');
            });
        } else {
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
