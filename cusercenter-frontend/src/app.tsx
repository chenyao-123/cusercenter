import { AvatarDropdown, AvatarName, Footer} from '@/components';
import { currentUser as queryCurrentUser } from '@/services/ant-design-pro/api';
import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import '@ant-design/v5-patch-for-react-19';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import { App } from 'antd';
import { stringify } from 'qs';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';

const isDev = process.env.NODE_ENV === 'development' ;
const loginPath = '/user/login';
/**
 * 无需用户登录态的页面
 */
const NO_NEED_LOGIN_WHITE_LIST = [
  loginPath,
  '/user/register',
  '/user/register-result'
];

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      // 注意: `request` 的响应拦截器已返回后端 `data` 字段（即真实的数据对象），
      // 所以这里直接接收返回值即可，而不是解构 { data }。
      const result = await queryCurrentUser();
      if (!result) return undefined;
      // `result` may be either the real data (API.CurrentUser) because our
      // globalRequest returns res.data, or the full BaseResponse when using
      // older compatibility. Handle both safely.
      if ((result as any).data) {
        return (result as any).data as API.CurrentUser;
      }
      // Use unknown intermediate cast to satisfy TS when the generic types
      // don't line up exactly.
      return result as unknown as API.CurrentUser;
    } catch {
      return undefined;
    }
  };
  //如果是无需登录的页面，不执行
  if (NO_NEED_LOGIN_WHITE_LIST.includes(history.location.pathname)) {
    return {
      fetchUserInfo,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  // 如果不在白名单里（即需要登录的页面），才去获取用户信息
  const currentUser = await fetchUserInfo();

  return {
    fetchUserInfo,
    currentUser,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的 api
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    avatarProps: {
      src: initialState?.currentUser?.avatarUrl, // 修改点 C: 对应你 API 里的 avatarUrl
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      // 修改点 D: 对应你 API 里的 username (教程是 name，你的接口是 username)
      content: initialState?.currentUser?.username,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，且不在白名单里，重定向到 login（带上 redirect 参数）
      if (!initialState?.currentUser && !NO_NEED_LOGIN_WHITE_LIST.includes(location.pathname)) {
        history.push({
          pathname: loginPath,
          search: stringify({ redirect: location.pathname }),
        });
      }
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
        <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
          <LinkOutlined />
          <span>OpenAPI 文档</span>
        </Link>,
      ]
      : [],
    menuHeaderRender: undefined,
     childrenRender: (children) => {
       return (
         <App>
           {children}
           {isDev && (
             <SettingDrawer
               disableUrlParams
               enableDarkTheme
               settings={initialState?.settings}
               onSettingChange={(settings) => {
                 setInitialState((preInitialState) => ({
                   ...preInitialState,
                   settings,
                 }));
               }}
             />
           )}
         </App>
       );
     },
    ...initialState?.settings,
  };
};

export const request: RequestConfig = {
  timeout: 1000000,
  // 这里通常不需要配 prefix，因为 proxy 已经处理了 /api
  ...errorConfig,
};
