package com.usercenterbackend.constant;

import com.baomidou.mybatisplus.extension.service.IService;
import com.usercenterbackend.model.domain.User;

/**
 * 用户常量
 * @author chenyao
 */
public interface UserConstant extends IService<User> {
    /**
     *用户状态登陆键
     */
    String USER_LOGIN_STATE ="userLoginState" ;

    //----------权限----------
    /**
     * 默认权限
     */
    int DEFAULT_ROLE = 0;
    /**
     * 管理员权限
     */
    int ADMIN_ROLE = 1;
}
