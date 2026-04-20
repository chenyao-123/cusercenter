package com.myuserbackend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.myuserbackend.model.domain.User;
import org.apache.ibatis.annotations.Mapper;
/**
* @author chenyao
* @description 针对表【user】的数据库操作Mapper
* @createDate 2026-03-13 19:30:45
* @Entity com.myuserbackend.model.domain.User
*/
@Mapper
public interface UserMapper extends BaseMapper<User> {

}




