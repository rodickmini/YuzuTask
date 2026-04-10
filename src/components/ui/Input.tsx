import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-text-sub font-medium">{label}</label>}
      <input
        ref={ref}
        className={`px-3 py-2 bg-white border border-warm-dark rounded-xl text-sm text-text-main placeholder:text-text-sub/50 outline-none transition-all duration-200 focus:border-primary focus:shadow-soft ${className}`}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
