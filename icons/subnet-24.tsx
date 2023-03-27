import icon from './subnet-24.svg?raw'

interface Subnet24IconProps {
  className?: string
  title: string
}

export const Subnet24Icon = ({ className = '', title }: Subnet24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
