import icon from './action-16.svg?raw'

interface Action16IconProps {
  className?: string
  title: string
}

export const Action16Icon = ({ className = '', title }: Action16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
