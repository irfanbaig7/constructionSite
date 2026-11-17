export const sumAmount = (items) => items.reduce((total, item) => total + item.amount, 0);

// Full amount with Indian grouping: 142000 -> "₹1,42,000"
export const formatINRFull = (value) => `₹${value.toLocaleString("en-IN")}`;