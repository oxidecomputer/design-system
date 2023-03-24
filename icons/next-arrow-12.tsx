import icon from './next-arrow-12.svg'

export const NextArrow12 = ({ className = '' }: { className: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
