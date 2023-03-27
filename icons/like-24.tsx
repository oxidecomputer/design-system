import icon from './like-24.svg?raw'

interface Like24IconProps {
  className?: string
  title: string
}

export const Like24Icon = ({ className = '', title }: Like24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
