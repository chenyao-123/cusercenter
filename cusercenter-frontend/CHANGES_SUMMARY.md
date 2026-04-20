# 前端修改总结（包含具体实现代码）

以下是为实现“管理员更新用户信息”及“删除用户账户”功能，对前端项目所作的所有更改记录及**对应代码实现**。

## 1. 接口类型定义扩展
**文件路径**: `d:\WorkSpace\myuser\myuser\src\types\user.ts`

**修改点**: 
- 兼容了后端返回的额外字段（`useStatus`, `createtime`），将大多数字段设置为可选。
- 新增了 `UserUpdateRequest`（管理员修改用户传参）和 `PageResult<T>`（后端分页结构）。

**实现代码**:
```typescript
/**
 * 用户相关类型定义
 */
export type CurrentUser = {
  id: number;
  username?: string;
  userAccount?: string;
  avatarUrl?: string;
  gender?: number;
  phone?: string;
  email?: string;
  userStatus?: number;
  useStatus?: number; // 兼容后端的 useStatus
  userRole?: number;
  planetCode: string;
  createTime?: string;
  createtime?: string; // 兼容后端的 createtime
};

// 新增管理员更新用户信息请求参数
export type UserUpdateRequest = {
  id: number;
  username?: string;
  avatarUrl?: string;
  gender?: number;
  phone?: string;
  email?: string;
};

// 新增后端通用分页返回结构
export type PageResult<T> = {
  data: T[];
  total: number;
};
```

---

## 2. API 接口请求封装
**文件路径**: `d:\WorkSpace\myuser\myuser\src\services\ant-design-pro\api.ts`

**修改点**:
- 引入了 `UserUpdateRequest` 类型。
- 封装了后端的 `POST /api/user/update` 和 `POST /api/user/delete`。

**实现代码**:
```typescript
import type { UserUpdateRequest } from '@/types/user';

// ... 现有代码保留 ...

/** 管理员更新用户信息 POST /api/user/update */
export async function updateUserByAdmin(
  body: UserUpdateRequest,
  options?: { [key: string]: any },
) {
  return request<boolean>('/api/user/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
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
    data: id, // 后端接收的是 @RequestBody long id
    ...(options || {}),
  });
}
```

---

## 3. 用户管理界面改造
**文件路径**: `d:\WorkSpace\myuser\myuser\src\pages\Admin\userManager\index.tsx`

**修改点**:
- 增加更新弹窗 `ModalForm` 及其内部的 `ProFormText` 等表单项。
- 扩展 `columns` 的操作列，添加了“编辑”按钮和带 `Popconfirm`（二次确认）的“删除”按钮。
- 实现 `handleUpdate` 和 `handleDelete` 逻辑，成功后刷新表格 `actionRef.current?.reload()`。

**实现代码 (核心逻辑提取)**:
```tsx
import request from '@/plugins/globalRequest';
import { updateUserByAdmin, deleteUserByAdmin } from '@/services/ant-design-pro/api';
import type { CurrentUser, PageResult, UserUpdateRequest } from '@/types/user';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ModalForm, ProFormSelect, ProFormText, ProTable } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Image, message, Tag, Popconfirm } from 'antd';
import React, { useMemo, useRef, useState } from 'react';

const UserManage: React.FC = () => {
  const actionRef = useRef<ActionType>(undefined);
  const formRef = useRef<ProFormInstance<UserUpdateRequest> | undefined>(undefined);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<CurrentUser>();

  // 执行删除逻辑
  const handleDelete = async (id: number) => {
    try {
      await deleteUserByAdmin(id);
      message.success('删除用户成功');
      actionRef.current?.reload();
    } catch (error) {
      // 错误由全局请求拦截器抛出
    }
  };

  // 执行更新逻辑
  const handleUpdate = async (values: Omit<UserUpdateRequest, 'id'>) => {
    if (!currentRow?.id) {
      message.error('未找到要编辑的用户');
      return false;
    }

    const payload: UserUpdateRequest = {
      id: currentRow.id,
      username: values.username?.trim(),
      avatarUrl: values.avatarUrl?.trim(),
      gender: values.gender,
      phone: values.phone?.trim(),
      email: values.email?.trim(),
    };

    await updateUserByAdmin(payload);
    message.success('用户信息更新成功');
    setUpdateModalOpen(false);
    setCurrentRow(undefined);
    actionRef.current?.reload();
    return true;
  };

  const columns = useMemo<ProColumns<CurrentUser>[]>(
    () => [
      // ... 原有列保留，针对不需要搜索的列增加了 hideInSearch: true ...
      {
        title: '状态',
        dataIndex: 'useStatus',
        hideInSearch: true,
        render: (_, record) => {
          // 兼容后端新老字段
          const status = record.useStatus ?? record.userStatus;
          return status === 1 ? <Tag color="error">封禁</Tag> : <Tag color="success">正常</Tag>;
        },
      },
      // ... 原有列保留 ...
      {
        title: '操作',
        valueType: 'option',
        key: 'option',
        render: (_, record) => [
          <Button
            key="edit"
            type="link"
            onClick={() => {
              setCurrentRow(record);
              setUpdateModalOpen(true);
            }}
          >
            编辑
          </Button>,
          <Popconfirm
            key="delete"
            title="确认删除该用户吗？"
            description="删除后将无法恢复该账户"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>,
        ],
      },
    ],
    [],
  );

  return (
    <>
      <ProTable<CurrentUser>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params) => {
          // 更新分页请求
          const res = await request<PageResult<CurrentUser>>('/api/user/list/page', {
            method: 'GET',
            params: {
              current: params.current,
              pageSize: params.pageSize,
              username: params.username,
            },
          });
          return {
            data: res?.data || [],
            success: true,
            total: res?.total || 0,
          };
        }}
        // ... 原有其他配置保留 ...
      />

      {/* 编辑弹窗表单 */}
      <ModalForm<UserUpdateRequest>
        title="编辑用户"
        open={updateModalOpen}
        formRef={formRef}
        width={520}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        initialValues={{
          username: currentRow?.username,
          avatarUrl: currentRow?.avatarUrl,
          gender: currentRow?.gender,
          phone: currentRow?.phone,
          email: currentRow?.email,
          userAccount: currentRow?.userAccount,
        }}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setUpdateModalOpen(false);
            setCurrentRow(undefined);
          },
        }}
        onOpenChange={(open) => {
          setUpdateModalOpen(open);
          if (!open) {
            formRef.current?.resetFields();
            setCurrentRow(undefined);
          }
        }}
        onFinish={handleUpdate}
      >
        <ProFormText
          name="userAccount"
          label="用户账户"
          readonly
          tooltip="后端当前不支持管理员修改用户账户"
        />
        <ProFormText
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          rules={[
            { required: true, whitespace: true, message: '用户名不能为空' },
            { max: 32, message: '用户名不能超过 32 个字符' },
          ]}
        />
        <ProFormText
          name="avatarUrl"
          label="头像链接"
          placeholder="请输入头像 URL"
          rules={[{ type: 'url', warningOnly: true, message: '建议填写合法的 URL 地址' }]}
        />
        <ProFormSelect
          name="gender"
          label="性别"
          placeholder="请选择性别"
          options={[
            { label: '男', value: 0 },
            { label: '女', value: 1 },
          ]}
        />
        <ProFormText
          name="phone"
          label="电话"
          placeholder="请输入联系电话"
          rules={[
            {
              pattern: /^[0-9+\-\s]{6,20}$/,
              warningOnly: true,
              message: '电话号码格式看起来不太对',
            },
          ]}
        />
        <ProFormText
          name="email"
          label="邮箱"
          placeholder="请输入邮箱"
          rules={[{ type: 'email', warningOnly: true, message: '邮箱格式不正确' }]}
        />
      </ModalForm>
    </>
  );
};

export default UserManage;
```
