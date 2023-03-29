interface Organization24IconProps {
  className?: string
  title: string
}

export const Organization24Icon = ({ className = '', title }: Organization24IconProps) => (
  <svg
    className={`ox-icon ${className}`}
    aria-label={title}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g fill="currentColor">
      <path d="M9.918 12.707a1 1 0 0 0 0-1.414L6.52 7.895a1 1 0 0 0-1.415 0l-3.398 3.398a1 1 0 0 0 0 1.414l3.398 3.398a1 1 0 0 0 1.415 0l3.398-3.398ZM22.293 12.707a1 1 0 0 0 0-1.414l-3.398-3.398a1 1 0 0 0-1.415 0l-3.398 3.398a1 1 0 0 0 0 1.414l3.398 3.398a1 1 0 0 0 1.415 0l3.398-3.398ZM11.293 1.707a1 1 0 0 1 1.414 0l3.398 3.398a1 1 0 0 1 0 1.415l-3.398 3.398a1 1 0 0 1-1.414 0L7.895 6.52a1 1 0 0 1 0-1.415l3.398-3.398ZM16.105 18.895a1 1 0 0 0 0-1.415l-3.398-3.398a1 1 0 0 0-1.414 0L7.895 17.48a1 1 0 0 0 0 1.415l3.398 3.398a1 1 0 0 0 1.414 0l3.398-3.398Z" />
    </g>
  </svg>
)
