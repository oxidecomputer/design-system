import { React } from 'react'

import icon from './distro-fedora.svg?raw'

export const DistroFedoraIcon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
