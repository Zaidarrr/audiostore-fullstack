const prisma = require("../lib/prisma");

async function createOrder(req, res) {
    try {
        const { items } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Передайте непустой массив items: [{ productId, quantity }]" });
        }

        const merged = new Map();
        for (const row of items) {
            const productId = Number(row.productId);
            const quantity = Number(row.quantity);
            if (Number.isNaN(productId) || Number.isNaN(quantity) || quantity < 1) {
                return res.status(400).json({ error: "Каждый элемент: productId (число), quantity (>=1)" });
            }
            merged.set(productId, (merged.get(productId) || 0) + quantity);
        }
        const normalized = [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity }));

        const order = await prisma.$transaction(async (tx) => {
            const productIds = [...new Set(normalized.map((i) => i.productId))];
            const products = await tx.product.findMany({
                where: { id: { in: productIds } },
            });
            if (products.length !== productIds.length) {
                throw new Error("PRODUCT_NOT_FOUND");
            }

            const byId = new Map(products.map((p) => [p.id, p]));
            let totalAmount = 0;
            const lineData = [];
            for (const { productId, quantity } of normalized) {
                const p = byId.get(productId);
                totalAmount += p.price * quantity;
                lineData.push({
                    productId,
                    quantity,
                    priceAtPurchase: p.price,
                });
            }

            return tx.order.create({
                data: {
                    userId: req.user.id,
                    totalAmount,
                    status: "pending",
                    items: {
                        create: lineData,
                    },
                },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    brand: true,
                                    category: true,
                                    image: true,
                                },
                            },
                        },
                    },
                },
            });
        });

        return res.status(201).json(order);
    } catch (e) {
        if (e.message === "PRODUCT_NOT_FOUND") {
            return res.status(400).json({ error: "Один из товаров не найден" });
        }
        console.error(e);
        return res.status(500).json({ error: "Не удалось создать заказ" });
    }
}

async function listMyOrders(req, res) {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                brand: true,
                                category: true,
                                image: true,
                                price: true,
                            },
                        },
                    },
                },
            },
        });
        return res.json(orders);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Не удалось загрузить заказы" });
    }
}

module.exports = { createOrder, listMyOrders };
