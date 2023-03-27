import icon from './unauthorized-12.svg?raw'

interface Unauthorized12IconProps {
  className?: string
  title: string
}

export const Unauthorized12Icon = ({ className = '', title }: Unauthorized12IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
