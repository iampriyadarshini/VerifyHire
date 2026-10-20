function Card({ children, className = '', hover = true, glow = false }) {
  return (
    <div
      className={`glass-card rounded-2xl p-6 transition-all duration-300
        ${hover ? 'hover:translate-y-[-2px]' : ''}
        ${glow ? 'glow-teal' : ''}
        ${className}`}
    >
      {children}
    </div>
  )
}

export default Card
