import icon from './storage-16.svg?raw'

interface Storage16IconProps {
  className?: string
  title: string
}

export const Storage16Icon = ({ className = '', title }: Storage16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
