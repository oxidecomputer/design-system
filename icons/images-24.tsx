import icon from './images-24.svg?raw'

interface Images24IconProps {
  className?: string
  title: string
}

export const Images24Icon = ({ className = '', title }: Images24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
