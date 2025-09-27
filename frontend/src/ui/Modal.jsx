// vims_project/frontend/src/ui/Modal.jsx
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";

export default function Modal({ isOpen, onClose, title, children, footer }) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>

        {/* Centered panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl flex flex-col max-h-[90vh]">
              {title && (
                <DialogTitle className="mb-4 text-lg font-semibold text-gray-800">
                  {title}
                </DialogTitle>
              )}

              {/* Flex-1 allows this div to grow and fill the available space. */}
              {/* The overflow-y-auto class enables scrolling for content overflow. */}
              <div className="flex-1 overflow-y-auto p-4">{children}</div>

              {footer && (
                <div className="mt-6 flex justify-end gap-2">{footer}</div>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
