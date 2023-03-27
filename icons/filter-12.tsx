import icon from './filter-12.svg?raw'

interface Filter12IconProps {
  className?: string
  title: string
}

export const Filter12Icon = ({ className = '', title }: Filter12IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
