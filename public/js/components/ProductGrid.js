/**
 * Сетка товаров — рендерит массив продуктов в контейнер.
 * @param {Object[]} products
 * @param {string|HTMLElement} container — id элемента или сам элемент
 */
function ProductGrid(products, container) {
  const root =
    typeof container === "string" ? document.getElementById(container) : container;

  if (!root) {
    console.error("ProductGrid: контейнер не найден");
    return;
  }

  if (!Array.isArray(products) || products.length === 0) {
    root.innerHTML = `
      <p class="col-span-full rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-12 text-center text-zinc-400">
        Товары не найдены
      </p>
    `;
    return;
  }

  root.innerHTML = products.map((product) => ProductCard(product)).join("");
}

window.ProductGrid = ProductGrid;
