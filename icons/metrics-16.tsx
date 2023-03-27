import icon from './metrics-16.svg?raw'

interface Metrics16IconProps {
  className?: string
  title: string
}

export const Metrics16Icon = ({ className = '', title }: Metrics16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
