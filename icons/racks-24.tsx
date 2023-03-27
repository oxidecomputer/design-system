import icon from './racks-24.svg?raw'

interface Racks24IconProps {
  className?: string
  title: string
}

export const Racks24Icon = ({ className = '', title }: Racks24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
