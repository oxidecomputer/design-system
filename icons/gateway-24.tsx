import icon from './gateway-24.svg?raw'

interface Gateway24IconProps {
  className?: string
  title: string
}

export const Gateway24Icon = ({ className = '', title }: Gateway24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
