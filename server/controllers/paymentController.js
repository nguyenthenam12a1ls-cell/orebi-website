import Stripe from "stripe";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent for Stripe
export const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    // Find the order
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // Verify order belongs to user
    if (order.userId.toString() !== userId) {
      return res.json({
        success: false,
        message: "Unauthorized access to order",
      });
    }

    // Check if order is already paid
    if (order.paymentStatus === "paid") {
      return res.json({ success: false, message: "Order is already paid" });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.amount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        orderId: order._id.toString(),
        userId: userId,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: order.amount,
    });
  } catch (error) {
    console.error("Create Payment Intent Error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Confirm payment and update order status (FULL CODE - LOGIC MỚI)
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    const userId = req.user.id;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Update order payment status
      const order = await orderModel.findById(orderId);
      if (!order) {
        return res.json({ success: false, message: "Order not found" });
      }

      // Verify order belongs to user
      if (order.userId.toString() !== userId) {
        return res.json({
          success: false,
          message: "Unauthorized access to order",
        });
      }

      order.paymentStatus = "paid";
      order.paymentMethod = "stripe";
      order.status = "confirmed";
      await order.save();

      // --- LOGIC MỚI: XÓA GIỎ HÀNG SAU KHI THANH TOÁN THÀNH CÔNG ---
      await userModel.findByIdAndUpdate(userId, { $set: { userCart: {} } });
      // -------------------------------------------------------------

      res.json({
        success: true,
        message: "Payment confirmed successfully",
        order: order,
      });
    } else {
      res.json({
        success: false,
        message: "Payment not completed",
      });
    }
  } catch (error) {
    console.error("Confirm Payment Error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Handle Stripe webhook for payment updates
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;

      // Update order status
      await orderModel.findByIdAndUpdate(orderId, {
        paymentStatus: "paid",
        status: "confirmed",
      });
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      const failedOrderId = failedPayment.metadata.orderId;

      // Update order status
      await orderModel.findByIdAndUpdate(failedOrderId, {
        paymentStatus: "failed",
      });
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};