interface Error12IconProps {
  className?: string
  title: string
}

export const Error12Icon = ({ className = '', title }: Error12IconProps) => (
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
      d="M6 12A6 6 0 1 0 6 0a6 6 0 0 0 0 12Zm.083-9c.368 0 .667.299.667.667v2.666A.667.667 0 0 1 6.083 7h-.166a.667.667 0 0 1-.667-.667V3.667c0-.368.299-.667.667-.667h.166Zm0 5c.368 0 .667.299.667.667v.166a.667.667 0 0 1-.667.667h-.166a.667.667 0 0 1-.667-.667v-.166c0-.368.299-.667.667-.667h.166Z"
      fill="currentColor"
    />
  </svg>
)
