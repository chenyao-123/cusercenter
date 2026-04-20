package com.myuserbackend.model.request;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
@Data
public class UserUpdateRequest implements Serializable {
    @Serial
    private static final long serialVersionUID = 372053837436544723L;
    /**
     * 用户ID
     */
    private Long id;

    /**
     * 用户昵称
     */
    private String username;

    /**
     * 用户头像
     */
    private String avataUrl;

    /**
     * 性别
     */
    private Integer gender;

    /**
     * 电话
     */
    private String phone;

    /**
     * 邮箱
     */
    private String email;
}
