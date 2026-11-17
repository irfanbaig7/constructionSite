import { inputClass } from "@/lib/styles";

// as = "input" | "select" | "textarea"
export default function Field({ label, name, as: Tag = "input", className = "", children, ...props }) {
    return (
        <div className={className}>
            <label htmlFor={name} className="mb-1.5 block text-sm font-medium">{label}</label>
            <Tag id={name} name={name} className={inputClass} {...props}>{children}</Tag>
        </div>
    );
}