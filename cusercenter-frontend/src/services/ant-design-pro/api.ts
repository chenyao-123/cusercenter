import request  from '@/plugins/globalRequest';
import type {UserUpdateRequest} from "@/types/user";

/** 获取当前的用户 GET /api/user/current*/
export async function currentUser(options?: { [key: string]: any }) {
  return request<API.BaseResponse<API.CurrentUser>>('/api/user/current', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/user/logout */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/user/logout', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/user/login */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.BaseResponse<API.LoginResult>>('/api/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
/** 注册接口 POST /api/user/register */
export async function register(body: API.RegisterParams, options?: { [key: string]: any }) {
  return request<API.BaseResponse<API.RegisterResult>>('/api/user/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/**管理员更新用户信息POST /api/user/update*/
export async function updateUserByAdmin(
  body:UserUpdateRequest,
  options?:{[key:string]:any},
){
  return request<boolean>('/api/user/update',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
    },
    data:body,
    ...(options||{})
  })
}
/** 管理员删除用户 POST /api/user/delete */
export async function deleteUserByAdmin(
  id: number,
  options?: { [key: string]: any },
) {
  return request<boolean>('/api/user/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: { id }, // 后端接收的是 DeleteAccountRequest
    ...(options || {}),
  });
}




