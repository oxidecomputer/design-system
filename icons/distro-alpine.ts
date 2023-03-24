import { React } from 'react'

import icon from './distro-alpine.svg?raw'

export const DistroAlpineIcon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
