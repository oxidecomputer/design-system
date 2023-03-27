import icon from './next-arrow-12.svg?raw'

interface NextArrow12IconProps {
  className?: string
  title: string
}

export const NextArrow12Icon = ({ className = '', title }: NextArrow12IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
