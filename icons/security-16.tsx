import icon from './security-16.svg?raw'

interface Security16IconProps {
  className?: string
  title: string
}

export const Security16Icon = ({ className = '', title }: Security16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
