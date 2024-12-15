
import React, { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

const InfiniteScrollList = () => {
  const [items, setItems] = useState([]); // Danh sách dữ liệu
  const [hasMore, setHasMore] = useState(true); // Kiểm tra còn dữ liệu để tải không

  // Hàm tải thêm dữ liệu
  const loadMore = () => {
    // Nếu đã tải đủ dữ liệu, dừng việc tải thêm
    if (items.length >= 100) {
      setHasMore(false);
      return;
    }

    // Tạo dữ liệu mới để thêm vào danh sách
    const newItems = Array.from({ length: 20 }, (_, i) => `Item ${items.length + i + 1}`);

    // Giả lập độ trễ tải dữ liệu
    setTimeout(() => {
      setItems((prevItems) => [...prevItems, ...newItems]);
    }, 1000);
  };

  return (
    <div style={{ height: '500px', overflow: 'auto', border: '1px solid #ccc', padding: '10px' }}>
      <InfiniteScroll
        pageStart={0} // Bắt đầu từ trang 0
        loadMore={loadMore} // Hàm tải thêm dữ liệu
        hasMore={hasMore} // Xác định còn dữ liệu để tải không
        loader={
          <div key="loader" style={{ textAlign: 'center', padding: '10px' }}>
            🔄 Loading more items...
          </div>
        }
        useWindow={false} // Không sử dụng cuộn toàn trang, chỉ cuộn trong phần tử cha
      >
        {items.map((item, index) => (
          <div
            key={index}
            style={{ padding: '20px', borderBottom: '1px solid #ddd', minHeight: '50px' }}
          >
            {item}
          </div>
        ))}
      </InfiniteScroll>
      {!hasMore && (
        <div style={{ textAlign: 'center', padding: '10px' }}>✅ You have reached the end!</div>
      )}
    </div>
  );
};

export default InfiniteScrollList;