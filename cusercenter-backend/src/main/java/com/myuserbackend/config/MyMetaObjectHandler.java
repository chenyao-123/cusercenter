package com.myuserbackend.config;

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;

import java.util.Date;

/**
 * MyBatis-Plus 自动填充处理器：为实体的创建/更新时间字段自动赋值
 */
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        Date now = new Date();
        // 注意：属性名必须与实体类字段名一致（createtime 与 updateTime）
        // 使用 setFieldValByName 保证无论 strictInsertFill 策略如何都能填充
        this.setFieldValByName("createtime", now, metaObject);
        this.setFieldValByName("updateTime", now, metaObject);
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        this.setFieldValByName("updateTime", new Date(), metaObject);
    }
}

