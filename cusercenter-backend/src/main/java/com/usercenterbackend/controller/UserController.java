 package com.usercenterbackend.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.usercenterbackend.common.BaseResponse;
import com.usercenterbackend.common.ErrorCode;
import com.usercenterbackend.common.ResultUtils;
import com.usercenterbackend.exception.BusinessException;
import com.usercenterbackend.model.request.UserLoginRequest;
import com.usercenterbackend.model.request.UserRegisterRequest;
import com.usercenterbackend.model.dto.PageResult;
import com.usercenterbackend.model.dto.UserUpdateRequest;
import com.usercenterbackend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.usercenterbackend.model.domain.User;

import java.util.List;
import java.util.stream.Collectors;

import static com.usercenterbackend.constant.UserConstant.ADMIN_ROLE;
import static com.usercenterbackend.constant.UserConstant.USER_LOGIN_STATE;

/**
 * @author chenyao
 * @description 用户接口
 * @createDate 2026-03-13 19:24:10
 */
@Slf4j
@RestController
@RequestMapping("/user")
public class UserController {

    public UserController() {
        log.info("UserController 构造函数被调用");
    }

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public BaseResponse<Long> userRegister(@RequestBody UserRegisterRequest userRegisterRequest) {
        log.info("收到注册请求: {}", userRegisterRequest);
        if (userRegisterRequest == null) {
            log.error("注册请求参数为空");
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        String userAccount = userRegisterRequest.getUserAccount();
        String userPassword = userRegisterRequest.getUserPassword();
        String checkPassword = userRegisterRequest.getCheckPassword();
        log.info("注册参数 - 账号: {}, 密码长度: {}, 确认密码长度: {}", 
                userAccount, 
                userPassword != null ? userPassword.length() : 0,
                checkPassword != null ? checkPassword.length() : 0);
        
        if (StringUtils.isAnyBlank(userAccount, userPassword, checkPassword)) {
            log.error("注册参数存在空值");
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        long result = userService.userRegister(userAccount, userPassword, checkPassword);
        log.info("注册结果: {}", result);
        return ResultUtils.success(result);
    }

    @PostMapping("/login")
    public BaseResponse<User> userLogin(@RequestBody UserLoginRequest userLoginRequest, HttpServletRequest request) {
        if (userLoginRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        String userAccount = userLoginRequest.getUserAccount();
        String userPassword = userLoginRequest.getUserPassword();
        if (StringUtils.isAnyBlank(userAccount, userPassword)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User user = userService.userLogin(userAccount, userPassword, request);
        if (user != null) {
            //记录登录成功的用户信息（用于审计）
            log.info("用户[{}]登录成功，IP:{}", user.getUserAccount(), request.getRemoteAddr());
            //将用户信息存入Session
            request.getSession().setAttribute(USER_LOGIN_STATE, user);
        }
        return ResultUtils.success(user);
    }

    @PostMapping("/logout")
    public BaseResponse<Integer> userLogout(HttpServletRequest request) {
        if (request == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        int result = userService.userLogout(request);
        return ResultUtils.success(result);
    }

    @GetMapping("/current")
    public BaseResponse<User> getCurrentUser(HttpServletRequest request) {
        Object userObj = request.getSession().getAttribute(USER_LOGIN_STATE);
        User currentUser = (User) userObj;
        if (currentUser == null) {
            throw new BusinessException(ErrorCode.NOT_LOGIN);
        }
        long userId = currentUser.getId();
        User user = userService.getById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.NOT_LOGIN);
        }
        if (user.getUseStatus() != null && user.getUseStatus() == 1) {
            // 用户已被封禁，移除登录态
            request.getSession().removeAttribute(USER_LOGIN_STATE);
            throw new BusinessException(ErrorCode.NO_AUTH, "该账号已被封禁");
        }
        User safeUser = userService.getSafetyUser(user);
        return ResultUtils.success(safeUser);
    }

    @GetMapping("/search")
    public BaseResponse<List<User>> searchUsers(String username, HttpServletRequest request) {
        // 仅管理员可查询
        if (!isAdmin(request)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        if (StringUtils.isNotBlank(username)) {
            queryWrapper.like("username", username);
        }
        List<User> userlist = userService.list(queryWrapper);
        List<User> list = userlist.stream().map(user -> userService.getSafetyUser(user)).toList();
        return ResultUtils.success(list);
    }

    /**
     * 删除用户（管理员专用）
     * @param id
     * @param request
     * @return 是否删除成功
     */
    @PostMapping("/delete")
    public BaseResponse<Boolean> deleteUser(@RequestBody com.usercenterbackend.model.request.DeleteAccountRequest deleteRequest, HttpServletRequest request) {
        if (!isAdmin(request)) {
            throw new BusinessException(ErrorCode.NO_AUTH);
        }
        if (deleteRequest == null || deleteRequest.getId() == null || deleteRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        boolean b = userService.removeById(deleteRequest.getId());
        return ResultUtils.success(b);
    }
    /**
     * 更新用户信息
     *
     * @param updateRequest
     * @param request
     * @return
     */
    @PostMapping("/update")
    public BaseResponse<Boolean> updateUser(@RequestBody UserUpdateRequest updateRequest, HttpServletRequest request) {
        if (updateRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        boolean result = userService.updateUser(updateRequest, request);
        return ResultUtils.success(result);
    }

    /**
     * 分页获取用户列表（管理员专用）
     * 对应前端请求：/api/user/list/page
     */
    @GetMapping("/list/page")
    public BaseResponse<PageResult<User>> listUserByPage(
            @RequestParam(defaultValue = "1") long current,
            @RequestParam(defaultValue = "10") long pageSize,
            @RequestParam(required = false) String username,
            HttpServletRequest request) {

        // 1. 权限校验：只有管理员能查分页列表
        if (!isAdmin(request)) {
            throw new BusinessException(ErrorCode.NO_AUTH);
        }

        // 2. 构建查询条件
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        // 如果有用户名搜索，进行模糊匹配
        if (StringUtils.isNotBlank(username)) {
            queryWrapper.like("username", username);
        }
        // 默认按创建时间倒序（最新用户在前）
        queryWrapper.orderByDesc("createTime");

        // 3. 执行分页查询
        // MyBatis-Plus 会自动拦截 Page 对象并拼接 LIMIT 语句
        Page<User> userPage = userService.page(new Page<>(current, pageSize), queryWrapper);

        // 4. 数据脱敏（重要！防止密码泄露）
        // 将分页结果中的 User 对象转换为安全对象
        List<User> safeUserList = userPage.getRecords().stream()
                .map(user -> userService.getSafetyUser(user))
                .collect(Collectors.toList());

        // 将脱敏后的列表放回 Page 对象
        PageResult<User> pageResult=new PageResult<>(safeUserList, userPage.getTotal());
        return ResultUtils.success(pageResult);
    }

    /**
     * 是否为管理员
     *
     * @param request
     * @return
     */
    private boolean isAdmin(HttpServletRequest request) {
        //仅管理员可查询
        Object userObj = request.getSession().getAttribute(USER_LOGIN_STATE);
        User user = (User) userObj;
        return user != null && user.getUserRole() == ADMIN_ROLE;
    }
}
