import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-b from-[#3b82f6] to-[#2563eb] text-white shadow-lg shadow-[#3b82f6]/20 hover:shadow-xl hover:shadow-[#3b82f6]/30 hover:from-[#60a5fa] hover:to-[#3b82f6] active:scale-95',
        destructive:
          'bg-gradient-to-b from-[#ef4444] to-[#dc2626] text-white shadow-lg shadow-[#ef4444]/20 hover:shadow-xl hover:shadow-[#ef4444]/30 hover:from-[#f87171] hover:to-[#ef4444] active:scale-95',
        outline:
          'border-2 border-[#3a3a3a] bg-gradient-to-b from-[#2a2a2a] to-[#1e1e1e] text-white shadow-md hover:border-[#3b82f6] hover:shadow-lg hover:shadow-[#3b82f6]/10 hover:from-[#3a3a3a] hover:to-[#2a2a2a] active:scale-95',
        secondary:
          'bg-gradient-to-b from-[#2a2a2a] to-[#1e1e1e] text-white shadow-md hover:from-[#3a3a3a] hover:to-[#2a2a2a] hover:shadow-lg active:scale-95',
        ghost: 'text-white hover:bg-white/10 hover:shadow-md active:scale-95',
        link: 'text-[#3b82f6] underline-offset-4 hover:underline hover:text-[#60a5fa]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-11 rounded-lg px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
