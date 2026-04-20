create table cyuniverse.user
(
    id           bigint auto_increment comment '主键ID'
        primary key,
    username     varchar(256)                       null comment '昵称',
    userAccount  varchar(256)                       null comment '登陆账号',
    avatarUrl    varchar(1024)                      null comment '头像',
    gender       tinyint                            null comment '性别',
    userPassword varchar(512)                       not null comment '密码',
    phone        varchar(128)                       null comment '电话',
    email        varchar(512)                       null comment '邮箱',
    useStatus    int      default 0                 not null comment '用户状态',
    createtime   datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    updateTime   datetime default CURRENT_TIMESTAMP not null comment '更新时间',
    isDelete     tinyint  default 0                 not null comment '是否删除01（逻辑删除）',
    userRole     int      default 0                 not null comment '用户角色',
    planetCode   varchar(512)                       null comment '星球用户'
);

-- 初始化测试数据
INSERT INTO cyuniverse.user (username, userAccount, userPassword, phone, email) VALUES
('user1','user1','pwd1','10001','user1@example.com'),
('user2','user2','pwd2','10002','user2@example.com'),
('user3','user3','pwd3','10003','user3@example.com'),
('user4','user4','pwd4','10004','user4@example.com'),
('dogcy','dogcy','pwd5','10005','dogcy@example.com');

