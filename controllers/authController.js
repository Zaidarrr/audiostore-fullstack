const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const SALT_ROUNDS = 10;

function signToken(user) {
    return jwt.sign(
        { sub: user.id, role: user.role, login: user.login },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

function userResponse(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        login: user.login,
        role: user.role,
        createdAt: user.createdAt,
    };
}

async function register(req, res) {
    try {
        const { name, email, login, password, role } = req.body;
        if (!name || !email || !login || !password) {
            return res.status(400).json({ error: "Укажите name, email, login и password" });
        }

        const existing = await prisma.user.findFirst({
            where: { OR: [{ email }, { login }] },
        });
        if (existing) {
            return res.status(409).json({ error: "Пользователь с таким email или login уже существует" });
        }

        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                login,
                password: hash,
                role: role === "seller" ? "seller" : "buyer",
            },
        });

        const token = signToken(user);
        return res.status(201).json({ token, user: userResponse(user) });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Ошибка регистрации" });
    }
}

async function login(req, res) {
    try {
        const { login: loginField, email, password } = req.body;
        const loginOrEmail = loginField || email;
        if (!loginOrEmail || !password) {
            return res.status(400).json({ error: "Укажите login/email и password" });
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [{ login: loginOrEmail }, { email: loginOrEmail }],
            },
        });
        if (!user) {
            return res.status(401).json({ error: "Неверный логин или пароль" });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return res.status(401).json({ error: "Неверный логин или пароль" });
        }

        const token = signToken(user);
        return res.json({ token, user: userResponse(user) });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Ошибка входа" });
    }
}

module.exports = { register, login };
