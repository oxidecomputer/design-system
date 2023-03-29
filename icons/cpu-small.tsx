interface CpuSmallIconProps {
  className?: string
  title: string
}

export const CpuSmallIcon = ({ className = '', title }: CpuSmallIconProps) => (
  <svg
    className={`ox-icon ${className}`}
    aria-label={title}
    width="15"
    height="15"
    viewBox="0 0 15 15"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M7 3h1V1H7v2Zm4 1H4v7h7V4ZM6 3H5V1h1v2Zm3 0h1V1H9v2ZM8 14H7v-2h1v2Zm-3 0h1v-2H5v2Zm5 0H9v-2h1v2Zm2-7v1h2V7h-2Zm0-1V5h2v1h-2Zm0 3v1h2V9h-2ZM1 8V7h2v1H1Zm0-3v1h2V5H1Zm0 5V9h2v1H1Z"
      fill="currentColor"
    />
  </svg>
)
