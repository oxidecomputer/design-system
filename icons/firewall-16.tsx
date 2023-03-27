import icon from './firewall-16.svg?raw'

interface Firewall16IconProps {
  className?: string
  title: string
}

export const Firewall16Icon = ({ className = '', title }: Firewall16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
