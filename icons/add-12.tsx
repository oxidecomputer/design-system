import icon from './add-12.svg?raw'

interface Add12IconProps {
  className?: string
  title: string
}

export const Add12Icon = ({ className = '', title }: Add12IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
