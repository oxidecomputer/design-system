import icon from './logs-16.svg?raw'

interface Logs16IconProps {
  className?: string
  title: string
}

export const Logs16Icon = ({ className = '', title }: Logs16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
