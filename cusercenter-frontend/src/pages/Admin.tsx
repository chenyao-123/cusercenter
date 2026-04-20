import { PageContainer } from '@ant-design/pro-components';
import React, { PropsWithChildren } from 'react';

// 建议：不需要显式写 PropsWithChildren<{}>，React.FC 默认包含 children
const Admin: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <PageContainer>
      {/* 直接渲染子组件，不要加固定的 content 提示 */}
      {children}
    </PageContainer>
  );
};

export default Admin;
