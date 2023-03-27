import icon from './error-12.svg?raw'

interface Error12IconProps {
  className?: string
  title: string
}

export const Error12Icon = ({ className = '', title }: Error12IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
