package com.myuserbackend.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import com.baomidou.mybatisplus.extension.spring.MybatisSqlSessionFactoryBean;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import javax.sql.DataSource;

/**
 * MyBatis-Plus 配置类
 * 用于在 Spring Boot 4 中手动配置 SqlSessionFactory
 */
@Configuration
@MapperScan("com.myuserbackend.mapper")
public class MyBatisConfig {

    /**
     * 配置 SqlSessionFactory
     * 这是解决 "Property 'sqlSessionFactory' or 'sqlSessionTemplate' are required" 错误的关键
     */
    @Bean
    public SqlSessionFactory sqlSessionFactory(DataSource dataSource, MyMetaObjectHandler myMetaObjectHandler) throws Exception {
        MybatisSqlSessionFactoryBean sessionFactory = new MybatisSqlSessionFactoryBean();
        sessionFactory.setDataSource(dataSource);
        
        // 设置 Mapper XML 文件位置（可选，如果不存在则跳过）
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        try {
            org.springframework.core.io.Resource[] resources = resolver.getResources("classpath:mapper/*.xml");
            if (resources != null && resources.length > 0) {
                sessionFactory.setMapperLocations(resources);
            }
        } catch (Exception e) {
            // 如果 mapper 目录不存在，忽略该配置
            System.out.println("未找到 Mapper XML 文件，使用注解方式");
        }
        
        // 设置 MyBatis-Plus 全局配置
        com.baomidou.mybatisplus.core.config.GlobalConfig globalConfig = 
            new com.baomidou.mybatisplus.core.config.GlobalConfig();
        com.baomidou.mybatisplus.core.config.GlobalConfig.DbConfig dbConfig = 
            new com.baomidou.mybatisplus.core.config.GlobalConfig.DbConfig();
        dbConfig.setLogicDeleteField("isDelete");
        dbConfig.setLogicDeleteValue("1");
        dbConfig.setLogicNotDeleteValue("0");
        globalConfig.setDbConfig(dbConfig);
        // 注册 MetaObjectHandler，以支持自动填充 create/update 时间
        globalConfig.setMetaObjectHandler(myMetaObjectHandler);
        sessionFactory.setGlobalConfig(globalConfig);
        
        return sessionFactory.getObject();
    }

    /**
     * 配置 SqlSessionTemplate
     */
    @Bean
    public SqlSessionTemplate sqlSessionTemplate(SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }

    /**
     * 配置 MyBatis-Plus 分页插件
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}
