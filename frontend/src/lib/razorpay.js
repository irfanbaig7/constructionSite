
function loadRazorpay() {
    return new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve(window.Razorpay);
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => resolve(window.Razorpay);
        s.onerror = () => reject(new Error("Unable to load the payment window. Please check your internet connection."));
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
            modal: { ondismiss: () => reject(new Error("Payment was cancelled.")) },
        });
        rz.on("payment.failed", (r) => reject(new Error(r.error?.description || "Payment failed.")));
        rz.open();
    });
}
