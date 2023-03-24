import { React } from 'react'

import icon from './logs-16.svg?raw'

export const Logs16Icon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
