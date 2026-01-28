import { useState } from "react";
import PropTypes from "prop-types";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { FaCreditCard, FaLock, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";
import { config } from "../../config";

// Thay bằng Public Key của bạn
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ orderId, amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setCardError(null);

    try {
      const token = localStorage.getItem("token");
      
      // 1. Tạo Payment Intent từ Backend
      const response = await fetch(
        `${config?.baseUrl}/api/payment/stripe/create-payment-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderId }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Không thể khởi tạo thanh toán");
      }

      // 2. Xác nhận thanh toán với Stripe (Client Side)
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setCardError(result.error.message);
        toast.error(result.error.message);
      } else {
        if (result.paymentIntent.status === "succeeded") {
          toast.success("Thanh toán thành công!");
          // 🔥 QUAN TRỌNG: Truyền ID thật (pi_xxxx) ra ngoài thay vì text rác
          onSuccess(result.paymentIntent.id); 
        }
      }
    } catch (error) {
      console.error(error);
      setCardError(error.message);
      toast.error("Thanh toán thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Thông tin thẻ tín dụng
        </label>
        <div className="p-4 border border-gray-300 rounded-lg bg-white focus-within:border-black transition-colors">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': { color: '#aab7c4' },
                },
                invalid: { color: '#9e2146' },
              },
            }}
          />
        </div>
        {cardError && (
          <p className="text-red-500 text-xs mt-2 font-medium">{cardError}</p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all font-bold flex justify-center items-center gap-2"
        >
          {isProcessing ? <><FaSpinner className="animate-spin"/> Đang xử lý...</> : `Thanh toán $${amount.toFixed(2)}`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-bold"
        >
          Hủy
        </button>
      </div>
      
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
         <FaLock /> Thanh toán bảo mật 100% qua Stripe
      </div>
    </form>
  );
};

CheckoutForm.propTypes = {
    orderId: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    onSuccess: PropTypes.func.isRequired, // Hàm này sẽ nhận ID
    onCancel: PropTypes.func.isRequired,
};

const StripePayment = ({ orderId, amount, onSuccess, onCancel }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm orderId={orderId} amount={amount} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
};

StripePayment.propTypes = {
    orderId: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    onSuccess: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default StripePayment;