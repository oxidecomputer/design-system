import { React } from 'react'

import icon from './distro-ubuntu.svg?raw'

export const DistroUbuntuIcon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
