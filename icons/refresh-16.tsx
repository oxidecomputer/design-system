import icon from './refresh-16.svg?raw'

interface Refresh16IconProps {
  className?: string
  title: string
}

export const Refresh16Icon = ({ className = '', title }: Refresh16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
