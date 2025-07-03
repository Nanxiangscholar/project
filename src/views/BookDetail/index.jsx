import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Rate, Result, Space, Typography } from 'antd';
import styles from './index.less';

const { Title, Text, Paragraph } = Typography;

const BookDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const bookId = parseInt(id);
  
  const {books} = useSelector(state => state.books);
  const book = books.find(book => book.id === bookId);

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles['book-detail']}>
      <div className={styles['page-header']}>
        <h2>图书详情</h2>
        <Button icon={<i className="anticon anticon-arrow-left" />} onClick={goBack}>返回</Button>
      </div>

      {book ? (
        <Card className={styles['book-content']} bordered={false}>
          <div className={styles['book-main']}>
            <div className={styles['book-cover']}>
              <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className={styles['book-info']}>
              <Title level={3}>{book.title}</Title>
              <div className={styles['book-meta']}>
                <Space direction="vertical" size={16}>
                  <div className={styles['meta-item']}>
                    <Text className={styles['label']} strong>作者：</Text>
                    <Text className={styles['value']}>{book.author}</Text>
                  </div>
                  <div className={styles['meta-item']}>
                    <Text className={styles['label']} strong>分类：</Text>
                    <Text className={styles['value-category']}>{book.category}</Text>
                  </div>
                  <div className={styles['meta-item']}>
                    <Text className={styles['label']} strong>评分：</Text>
                    <Space>
                      <Rate disabled value={book.rating} className={styles['rating-stars']} />
                      <Text className={styles['rating-value']}>{book.rating}</Text>
                    </Space>
                  </div>
                  <div className={styles['meta-item']}>
                    <Text className={styles['label']} strong>销量：</Text>
                    <Text className={styles['value']}>{book.sales}</Text>
                  </div>
                  <div className={styles['meta-item']}>
                    <Text className={styles['label']} strong>价格：</Text>
                    <Text className={styles['value-price']}>{book.price}</Text>
                  </div>
                </Space>
              </div>
              
              <div className={styles['book-actions']}>
                <Space size={16}>
                  <Button type="primary" icon={<i className="anticon anticon-shopping-cart" />} size="large">
                    加入购物车
                  </Button>
                  <Button type="success" icon={<i className="anticon anticon-shopping" />} size="large">
                    立即购买
                  </Button>
                </Space>
              </div>
            </div>
          </div>

          <div className={styles['book-description']}>
            <Title level={4}>图书简介</Title>
            <Paragraph>{book.description || '暂无简介'}</Paragraph>
          </div>
        </Card>
      ) : (
        <Result
          status="warning"
          title="未找到图书信息"
          extra={<Button type="primary" onClick={goBack}>返回列表</Button>}
        />
      )}
    </div>
  );
};

export default BookDetail;  