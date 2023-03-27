import icon from './security-12.svg?raw'

interface Security12IconProps {
  className?: string
  title: string
}

export const Security12Icon = ({ className = '', title }: Security12IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
