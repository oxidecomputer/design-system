import icon from './distro-windows.svg?raw'

interface DistroWindowsIconProps {
  className?: string
  title: string
}

export const DistroWindowsIcon = ({ className = '', title }: DistroWindowsIconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
