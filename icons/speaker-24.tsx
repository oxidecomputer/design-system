interface Speaker24IconProps {
  className?: string
  title: string
}

export const Speaker24Icon = ({ className = '', title }: Speaker24IconProps) => (
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
      d="M10.723 7a1 1 0 0 0 .514-.143l8.248-4.948A1 1 0 0 1 21 2.766v18.468a1 1 0 0 1-1.515.857l-8.247-4.949a1 1 0 0 0-.515-.142H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h6.723Z"
      fill="currentColor"
    />
  </svg>
)
