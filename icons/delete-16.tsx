import icon from './delete-16.svg?raw'

interface Delete16IconProps {
  className?: string
  title: string
}

export const Delete16Icon = ({ className = '', title }: Delete16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
