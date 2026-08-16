import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer shadow-xs",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
        outline:
          'border-border bg-background hover:bg-secondary hover:text-foreground text-foreground',
        secondary:
          'bg-secondary text-secondary-foreground border border-border hover:bg-slate-200/60',
        ghost:
          'hover:bg-muted hover:text-foreground text-foreground shadow-none',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 shadow-sm',
        link: 'text-primary underline-offset-4 hover:underline shadow-none',
      },
      size: {
        default: 'h-10 gap-2 px-4 text-xs font-bold tracking-tight',
        xs: 'h-7 gap-1 px-2.5 text-[11px] rounded-lg',
        sm: 'h-8.5 gap-1.5 px-3 text-xs rounded-lg',
        lg: 'h-12 gap-2.5 px-6 text-sm font-bold rounded-2xl',
        icon: 'size-10 rounded-xl',
        'icon-xs': 'size-7 rounded-lg',
        'icon-sm': 'size-8.5 rounded-lg',
        'icon-lg': 'size-12 rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
