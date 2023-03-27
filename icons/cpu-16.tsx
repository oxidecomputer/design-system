import icon from './cpu-16.svg?raw'

interface Cpu16IconProps {
  className?: string
  title: string
}

export const Cpu16Icon = ({ className = '', title }: Cpu16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
