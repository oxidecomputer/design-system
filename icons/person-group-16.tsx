interface PersonGroup16IconProps {
  className?: string
  title: string
}

export const PersonGroup16Icon = ({ className = '', title }: PersonGroup16IconProps) => (
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
      d="M10.5 7a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM9 9a3 3 0 0 0-3 3v1.25c0 .414.336.75.75.75h7.5a.75.75 0 0 0 .75-.75V12a3 3 0 0 0-3-3H9ZM5.508 3.212A4.98 4.98 0 0 0 6.68 6.726 2.5 2.5 0 0 1 2 5.5a2.5 2.5 0 0 1 3.508-2.288ZM5.168 10a4.977 4.977 0 0 0-.668 2.5V14H1.75a.75.75 0 0 1-.75-.75V13a3 3 0 0 1 3-3h1.169Z"
      fill="currentColor"
    />
  </svg>
)
