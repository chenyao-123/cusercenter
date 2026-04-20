package com.myuserbackend.model.dto;
import lombok.Data;
import java.io.Serializable;

@Data
public class UserUpdateRequest implements Serializable {
    /**
     * 用户id（仅管理员可指定其他用户id）
     */
    private Long id;

    /**
     * 用户昵称
     */
    private String username;

    /**
     * 用户头像
     */
    private String avatarUrl;

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

    /**
     * 用户状态 0-正常 1-封号
     */
    private Integer useStatus;

    /**
     * 用户角色 0-普通用户 1-管理员
     */
    private Integer userRole;
}