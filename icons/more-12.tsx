import icon from './more-12.svg?raw'

interface More12IconProps {
  className?: string
  title: string
}

export const More12Icon = ({ className = '', title }: More12IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
