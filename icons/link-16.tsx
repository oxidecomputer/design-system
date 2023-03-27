import icon from './link-16.svg?raw'

interface Link16IconProps {
  className?: string
  title: string
}

export const Link16Icon = ({ className = '', title }: Link16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
