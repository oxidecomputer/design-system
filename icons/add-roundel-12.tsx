import icon from './add-roundel-12.svg?raw'

export const AddRoundel12Icon = ({ className = '' }: { className?: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
