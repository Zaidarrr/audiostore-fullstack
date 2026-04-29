// Система авторизации через API
const API_BASE = "";
const TOKEN_KEY = "authToken";
const USER_KEY = "currentUser";
let currentUser = null;

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function setAuthSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    currentUser = user;
}

function clearAuthSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    currentUser = null;
}

function normalizeUser(user) {
    return {
        ...user,
        type: user.role,
    };
}

async function apiRequest(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const token = getToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    let payload = null;
    try {
        payload = await response.json();
    } catch {
        payload = null;
    }

    if (!response.ok) {
        const message = payload?.error || "Ошибка запроса";
        throw new Error(message);
    }
    return payload;
}

window.apiRequest = apiRequest;

document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    updateAuthUI();
});

function checkAuth() {
    const token = getToken();
    const user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
    if (token && user) {
        currentUser = user;
        return true;
    }
    clearAuthSession();
    return false;
}

function getCurrentUser() {
    if (!currentUser) {
        currentUser = JSON.parse(localStorage.getItem(USER_KEY) || "null");
    }
    return currentUser;
}

async function register(userData) {
    try {
        const data = await apiRequest("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({
                name: userData.name,
                email: userData.email,
                login: userData.login,
                password: userData.password,
                role: userData.userType,
            }),
        });
        const user = normalizeUser(data.user);
        setAuthSession(data.token, user);
        return { success: true, message: "Регистрация успешна!", user };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function login(loginOrEmail, password) {
    try {
        const data = await apiRequest("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
                login: loginOrEmail,
                password,
            }),
        });
        const user = normalizeUser(data.user);
        setAuthSession(data.token, user);
        return { success: true, user };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

window.logout = function(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    clearAuthSession();
    window.location.href = "index.html";
    return false;
};

// Обработка формы входа (глобальная функция)
window.handleLogin = async function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const loginOrEmail = formData.get('email');
    const password = formData.get('password');

    const result = await login(loginOrEmail, password);
    
    if (result.success) {
        if (typeof showNotification === 'function') {
            showNotification('Вход выполнен успешно!', 'success');
        } else {
            alert('Вход выполнен успешно!');
        }
        setTimeout(() => {
            if (result.user.type === 'seller') {
                window.location.href = 'profile.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 500);
    } else {
        if (typeof showNotification === 'function') {
            showNotification(result.message, 'error');
        } else {
            alert(result.message);
        }
    }
};

// Обработка формы регистрации (глобальная функция)
window.handleRegister = async function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const password = formData.get('password');
    const passwordConfirm = formData.get('passwordConfirm');

    if (password !== passwordConfirm) {
        if (typeof showNotification === 'function') {
            showNotification('Пароли не совпадают', 'error');
        } else {
            alert('Пароли не совпадают');
        }
        return;
    }

    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        login: formData.get('login'),
        password: password,
        userType: formData.get('userType')
    };

    const result = await register(userData);
    
    if (result.success) {
        if (typeof showNotification === 'function') {
            showNotification(result.message, 'success');
        } else {
            alert(result.message);
        }
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    } else {
        if (typeof showNotification === 'function') {
            showNotification(result.message, 'error');
        } else {
            alert(result.message);
        }
    }
};

// Переключение между вкладками входа/регистрации (глобальная функция)
window.switchTab = function(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.auth-tab');

    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        tabs[0].classList.add('active');
    } else {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        tabs[1].classList.add('active');
    }
};

// Заполнение демо-аккаунта (глобальная функция)
window.fillDemoAccount = function(type) {
    if (type === 'buyer') {
        document.getElementById('loginEmail').value = 'buyer';
        document.getElementById('loginPassword').value = '123456';
    } else {
        document.getElementById('loginEmail').value = 'demo_seller';
        document.getElementById('loginPassword').value = 'DemoSeller123!';
    }
};

// Обновление UI авторизации
function updateAuthUI() {
    const user = getCurrentUser();
    const authLink = document.getElementById('authLink');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    
    if (user) {
        if (authLink) {
            authLink.style.display = 'none';
        }
        if (userMenu) {
            userMenu.style.display = 'block';
        }
        if (userName) {
            userName.textContent = user.name;
        }
    } else {
        if (authLink) {
            authLink.style.display = 'block';
        }
        if (userMenu) {
            userMenu.style.display = 'none';
        }
    }
}

// Проверка доступа (для защищенных страниц)
function requireAuth() {
    if (!checkAuth()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Проверка прав продавца
function requireSeller() {
    if (!requireAuth()) return false;
    const user = getCurrentUser();
    if (user.type !== 'seller') {
        showNotification('Доступ запрещен. Требуются права продавца.', 'error');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}
