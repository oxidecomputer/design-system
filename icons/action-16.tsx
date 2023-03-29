interface Action16IconProps {
  className?: string
  title: string
}

export const Action16Icon = ({ className = '', title }: Action16IconProps) => (
  <svg
    className={`ox-icon ${className}`}
    aria-label={title}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 7h3.978a.5.5 0 0 1 .394.807L7.895 14.85A.5.5 0 0 1 7 14.543V9H3.022a.5.5 0 0 1-.394-.807L8.105 1.15A.5.5 0 0 1 9 1.457V7Z"
      fill="currentColor"
    />
  </svg>
)
