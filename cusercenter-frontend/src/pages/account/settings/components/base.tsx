import { UploadOutlined } from '@ant-design/icons';
import {
  ProForm,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { useRequest, useModel } from '@umijs/max';
import { Button, message, Upload, type UploadProps } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { currentUser as queryCurrent } from '@/services/ant-design-pro/api';
import request from '@/plugins/globalRequest';
import useStyles from './index.style';

const BaseView: React.FC = () => {
  const { styles } = useStyles();
  const formRef = useRef<ProFormInstance>();
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  const { data: currentUserData, loading } = useRequest(() => {
    return queryCurrent();
  });

  const { initialState, setInitialState } = useModel('@@initialState');
  // 优先使用接口最新数据，没有时回退到全局登录态，确保页面首次进入也能显示
  const currentUser = currentUserData?.data || currentUserData || initialState?.currentUser || {};

  const [isEditing, setIsEditing] = useState(false);

  // 请求返回后同步表单，避免 ProForm 的 initialValues 只在首次渲染生效一次
  useEffect(() => {
    if (currentUser && Object.keys(currentUser).length > 0) {
      if (currentUser.avatarUrl) {
        setAvatarUrl(currentUser.avatarUrl);
      }
      formRef.current?.setFieldsValue(currentUser);
    }
  }, [currentUser]);

  const handleUpload: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      const url = info.file.response?.data;
      if (url) {
        setAvatarUrl(url);
        formRef.current?.setFieldsValue({ avatarUrl: url });
        message.success('头像上传成功');
      } else {
        message.error(info.file.response?.message || '上传失败');
      }
    } else if (info.file.status === 'error') {
      message.error('上传失败');
    }
  };

  // 头像组件
  const AvatarView = ({ avatar }: { avatar: string }) => (
    <>
      <div className={styles.avatar_title}>头像</div>
      <div className={styles.avatar}>
        <img src={avatar || 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'} alt="avatar" />
      </div>
      {isEditing && (
        <Upload 
          name="file" 
          showUploadList={false} 
          action="/api/file/upload"
          onChange={handleUpload}
        >
          <div className={styles.button_view}>
            <Button>
              <UploadOutlined />
              更换头像
            </Button>
          </div>
        </Upload>
      )}
    </>
  );

  const handleFinish = async (values: any) => {
    try {
      const res = await request<boolean>('/api/user/update', {
        method: 'POST',
        data: {
          id: currentUser?.id,
          username: values.username,
          avatarUrl: avatarUrl || values.avatarUrl,
          gender: values.gender,
          phone: values.phone,
          email: values.email,
        },
      });
      if (res.data) {
        message.success('个人信息更新成功');
        setIsEditing(false);
        // 更新全局状态，使页面内容和右上角头像、名称都同步刷新
        setInitialState((s: any) => ({
          ...s,
          currentUser: {
            ...s.currentUser,
            username: values.username,
            avatarUrl: avatarUrl || values.avatarUrl,
            gender: values.gender,
            phone: values.phone,
            email: values.email,
          },
        }));
      }
    } catch (error) {
      // 错误拦截已在全局处理
    }
  };
  return (
    <div className={styles.baseView}>
      {loading ? null : (
        <>
          <div className={styles.left}>
            <ProForm
              formRef={formRef}
              layout="vertical"
              onFinish={handleFinish}
              readonly={!isEditing}
              submitter={isEditing ? {
                searchConfig: {
                  submitText: '保存个人信息',
                },
                render: (_, dom) => [
                  <Button key="cancel" onClick={() => setIsEditing(false)}>
                    取消
                  </Button>,
                  dom[1],
                ],
              } : {
                render: () => [
                  <Button key="edit" type="primary" onClick={(e) => {
                    e.preventDefault();
                    setIsEditing(true);
                  }}>
                    编辑个人信息
                  </Button>
                ]
              }}
              initialValues={{
                ...currentUser,
              }}
              hideRequiredMark
            >
              <ProFormText
                width="md"
                name="username"
                label="用户名"
                rules={[
                  {
                    required: true,
                    message: '请输入您的用户名!',
                  },
                ]}
              />
              <ProFormSelect
                width="sm"
                name="gender"
                label="性别"
                options={[
                  { label: '男', value: 0 },
                  { label: '女', value: 1 },
                ]}
              />
              <ProFormText
                width="md"
                name="phone"
                label="联系电话"
              />
              <ProFormText
                width="md"
                name="email"
                label="邮箱"
                rules={[
                  {
                    type: 'email',
                    message: '请输入正确的邮箱格式!',
                  },
                ]}
              />
            </ProForm>
          </div>
          <div className={styles.right}>
            <AvatarView avatar={avatarUrl} />
          </div>
        </>
      )}
    </div>
  );
};
export default BaseView;
