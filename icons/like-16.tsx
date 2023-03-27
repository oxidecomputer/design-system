import icon from './like-16.svg?raw'

interface Like16IconProps {
  className?: string
  title: string
}

export const Like16Icon = ({ className = '', title }: Like16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
