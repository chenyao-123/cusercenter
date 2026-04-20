package com.myuserbackend.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.myuserbackend.common.ErrorCode;
import com.myuserbackend.exception.BusinessException;
import com.myuserbackend.model.domain.User;
import com.myuserbackend.model.dto.UserUpdateRequest;
import com.myuserbackend.service.UserService;
import com.myuserbackend.mapper.UserMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.myuserbackend.constant.UserConstant.ADMIN_ROLE;
import static com.myuserbackend.constant.UserConstant.USER_LOGIN_STATE;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myuserbackend.mapper.UserMapper;
/**
* @author chenyao
* @description 针对表【user】的数据库操作Service实现
* @createDate 2026-03-13 19:30:45
*/

@Service
@Slf4j
public class UserServiceImpl extends ServiceImpl<UserMapper, User>implements UserService {

    @Autowired
    private UserMapper userMapper;
    /**
     * 盐值，混淆密码
     */
    private static final String SALT = "chenyao";




    @Override
    public long userRegister(String userAccount, String userPassword, String checkPassword) {
        // 去除前后空格
        userAccount = userAccount != null ? userAccount.trim() : null;
        userPassword = userPassword != null ? userPassword.trim() : null;
        checkPassword = checkPassword != null ? checkPassword.trim() : null;
        //1. 校验
        if (StringUtils.isAnyBlank(userAccount, userPassword, checkPassword)) {
            // 测试期望返回 -1 而不是抛异常
            return -1;
        }
        if (userAccount.length() < 4) {
            return -1;
        }
        if (userPassword.length() < 8 || checkPassword.length() < 8) {
            return -1;
        }

        // 账户不能包含特殊字符
        String validPattern = "[~!@#$%^&*()+=|{}':;,\\\\[\\\\]<>/?~！@#￥%……&*（）—+{}|（）【】；：《》\"]";
        Matcher matcher = Pattern.compile(validPattern).matcher(userAccount);
        if (matcher.find()) {
            return -1;
        }
        //密码和校验密码相同
        if (!userPassword.equals(checkPassword)) {
            return -1;
        }
        //账户不能重复
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("userAccount", userAccount);
        long count = userMapper.selectCount(queryWrapper);
        if (count > 0) {
            return -1;
        }
        //2.加密
        String encryptPassword = DigestUtils.md5DigestAsHex((SALT + userPassword).getBytes());
        //3.插入数据
        User user =new User();
        user.setUserAccount(userAccount);
        user.setUserPassword(encryptPassword);
        boolean saveResult = this.save(user);
        if (!saveResult) {
            return -1;
        }
        return user.getId();
    }

    @Override
    public User userLogin(String userAccount, String userPassword, HttpServletRequest request) {
        // 去除前后空格
        userAccount = userAccount != null ? userAccount.trim() : null;
        userPassword = userPassword != null ? userPassword.trim() : null;
        //1. 校验
        if (StringUtils.isAnyBlank(userAccount, userPassword)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR,"参数为空");
        }
        if (userAccount.length() < 4) {
           throw new BusinessException(ErrorCode.PARAMS_ERROR,"用户账户过短");
        }
        if (userPassword.length() < 8 ) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR,"用户密码过短");
        }

        // 账户不能包含特殊字符
        String validPattern = "[~!@#$%^&*()+=|{}':;,\\\\[\\\\]<>/?~！@#￥%……&*（）—+{}|（）【】；：《》\"]";
        Matcher matcher = Pattern.compile(validPattern).matcher(userAccount);
        if (matcher.find()) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR,"账户不能包含特殊字符");
        }
        //2.加密
        String encryptPassword = DigestUtils.md5DigestAsHex((SALT + userPassword).getBytes());
        //查询用户是否还存在
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("userAccount", userAccount);
        queryWrapper.eq("userPassword", encryptPassword);
        User user = userMapper.selectOne(queryWrapper);
        //用户不存在
        if (user == null) {
            log.info("user login failed userAccount Cannot match userPassword");
            throw new BusinessException(ErrorCode.PARAMS_ERROR,"用户不存在或密码错误");
        }
        //判断用户是否被封禁
        if (user.getUseStatus() != null && user.getUseStatus() == 1) {
            log.info("user login failed user is banned");
            throw new BusinessException(ErrorCode.NO_AUTH, "该账号已被封禁");
        }
        //3.用户脱敏
        User safetyUser =getSafetyUser(user);
        //4.记录用户的登录态
        request.getSession().setAttribute(USER_LOGIN_STATE,safetyUser);
        return safetyUser;
    }

    /**
     * 用户脱敏
     * @param originUser
     * @return
     */
    @Override
    public User getSafetyUser(User originUser){
        if(originUser == null){
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User safetyUser = new User();
        safetyUser.setId(originUser.getId());
        safetyUser.setUsername(originUser.getUsername());
        safetyUser.setUserAccount(originUser.getUserAccount());
        safetyUser.setAvatarUrl(originUser.getAvatarUrl());
        safetyUser.setGender(originUser.getGender());
        safetyUser.setPhone(originUser.getPhone());
        safetyUser.setEmail(originUser.getEmail());
        safetyUser.setUserRole(originUser.getUserRole());
        safetyUser.setUseStatus(originUser.getUseStatus());
        safetyUser.setCreatetime(originUser.getCreatetime());
        return safetyUser;
    }

    @Override
    public int userLogout(HttpServletRequest request) {
        //移除登录态
        request.getSession().removeAttribute(USER_LOGIN_STATE);
        return 1;
    }

    @Override
    public User getById(long id) {return userMapper.selectById(id);}

    @Override
    @Transactional(rollbackFor=Exception.class)
    public boolean updateUser(UserUpdateRequest updateRequest, HttpServletRequest request){
        if(updateRequest==null||request==null){
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }

        log.info("更新用户请求：{}", updateRequest);

        Object userObj=request.getSession().getAttribute(USER_LOGIN_STATE);
        User currentUser = (User) userObj;
        if(currentUser==null){
            throw new BusinessException(ErrorCode.NOT_LOGIN);
        }
        log.info("当前登录用户：{},角色：{}",currentUser.getUserAccount(),currentUser.getUserRole());

        //要修改的用户ID
        Long userId;
        boolean isAdmin = currentUser.getUserRole()==ADMIN_ROLE;
        if(isAdmin&&updateRequest.getId()!=null){
            userId=updateRequest.getId();
            log.info("用户修改自己的信息，用户ID：{}", userId);
        }
        else{
            userId=currentUser.getId();
            log.info("用户修改自己信息，ID：{}", userId);

        }
    User user=userMapper.selectById(userId);
    if(user==null){
        throw new BusinessException(ErrorCode.PARAMS_ERROR,"用户不存在");
    }
        // 更新用户信息
        if (updateRequest.getUsername() != null) {
            user.setUsername(updateRequest.getUsername());
        }
        if (updateRequest.getAvatarUrl() != null) {
            user.setAvatarUrl(updateRequest.getAvatarUrl());
        }
        if (updateRequest.getGender() != null) {
            user.setGender(updateRequest.getGender());
        }
        if (updateRequest.getPhone() != null) {
            user.setPhone(updateRequest.getPhone());
        }
        if (updateRequest.getEmail() != null) {
            user.setEmail(updateRequest.getEmail());
        }
        
        // 只有管理员可以修改用户状态和角色
        if (isAdmin) {
            if (updateRequest.getUseStatus() != null) {
                user.setUseStatus(updateRequest.getUseStatus());
            }
            if (updateRequest.getUserRole() != null) {
                user.setUserRole(updateRequest.getUserRole());
            }
        }

        // 更新用户
        int result = userMapper.updateById(user);

        // 如果是修改当前登录用户的信息，更新session中的用户信息
        if (result > 0 && userId.equals(currentUser.getId())) {
            User safetyUser = getSafetyUser(user);
            request.getSession().setAttribute(USER_LOGIN_STATE, safetyUser);
        }
    return result > 0;
}


}





