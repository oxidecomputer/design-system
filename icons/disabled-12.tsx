interface Disabled12IconProps {
  className?: string
  title: string
}

export const Disabled12Icon = ({ className = '', title }: Disabled12IconProps) => (
  <svg
    className={`ox-icon ${className}`}
    aria-label={title}
    width="12"
    height="12"
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M6 12A6 6 0 1 0 6 0a6 6 0 0 0 0 12ZM3.167 6.75a.667.667 0 0 1-.667-.667v-.166c0-.368.299-.667.667-.667h5.666c.368 0 .667.299.667.667v.166a.667.667 0 0 1-.667.667H3.167Z"
      fill="currentColor"
    />
  </svg>
)
