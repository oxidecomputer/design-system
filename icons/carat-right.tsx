import icon from './carat-right.svg?raw'

interface CaratRightIconProps {
  className?: string
  title: string
}

export const CaratRightIcon = ({ className = '', title }: CaratRightIconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
