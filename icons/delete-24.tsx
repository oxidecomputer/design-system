import icon from './delete-24.svg?raw'

interface Delete24IconProps {
  className?: string
  title: string
}

export const Delete24Icon = ({ className = '', title }: Delete24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
