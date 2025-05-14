import { Spin } from 'antd';

const CommonLoading = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Spin size="large" tip="Loading..." className="text-white" />
    </div>
  );
};

export default CommonLoading;
