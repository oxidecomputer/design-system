import icon from './action-24.svg?raw'

interface Action24IconProps {
  className?: string
  title: string
}

export const Action24Icon = ({ className = '', title }: Action24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
