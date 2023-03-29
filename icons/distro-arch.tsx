interface DistroArchIconProps {
  className?: string
  title: string
}

export const DistroArchIcon = ({ className = '', title }: DistroArchIconProps) => (
  <svg
    className={`ox-icon ${className}`}
    aria-label={title}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.499 0C6.83 1.637 6.428 2.708 5.685 4.297a11.712 11.712 0 0 0 1.924 1.681c-.977-.402-1.644-.806-2.142-1.224C4.516 6.739 3.025 9.567 0 15.003c2.378-1.372 4.22-2.22 5.939-2.541a4.36 4.36 0 0 1-.113-1.019l.002-.076c.038-1.523.83-2.695 1.77-2.615.938.08 1.667 1.38 1.63 2.902a4.203 4.203 0 0 1-.096.819c1.699.332 3.523 1.176 5.868 2.53-.462-.851-.876-1.619-1.27-2.35-.62-.481-1.268-1.108-2.59-1.786.909.237 1.559.509 2.066.813C9.198 4.217 8.873 3.225 7.498 0Z"
      fill="currentColor"
    />
  </svg>
)
