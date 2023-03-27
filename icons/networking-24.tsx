import icon from './networking-24.svg?raw'

interface Networking24IconProps {
  className?: string
  title: string
}

export const Networking24Icon = ({ className = '', title }: Networking24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
