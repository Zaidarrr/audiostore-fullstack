// Фильтры
let currentFilters = {
    categories: [],
    brands: [],
    priceMin: 0,
    priceMax: 100000
};
let catalogProducts = [];

// Инициализация страницы каталога
document.addEventListener('DOMContentLoaded', async () => {
    // Проверка параметров URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    
    if (categoryParam) {
        const checkbox = document.querySelector(`.category-filter[value="${categoryParam}"]`);
        if (checkbox) {
            checkbox.checked = true;
            currentFilters.categories.push(categoryParam);
        }
    }

    // Настройка фильтров
    setupFilters();
    
    // Настройка сортировки
    setupSorting();
    
    // Настройка поиска
    setupSearch();
    
    try {
        catalogProducts = await fetch('/api/products').then((r) => {
            if (!r.ok) throw new Error();
            return r.json();
        });
        applyFilters();
    } catch {
        if (typeof showNotification === "function") {
            showNotification("Не удалось загрузить каталог", "error");
        }
    }
});

// Настройка фильтров
function setupFilters() {
    // Фильтры по категориям
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                if (!currentFilters.categories.includes(checkbox.value)) {
                    currentFilters.categories.push(checkbox.value);
                }
            } else {
                currentFilters.categories = currentFilters.categories.filter(c => c !== checkbox.value);
            }
            applyFilters();
        });
    });

    // Фильтры по брендам
    const brandFilters = document.querySelectorAll('.brand-filter');
    brandFilters.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                if (!currentFilters.brands.includes(checkbox.value)) {
                    currentFilters.brands.push(checkbox.value);
                }
            } else {
                currentFilters.brands = currentFilters.brands.filter(b => b !== checkbox.value);
            }
            applyFilters();
        });
    });

    // Фильтр по цене
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const priceMinInput = document.getElementById('priceMinInput');
    const priceMaxInput = document.getElementById('priceMaxInput');
    const priceMinValue = document.getElementById('priceMinValue');
    const priceMaxValue = document.getElementById('priceMaxValue');

    // Синхронизация слайдера и input поля для минимальной цены
    if (priceMin && priceMinInput) {
        priceMin.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            currentFilters.priceMin = value;
            priceMinInput.value = value;
            if (priceMinValue) priceMinValue.textContent = value.toLocaleString();
            applyFilters();
        });

        priceMinInput.addEventListener('input', (e) => {
            let value = parseInt(e.target.value) || 0;
            value = Math.max(0, Math.min(100000, value));
            currentFilters.priceMin = value;
            priceMin.value = value;
            priceMinInput.value = value;
            if (priceMinValue) priceMinValue.textContent = value.toLocaleString();
            applyFilters();
        });

        // Поддержка колесика мыши
        priceMinInput.addEventListener('wheel', (e) => {
            e.preventDefault();
            const step = e.deltaY > 0 ? -1000 : 1000;
            adjustPrice('min', step);
        });

        // Поддержка стрелок клавиатуры
        priceMinInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                adjustPrice('min', 1000);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                adjustPrice('min', -1000);
            }
        });
    }

    // Синхронизация слайдера и input поля для максимальной цены
    if (priceMax && priceMaxInput) {
        priceMax.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            currentFilters.priceMax = value;
            priceMaxInput.value = value;
            if (priceMaxValue) priceMaxValue.textContent = value.toLocaleString();
            applyFilters();
        });

        priceMaxInput.addEventListener('input', (e) => {
            let value = parseInt(e.target.value) || 0;
            value = Math.max(0, Math.min(100000, value));
            currentFilters.priceMax = value;
            priceMax.value = value;
            priceMaxInput.value = value;
            if (priceMaxValue) priceMaxValue.textContent = value.toLocaleString();
            applyFilters();
        });

        // Поддержка колесика мыши
        priceMaxInput.addEventListener('wheel', (e) => {
            e.preventDefault();
            const step = e.deltaY > 0 ? -1000 : 1000;
            adjustPrice('max', step);
        });

        // Поддержка стрелок клавиатуры
        priceMaxInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                adjustPrice('max', 1000);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                adjustPrice('max', -1000);
            }
        });
    }
}

// Применение фильтров
function applyFilters() {
    let filteredProducts = [...catalogProducts];

    // Фильтр по категориям
    if (currentFilters.categories.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
            currentFilters.categories.includes(product.category)
        );
    }

    // Фильтр по брендам
    if (currentFilters.brands.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
            currentFilters.brands.includes(product.brand)
        );
    }

    // Фильтр по цене
    filteredProducts = filteredProducts.filter(product =>
        product.price >= currentFilters.priceMin &&
        product.price <= currentFilters.priceMax
    );

    // Поиск
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value) {
        const query = searchInput.value.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.brand.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
        );
    }

    // Обновление счетчика
    const productsCount = document.getElementById('productsCount');
    if (productsCount) {
        productsCount.textContent = `Найдено товаров: ${filteredProducts.length}`;
    }

    // Отображение товаров
    displayProducts(filteredProducts);
}

// Настройка сортировки
function setupSorting() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', sortProducts);
    }
}

// Сортировка товаров
function sortProducts() {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect) return;

    const sortValue = sortSelect.value;
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    const productCards = Array.from(productsGrid.children);
    
    productCards.sort((a, b) => {
        const priceA = parseInt(a.querySelector('.product-price').textContent.replace(/\s/g, '').replace('₽', ''));
        const priceB = parseInt(b.querySelector('.product-price').textContent.replace(/\s/g, '').replace('₽', ''));
        const nameA = a.querySelector('.product-name').textContent;
        const nameB = b.querySelector('.product-name').textContent;

        switch (sortValue) {
            case 'price-asc':
                return priceA - priceB;
            case 'price-desc':
                return priceB - priceA;
            case 'name-asc':
                return nameA.localeCompare(nameB, 'ru');
            case 'name-desc':
                return nameB.localeCompare(nameA, 'ru');
            default:
                return 0;
        }
    });

    // Перестановка элементов
    productCards.forEach(card => productsGrid.appendChild(card));
}

// Настройка поиска
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            applyFilters();
        });
    }
}

// Сброс фильтров (глобальная функция)
window.resetFilters = function() {
    currentFilters = {
        categories: [],
        brands: [],
        priceMin: 0,
        priceMax: 100000
    };

    // Сброс чекбоксов
    document.querySelectorAll('.category-filter, .brand-filter').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Сброс слайдеров цены
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const priceMinInput = document.getElementById('priceMinInput');
    const priceMaxInput = document.getElementById('priceMaxInput');
    const priceMinValue = document.getElementById('priceMinValue');
    const priceMaxValue = document.getElementById('priceMaxValue');

    if (priceMin) priceMin.value = 0;
    if (priceMax) priceMax.value = 100000;
    if (priceMinInput) priceMinInput.value = 0;
    if (priceMaxInput) priceMaxInput.value = 100000;
    if (priceMinValue) priceMinValue.textContent = '0';
    if (priceMaxValue) priceMaxValue.textContent = '100000';

    // Сброс поиска
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    applyFilters();
};
