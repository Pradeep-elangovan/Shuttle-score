interface ShuttlecockIconProps {
  className?: string
}

export default function ShuttlecockIcon({ className = 'w-6 h-6' }: ShuttlecockIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cork base */}
      <circle cx="32" cy="48" r="8" fill="currentColor" opacity="0.9" />
      <ellipse cx="32" cy="48" rx="6" ry="5" fill="currentColor" />

      {/* Feathers */}
      <path
        d="M32 40 C28 30, 20 20, 18 12 C18 8, 22 6, 26 10 C28 14, 30 24, 32 40Z"
        fill="currentColor"
        opacity="0.7"
      />
      <path
        d="M32 40 C36 30, 44 20, 46 12 C46 8, 42 6, 38 10 C36 14, 34 24, 32 40Z"
        fill="currentColor"
        opacity="0.7"
      />
      <path
        d="M32 40 C30 28, 26 16, 24 8 C24 4, 28 3, 30 8 C31 14, 31.5 26, 32 40Z"
        fill="currentColor"
        opacity="0.5"
      />
      <path
        d="M32 40 C34 28, 38 16, 40 8 C40 4, 36 3, 34 8 C33 14, 32.5 26, 32 40Z"
        fill="currentColor"
        opacity="0.5"
      />

      {/* Center spine */}
      <line x1="32" y1="10" x2="32" y2="44" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </svg>
  )
}
