package com.usercenterbackend.model.request;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 用户注册请求体
 * @author chenyao
 */
@Data
public class UserRegisterRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = -8559162122619488659L;

    private String userAccount;

    private String userPassword;

    private String checkPassword;

    public UserRegisterRequest() {
    }

    public String getUserAccount() {
        return userAccount;
    }

    public void setUserAccount(String userAccount) {
        this.userAccount = userAccount;
    }

    public String getUserPassword() {
        return userPassword;
    }

    public void setUserPassword(String userPassword) {
        this.userPassword = userPassword;
    }

    public String getCheckPassword() {
        return checkPassword;
    }

    public void setCheckPassword(String checkPassword) {
        this.checkPassword = checkPassword;
    }

    @Override
    public String toString() {
        return "UserRegisterRequest{" +
                "userAccount='" + userAccount + '\'' +
                ", userPassword='***'" +
                ", checkPassword='***'" +
                '}';
    }
}
