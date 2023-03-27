import icon from './servers-16.svg?raw'

interface Servers16IconProps {
  className?: string
  title: string
}

export const Servers16Icon = ({ className = '', title }: Servers16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
