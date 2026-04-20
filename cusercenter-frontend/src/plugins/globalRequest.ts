/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { message } from 'antd';
import { stringify } from 'qs';
import { history } from '@umijs/max';

/**
 * 配置request请求时的默认参数
 */
const request = extend({
  credentials: 'include', // 默认请求是否带上cookie
  prefix:process.env.NODE_ENV==='production'?'':undefined
  // requestType: 'form',
});

/**
 * 所有请求拦截器
 */
request.interceptors.request.use((url, options): any => {
  return {
    url,
    options: {
      ...options,
      headers: {
        // 这里可以统一加 Token 或其他 Header
        // 'Authorization': 'Bearer xxx',
      },
    },
  };
});

/**
 * 所有响应拦截器
 */
request.interceptors.response.use(async (response): Promise<any> => {
  const res = await response.clone().json().catch(() => null);

  // 如果后端没有返回 JSON，直接返回 null
  if (!res) return null;

  // 处理后端统一的 BaseResponse 结构（只支持 BaseResponse）
  if (typeof res.code !== 'undefined') {
    // 未登录处理
    if (res.code === 40100) {
      const msg = res.message || '请先登录';
      message.error(msg);
      history.replace({
        pathname: '/user/login',
        search: stringify({
          redirect: location.pathname,
        }),
      });
      // 抛出错误，阻止上层误认为请求成功
      const err: any = new Error(msg);
      err.info = res;
      throw err;
    }

    // 非 0 的 code 视为业务错误，抛出错误并携带后端 message
    if (res.code !== 0) {
      const msg = res.message || '请求失败';
      const err: any = new Error(msg);
      err.info = res;
      throw err;
    }

    // 业务成功：只返回 data（移除对旧格式的兼容）
    return res.data;
  }

  // 非 BaseResponse，直接返回解析结果
  return res;
});

export default request;
