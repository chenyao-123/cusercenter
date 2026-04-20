import {
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useModel, history } from '@umijs/max';
import type { MenuProps } from 'antd';
import { Spin } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';
import { flushSync } from 'react-dom';
import { outLogin } from '@/services/ant-design-pro/api';
import HeaderDropdown from '../HeaderDropdown';

export type GlobalHeaderRightProps = {
  menu?: boolean;
  children?: React.ReactNode;
};

export const AvatarName = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  // 兼容多种字段名，防止 TS 报错
  const displayName =
    (currentUser as any)?.username ||
    (currentUser as any)?.userAccount ||
    '用户';

  return <span className="anticon">{displayName}</span>;
};

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      alignItems: 'center',
      padding: '0 8px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    menu: {
      minWidth: 120,
    },
  };
});

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({
                                                                   menu,
                                                                   children,
                                                                 }) => {
  const { styles } = useStyles();
  const { initialState, setInitialState } = useModel('@@initialState');

  /**
   * 核心修改：登出逻辑
   * 1. 立即清除本地状态 (UI 响应)
   * 2. 异步请求后端 (销毁 Session)
   * 3. 强制刷新页面跳转 (清除内存残留)
   */
  const loginOut = async () => {
    // 1. 【乐观更新】立即清除状态，让用户感觉瞬间退出
    flushSync(() => {
      setInitialState((s: any) => ({ ...s, currentUser: undefined }));
    });

    try {
      await outLogin();
    } catch (error) {
      // 即使后端报错，也不影响前端退出流程
    } finally {
      // 4. 【关键修改】强制整页刷新跳转，而不是 history.replace
      // 这样可以彻底清除 Redux/Model 中的脏数据、未完成的请求等
      const { pathname, search } = window.location;
      const redirectParams = new URLSearchParams({
        redirect: pathname + search,
      });

      // 使用 window.location.href 触发浏览器原生跳转
      window.location.href = `/user/login?${redirectParams.toString()}`;
    }
  };

  const onMenuClick: MenuProps['onClick'] = (event) => {
    const { key } = event;
    if (key === 'logout') {
      loginOut();
      return;
    }
    history.push(`/account/${key}`);
  };

  const loading = (
    <span className={styles.action}>
      <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  // 检查是否有显示名称
  const hasName =
    (currentUser as any)?.username ||
    (currentUser as any)?.userAccount;

  if (!currentUser || !hasName) {
    return loading;
  }

  const menuItems: MenuProps['items'] = [
    ...(menu
      ? [
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: '个人信息',
        },
        {
          type: 'divider' as const,
        },
      ]
      : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
      overlayClassName={styles.menu}
    >
      {children}
    </HeaderDropdown>
  );
};
