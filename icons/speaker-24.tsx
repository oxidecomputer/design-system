import icon from './speaker-24.svg?raw'

interface Speaker24IconProps {
  className?: string
  title: string
}

export const Speaker24Icon = ({ className = '', title }: Speaker24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
