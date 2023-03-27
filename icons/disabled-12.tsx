import icon from './disabled-12.svg?raw'

interface Disabled12IconProps {
  className?: string
  title: string
}

export const Disabled12Icon = ({ className = '', title }: Disabled12IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
