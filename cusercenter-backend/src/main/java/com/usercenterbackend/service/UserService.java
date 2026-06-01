package com.usercenterbackend.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.usercenterbackend.model.domain.User;
import jakarta.servlet.http.HttpServletRequest;
import com.usercenterbackend.model.dto.UserUpdateRequest;

/**
 * @author chenyao
 * 用户服务
 */
public interface UserService extends IService<User> {



    /**
     * 用户注册
     *
     * @param userAccount   用户账户
     * @param userPassword  用户密码
     * @param checkPassword 校验密码
     * @return 新用户id
     */

    long userRegister(String userAccount, String userPassword, String checkPassword);

    /**
     * @param userAccount  用户账户
     * @param userPassword 用户密码
     * @param request HTTP请求对象，用于记录登录态
     * @return 脱敏后的用户信息
     */
    User userLogin(String userAccount, String userPassword, HttpServletRequest request);

    /**
     * 用户脱敏
     * @param originUser
     * @return
     */
    User getSafetyUser(User originUser);
    /**
     * 用户注销
     *
     * @param request
     * @return
     */
    int userLogout(HttpServletRequest request);

    /**
     * 根据ID获取用户
     * @param id 用户ID
     * return  用户信息
     */
    User getById(long id);

    /**
     * 根据ID获取用户
     * @param id
     * @return
     */

    /**
     * 更新用户信息
     * @param userUpdateRequest 包含更新信息的请求对象
     * @param request HTTP请求
     * @return 更新后的用户信息
     */
    boolean updateUser(UserUpdateRequest userUpdateRequest,HttpServletRequest request);


}
