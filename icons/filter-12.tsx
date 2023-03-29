interface Filter12IconProps {
  className?: string
  title: string
}

export const Filter12Icon = ({ className = '', title }: Filter12IconProps) => (
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
      d="M0 1.667C0 1.299.299 1 .667 1h10.666c.368 0 .667.299.667.667v.666a.667.667 0 0 1-.667.667H.667A.667.667 0 0 1 0 2.333v-.666Zm2 4C2 5.299 2.299 5 2.667 5h6.666c.368 0 .667.299.667.667v.666A.667.667 0 0 1 9.333 7H2.667A.667.667 0 0 1 2 6.333v-.666Zm6 4A.667.667 0 0 0 7.333 9H4.667A.667.667 0 0 0 4 9.667v.666c0 .368.299.667.667.667h2.666A.667.667 0 0 0 8 10.333v-.666Z"
      fill="currentColor"
    />
  </svg>
)
