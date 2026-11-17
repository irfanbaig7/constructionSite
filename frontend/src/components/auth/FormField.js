"use client";

import { useState } from "react";

const inputClass =
    "w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/50 outline-none focus:border-orange-500 light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder-slate-500";

export default function FormField({ label, name, type = "text", value, onChange, placeholder, autoComplete }) {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";

    return (
        <div>
            <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
                {label}
            </label>
            <div className="relative">
                <input
                    id={name}
                    name={name}
                    type={isPassword && show ? "text" : type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    required
                    className={`${inputClass} ${isPassword ? "pr-16" : ""}`}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold hover:text-orange-500"
                    >
                        {show ? "Hide" : "Show"}
                    </button>
                )}
            </div>
        </div>
    );
}