/**
 * 用户相关类型定义
 */
export type CurrentUser = {
  id: number;
  username: string;
  userAccount: string;
  avatarUrl?: string;
  gender: number;
  phone: string;
  email: string;
  useStatus: number;
  userRole: number;
  planetCode: string;
  createtime: Date;
};

export type LoginResult = {
  status?: string;
  type?: string;
  currentAuthority?: string;
};

export type RegisterResult = number;

export type PageParams = {
  current?: number;
  pageSize?: number;
};

export type RuleListItem = {
  key?: number;
  disabled?: boolean;
  href?: string;
  avatar?: string;
  name?: string;
  owner?: string;
  desc?: string;
  callNo?: number;
  status?: number;
  updatedAt?: string;
  createdAt?: string;
  progress?: number;
};

/**
 * 通用返回类
 */
export type BaseResponse<T> = {
  code: number;
  data: T;
  message: string;
  description: string;
};

export type RuleList = {
  data?: RuleListItem[];
  /** 列表的内容总数 */
  total?: number;
  success?: boolean;
};

export type FakeCaptcha = {
  code?: number;
  status?: string;
};

export type LoginParams = {
  userAccount?: string;
  userPassword?: string;
  autoLogin?: boolean;
  type?: string;
};

export type RegisterParams = {
  userAccount?: string;
  userPassword?: string;
  checkPassword?: string;
  planetCode?: string;
  type?: string;
};

export type ErrorResponse = {
  /** 业务约定的错误码 */
  errorCode: string;
  /** 业务上的错误信息 */
  errorMessage?: string;
  /** 业务上的请求是否成功 */
  success?: boolean;
};

export type NoticeIconList = {
  data?: NoticeIconItem[];
  /** 列表的内容总数 */
  total?: number;
  success?: boolean;
};

export type NoticeIconItemType = 'notification' | 'message' | 'event';

export type NoticeIconItem = {
  id?: string;
  extra?: string;
  key?: string;
  read?: boolean;
  avatar?: string;
  title?: string;
  status?: string;
  datetime?: string;
  description?: string;
  type?: NoticeIconItemType;
};
export type UserUpdateRequest = {
  id: number;
  username?: string;
  userAccount?: string;
  avatarUrl?: string
  gender?: number;
  phone?: string;
  email?: string;
  useStatus?: number;
  userRole?: number;
};

export type PageResult<T> = {
  data: T[];
  total:number;
};

