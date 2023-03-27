import icon from './edit-24.svg?raw'

interface Edit24IconProps {
  className?: string
  title: string
}

export const Edit24Icon = ({ className = '', title }: Edit24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
