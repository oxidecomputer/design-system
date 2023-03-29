interface Progress24IconProps {
  className?: string
  title: string
}

export const Progress24Icon = ({ className = '', title }: Progress24IconProps) => (
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
      d="M18 1a1 1 0 0 0-1 1v20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2Zm-8 8a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V9Zm-7 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6Z"
      fill="currentColor"
    />
  </svg>
)
