import icon from './software-update-24.svg?raw'

interface SoftwareUpdate24IconProps {
  className?: string
  title: string
}

export const SoftwareUpdate24Icon = ({
  className = '',
  title,
}: SoftwareUpdate24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
