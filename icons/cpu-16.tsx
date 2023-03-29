interface Cpu16IconProps {
  className?: string
  title: string
}

export const Cpu16Icon = ({ className = '', title }: Cpu16IconProps) => (
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
      d="M7 0v3h2V0h2v3h1.25a.75.75 0 0 1 .75.75V5h3v2h-3v2h3v2h-3v1.25a.75.75 0 0 1-.75.75H11v3H9v-3H7v3H5v-3H3.75a.75.75 0 0 1-.75-.75V11H0V9h3V7H0V5h3V3.75A.75.75 0 0 1 3.75 3H5V0h2Zm0 9V7h2v2H7Zm3.5-4h-5a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5Z"
      fill="currentColor"
    />
  </svg>
)
