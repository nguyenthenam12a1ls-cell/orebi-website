import { Router } from "express";
import { processCheckout } from "../controllers/checkoutController.js";

const router = Router();

// Process checkout and update product stock
router.post("/api/checkout", processCheckout);

export default router;
