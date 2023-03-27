import icon from './firewall-24.svg?raw'

interface Firewall24IconProps {
  className?: string
  title: string
}

export const Firewall24Icon = ({ className = '', title }: Firewall24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
