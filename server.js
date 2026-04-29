require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === "production") {
        console.error("Критично: задайте JWT_SECRET в окружении.");
        process.exit(1);
    }
    process.env.JWT_SECRET = "dev-only-jwt-secret";
    console.warn("JWT_SECRET не задан — используется небезопасное значение для разработки.");
}

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || true,
        credentials: true,
    })
);
app.use(express.json());
app.use(express.static("public"));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/health", (req, res) => {
    res.json({ ok: true });
});

app.use((req, res) => {
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "Not found" });
    }
    return res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`AudioStore API слушает порт ${PORT}`);
});
