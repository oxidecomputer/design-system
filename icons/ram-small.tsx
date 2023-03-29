interface RamSmallIconProps {
  className?: string
  title: string
}

export const RamSmallIcon = ({ className = '', title }: RamSmallIconProps) => (
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
      d="M15 4H0v5h15V7h-1V6h1V4ZM1 7H0V6h1v1Zm0 4h1v-1H1v1Zm3 0H3v-1h1v1Zm1 0h1v-1H5v1Zm3 0H7v-1h1v1Zm1 0h1v-1H9v1Zm3 0h-1v-1h1v1Zm2 0h-1v-1h1v1Z"
      fill="currentColor"
    />
  </svg>
)
