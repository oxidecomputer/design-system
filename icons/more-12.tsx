interface More12IconProps {
  className?: string
  title: string
}

export const More12Icon = ({ className = '', title }: More12IconProps) => (
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
      d="M5 1.667C5 1.299 5.299 1 5.667 1h.666c.368 0 .667.299.667.667v.666A.667.667 0 0 1 6.333 3h-.666A.667.667 0 0 1 5 2.333v-.666Zm0 4C5 5.299 5.299 5 5.667 5h.666c.368 0 .667.299.667.667v.666A.667.667 0 0 1 6.333 7h-.666A.667.667 0 0 1 5 6.333v-.666Zm2 4A.667.667 0 0 0 6.333 9h-.666A.667.667 0 0 0 5 9.667v.666c0 .368.299.667.667.667h.666A.667.667 0 0 0 7 10.333v-.666Z"
      fill="currentColor"
    />
  </svg>
)
