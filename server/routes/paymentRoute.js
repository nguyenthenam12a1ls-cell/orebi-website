import express from "express";
import { 
  createPaymentIntent, 
  confirmPayment, 
  handleStripeWebhook 
} from "../controllers/paymentController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// Tạo Payment Intent (Khởi tạo thanh toán)
router.post("/stripe/create-payment-intent", userAuth, createPaymentIntent);

// Xác nhận thanh toán thành công
router.post("/stripe/confirm-payment", userAuth, confirmPayment);

// Webhook
router.post("/stripe/webhook", express.raw({type: 'application/json'}), handleStripeWebhook);

export default router;