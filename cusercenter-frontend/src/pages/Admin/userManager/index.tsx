import React, { useState, useRef, useMemo } from 'react';
import { Button,  Tag, message, Image, Popconfirm} from 'antd';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { ProTable,  ModalForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import {CurrentUser, UserUpdateRequest} from '@/types/user'; // 确保类型定义正确
import  request from '@/plugins/globalRequest';
import {updateUserByAdmin,deleteUserByAdmin} from "@/services/ant-design-pro/api"; // 确保路径正确

// --- 工具函数 ---
export const waitTimePromise = async (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export const waitTime = async (time: number = 100) => {
  await waitTimePromise(time);
};

// --- 主组件 ---
const UserManage: React.FC = () => {
  const actionRef = useRef<ActionType|undefined>(undefined);
  const formRef = useRef<ProFormInstance|undefined>(undefined);
  const [updateModalOpen,setUpdateModalOpen]=useState(false);
  const [currentRow,setCurrentRow]=useState<CurrentUser>();

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
      useStatus: values.useStatus,
      userRole: values.userRole,
    };

    await updateUserByAdmin(payload);
    message.success('用户信息更新成功');
    setUpdateModalOpen(false);
    setCurrentRow(undefined);
    actionRef.current?.reload();
    return true;
  };

  const columns: ProColumns<CurrentUser>[] = useMemo<ProColumns<CurrentUser>[]>(
    () => [
      {
        dataIndex: 'id',
        valueType: 'indexBorder',
        width: 48,
      },
      {
        title: '用户名',
        dataIndex: 'username',
        copyable: true,
      },
      {
        title: '账户',
        dataIndex: 'userAccount',
        copyable: true,
        hideInSearch: true,
      },
      {
        title: '头像',
        dataIndex: 'avatarUrl',
        valueType: 'image',
        hideInSearch: true,
        render: (_, record) => (
          <div>
            <Image src={record.avatarUrl} width={100} />
          </div>
        ),
      },
      {
        title: '性别',
        dataIndex: 'gender',
        hideInSearch: true,
        valueEnum: {
          0: { text: '男' },
          1: { text: '女' },
        },
      },
      {
        title: '电话',
        dataIndex: 'phone',
        copyable: true,
        hideInSearch: true,
      },
      {
        title: '邮件',
        dataIndex: 'email',
        copyable: true,
        hideInSearch: true,
      },
      {
        title: '状态',
        dataIndex: 'useStatus',
        hideInSearch: true,
        render: (_, record) => {
          const status = record.useStatus ?? record.useStatus;
          return status === 1 ? <Tag color="error">封禁</Tag> : <Tag color="success">正常</Tag>;
        },
      },
      {
        title: '角色',
        dataIndex: 'userRole',
        hideInSearch: true,
        valueType: 'select',
        valueEnum: {
          0: { text: '普通用户', status: 'Default' },
          1: { text: '管理员', status: 'Success' },
        },
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        valueType: 'dateTime',
        hideInSearch: true,
      },
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
      request={async (params, sort, filter) => {
        // 发送请求到后端分页接口
        const res = await request<any>('/api/user/list/page',{
          method: 'GET',
          params: {
            current: params.current,
            pageSize: params.pageSize,
            username: params.username,
          },
        });

        // res 已经是 globalRequest 拦截器处理后的 data
        // 后端返回的 data 是 PageResult { data: [], total: number }
        return {
          data: res.data || [],
          success: true,
          total: res.total || 0,
        };
      }}
      editable={{
        type: 'multiple',
      }}
      columnsState={{
        persistenceKey: 'user-table-state',
        persistenceType: 'localStorage',
        defaultValue: {
          option: { fixed: 'right', disable: true },
        },
      }}
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      options={{
        setting: {
          listsHeight: 400,
        },
      }}
      pagination={{
        pageSize: 5,
      }}
      dateFormatter="string"
      headerTitle="用户管理"
      toolBarRender={() => []}
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
        useStatus: currentRow?.useStatus,
        userRole: currentRow?.userRole,
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
        label="账户"
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
      <ProFormSelect
        name="useStatus"
        label="状态"
        placeholder="请选择用户状态"
        options={[
          { label: '正常', value: 0 },
          { label: '封禁', value: 1 },
        ]}
      />
      <ProFormSelect
        name="userRole"
        label="角色"
        placeholder="请选择用户角色"
        options={[
          { label: '普通用户', value: 0 },
          { label: '管理员', value: 1 },
        ]}
      />
    </ModalForm>
  </>
  );
};

export default UserManage;
