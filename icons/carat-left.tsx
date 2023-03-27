import icon from './carat-left.svg?raw'

interface CaratLeftIconProps {
  className?: string
  title: string
}

export const CaratLeftIcon = ({ className = '', title }: CaratLeftIconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
