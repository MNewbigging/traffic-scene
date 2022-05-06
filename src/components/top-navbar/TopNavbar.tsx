import './top-navbar.scss';

import React from 'react';

export const TopNavbar: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <div className={'top-navbar'}>{children}</div>;
};
