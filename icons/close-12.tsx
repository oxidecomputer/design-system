interface Close12IconProps {
  className?: string
  title: string
}

export const Close12Icon = ({ className = '', title }: Close12IconProps) => (
  <svg
    className={`ox-icon ${className}`}
    aria-label={title}
    width="17"
    height="17"
    viewBox="0 0 17 17"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M12.809 5.254a.668.668 0 0 0 0-.945l-.118-.118a.668.668 0 0 0-.945 0L8.5 7.437 5.254 4.191a.668.668 0 0 0-.945 0l-.118.118a.668.668 0 0 0 0 .945L7.437 8.5l-3.246 3.246a.668.668 0 0 0 0 .945l.118.118c.26.26.684.26.945 0L8.5 9.562l3.246 3.247c.261.26.684.26.945 0l.118-.118a.668.668 0 0 0 0-.945L9.562 8.5l3.247-3.246Z"
      fill="currentColor"
    />
  </svg>
)
