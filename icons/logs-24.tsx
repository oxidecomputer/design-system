import icon from './logs-24.svg?raw'

interface Logs24IconProps {
  className?: string
  title: string
}

export const Logs24Icon = ({ className = '', title }: Logs24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
