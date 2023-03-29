interface Dislike24IconProps {
  className?: string
  title: string
}

export const Dislike24Icon = ({ className = '', title }: Dislike24IconProps) => (
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
      d="M11.328 23.616 17 16.982V4H5.78a.75.75 0 0 0-.689.455L1 14v.982a2 2 0 0 0 2 2h6.571l-1.098 4.207a2 2 0 0 0 1.302 2.403l.746.248a.75.75 0 0 0 .807-.224Zm9.922-6.634a.75.75 0 0 0 .75-.75V4.75a.75.75 0 0 0-.75-.75h-2.107v12.982h2.107Z"
      fill="currentColor"
    />
  </svg>
)
