import { defineConfig } from '@umijs/max';
import { join } from 'node:path';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';
const { REACT_APP_ENV = 'dev' } = process.env;

const PUBLIC_PATH: string = '/';

export default defineConfig({
  hash: true,
  publicPath: PUBLIC_PATH,
  npmClient: 'npm',

  // 显式启用 Umi Max 插件
  dva: {},
  model: {},
  request: {},
  antd: {},
  initialState: {},
  layout: {},

  // 保留：路由配置
  routes,

  // 保留：开发代理
  proxy: proxy[REACT_APP_ENV as keyof typeof proxy],

  // 保留：基础构建
  fastRefresh: true,
  ignoreMomentLocale: true,

});
