import icon from './contrast-16.svg?raw'

interface Contrast16IconProps {
  className?: string
  title: string
}

export const Contrast16Icon = ({ className = '', title }: Contrast16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
