import icon from './document-16.svg?raw'

export const Document16Icon = ({ className = '' }: { className?: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
