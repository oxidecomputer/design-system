import { React } from 'react'

import icon from './load-balancer-24.svg?raw'

export const LoadBalancer24Icon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
