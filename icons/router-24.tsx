import icon from './router-24.svg?raw'

interface Router24IconProps {
  className?: string
  title: string
}

export const Router24Icon = ({ className = '', title }: Router24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
