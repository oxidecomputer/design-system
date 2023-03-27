import icon from './carat-up.svg?raw'

interface CaratUpIconProps {
  className?: string
  title: string
}

export const CaratUpIcon = ({ className = '', title }: CaratUpIconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
