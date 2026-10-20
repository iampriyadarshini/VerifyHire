const riskConfig = {
  safe: {
    label: 'Safe',
    bg: 'bg-risk-safe/15',
    text: 'text-risk-safe',
    border: 'border-risk-safe/30',
    dot: 'bg-risk-safe',
  },
  low: {
    label: 'Low Risk',
    bg: 'bg-risk-low/15',
    text: 'text-risk-low',
    border: 'border-risk-low/30',
    dot: 'bg-risk-low',
  },
  medium: {
    label: 'Medium Risk',
    bg: 'bg-risk-medium/15',
    text: 'text-risk-medium',
    border: 'border-risk-medium/30',
    dot: 'bg-risk-medium',
  },
  high: {
    label: 'High Risk',
    bg: 'bg-risk-high/15',
    text: 'text-risk-high',
    border: 'border-risk-high/30',
    dot: 'bg-risk-high',
  },
  critical: {
    label: 'Critical',
    bg: 'bg-risk-critical/15',
    text: 'text-risk-critical',
    border: 'border-risk-critical/30',
    dot: 'bg-risk-critical',
  },
  unknown: {
    label: 'Unknown',
    bg: 'bg-gray-500/15',
    text: 'text-gray-400',
    border: 'border-gray-500/30',
    dot: 'bg-gray-400',
  },
  'needs-review': {
    label: 'Needs Review',
    bg: 'bg-risk-medium/15',
    text: 'text-risk-medium',
    border: 'border-risk-medium/30',
    dot: 'bg-risk-medium',
  },
  unverified: {
    label: 'Unverified',
    bg: 'bg-gray-500/15',
    text: 'text-gray-300',
    border: 'border-gray-500/30',
    dot: 'bg-gray-400',
  },
  'lower-observed-risk': {
    label: 'Lower Observed Risk',
    bg: 'bg-risk-safe/15',
    text: 'text-risk-safe',
    border: 'border-risk-safe/30',
    dot: 'bg-risk-safe',
  },
}

function RiskBadge({ level = 'unknown', label, size = 'md', showDot = true, className = '' }) {
  const config = riskConfig[level] || riskConfig.unknown
  const displayLabel = label || config.label

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border
        ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      )}
      {displayLabel}
    </span>
  )
}

export default RiskBadge
