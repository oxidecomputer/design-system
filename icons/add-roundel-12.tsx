import icon from './add-roundel-12.svg?raw'

interface AddRoundel12IconProps {
  className?: string
  title: string
}

export const AddRoundel12Icon = ({ className = '', title }: AddRoundel12IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
