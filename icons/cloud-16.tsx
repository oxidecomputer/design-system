import icon from './cloud-16.svg?raw'

interface Cloud16IconProps {
  className?: string
  title: string
}

export const Cloud16Icon = ({ className = '', title }: Cloud16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
