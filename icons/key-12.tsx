import icon from './key-12.svg?raw'

interface Key12IconProps {
  className?: string
  title: string
}

export const Key12Icon = ({ className = '', title }: Key12IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
