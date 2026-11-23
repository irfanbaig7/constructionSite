import toast from "react-hot-toast";

// The message itself is the id, so the same error never stacks.
export const notify = {
    error: (message) => toast.error(message, { id: message }),
    success: (message) => toast.success(message, { id: message }),
};