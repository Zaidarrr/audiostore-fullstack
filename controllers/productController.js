const prisma = require("../lib/prisma");

async function list(req, res) {
    try {
        const { category, brand, q } = req.query;
        const where = {};

        if (category && String(category).trim()) {
            where.category = String(category).trim();
        }
        if (brand && String(brand).trim()) {
            where.brand = String(brand).trim();
        }
        if (q && String(q).trim()) {
            const search = String(q).trim();
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { brand: { contains: search, mode: "insensitive" } },
            ];
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { id: "asc" },
            include: {
                seller: {
                    select: { id: true, name: true, login: true },
                },
            },
        });
        return res.json(products);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Не удалось загрузить товары" });
    }
}

async function getById(req, res) {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: "Некорректный id" });
        }
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                seller: {
                    select: { id: true, name: true, login: true },
                },
            },
        });
        if (!product) {
            return res.status(404).json({ error: "Товар не найден" });
        }
        return res.json(product);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Ошибка загрузки товара" });
    }
}

async function create(req, res) {
    try {
        const { name, brand, category, price, description, image } = req.body;
        if (!name || !brand || !category || price == null || !description || image == null) {
            return res.status(400).json({
                error: "Укажите name, brand, category, price, description, image",
            });
        }
        const priceNum = Number(price);
        if (Number.isNaN(priceNum) || priceNum < 0) {
            return res.status(400).json({ error: "Некорректная цена" });
        }

        const product = await prisma.product.create({
            data: {
                name,
                brand,
                category,
                price: Math.round(priceNum),
                description,
                image: String(image),
                sellerId: req.user.id,
            },
            include: {
                seller: {
                    select: { id: true, name: true, login: true },
                },
            },
        });
        return res.status(201).json(product);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Не удалось создать товар" });
    }
}

async function update(req, res) {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: "Некорректный id" });
        }

        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: "Товар не найден" });
        }
        if (existing.sellerId !== req.user.id) {
            return res.status(403).json({ error: "Можно редактировать только свои товары" });
        }

        const { name, brand, category, price, description, image } = req.body;
        const data = {};
        if (name != null) data.name = name;
        if (brand != null) data.brand = brand;
        if (category != null) data.category = category;
        if (price != null) {
            const priceNum = Number(price);
            if (Number.isNaN(priceNum) || priceNum < 0) {
                return res.status(400).json({ error: "Некорректная цена" });
            }
            data.price = Math.round(priceNum);
        }
        if (description != null) data.description = description;
        if (image != null) data.image = String(image);

        const product = await prisma.product.update({
            where: { id },
            data,
            include: {
                seller: {
                    select: { id: true, name: true, login: true },
                },
            },
        });
        return res.json(product);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Не удалось обновить товар" });
    }
}

async function remove(req, res) {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: "Некорректный id" });
        }

        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: "Товар не найден" });
        }
        if (existing.sellerId !== req.user.id) {
            return res.status(403).json({ error: "Можно удалять только свои товары" });
        }

        await prisma.product.delete({ where: { id } });
        return res.status(204).send();
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Не удалось удалить товар" });
    }
}

module.exports = { list, getById, create, update, remove };
