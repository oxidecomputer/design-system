import icon from './organization-24.svg?raw'

interface Organization24IconProps {
  className?: string
  title: string
}

export const Organization24Icon = ({ className = '', title }: Organization24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
