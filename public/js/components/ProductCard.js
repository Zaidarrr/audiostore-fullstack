/**
 * Карточка товара — возвращает HTML-разметку с классами Tailwind CSS.
 * @param {Object} product
 * @returns {string}
 */
function ProductCard(product) {
  const price = new Intl.NumberFormat("ru-RU").format(product.price);

  return `
    <article
      class="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/90 shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-zinc-600 hover:shadow-xl hover:shadow-black/40"
      data-product-id="${product.id}"
    >
      <div class="relative aspect-[4/3] overflow-hidden bg-zinc-950">
        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
          class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span class="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-zinc-100 backdrop-blur-sm">
          ${product.category}
        </span>
      </div>

      <div class="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-zinc-400">${product.brand}</p>
          <h3 class="mt-1 line-clamp-2 text-lg font-semibold leading-snug text-white">${product.name}</h3>
        </div>

        <p class="line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-400">
          ${product.description}
        </p>

        <div class="mt-auto flex items-end justify-between gap-3 border-t border-zinc-800 pt-4">
          <div>
            <p class="text-xs text-zinc-500">Цена</p>
            <p class="text-2xl font-bold tracking-tight text-emerald-400">${price} ₽</p>
          </div>
          <button
            type="button"
            class="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            В корзину
          </button>
        </div>
      </div>
    </article>
  `;
}

window.ProductCard = ProductCard;
