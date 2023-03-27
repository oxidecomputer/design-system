import icon from './open-link-12.svg?raw'

interface OpenLink12IconProps {
  className?: string
  title: string
}

export const OpenLink12Icon = ({ className = '', title }: OpenLink12IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
