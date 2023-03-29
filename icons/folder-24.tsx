interface Folder24IconProps {
  className?: string
  title: string
}

export const Folder24Icon = ({ className = '', title }: Folder24IconProps) => (
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
      d="M2 3h10a1 1 0 0 1 1 1v2H1V4a1 1 0 0 1 1-1ZM1 8h21a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V8Z"
      fill="currentColor"
    />
  </svg>
)
