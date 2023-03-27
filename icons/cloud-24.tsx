import icon from './cloud-24.svg?raw'

interface Cloud24IconProps {
  className?: string
  title: string
}

export const Cloud24Icon = ({ className = '', title }: Cloud24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
