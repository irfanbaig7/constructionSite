function loadRazorpay() {
    return new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve(window.Razorpay);
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => resolve(window.Razorpay);
        s.onerror = () => reject(new Error("Payment window load nahi hui. Internet check karo."));
        document.body.appendChild(s);
    });
}

// Resolves with Razorpay's response (order id, payment id, signature); rejects if closed or failed.
export async function openCheckout(options) {
    const Razorpay = await loadRazorpay();
    return new Promise((resolve, reject) => {
        const rz = new Razorpay({
            ...options,
            handler: resolve,
            modal: { ondismiss: () => reject(new Error("Payment cancel ho gaya.")) },
        });
        rz.on("payment.failed", (r) => reject(new Error(r.error?.description || "Payment fail ho gaya.")));
        rz.open();
    });
}