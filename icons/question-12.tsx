import icon from './question-12.svg?raw'

interface Question12IconProps {
  className?: string
  title: string
}

export const Question12Icon = ({ className = '', title }: Question12IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
