import { Footer } from '@/components';
import { register } from '@/services/ant-design-pro/api';
import {
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormText,
} from '@ant-design/pro-components';
import { Helmet, history } from '@umijs/max';
import { App, message as staticMessage, Tabs, Button } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import Settings from '../../../../config/defaultSettings';
import { BEAR_LINK, SYSTEM_LOGO } from "@/constants";

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://c-ssl.duitang.com/uploads/blog/202505/29/2YSzE99eS6y5BNo.jpg')",
      backgroundSize: '100% 100%',
    },
  };
});

const Register: React.FC = () => {
  const [type, setType] = useState<string>('account');
  const { styles } = useStyles();
  // 获取 App 上下文的 message 实例；如果不可用（组件未被 App 包裹），回退到静态 message
  const appMessage = App.useApp?.()?.message;
  const messageApi = appMessage || staticMessage;
  const showError = (content: React.ReactNode) => {
    if (messageApi && typeof (messageApi as any).error === 'function') {
      return (messageApi as any).error(content);
    }
    console.error(content);
  };
  const showSuccess = (content: React.ReactNode) => {
    if (messageApi && typeof (messageApi as any).success === 'function') {
      return (messageApi as any).success(content);
    }
  };

  // 直接使用 antd 的 message API，避免 useApp 实例无效问题

  const handleSubmit = async (values: API.RegisterParams) => {
    const { userPassword, checkPassword, userAccount } = values;
    // 前端重复校验：账户长度至少 4
    if (!userAccount || (userAccount as string).length < 4) {
      showError('账号长度不能小于4位！');
      return;
    }
    //  前端二次校验密码一致性
    if (userPassword !== checkPassword) {
      showError('两次输入的密码不一致！');
      return;
    }

    try {
      const res = await register({
        userAccount: values.userAccount,
        userPassword: values.userPassword,
        checkPassword: values.checkPassword,
      });

      if (res !== null && res !== undefined) {
        showSuccess('注册成功！');
        setTimeout(() => {
          const urlParams = new URL(window.location.href).searchParams;
          const redirect = urlParams.get('redirect') || '/';
          history.push(`/user/login?redirect=${encodeURIComponent(redirect)}`);
        }, 1500);
      } else {
        showError('注册失败，请重试！');
      }
    } catch (error: any) {
      const errorMsg = error?.message || '注册失败，请重试！';
      showError(errorMsg);
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {'注册'}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <div style={{ flex: '1', padding: '32px 0' }}>
        <LoginForm
          contentStyle={{ minWidth: 280, maxWidth: '75vw' }}
          logo={<img alt="logo" src={SYSTEM_LOGO} />}
          title="用户管理系统"
          subTitle={<a href={BEAR_LINK} target="_blank" rel="noreferrer">熊的介绍</a>}
          onFinish={handleSubmit}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[{ key: 'account', label: '账号密码注册' }]}
          />

          {type === 'account' && (
            <>
              <ProFormText
                name="userAccount"
                fieldProps={{ size: 'large', prefix: <UserOutlined /> }}
                placeholder="请输入账号"
                rules={[
                  { required: true, message: '账号是必填项！' },
                  { min: 4, message: '账号长度不能小于4位！' },
                ]}
              />
              <ProFormText.Password
                name="userPassword"
                fieldProps={{ size: 'large', prefix: <LockOutlined /> }}
                placeholder="请输入密码"
                rules={[
                  { required: true, message: '密码是必填项！' },
                  { min: 8, message: '密码长度不能小于8位！' },
                ]}
              />
              <ProFormText.Password
                name="checkPassword"
                fieldProps={{ size: 'large', prefix: <LockOutlined /> }}
                placeholder="请再次输入密码"
                rules={[
                  { required: true, message: '确认密码是必填项！' },
                  { min: 8, message: '密码长度不能小于8位！' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('userPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致！'));
                    },
                  }),
                ]}
              />
            </>
          )}
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
