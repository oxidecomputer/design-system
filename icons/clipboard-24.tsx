interface Clipboard24IconProps {
  className?: string
  title: string
}

export const Clipboard24Icon = ({ className = '', title }: Clipboard24IconProps) => (
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
      d="M10 1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-4ZM4 3h3v3a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V3h3a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
      fill="currentColor"
    />
  </svg>
)
