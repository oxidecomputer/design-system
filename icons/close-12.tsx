import icon from './close-12.svg?raw'

interface Close12IconProps {
  className?: string
  title: string
}

export const Close12Icon = ({ className = '', title }: Close12IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
