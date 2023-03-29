interface Folder16IconProps {
  className?: string
  title: string
}

export const Folder16Icon = ({ className = '', title }: Folder16IconProps) => (
  <svg
    className={`ox-icon ${className}`}
    aria-label={title}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M1.75 2h6.773a.75.75 0 0 1 .75.75v1.16H1V2.75A.75.75 0 0 1 1.75 2ZM1 5h13.25a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75V5Z"
      fill="currentColor"
    />
  </svg>
)
