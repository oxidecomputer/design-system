import { React } from 'react'

import icon from './unread-indicator-6.svg?raw'

export const UnreadIndicator6Icon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
