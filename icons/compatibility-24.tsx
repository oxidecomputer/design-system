import icon from './compatibility-24.svg?raw'

interface Compatibility24IconProps {
  className?: string
  title: string
}

export const Compatibility24Icon = ({
  className = '',
  title,
}: Compatibility24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
