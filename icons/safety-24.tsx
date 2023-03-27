import icon from './safety-24.svg?raw'

interface Safety24IconProps {
  className?: string
  title: string
}

export const Safety24Icon = ({ className = '', title }: Safety24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
