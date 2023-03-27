import icon from './software-update-16.svg?raw'

interface SoftwareUpdate16IconProps {
  className?: string
  title: string
}

export const SoftwareUpdate16Icon = ({
  className = '',
  title,
}: SoftwareUpdate16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
