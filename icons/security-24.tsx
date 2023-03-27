import icon from './security-24.svg?raw'

interface Security24IconProps {
  className?: string
  title: string
}

export const Security24Icon = ({ className = '', title }: Security24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
