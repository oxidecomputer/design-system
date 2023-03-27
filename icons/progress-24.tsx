import icon from './progress-24.svg?raw'

interface Progress24IconProps {
  className?: string
  title: string
}

export const Progress24Icon = ({ className = '', title }: Progress24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
