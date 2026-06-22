import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  showPageSize = false,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100]
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1 && !showPageSize) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach(i => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      // Scroll to top of table smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      {/* Mobile view */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
            currentPage === 1 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <i className="fas fa-chevron-left mr-1 text-xs"></i>
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
            currentPage === totalPages || totalPages === 0
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Next
          <i className="fas fa-chevron-right ml-1 text-xs"></i>
        </button>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{totalItems === 0 ? 0 : startItem}</span>{' '}
            to <span className="font-medium">{endItem}</span>{' '}
            of <span className="font-medium">{totalItems}</span> results
          </p>
          
          {/* Page size selector */}
          {showPageSize && onPageSizeChange && (
            <div className="flex items-center space-x-2">
              <label htmlFor="pageSize" className="text-sm text-gray-600">
                Show:
              </label>
              <select
                id="pageSize"
                value={itemsPerPage}
                onChange={(e) => {
                  onPageSizeChange(Number(e.target.value));
                  onPageChange(1); // Reset to first page when changing page size
                }}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
              }`}
              aria-label="Previous page"
            >
              <span className="sr-only">Previous</span>
              <i className="fas fa-chevron-left h-4 w-4"></i>
            </button>
            
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && handlePageChange(page)}
                disabled={page === '...'}
                aria-current={page === currentPage ? 'page' : undefined}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  page === currentPage
                    ? 'z-10 bg-amber-500 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500'
                    : page === '...'
                    ? 'text-gray-700 cursor-default'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''
              }`}
              aria-label="Next page"
            >
              <span className="sr-only">Next</span>
              <i className="fas fa-chevron-right h-4 w-4"></i>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Pagination;