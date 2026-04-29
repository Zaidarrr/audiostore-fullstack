const express = require("express");
const { list, getById, create, update, remove } = require("../controllers/productController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireSeller } = require("../middleware/requireSeller");

const router = express.Router();

router.get("/", list);
router.get("/:id", getById);
router.post("/", authMiddleware, requireSeller, create);
router.put("/:id", authMiddleware, requireSeller, update);
router.delete("/:id", authMiddleware, requireSeller, remove);

module.exports = router;
