import icon from './router-16.svg?raw'

interface Router16IconProps {
  className?: string
  title: string
}

export const Router16Icon = ({ className = '', title }: Router16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
