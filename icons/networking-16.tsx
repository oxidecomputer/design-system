import icon from './networking-16.svg?raw'

interface Networking16IconProps {
  className?: string
  title: string
}

export const Networking16Icon = ({ className = '', title }: Networking16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
