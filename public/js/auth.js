// public/js/auth.js 

document.addEventListener('DOMContentLoaded', () => {
    // This script only runs in the BROWSER

    // --- 1. Handle Login Form Submission ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            const statusDiv = document.getElementById('login-status');
            const loginBtn = document.getElementById('login-btn');
            
            // Set initial status and disable button (handled by snippet in login.html)
            statusDiv.textContent = 'Logging in...';
            statusDiv.style.display = 'block';

            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    statusDiv.textContent = `Welcome, ${data.user.name}! Redirecting...`;
                    statusDiv.style.color = 'var(--success, #10b981)'; // Green

                    // Get redirect URL or default to profile
                    const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/profile';
                    sessionStorage.removeItem('redirectAfterLogin');

                    // Small delay for the user to see the success message
                    setTimeout(() => {
                        window.location.href = redirectUrl; 
                    }, 500);

                } else {
                    statusDiv.textContent = data.error || 'Login failed. Please check credentials.';
                    statusDiv.style.color = 'var(--danger, #ef4444)'; // Red
                }
            } catch (error) {
                console.error('Network Error:', error);
                statusDiv.textContent = 'A network error occurred.';
                statusDiv.style.color = 'var(--danger, #ef4444)'; // Red
            } finally {
                // The snippet in the HTML will reset the button/status visually
            }
        });
    }

    // --- 2. Handle Register Form Submission ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = registerForm.name.value;
            const email = registerForm.email.value;
            const password = registerForm.password.value;
            const statusDiv = document.getElementById('register-status');
            
            // Set initial status and disable button (handled by snippet in register.html)
            statusDiv.textContent = 'Registering...';
            statusDiv.style.display = 'block';


            try {
                const response = await fetch('/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    statusDiv.textContent = `Success! Welcome, ${data.user.name}! Redirecting...`;
                    statusDiv.style.color = 'var(--success, #10b981)'; // Green

                    // Redirect after registration (implicitly logs user in via server)
                    setTimeout(() => {
                         window.location.href = '/profile'; 
                    }, 500);
                   
                } else {
                    statusDiv.textContent = data.error || 'Registration failed.';
                    statusDiv.style.color = 'var(--danger, #ef4444)'; // Red
                }
            } catch (error) {
                console.error('Network Error:', error);
                statusDiv.textContent = 'A network error occurred.';
                statusDiv.style.color = 'var(--danger, #ef4444)'; // Red
            } finally {
                 // The snippet in the HTML will reset the button/status visually
            }
        });
    }
});