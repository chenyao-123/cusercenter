package com.myuserbackend.model.domain;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.util.Date;

@TableName(value = "`user`")
@Data
public class User {

    /**
     * 主键用户ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 昵称
     */
    @TableField("username")
    private String username;

    /**
     * 登陆账号
     */
    @TableField("userAccount")
    private String userAccount;

    /**
     * 头像
     */
    @TableField("avatarUrl")
    private String avatarUrl;

    /**
     * 性别
     */
    @TableField("gender")
    private Integer gender;

    /**
     * 密码
     */
    @TableField("userPassword")
    private String userPassword;

    /**
     * 电话
     */
    @TableField("phone")
    private String phone;

    /**
     * 邮箱
     */
    @TableField("email")
    private String email;

    /**
     * 用户状态
     */
    @TableField("useStatus")
    private Integer useStatus;

    /**
     * 创建时间
     */
    @TableField(value = "createtime", fill = FieldFill.INSERT)
    private Date createtime;

    /**
     * 更新时间
     */
    @TableField(value = "updateTime", fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;

    /**
     * 是否删除01（逻辑删除）
     */
    @TableLogic(value = "0", delval = "1") // 显式指定：0-未删，1-已删
    @TableField("isDelete")
    private Integer isDelete;

    /**
     * 用户角色
     */
    @TableField("userRole")
    private Integer userRole;

    /**
     * 星球用户
     */
    @TableField("planetCode")
    private String planetCode;

}