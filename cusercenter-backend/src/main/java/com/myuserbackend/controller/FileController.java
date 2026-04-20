package com.myuserbackend.controller;

import com.myuserbackend.common.BaseResponse;
import com.myuserbackend.common.ErrorCode;
import com.myuserbackend.common.ResultUtils;
import com.myuserbackend.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

/**
 * 文件上传接口
 */
@RestController
@RequestMapping("/file")
@Slf4j
public class FileController {

    @PostMapping("/upload")
    public BaseResponse<String> uploadFile(@RequestParam("file") MultipartFile file, HttpServletRequest request) {
        if (file.isEmpty()) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "上传文件为空");
        }
        
        try {
            // 获取文件名并生成新文件名（避免重名）
            String originalFilename = file.getOriginalFilename();
            String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
            String newFilename = UUID.randomUUID().toString() + suffix;
            
            // 获取项目根目录下的 uploads 文件夹
            String projectPath = System.getProperty("user.dir");
            File uploadDir = new File(projectPath, "uploads");
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            
            // 保存文件
            File destFile = new File(uploadDir, newFilename);
            file.transferTo(destFile);
            
            // 构造文件访问 URL (通过前端代理，/api 会被去掉，后端处理的是 /uploads/...)
            String fileUrl = "/api/uploads/" + newFilename;
            
            log.info("文件上传成功: {}", fileUrl);
            return ResultUtils.success(fileUrl);
        } catch (IOException e) {
            log.error("文件上传失败", e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "文件上传失败");
        }
    }
}
