import { Link } from 'react-router-dom'

const variants = {
  primary: 'bg-gradient-to-r from-cyber-teal to-cyan-400 text-navy-950 font-semibold hover:shadow-[0_0_30px_rgba(0,229,204,0.3)] hover:scale-[1.02]',
  secondary: 'bg-navy-700/60 text-white border border-navy-600 hover:border-cyber-teal/40 hover:bg-navy-700',
  outline: 'bg-transparent text-cyber-teal border border-cyber-teal/40 hover:bg-cyber-teal/10 hover:border-cyber-teal',
  danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:scale-[1.02]',
  ghost: 'bg-transparent text-gray-300 hover:text-cyber-teal hover:bg-navy-800/50',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  className = '',
  disabled = false,
  ...props
}) {
  const baseClasses = `inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${variants[variant]} ${sizes[size]} ${className}`

  if (to) {
    return (
      <Link to={to} className={baseClasses} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={baseClasses} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    )
  }

  return (
    <button className={baseClasses} disabled={disabled} {...props}>
      {children}
    </button>
  )
}

export default Button
