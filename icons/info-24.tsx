interface Info24IconProps {
  className?: string
  title: string
}

export const Info24Icon = ({ className = '', title }: Info24IconProps) => (
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
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10ZM11 8a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm0 3a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0v-5Z"
      fill="currentColor"
    />
  </svg>
)
