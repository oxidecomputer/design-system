import icon from './subnet-16.svg?raw'

interface Subnet16IconProps {
  className?: string
  title: string
}

export const Subnet16Icon = ({ className = '', title }: Subnet16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
