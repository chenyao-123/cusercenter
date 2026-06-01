package com.usercenterbackend.exception;

import com.usercenterbackend.common.ErrorCode;

/**
 * 自定义异常类
 * @author chenyao
 */
public class BusinessException extends RuntimeException{
    private final int code;
    private final String decription;

    public BusinessException(String message, int code, String decription) {
        super(message);
        this.code = code;
        this.decription = decription;
    }

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.code = errorCode.getCode();
        this.decription = errorCode.getDescription();
    }
    public BusinessException(ErrorCode errorCode, String message) {
        // use provided message when available
        super(message != null && !message.isEmpty() ? message : errorCode.getMessage());
        this.code = errorCode.getCode();
        this.decription = errorCode.getDescription();
    }

    public int getCode() {
        return code;
    }

    public String getDescription() {
        return decription;
    }
}
