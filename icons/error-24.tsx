import icon from './error-24.svg?raw'

interface Error24IconProps {
  className?: string
  title: string
}

export const Error24Icon = ({ className = '', title }: Error24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
