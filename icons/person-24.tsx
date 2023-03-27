import icon from './person-24.svg?raw'

interface Person24IconProps {
  className?: string
  title: string
}

export const Person24Icon = ({ className = '', title }: Person24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
