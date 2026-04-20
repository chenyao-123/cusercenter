import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Card, Col, Row } from 'antd';
import React from 'react';

/**
 * 分析页 - 简化版本
 */
const Analysis: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  return (
    <PageContainer>
      <Row gutter={16}>
        <Col span={24}>
          <Card title="欢迎使用用户管理系统">
            <p>当前用户：{initialState?.currentUser?.username || '未登录'}</p>
            <p>账号：{initialState?.currentUser?.userAccount || '-'}</p>
            <p>邮箱：{initialState?.currentUser?.email || '-'}</p>
            <p>电话：{initialState?.currentUser?.phone || '-'}</p>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Analysis;
