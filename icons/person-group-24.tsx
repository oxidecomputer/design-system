import icon from './person-group-24.svg?raw'

interface PersonGroup24IconProps {
  className?: string
  title: string
}

export const PersonGroup24Icon = ({ className = '', title }: PersonGroup24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
