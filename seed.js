require("dotenv").config();

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { products } = require("./public/js/data.js");

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

const DEMO_SELLER = {
    name: "Демо продавец",
    email: "seller@audiostore.demo",
    login: "demo_seller",
    password: "DemoSeller123!",
    role: "seller",
};
const DEMO_BUYER = {
    name: "Демо покупатель",
    email: "buyer@audiostore.demo",
    login: "buyer",
    password: "123456",
    role: "buyer",
};

async function main() {
    const hash = await bcrypt.hash(DEMO_SELLER.password, SALT_ROUNDS);
    const buyerHash = await bcrypt.hash(DEMO_BUYER.password, SALT_ROUNDS);

    const seller = await prisma.user.upsert({
        where: { login: DEMO_SELLER.login },
        create: {
            name: DEMO_SELLER.name,
            email: DEMO_SELLER.email,
            login: DEMO_SELLER.login,
            password: hash,
            role: DEMO_SELLER.role,
        },
        update: {
            name: DEMO_SELLER.name,
            email: DEMO_SELLER.email,
            password: hash,
            role: DEMO_SELLER.role,
        },
    });
    await prisma.user.upsert({
        where: { login: DEMO_BUYER.login },
        create: {
            name: DEMO_BUYER.name,
            email: DEMO_BUYER.email,
            login: DEMO_BUYER.login,
            password: buyerHash,
            role: DEMO_BUYER.role,
        },
        update: {
            name: DEMO_BUYER.name,
            email: DEMO_BUYER.email,
            password: buyerHash,
            role: DEMO_BUYER.role,
        },
    });

    await prisma.product.deleteMany({ where: { sellerId: seller.id } });

    await prisma.product.createMany({
        data: products.map((p) => ({
            name: p.name,
            brand: p.brand,
            category: p.category,
            price: p.price,
            description: p.description,
            image: p.image,
            sellerId: seller.id,
        })),
    });

    console.log(`Сид завершён: продавец id=${seller.id}, товаров: ${products.length}`);
    console.log(`Логин продавца: ${DEMO_SELLER.login} / ${DEMO_SELLER.password}`);
    console.log(`Логин покупателя: ${DEMO_BUYER.login} / ${DEMO_BUYER.password}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
