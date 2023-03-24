import { React } from 'react'

import icon from './ip-global-24.svg?raw'

export const IpGlobal24Icon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
