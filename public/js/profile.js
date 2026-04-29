let sellerProductsCache = [];
let favoriteProductsCache = [];

document.addEventListener("DOMContentLoaded", async () => {
    if (typeof requireAuth === "function" && !requireAuth()) return;
    const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    await loadProfile(user);
});

async function loadProfile(user) {
    const profileContent = document.getElementById("profileContent");
    if (!profileContent) return;
    if (user.type === "seller") {
        await loadSellerProfile(user);
    } else {
        await loadBuyerProfile(user);
    }
}

// Профиль покупателя
async function loadBuyerProfile(user) {
    const profileContent = document.getElementById("profileContent");
    let userOrders = [];
    try {
        userOrders = await apiRequest("/api/orders");
    } catch {
        userOrders = [];
    }

    profileContent.innerHTML = `
        <div class="profile-container">
            <div class="profile-header">
                <div class="profile-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="profile-info">
                    <h1>${user.name}</h1>
                    <p class="profile-email">${user.email}</p>
                    <span class="profile-badge buyer">Покупатель</span>
                </div>
            </div>

            <div class="profile-tabs">
                <button class="profile-tab active" onclick="switchProfileTab('info')">Личная информация</button>
                <button class="profile-tab" onclick="switchProfileTab('orders')">Мои заказы (${userOrders.length})</button>
                <button class="profile-tab" onclick="switchProfileTab('favorites')">Избранное</button>
            </div>
            
            <div class="profile-logout-section">
                <button class="btn btn-secondary" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i> Выйти из аккаунта
                </button>
            </div>

            <div class="profile-content">
                <!-- Личная информация -->
                <div class="profile-section active" id="infoSection">
                    <h2>Личная информация</h2>
                    <form class="profile-form" onsubmit="updateProfile(event)">
                        <div class="form-group">
                            <label>Имя</label>
                            <input type="text" id="profileName" value="${user.name}" required>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="profileEmail" value="${user.email}" required>
                        </div>
                        <div class="form-group">
                            <label>Логин</label>
                            <input type="text" id="profileLogin" value="${user.login}" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Сохранить изменения</button>
                    </form>

                    <div class="profile-section-divider"></div>

                    <h2>Смена пароля</h2>
                    <form class="profile-form" onsubmit="changePassword(event)">
                        <div class="form-group">
                            <label>Текущий пароль</label>
                            <input type="password" id="currentPassword" required>
                        </div>
                        <div class="form-group">
                            <label>Новый пароль</label>
                            <input type="password" id="newPassword" required minlength="6">
                        </div>
                        <div class="form-group">
                            <label>Подтвердите новый пароль</label>
                            <input type="password" id="confirmPassword" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Изменить пароль</button>
                    </form>
                </div>

                <!-- Заказы -->
                <div class="profile-section" id="ordersSection">
                    <h2>Мои заказы</h2>
                    ${userOrders.length === 0 ? 
                        '<p class="empty-state">У вас пока нет заказов</p>' :
                        userOrders.map(order => `
                            <div class="order-card">
                                <div class="order-header">
                                    <div>
                                        <strong>Заказ #${order.id}</strong>
                                        <span class="order-date">${new Date(order.date).toLocaleDateString('ru-RU')}</span>
                                    </div>
                                    <span class="order-status ${order.status}">${getOrderStatusText(order.status)}</span>
                                </div>
                                <div class="order-items">
                                    ${order.items.map(item => `
                                        <div class="order-item">
                                            <span>${item.name}</span>
                                            <span>${item.quantity} шт.</span>
                                            <span>${(item.price * item.quantity).toLocaleString()} ₽</span>
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="order-footer">
                                    <strong>Итого: ${order.total.toLocaleString()} ₽</strong>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>

                <!-- Избранное -->
                <div class="profile-section" id="favoritesSection">
                    <h2>Избранное</h2>
                    <div class="favorites-grid" id="favoritesGrid">
                        <!-- Будет загружено через JavaScript -->
                    </div>
                </div>
            </div>
        </div>
    `;

    await loadFavorites();
}

// Профиль продавца
async function loadSellerProfile(user) {
    const profileContent = document.getElementById("profileContent");

    profileContent.innerHTML = `
        <div class="profile-container">
            <div class="profile-header">
                <div class="profile-avatar">
                    <i class="fas fa-user-tie"></i>
                </div>
                <div class="profile-info">
                    <h1>${user.name}</h1>
                    <p class="profile-email">${user.email}</p>
                    <span class="profile-badge seller">Продавец</span>
                </div>
            </div>

            <div class="profile-tabs">
                <button class="profile-tab active" onclick="switchProfileTab('products')">Товары</button>
                <button class="profile-tab" onclick="switchProfileTab('add')">Добавить товар</button>
                <button class="profile-tab" onclick="switchProfileTab('info')">Настройки</button>
            </div>
            
            <div class="profile-logout-section">
                <button class="btn btn-secondary" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i> Выйти из аккаунта
                </button>
            </div>

            <div class="profile-content">
                <!-- Управление товарами -->
                <div class="profile-section active" id="productsSection">
                    <div class="seller-actions">
                        <h2>Мои товары</h2>
                        <button class="btn btn-primary" onclick="switchProfileTab('add')">
                            <i class="fas fa-plus"></i> Добавить товар
                        </button>
                    </div>
                    <div class="products-grid" id="sellerProductsGrid">
                        <!-- Товары будут загружены -->
                    </div>
                </div>

                <!-- Добавление товара -->
                <div class="profile-section" id="addSection">
                    <h2>Добавить новый товар</h2>
                    <form class="product-form" onsubmit="addProduct(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Название товара *</label>
                                <input type="text" id="productName" required>
                            </div>
                            <div class="form-group">
                                <label>Бренд *</label>
                                <input type="text" id="productBrand" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Категория *</label>
                                <select id="productCategory" required>
                                    <option value="headphones">Наушники</option>
                                    <option value="speakers">Колонки</option>
                                    <option value="microphones">Микрофоны</option>
                                    <option value="amplifiers">Усилители</option>
                                    <option value="accessories">Аксессуары</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Цена (₽) *</label>
                                <input type="number" id="productPrice" min="0" step="100" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Описание *</label>
                            <textarea id="productDescription" rows="4" required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Эмодзи для изображения</label>
                            <input type="text" id="productImage" placeholder="🎧" maxlength="2">
                        </div>
                        <button type="submit" class="btn btn-primary">Добавить товар</button>
                    </form>
                </div>

                <!-- Настройки -->
                <div class="profile-section" id="infoSection">
                    <h2>Настройки профиля</h2>
                    <form class="profile-form" onsubmit="updateProfile(event)">
                        <div class="form-group">
                            <label>Имя</label>
                            <input type="text" id="profileName" value="${user.name}" required>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="profileEmail" value="${user.email}" required>
                        </div>
                        <div class="form-group">
                            <label>Логин</label>
                            <input type="text" id="profileLogin" value="${user.login}" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Сохранить изменения</button>
                    </form>
                </div>
            </div>
        </div>
    `;

    await loadSellerProducts();
}

// Переключение вкладок профиля (глобальная функция)
window.switchProfileTab = function(tab) {
    const sections = document.querySelectorAll('.profile-section');
    const tabs = document.querySelectorAll('.profile-tab');

    sections.forEach(s => s.classList.remove('active'));
    tabs.forEach(t => t.classList.remove('active'));

    const section = document.getElementById(tab + 'Section');
    if (section) {
        section.classList.add('active');
    }

    // Активация соответствующей вкладки
    tabs.forEach(t => {
        if (t.textContent.includes(tab === 'products' ? 'Товары' : 
                                   tab === 'add' ? 'Добавить' :
                                   tab === 'orders' ? 'Заказы' :
                                   tab === 'favorites' ? 'Избранное' : 'Настройки')) {
            t.classList.add('active');
        }
    });
};

// Загрузка товаров продавца
function loadSellerProducts() {
    return (async () => {
    const grid = document.getElementById("sellerProductsGrid");
    if (!grid) return;
    const user = getCurrentUser();
    try {
        const allProducts = await fetch("/api/products").then((r) => {
            if (!r.ok) throw new Error();
            return r.json();
        });
        sellerProductsCache = allProducts.filter((p) => p.sellerId === user.id);
    } catch {
        sellerProductsCache = [];
    }

    if (sellerProductsCache.length === 0) {
        grid.innerHTML = "<p class=\"empty-state\">У вас пока нет товаров</p>";
        return;
    }

    grid.innerHTML = sellerProductsCache.map(product => `
        <div class="product-card">
            <div class="product-image">${product.image}</div>
            <div class="product-info">
                <div class="product-brand">${product.brand}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-footer">
                    <div class="product-price">${product.price.toLocaleString()} ₽</div>
                    <div class="product-actions">
                        <button class="btn btn-secondary btn-sm" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join("");
    })();
}

// Добавление товара (глобальная функция)
window.addProduct = async function(event) {
    event.preventDefault();
    const newProduct = {
        name: document.getElementById('productName').value,
        brand: document.getElementById('productBrand').value,
        category: document.getElementById('productCategory').value,
        price: parseInt(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value,
        image: document.getElementById('productImage').value || '🎧'
    };

    try {
        await apiRequest("/api/products", {
            method: "POST",
            body: JSON.stringify(newProduct),
        });
        if (typeof showNotification === 'function') {
            showNotification('Товар успешно добавлен!', 'success');
        }
        event.target.reset();
        await loadSellerProducts();
        switchProfileTab('products');
    } catch (error) {
        showNotification(error.message || "Ошибка добавления", "error");
    }
};

// Удаление товара (глобальная функция)
window.deleteProduct = async function(productId) {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
    try {
        await apiRequest(`/api/products/${productId}`, { method: "DELETE" });
        if (typeof showNotification === 'function') {
            showNotification('Товар удален', 'success');
        }
        await loadSellerProducts();
    } catch (error) {
        showNotification(error.message || "Ошибка удаления", "error");
    }
};

// Редактирование товара (глобальная функция)
window.editProduct = function(productId) {
    const product = sellerProductsCache.find(p => p.id === productId);
    if (!product) return;

    // Заполнение формы
    document.getElementById('productName').value = product.name;
    document.getElementById('productBrand').value = product.brand;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productImage').value = product.image;

    // Изменение формы на редактирование
    const form = document.querySelector('.product-form');
    form.onsubmit = (e) => {
        e.preventDefault();
        updateProduct(productId);
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Сохранить изменения';
    submitBtn.onclick = null;

    switchProfileTab('add');
};

// Обновление товара (глобальная функция)
window.updateProduct = async function(productId) {
    const payload = {
        name: document.getElementById('productName').value,
        brand: document.getElementById('productBrand').value,
        category: document.getElementById('productCategory').value,
        price: parseInt(document.getElementById('productPrice').value, 10),
        description: document.getElementById('productDescription').value,
        image: document.getElementById('productImage').value || '🎧'
    };
    try {
        await apiRequest(`/api/products/${productId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
        if (typeof showNotification === 'function') {
            showNotification('Товар обновлен!', 'success');
        }
        await loadSellerProducts();
        switchProfileTab('products');
    } catch (error) {
        showNotification(error.message || "Ошибка обновления", "error");
    }
};

// Обновление профиля (глобальная функция)
window.updateProfile = function(event) {
    event.preventDefault();
    const user = getCurrentUser();
    const users = JSON.parse(localStorage.getItem('users')) || [];

    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex > -1) {
        users[userIndex].name = document.getElementById('profileName').value;
        users[userIndex].email = document.getElementById('profileEmail').value;
        users[userIndex].login = document.getElementById('profileLogin').value;

        localStorage.setItem('users', JSON.stringify(users));

        // Обновление текущего пользователя
        currentUser.name = users[userIndex].name;
        currentUser.email = users[userIndex].email;
        currentUser.login = users[userIndex].login;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        if (typeof showNotification === 'function') {
            showNotification('Профиль обновлен!', 'success');
        }
        setTimeout(() => location.reload(), 1000);
    }
};

// Смена пароля (глобальная функция)
window.changePassword = function(event) {
    event.preventDefault();
    const user = getCurrentUser();
    const users = JSON.parse(localStorage.getItem('users')) || [];

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const userData = users.find(u => u.id === user.id);
    if (userData.password !== currentPassword) {
        if (typeof showNotification === 'function') {
            showNotification('Текущий пароль неверен', 'error');
        }
        return;
    }

    if (newPassword !== confirmPassword) {
        if (typeof showNotification === 'function') {
            showNotification('Пароли не совпадают', 'error');
        }
        return;
    }

    userData.password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));

    if (typeof showNotification === 'function') {
        showNotification('Пароль изменен!', 'success');
    }
    event.target.reset();
};

// Загрузка избранного
function loadFavorites() {
    return (async () => {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const grid = document.getElementById('favoritesGrid');
    if (!grid) return;

    if (favorites.length === 0) {
        grid.innerHTML = '<p class="empty-state">У вас нет избранных товаров</p>';
        return;
    }

    try {
        const allProducts = await fetch("/api/products").then((r) => r.json());
        favoriteProductsCache = allProducts.filter(p => favorites.includes(p.id));
    } catch {
        favoriteProductsCache = [];
    }
    grid.innerHTML = favoriteProductsCache.map(product => `
        <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
            <div class="product-image">${product.image}</div>
            <div class="product-info">
                <div class="product-brand">${product.brand}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-footer">
                    <div class="product-price">${product.price.toLocaleString()} ₽</div>
                    <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                        В корзину
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    })();
}

// Получение текста статуса заказа
function getOrderStatusText(status) {
    const statuses = {
        'pending': 'В обработке',
        'processing': 'Обрабатывается',
        'shipped': 'Отправлен',
        'delivered': 'Доставлен',
        'cancelled': 'Отменен'
    };
    return statuses[status] || status;
}

// Переключение меню пользователя (глобальная функция)
window.toggleUserMenu = function() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
};

// Закрытие меню при клике вне его
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdown');
    const userBtn = document.querySelector('.user-btn');
    if (dropdown && !dropdown.contains(e.target) && !userBtn?.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});
