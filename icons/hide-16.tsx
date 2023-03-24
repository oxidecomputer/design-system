import icon from './hide-16.svg?raw'

export const Hide16Icon = ({ className = '' }: { className: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
