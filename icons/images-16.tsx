import icon from './images-16.svg?raw'

interface Images16IconProps {
  className?: string
  title: string
}

export const Images16Icon = ({ className = '', title }: Images16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
