import icon from './prev-arrow-12.svg?raw'

interface PrevArrow12IconProps {
  className?: string
  title: string
}

export const PrevArrow12Icon = ({ className = '', title }: PrevArrow12IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
