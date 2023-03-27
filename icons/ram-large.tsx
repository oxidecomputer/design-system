import icon from './ram-large.svg?raw'

interface RamLargeIconProps {
  className?: string
  title: string
}

export const RamLargeIcon = ({ className = '', title }: RamLargeIconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
