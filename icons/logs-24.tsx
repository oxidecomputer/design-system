interface Logs24IconProps {
  className?: string
  title: string
}

export const Logs24Icon = ({ className = '', title }: Logs24IconProps) => (
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
      d="M1 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5v3.973l4 .054V11a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H10a1 1 0 0 1-1-.973l-4-.054V18h4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1H4a1 1 0 0 1-1-1V7H2a1 1 0 0 1-1-1V4Zm8 0a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1V4Z"
      fill="currentColor"
    />
  </svg>
)
