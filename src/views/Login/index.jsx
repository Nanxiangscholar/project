import { useState, useEffect } from 'react';
import { Form, Input, Button, Alert, message } from 'antd';
import { UserOutlined, LockOutlined, ReadOutlined, LineChartOutlined , StarFilled } from '@ant-design/icons';
import { validateCredentials, setAuthToken, isAuthenticated } from '../../utils/auth';
import styles from './index.module.css';

const Login = () => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm(); // Ant Design的表单引用

  // 组件挂载时检查是否已登录
  useEffect(() => {
    if (isAuthenticated()) {
      // 如果已登录，重定向到首页
      window.location.href = '/';
    }
  }, []);

  // 处理登录表单提交
  const handleLogin = async () => {
    try {
      // 验证表单字段
      const values = await form.validateFields();
      const { username, password } = values;

      setLoading(true); // 设置加载状态

      // 模拟API请求延迟
      setTimeout(() => {
        // 使用认证工具验证用户凭据
        const result = validateCredentials(username, password);

        if (result.success) {
          // 保存认证令牌
          setAuthToken(result.user);
          
          message.success('登录成功！'); // 显示成功消息
          
          // 延迟跳转，让用户看到成功消息
          setTimeout(() => {
            window.location.href = '/';
          }, 500);
        } else {
          message.error(result.message || '登录失败！'); // 显示错误消息
        }

        setLoading(false); // 重置加载状态
      }, 1000);
    } catch (error) {
      // 表单验证失败
      console.error('表单验证失败:', error);
    }
  };

  // 处理回车键按下事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin(); // 触发登录
    }
  };

  return (
    <div className={styles["login-container"]}>
      <div className={styles["login-bg"]}>
        <div className={styles["bg-overlay"]}></div>
      </div>
      <div className={styles["login-content"]}>
        <div className={styles["login-card"]}>
          <div className={styles["login-header"]}>
            <div className={styles["login-icon"]}>
              <ReadOutlined />
            </div>
            <h1>图书馆管理系统</h1>
            <p>智慧管理，高效服务</p>
          </div>

          <Form
            form={form}
            name="loginForm"
            layout="vertical"
            className="login-form"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名', trigger: 'blur' },
                { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
                size="large"
                allowClear
                onPressEnter={handleKeyPress} // 支持回车键提交
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码', trigger: 'blur' },
                { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                size="large"
                allowClear
                onPressEnter={handleKeyPress} // 支持回车键提交
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                size="large"
                loading={loading}
                onClick={handleLogin}
                className="login-button"
                block
              >
                {loading ? '登录中...' : '立即登录'}
              </Button>
            </Form.Item>
          </Form>

          <div className={styles["login-tips"]}>
            <Alert
              message="演示账号"
              description={
                <>
                  <p><strong>管理员：</strong>admin / 123456</p>
                  <p><strong>用户：</strong>user / 123456</p>
                </>
              }
              type="info"
              showIcon
              closable={false}
            />
          </div>

          <div className={styles["login-footer"]}>
            <div className={styles["system-info"]}>
              <span className={styles["info-item"]}>
                <LineChartOutlined  />
                React
              </span>
              <span className={styles["info-item"]}>
                <LineChartOutlined />
                Ant Design
              </span>
              <span className={styles["info-item"]}>
                <StarFilled />
                现代化管理
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;