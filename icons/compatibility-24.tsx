import icon from './compatibility-24.svg'

export const Compatibility24 = ({ className = '' }: { className: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
