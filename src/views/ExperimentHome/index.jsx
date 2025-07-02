import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Carousel,
  Radio,
  Tag,
  Tooltip,
  Button,
  message,
  Card,
  Row,
  Col,
  Space
} from 'antd';
import {
  StarOutlined,
  SettingOutlined,
  MobileOutlined,
  BookOutlined,
  SyncOutlined,
  BarChartOutlined,
  MenuOutlined,
  ThunderboltOutlined,
  QuestionOutlined,
  KeyOutlined,
  SortAscendingOutlined,
  CloseOutlined,
  ShoppingCartOutlined,
  DashboardOutlined,
  MonitorOutlined,
  RightOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import styles from './index.less';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

const ExperimentHome = () => {
  const navigate = useNavigate();
  const [currentStrategy, setCurrentStrategy] = useState('id');

  const [popularBooks, setPopularBooks] = useState([]);
  const { books } = useSelector((state) => state.books);

  useEffect(() => {
    if (books.length === 0) return;
    let sortedBooks = [...books]?.sort((a, b) => b.sales - a.sales)?.slice(0, 8);
    setPopularBooks(sortedBooks);
  }, [books])

  const showcaseItems = [
    { icon: <BookOutlined />, name: '图书管理' },
    { icon: <ShoppingCartOutlined />, name: '电商功能' },
    { icon: <DashboardOutlined />, name: '系统核心' },
    { icon: <BarChartOutlined />, name: '数据分析' }
  ];

  const handleStrategyChange = (e) => {
    setCurrentStrategy(e.target.value);
    message.success(`已切换到${getStrategyText(e.target.value)}`);
  };

  const getStrategyText = (strategy) => {
    const texts = {
      id: '使用ID作为Key',
      index: '使用索引作为Key',
      none: '不使用Key'
    };
    return texts[strategy] || '未知策略';
  };

  const getStrategyTagType = () => {
    const typeMap = {
      id: 'primary',
      index: 'success',
      none: 'info'
    };
    return typeMap[currentStrategy] || 'primary';
  };

  const getStrategyIcon = () => {
    const iconMap = {
      id: <KeyOutlined />,
      index: <SortAscendingOutlined />,
      none: <CloseOutlined />
    };
    return iconMap[currentStrategy] || <KeyOutlined />;
  };

  const getStrategyDescription = () => {
    const descMap = {
      id: '使用数据项的唯一标识符作为key，这是React推荐的做法，可以最大程度地提高列表渲染性能。',
      index: '使用数组索引作为key，适用于静态列表，但在数据频繁变动时可能影响性能。',
      none: '不使用key或使用索引作为key，这种方式在某些场景下可能导致不必要的DOM重新渲染。'
    };
    return descMap[currentStrategy] || descMap.id;
  };

  const viewBookDetail = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const viewAll = () => {
    navigate('/books');
  };

  const handleImageError = (e) => {
    e.target.src = '../assets/images/book-placeholder.png';
  };

  return (
    <div className={styles['experimentHome']}>
      <h1 >图书馆电商管理系统</h1>
      <div className={styles['carousel-section']}>
        <Carousel
          autoplay
          dotPosition="bottom"
          effect="fade"
          className="system-carousel"
        >
          <div>
            <div className={classNames(styles['carousel-slide'], styles['slide-overview'])}>
              <div className={styles["slide-content"]}>
                <div className={styles["slide-text"]}>
                  <div className={styles["slide-badge"]}>
                    <StarOutlined />
                    <span>智慧图书馆</span>
                  </div>
                  <h2>现代化电商管理平台</h2>
                  <div className={styles["slide-features"]}>
                    <div className={styles["feature-tag"]}>
                      <ThunderboltOutlined />
                      <span>高性能架构</span>
                    </div>
                    <div className={styles["feature-tag"]}>
                      <BarChartOutlined />
                      <span>大数据支持</span>
                    </div>
                    <div className={styles["feature-tag"]}>
                      <MobileOutlined />
                      <span>响应式设计</span>
                    </div>
                  </div>
                </div>
                <div className={styles["slide-visual"]}>
                  <div className={classNames(styles["visual-icon"], styles["main-icon"])}>
                    <BookOutlined />
                  </div>
                  <div className={styles["floating-elements"]}>
                    <div className={styles["floating-item"]} style={{ '--delay': '0s' }}>
                      <BookOutlined />
                    </div>
                    <div className={styles["floating-item"]} style={{ '--delay': '0.5s' }}>
                      <ShoppingCartOutlined />
                    </div>
                    <div className={styles["floating-item"]} style={{ '--delay': '1s' }}>
                      <BarChartOutlined />
                    </div>
                    <div className={styles["floating-item"]} style={{ '--delay': '1.5s' }}>
                      <MenuOutlined />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className={classNames(styles["carousel-slide"], styles["slide-features"])}>
              <div className={styles["slide-content"]}>
                <div className={styles["slide-text"]}>
                  <div className={styles["slide-badge"]}>
                    <SettingOutlined />
                    <span>核心功能</span>
                  </div>
                  <h2>四大管理模块</h2>
                  <div className={styles["module-grid"]}>
                    <div className={styles["module-item"]} onClick={() => navigate('/books')}>
                      <BookOutlined />
                      <span>图书目录</span>
                    </div>
                    <div className={styles["module-item"]} onClick={() => navigate('/dynamic-medium-list')}>
                      <SyncOutlined />
                      <span>库存管理</span>
                    </div>
                    <div className={styles["module-item"]} onClick={() => navigate('/order-process')}>
                      <BarChartOutlined />
                      <span>订单处理</span>
                    </div>
                    <div className={styles["module-item"]} onClick={() => navigate('/book-catalog')}>
                      <MenuOutlined />
                      <span>分类管理</span>
                    </div>
                  </div>
                </div>
                <div className={styles["slide-visual"]}>
                  <div className={styles["feature-showcase"]}>
                    {showcaseItems.map((item, index) => (
                      <div
                        key={index}
                        className={styles["showcase-item"]}
                        style={{ animationDelay: `${index * 0.3}s` }}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className={classNames(styles["carousel-slide"], styles["slide-tech"])}>
              <div className={styles["slide-content"]}>
                <div className={styles["slide-text"]}>
                  <div className={styles["slide-badge"]}>
                    <ThunderboltOutlined />
                    <span>技术优势</span>
                  </div>
                  <h2>React性能优化</h2>
                  <div className={styles["tech-stats"]}>
                    <div className={styles["stat-item"]}>
                      <div className={styles["stat-number"]}>3种</div>
                      <div className={styles["stat-label"]}>Key策略</div>
                    </div>
                    <div className={styles["stat-item"]}>
                      <div className={styles["stat-number"]}>1000+</div>
                      <div className={styles["stat-label"]}>并发支持</div>
                    </div>
                    <div className={styles["stat-item"]}>
                      <div className={styles["stat-number"]}>99%</div>
                      <div className={styles["stat-label"]}>性能优化</div>
                    </div>
                  </div>
                </div>
                <div className={styles["slide-visual"]}>
                  <div className={styles["tech-visual"]}>
                    <div className={styles["code-window"]}>
                      <div className={styles["window-header"]}>
                        <div className={styles["window-dots"]}>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <span className={styles["window-title"]}>performance.js</span>
                      </div>
                      <div className={styles["window-content"]}>
                        <div className={styles["code-line"]}>
                          <span className={styles["keyword"]}>const</span>
                          <span className={styles["variable"]}>strategy</span> =
                          <span className={styles["string"]}>'{currentStrategy}'</span>
                        </div>
                        <div className={styles["code-line"]}>
                          <span className={styles["keyword"]}>if</span>
                          <span className={styles["bracket"]}>(</span>
                          <span className={styles["variable"]}>strategy</span>
                          <span className="operator">===</span>
                          <span className={styles["string"]}>
                            'id'
                          </span>
                          <span className={styles["bracket"]}>)</span>
                        </div>
                        <div className={classNames(styles["code-line"], styles["indent"])}>
                          <span className={styles["keyword"]}>return</span>
                          <span className={styles["variable"]}>item.id</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className={classNames(styles["carousel-slide"], styles["slide-cta"])}>
              <div className={styles["slide-content"]}>
                <div className={styles["slide-text"]}>
                  <div className={styles["slide-badge"]}>
                    <TrophyOutlined />
                    <span>立即体验</span>
                  </div>
                  <h2>开始体验</h2>
                  <div className={styles["cta-buttons"]}>
                    <Button
                      type="primary"
                      className="cta-button warning"
                      onClick={() => navigate('/books')}
                    >
                      <BookOutlined />
                      <span>图书目录</span>
                    </Button>
                    <Button
                      type="primary"
                      className="cta-button primary"
                      onClick={() => navigate('/book-catalog')}
                    >
                      <MenuOutlined />
                      <span>分类管理</span>
                    </Button>
                    <Button
                      type="primary"
                      className="cta-button success"
                      onClick={() => navigate('/order-process')}
                    >
                      <BarChartOutlined />
                      <span>订单中心</span>
                    </Button>
                  </div>
                </div>
                <div className={styles["slide-visual"]}>
                  <div className={styles["cta-visual"]}>
                    <div className={styles["rocket-container"]}>
                      <div className={styles["rocket"]}>
                        <TrophyOutlined />
                      </div>
                      <div className={styles["stars"]}>
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={styles["star"]}
                            style={{ animationDelay: `${i * 0.2}s` }}
                          >
                            ✨
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Carousel>
      </div>

      <div className={styles["key-strategy-section"]}>
        <div className={styles["section-header"]}>
          <h3>
            <KeyOutlined />
            Key 策略选择
          </h3>
          <Tooltip title="不同的Key策略会影响React列表渲染的性能表现" placement="top">
            <QuestionOutlined className="help-icon" />
          </Tooltip>
        </div>

        <div className={styles["strategy-card"]}>
          <div className={styles["strategy-options"]}>
            <Radio.Group
              onChange={handleStrategyChange}
              value={currentStrategy}
              className="strategy-radio-group"
            >
              <Radio value="id">
                <div className={styles["radio-content"]}>
                  <KeyOutlined />
                  <div className={styles["radio-text"]}>
                    <span className={styles["primary-text"]}>使用ID</span>
                    <span className={styles["secondary-text"]}>使用数据的唯一标识作为key</span>
                  </div>
                </div>
              </Radio>
              <Radio value="index">
                <div className={styles["radio-content"]}>
                  <SortAscendingOutlined />
                  <div className={styles["radio-text"]}>
                    <span className={styles["primary-text"]}>使用索引</span>
                    <span className={styles["secondary-text"]}>使用数组索引作为key</span>
                  </div>
                </div>
              </Radio>
              <Radio value="none">
                <div className={styles["radio-content"]}>
                  <CloseOutlined />
                  <div className={styles["radio-text"]}>
                    <span className={styles["primary-text"]}>不使用key</span>
                    <span className={styles["secondary-text"]}>默认模式，可能影响性能</span>
                  </div>
                </div>
              </Radio>
            </Radio.Group>
          </div>

          <div className={styles["current-strategy"]}>
            <div className={styles["strategy-tag"]}>
              <Tag
                color={getStrategyTagType()}
                size="medium"
                icon={getStrategyIcon()}
              >
                {getStrategyText(currentStrategy)}
              </Tag>
            </div>
            <div className={styles["strategy-description"]}>
              {getStrategyDescription()}
            </div>
          </div>
        </div>
      </div>
      <Row gutter={[16, 16]} className={styles["function-cards"]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            className="function-card"
            onClick={() => navigate('/book-catalog')}
          >
            <div className={styles["card-header"]}>
              <div className={styles["card-icon"]}>
                <BookOutlined style={{ color: 'white', fontSize: '1.75rem' }} />
              </div>
              <div className={styles["header-content"]}>
                <span className={styles["tag"]}>基础功能</span>
                <h3>图书管理</h3>
              </div>
            </div>
            <p className={styles["card-desc"]}>
              支持海量图书数据的高效管理，包括图书信息维护、库存跟踪、分类管理等功能。
            </p>
            <ul className={styles["feature-list"]}>
              <li><StarOutlined /> 图书信息维护</li>
              <li><StarOutlined /> 库存跟踪</li>
              <li><StarOutlined /> 分类管理</li>
            </ul>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="function-card">
            <div className={styles["card-header"]}>
              <div className={styles["card-icon"]}>
                <ShoppingCartOutlined style={{ color: 'white', fontSize: '1.75rem' }} />
              </div>
              <div className={styles["header-content"]}>
                <span className={styles["tag"]}>电商功能</span>
                <h3>电商系统</h3>
              </div>
            </div>
            <p className={styles["card-desc"]}>
              完整的电商交易流程，支持在线下单、支付处理、订单跟踪、用户管理等。
            </p>
            <ul className={styles["feature-list"]}>
              <li><StarOutlined /> 在线下单</li>
              <li><StarOutlined /> 支付处理</li>
              <li><StarOutlined /> 订单跟踪</li>
            </ul>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className={styles["function-card"]}>
            <div className={styles["card-header"]}>
              <div className={styles["card-icon"]}>
                <DashboardOutlined style={{ color: 'white', fontSize: '1.75rem' }} />
              </div>
              <div className={styles["header-content"]}>
                <span className={styles["tag"]}>核心功能</span>
                <h3>系统核心</h3>
              </div>
            </div>
            <p className={styles["card-desc"]}>
              系统核心功能模块，提供强大的业务支持和数据处理能力。
            </p>
            <ul className={styles["feature-list"]}>
              <li><StarOutlined /> 数据处理</li>
              <li><StarOutlined /> 业务流程</li>
              <li><StarOutlined /> 系统集成</li>
            </ul>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className={styles["function-card"]}>
            <div className={styles["card-header"]}>
              <div className={styles["card-icon"]}>
                <MonitorOutlined style={{ color: 'white', fontSize: '1.75rem' }} />
              </div>
              <div className={styles["header-content"]}>
                <span className={styles["tag"]}>高级特性</span>
                <h3>性能优化</h3>
              </div>
            </div>
            <p className={styles["card-desc"]}>
              采用React最佳实践，支持多种Key绑定策略，确保大数据量场景下的流畅体验。
            </p>
            <ul className={styles["feature-list"]}>
              <li><StarOutlined /> Key策略优化</li>
              <li><StarOutlined /> 性能监控</li>
              <li><StarOutlined /> 大数据处理</li>
            </ul>
          </Card>
        </Col>
      </Row>
      <div className={styles["book-section"]}>
        <div className={styles["section-header"]}>
          <h2>热门图书</h2>
          <div className={styles["section-actions"]}>
            <Button type="text" onClick={viewAll}>
              查看全部 <RightOutlined />
            </Button>
          </div>
        </div>

        <Row gutter={[16, 16]} className={styles["book-list"]}>
          {popularBooks?.map(book => (
            <Col key={book.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                className="book-card"
                onClick={() => viewBookDetail(book.id)}
                cover={
                  <div className={styles["book-cover"]}>
                    <img
                      src={book.coverUrl || '/book-placeholder.png'}
                      alt={book.title}
                      onError={handleImageError}
                    />
                    <div className={styles["book-hover"]}>
                      <Button type="primary" shape="round" size="small">
                        查看详情
                      </Button>
                    </div>
                  </div>
                }
              >
                <div className={styles["book-info"]}>
                  <h3>{book.title}</h3>
                  <div className={styles["book-meta"]}>
                    <span className={styles["book-author"]}>{book.author}</span>
                    <span className={styles["book-category"]}>{book.category}</span>
                  </div>
                  <div className={styles["book-rating"]}>
                    <Space>
                      {[...Array(Math.floor(book.rating))].map((_, i) => (
                        <StarOutlined key={i} />
                      ))}
                      {book.rating % 1 >= 0.5 && <StarOutlined />}
                      <span className={styles["rating-value"]}>{book.rating}</span>
                    </Space>
                  </div>
                  <div className={styles["book-footer"]}>
                    <span className={styles["book-price"]}>¥{book.price}</span>
                    <span className={styles["book-sales"]}>销量 {book.sales}</span>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default ExperimentHome;