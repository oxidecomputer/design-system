import icon from './prev-arrow-12.svg?raw'

export const PrevArrow12Icon = ({ className = '' }: { className?: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
