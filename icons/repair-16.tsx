import icon from './repair-16.svg?raw'

interface Repair16IconProps {
  className?: string
  title: string
}

export const Repair16Icon = ({ className = '', title }: Repair16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
