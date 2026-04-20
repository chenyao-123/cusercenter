package com.myuserbackend.model.dto;

import lombok.Data;
import java.io.Serial; // 导入这个注解
import java.io.Serializable;
import java.util.List;

/**
 * 通用的分页响应 DTO
 *
 * @author chenyao
 */
@Data
public class PageResult<T> implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /** 当前数据列表 */
    private List<T> data;

    /** 总记录数 */
    private long total;

    /**
     * 构造函数
     * @param data 数据列表
     * @param total 总记录数
     */
    public PageResult(List<T> data, long total) {
        this.data = data;
        this.total = total;
    }
}