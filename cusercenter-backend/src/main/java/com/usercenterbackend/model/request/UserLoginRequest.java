package com.usercenterbackend.model.request;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 用户登录请求体
 * @author chenyao
 */
@Data
public class

UserLoginRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = -8559162122619488659L;

    private String userAccount;

    private String userPassword;
}
