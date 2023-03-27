import icon from './warning-12.svg?raw'

interface Warning12IconProps {
  className?: string
  title: string
}

export const Warning12Icon = ({ className = '', title }: Warning12IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
