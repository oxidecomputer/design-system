import icon from './person-16.svg?raw'

interface Person16IconProps {
  className?: string
  title: string
}

export const Person16Icon = ({ className = '', title }: Person16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
