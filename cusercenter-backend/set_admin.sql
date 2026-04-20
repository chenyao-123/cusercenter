-- 设置管理员权限
-- 将 userAccount 为 'admin' 的用户设置为管理员（userRole = 1）

UPDATE user 
SET userRole = 1 
WHERE userAccount = 'admin';

-- 验证修改结果
SELECT id, userAccount, username, userRole 
FROM user 
WHERE userAccount = 'admin';
