interface PersonGroup24IconProps {
  className?: string
  title: string
}

export const PersonGroup24Icon = ({ className = '', title }: PersonGroup24IconProps) => (
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
      d="M16 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-2 2a5 5 0 0 0-5 5v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2a5 5 0 0 0-5-5h-4ZM9.136 5.618C9.046 6.065 9 6.527 9 7c0 1.557.508 2.995 1.368 4.158a4 4 0 1 1-1.232-5.54Zm-.886 9.388A6.968 6.968 0 0 0 7 19v3H2a1 1 0 0 1-1-1v-1a5 5 0 0 1 5-5h2c.084 0 .167.002.25.006Z"
      fill="currentColor"
    />
  </svg>
)
