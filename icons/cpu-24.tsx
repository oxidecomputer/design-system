import icon from './cpu-24.svg?raw'

interface Cpu24IconProps {
  className?: string
  title: string
}

export const Cpu24Icon = ({ className = '', title }: Cpu24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
