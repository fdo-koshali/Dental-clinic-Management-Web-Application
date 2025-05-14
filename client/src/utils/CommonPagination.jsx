import PropTypes from "prop-types";
import { Pagination } from "antd";

const CommonPagination = ({ totalPages, currentPage, onPageChange, itemsPerPage, onItemsPerPageChange }) => {
  return (
    <div className="mt-3 flex justify-between items-center p-2">
      <Pagination
        total={totalPages * itemsPerPage}
        current={currentPage}
        pageSize={itemsPerPage}
        onChange={(page, pageSize) => {
          onPageChange(page);
          if (pageSize !== itemsPerPage) {
            onItemsPerPageChange(pageSize);
          }
        }}
        showSizeChanger
        pageSizeOptions={[5, 10, 50]}
      />
    </div>
  );
};

CommonPagination.propTypes = {
  totalPages: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  onItemsPerPageChange: PropTypes.func.isRequired,
};

export default CommonPagination;