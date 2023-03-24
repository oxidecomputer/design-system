import icon from './servers-16.svg?raw'

export const Servers16Icon = ({ className = '' }: { className: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
