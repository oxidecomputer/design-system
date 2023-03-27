import icon from './repair-12.svg?raw'

interface Repair12IconProps {
  className?: string
  title: string
}

export const Repair12Icon = ({ className = '', title }: Repair12IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
