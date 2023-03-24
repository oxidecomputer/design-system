import { React } from 'react'

import icon from './distro-debian.svg?raw'

export const DistroDebianIcon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
