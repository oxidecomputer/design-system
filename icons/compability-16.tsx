import icon from './compability-16.svg?raw'

interface Compability16IconProps {
  className?: string
  title: string
}

export const Compability16Icon = ({ className = '', title }: Compability16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
