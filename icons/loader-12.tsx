import icon from './loader-12.svg?raw'

interface Loader12IconProps {
  className?: string
  title: string
}

export const Loader12Icon = ({ className = '', title }: Loader12IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
