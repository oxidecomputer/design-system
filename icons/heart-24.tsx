import icon from './heart-24.svg?raw'

interface Heart24IconProps {
  className?: string
  title: string
}

export const Heart24Icon = ({ className = '', title }: Heart24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
