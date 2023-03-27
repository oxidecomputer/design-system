import icon from './gateway-16.svg?raw'

interface Gateway16IconProps {
  className?: string
  title: string
}

export const Gateway16Icon = ({ className = '', title }: Gateway16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
