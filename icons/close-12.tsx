import icon from './close-12.svg'

export const Close12 = ({ className = '' }: { className: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
