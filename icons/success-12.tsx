import icon from './success-12.svg?raw'

interface Success12IconProps {
  className?: string
  title: string
}

export const Success12Icon = ({ className = '', title }: Success12IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
