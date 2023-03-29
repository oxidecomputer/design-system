interface Location24IconProps {
  className?: string
  title: string
}

export const Location24Icon = ({ className = '', title }: Location24IconProps) => (
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
      d="M18 7a6.002 6.002 0 0 1-5 5.917V17h-2v-4.083A6.002 6.002 0 0 1 12 1a6 6 0 0 1 6 6Zm3 13c0 1.657-4.03 3-9 3s-9-1.343-9-3c0-1.544 3.5-2.816 8-2.982V20a1 1 0 1 0 2 0v-2.982c4.5.166 8 1.438 8 2.982Z"
      fill="currentColor"
    />
  </svg>
)
