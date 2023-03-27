import icon from './contrast-24.svg?raw'

interface Contrast24IconProps {
  className?: string
  title: string
}

export const Contrast24Icon = ({ className = '', title }: Contrast24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
