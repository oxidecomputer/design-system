import icon from './error-16.svg?raw'

interface Error16IconProps {
  className?: string
  title: string
}

export const Error16Icon = ({ className = '', title }: Error16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
