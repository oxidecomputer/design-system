import icon from './resize-24.svg?raw'

interface Resize24IconProps {
  className?: string
  title: string
}

export const Resize24Icon = ({ className = '', title }: Resize24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
