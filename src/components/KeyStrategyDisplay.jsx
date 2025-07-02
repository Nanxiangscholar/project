import { Tag } from 'antd';
import { 
  KeyOutlined, 
  SortAscendingOutlined, 
  LinkOutlined, 
  CloseOutlined 
} from '@ant-design/icons';
import styles from './KeyStrategyDisplay.module.css';

/**
 * KeyStrategyDisplay 组件
 * 用于显示当前使用的Key策略
 * @param {string} keyStrategy - 当前Key策略，可选值: 'id', 'index', 'key', 'none'
 */
const KeyStrategyDisplay = ({ keyStrategy }) => {
  /**
   * 获取策略显示文本
   * @returns {string} 策略对应的中文描述
   */
  const getDisplayText = () => {
    const strategyMap = {
      'id': 'ID作为Key',
      'index': '索引作为Key',
      'key': '使用Key属性',
      'none': '不使用Key'
    };
    return strategyMap[keyStrategy] || 'ID作为Key'; // 默认返回'ID作为Key'
  };

  /**
   * 获取标签类型
   * @returns {string} antd Tag组件支持的类型: 'primary', 'success', 'danger', 'info'
   */
  const getTagType = () => {
    const typeMap = {
      'id': 'primary',
      'index': 'success',
      'key': 'danger',
      'none': 'info'
    };
    return typeMap[keyStrategy] || 'primary'; // 默认返回'primary'
  };

  /**
   * 获取对应的图标组件
   * @returns {ReactNode} antd图标组件
   */
  const getIcon = () => {
    const iconMap = {
      'id': <KeyOutlined />,       // 钥匙图标
      'index': <SortAscendingOutlined />, // 排序图标
      'key': <LinkOutlined />,      // 链接图标
      'none': <CloseOutlined />     // 关闭图标
    };
    return iconMap[keyStrategy] || <KeyOutlined />; // 默认返回钥匙图标
  };

  return (
    <div className={styles['key-strategy-display']}>
      {/* 
        antd的Tag组件，用于突出显示策略信息
        包含图标和文字说明
      */}
      <Tag 
        type={getTagType()}  // 动态设置标签类型
        size="medium"        // 中等大小
      >
        {getIcon()}          {/* 动态显示图标 */}
        <span className={styles['strategy-text']}>{getDisplayText()}</span> {/* 动态显示文本 */}
      </Tag>
    </div>
  );
};

export default KeyStrategyDisplay;