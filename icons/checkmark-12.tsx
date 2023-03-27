import icon from './checkmark-12.svg?raw'

interface Checkmark12IconProps {
  className?: string
  title: string
}

export const Checkmark12Icon = ({ className = '', title }: Checkmark12IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
