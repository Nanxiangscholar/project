import { Dropdown, Menu } from 'antd';
import { UserOutlined, StarOutlined, ClockCircleOutlined, SettingOutlined } from '@ant-design/icons';
import styles from './UserInfo.less';

const UserInfo = ({ userInfo, onLogout }) => {
  const formatLoginTime = () => {
    if (!userInfo.loginTime) return '';
    const date = new Date(userInfo.loginTime);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const menu = (
    <Menu>
      <Menu.Item key="user" icon={<UserOutlined />}>
        用户：{userInfo.username}
      </Menu.Item>
      {userInfo.role === 'admin' && (
        <Menu.Item key="admin" icon={<StarOutlined />}>
          管理员身份
        </Menu.Item>
      )}
      <Menu.Item key="time" icon={<ClockCircleOutlined />}>
        登录时间：{formatLoginTime()}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<SettingOutlined />} onClick={onLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={styles['user-info']}>
      <Dropdown overlay={menu} trigger={['hover']} placement="bottomRight">
        <div className={styles['user-avatar']}>
          <div className={styles['avatar-icon']}>
            <UserOutlined />
          </div>
          <span className={styles['username']}>{userInfo.username}</span>
          <span className={styles['arrow-down']}>▼</span>
        </div>
      </Dropdown>
    </div>
  );
};

export default UserInfo;