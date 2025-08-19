import { X } from "lucide-react";
type ModalSuccessProp = {
  size?: "lg" | "md" | "sm";
  onClose?: () => void | undefined;
  isOpen?: boolean;
  children?: React.ReactNode;
};
export const Modal = ({ ...props }: ModalSuccessProp) => {
  if (!props.isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 relative ${props.size === "lg" ? "max-w-lg" : props.size === "md" ? "max-w-md" : "max-w-sm"}`}>
        <button
          onClick={props.onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        {props.children}
      </div>
    </div>
  );
};
