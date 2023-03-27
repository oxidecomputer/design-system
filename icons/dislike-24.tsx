import icon from './dislike-24.svg?raw'

interface Dislike24IconProps {
  className?: string
  title: string
}

export const Dislike24Icon = ({ className = '', title }: Dislike24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
