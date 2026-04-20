import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';
import {BEAR_LINK} from "@/constants";

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright="Powered by chenyao"
      links={[
        {
          key: 'Ant Design Pro',
          title: '知识星球',
          href: BEAR_LINK,
          blankTarget: true,
        },
        {
          key: 'github',
          title: <><GithubOutlined />chenyao</>,
          href: BEAR_LINK,
          blankTarget: true,
        },
        {
          key: 'Ant Design',
          title: '编程导航',
          href: 'https://ant.design',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
