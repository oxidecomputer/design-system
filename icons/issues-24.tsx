interface Issues24IconProps {
  className?: string
  title: string
}

export const Issues24Icon = ({ className = '', title }: Issues24IconProps) => (
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
      d="M6 1a1 1 0 0 0-1 1v19H4a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2H7v-9h6v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-4V4a1 1 0 0 0-1-1H7V2a1 1 0 0 0-1-1Z"
      fill="currentColor"
    />
  </svg>
)
