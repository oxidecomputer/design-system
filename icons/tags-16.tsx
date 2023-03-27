import icon from './tags-16.svg?raw'

interface Tags16IconProps {
  className?: string
  title: string
}

export const Tags16Icon = ({ className = '', title }: Tags16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
