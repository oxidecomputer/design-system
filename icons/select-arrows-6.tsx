import icon from './select-arrows-6.svg?raw'

interface SelectArrows6IconProps {
  className?: string
  title: string
}

export const SelectArrows6Icon = ({ className = '', title }: SelectArrows6IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
