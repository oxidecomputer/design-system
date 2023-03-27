import icon from './carat-down.svg?raw'

interface CaratDownIconProps {
  className?: string
  title: string
}

export const CaratDownIcon = ({ className = '', title }: CaratDownIconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
