// Shrinks a photo before upload. Returns a JPEG Blob.
export function compressImage(file, max = 1200, quality = 0.75) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const scale = Math.min(1, max / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Compress failed"))), "image/jpeg", quality);
        };
        img.onerror = reject;
        img.src = url;
    });
}