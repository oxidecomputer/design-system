interface Subnet24IconProps {
  className?: string
  title: string
}

export const Subnet24Icon = ({ className = '', title }: Subnet24IconProps) => (
  <svg
    className={`ox-icon ${className}`}
    aria-label={title}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M3 2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2v4H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2h4v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-2v-4h2a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v2h-4V3a1 1 0 0 0-1-1H3Zm14 12v-4h-2a1 1 0 0 1-1-1V7h-4v2a1 1 0 0 1-1 1H7v4h2a1 1 0 0 1 1 1v2h4v-2a1 1 0 0 1 1-1h2Z"
      fill="currentColor"
    />
  </svg>
)
