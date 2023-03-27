import icon from './storage-24.svg?raw'

interface Storage24IconProps {
  className?: string
  title: string
}

export const Storage24Icon = ({ className = '', title }: Storage24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
