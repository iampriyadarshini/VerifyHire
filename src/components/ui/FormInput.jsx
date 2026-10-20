function FormInput({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  helpText,
  ...props
}) {
  const isTextarea = type === 'textarea'
  const Component = isTextarea ? 'textarea' : 'input'

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-cyber-teal ml-1">*</span>}
        </label>
      )}
      <Component
        id={name}
        name={name}
        type={isTextarea ? undefined : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        rows={isTextarea ? 4 : undefined}
        className={`w-full px-4 py-3 bg-navy-800/60 border rounded-xl text-white placeholder-gray-500 
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyber-teal/40 focus:border-cyber-teal/60
          ${error ? 'border-risk-high/60 focus:ring-risk-high/40 focus:border-risk-high/60' : 'border-navy-600/50 hover:border-navy-500'}
          ${isTextarea ? 'resize-none' : ''}`}
        {...props}
      />
      {error && (
        <p className="text-risk-high text-xs flex items-center gap-1 mt-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="text-gray-500 text-xs mt-1">{helpText}</p>
      )}
    </div>
  )
}

export default FormInput
