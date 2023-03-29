interface Delete24IconProps {
  className?: string
  title: string
}

export const Delete24Icon = ({ className = '', title }: Delete24IconProps) => (
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
      d="M14.586 1a1 1 0 0 1 .707.293l.414.414a1 1 0 0 0 .707.293H20a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3.586a1 1 0 0 0 .707-.293l.414-.414A1 1 0 0 1 9.414 1h5.172ZM6 7a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H6Zm4 3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h1Zm4 0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1Z"
      fill="currentColor"
    />
  </svg>
)
