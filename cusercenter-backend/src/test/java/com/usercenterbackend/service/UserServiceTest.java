package com.usercenterbackend.service;

import com.usercenterbackend.model.domain.User;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * @author chenyao
 */
@SpringBootTest
class UserServiceTest {
    @Resource
    private UserService userService;

    @Test
    public void testAddUser(){
        User user=new User();
        user.setUsername("kk");
        user.setUserAccount("123");
        user.setAvatarUrl("https://www.vcg.com/creative/1226437418.html");
        user.setGender(0);
        user.setUserPassword("xxx");
        user.setPhone("123");
        user.setEmail("234");
        boolean result=userService.save(user);
        System.out.println(user.getId());
        Assertions.assertTrue( result);

    }


    @Test
    void userRegister() {
        String userAccount = "chenyao";
        String userPassword ="";
        String checkPassword="123456";
        long result =userService.userRegister(userAccount,userPassword,checkPassword);
        Assertions.assertEquals(-1,result);

        userAccount="ch";
        result=userService.userRegister(userAccount,userPassword,checkPassword);
        Assertions.assertEquals(-1,result);

        userAccount="chenyao";
        userPassword="123456";
        result=userService.userRegister(userAccount,userPassword,checkPassword);
        Assertions.assertEquals(-1,result);

        userAccount="chen yao";
        userPassword="12345678";
        result=userService.userRegister(userAccount,userPassword,checkPassword);
        Assertions.assertEquals(-1,result);

        checkPassword="123456789";
        result=userService.userRegister(userAccount,userPassword,checkPassword);
        Assertions.assertEquals(-1,result);

        userAccount="dogcy";
        checkPassword="12345678";
        result=userService.userRegister(userAccount,userPassword,checkPassword);
        Assertions.assertEquals(-1,result);

        userAccount="chenyao";
        result=userService.userRegister(userAccount,userPassword,checkPassword);
        Assertions.assertTrue(result>0);

    }
}