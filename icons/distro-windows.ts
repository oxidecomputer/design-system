import { React } from 'react'

import icon from './distro-windows.svg?raw'

export const DistroWindowsIcon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
