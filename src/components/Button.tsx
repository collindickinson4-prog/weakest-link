import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'correct' | 'wrong' | 'bank' | 'ghost' | 'danger'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-wl-blue-bright to-wl-blue text-white border-wl-cyan hover:brightness-110',
  correct:
    'bg-gradient-to-b from-emerald-400 to-emerald-600 text-white border-emerald-200 hover:brightness-110',
  wrong: 'bg-gradient-to-b from-rose-500 to-rose-700 text-white border-rose-300 hover:brightness-110',
  bank: 'bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 border-amber-200 hover:brightness-110',
  ghost: 'bg-white/5 text-slate-100 border-white/20 hover:bg-white/10',
  danger: 'bg-gradient-to-b from-red-600 to-red-800 text-white border-red-300 hover:brightness-110',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-4 text-2xl',
}

export default function Button({ variant = 'primary', size = 'md', className = '', ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`rounded-xl border font-cond font-semibold uppercase tracking-wide shadow-lg transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className}`}
    />
  )
}
