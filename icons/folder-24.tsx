import icon from './folder-24.svg'

export const Folder24 = ({ className = '' }: { className: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
