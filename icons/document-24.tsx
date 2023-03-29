interface Document24IconProps {
  className?: string
  title: string
}

export const Document24Icon = ({ className = '', title }: Document24IconProps) => (
  <svg
    className={`ox-icon ${className}`}
    aria-label={title}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.293 1.293A1 1 0 0 0 15.586 1H4a1 1 0 0 0-1 1v20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V6.414a1 1 0 0 0-.293-.707l-4.414-4.414ZM6 12a1 1 0 0 1 1-1h7a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Zm11 4a1 1 0 0 1-1 1H7a1 1 0 1 1 0-2h9a1 1 0 0 1 1 1Zm1-8a1 1 0 0 1-1 1H7a1 1 0 0 1 0-2h10a1 1 0 0 1 1 1Z"
      fill="currentColor"
    />
  </svg>
)
