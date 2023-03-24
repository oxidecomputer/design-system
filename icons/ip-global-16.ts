import { React } from 'react'

import icon from './ip-global-16.svg?raw'

export const IpGlobal16Icon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
