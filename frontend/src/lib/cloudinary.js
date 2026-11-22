// Cloudinary URLs get resized on the fly; any other URL (local disk etc.) is used as is.
const isCloudinary = (url) => url.includes("res.cloudinary.com") && url.includes("/upload/");
const t = (url, tr) => (isCloudinary(url) ? url.replace("/upload/", `/upload/${tr}/`) : url);

export const thumb = (url) => t(url, "c_fill,w_240,h_240,q_auto,f_auto");
export const large = (url) => t(url, "c_limit,w_1600,q_auto,f_auto");