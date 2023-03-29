interface Close8IconProps {
  className?: string
  title: string
}

export const Close8Icon = ({ className = '', title }: Close8IconProps) => (
  <svg
    className={`ox-icon ${className}`}
    aria-label={title}
    width="8"
    height="8"
    viewBox="0 0 8 8"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M6.21 6.917a.375.375 0 0 0 .53 0l.177-.177a.375.375 0 0 0 0-.53L4.707 4l2.21-2.21a.375.375 0 0 0 0-.53l-.177-.177a.375.375 0 0 0-.53 0L4 3.293l-2.21-2.21a.375.375 0 0 0-.53 0l-.177.177a.375.375 0 0 0 0 .53L3.293 4l-2.21 2.21a.375.375 0 0 0 0 .53l.177.177a.375.375 0 0 0 .53 0L4 4.707l2.21 2.21Z"
      fill="currentColor"
    />
  </svg>
)
