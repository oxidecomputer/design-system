import icon from './clipboard-12.svg?raw'

interface Clipboard12IconProps {
  className?: string
  title: string
}

export const Clipboard12Icon = ({ className = '', title }: Clipboard12IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
