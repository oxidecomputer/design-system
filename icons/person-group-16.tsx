import icon from './person-group-16.svg?raw'

interface PersonGroup16IconProps {
  className?: string
  title: string
}

export const PersonGroup16Icon = ({ className = '', title }: PersonGroup16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
