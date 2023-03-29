interface Wireless24IconProps {
  className?: string
  title: string
}

export const Wireless24Icon = ({ className = '', title }: Wireless24IconProps) => (
  <svg
    className={`ox-icon ${className}`}
    aria-label={title}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.321 20.227a1 1 0 0 0 1.457-.004L22.476 9.86a.956.956 0 0 0 .102-1.2C20.164 5.2 16.338 3 12.052 3 7.767 3 3.849 5.2 1.425 8.657a.954.954 0 0 0 .104 1.203l9.792 10.367Z"
      fill="currentColor"
    />
  </svg>
)
