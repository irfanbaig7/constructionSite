"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export default function Modal({ title, onClose, children }) {
    return (
        <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60" />
                <Dialog.Content
                    aria-describedby={undefined}
                    className="fixed left-1/2 top-1/2 z-[61] max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/10 bg-[#0d1424] p-5 text-white shadow-2xl light:border-slate-200 light:bg-white light:text-slate-900"
                >
                    <div className="flex items-center justify-between gap-3">
                        <Dialog.Title className="text-lg font-bold">{title}</Dialog.Title>
                        <Dialog.Close aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 light:hover:bg-slate-100">
                            <X size={18} />
                        </Dialog.Close>
                    </div>
                    <div className="mt-4">{children}</div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}