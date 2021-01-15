/* eslint-disable react/no-deprecated */
import React from 'react';
import PropTypes from 'prop-types';
import arrowLeft from '../../images/arrowPaginationLeft.svg';
import arrowRight from '../../images/arrowPaginationRight.svg';

export default class Pagination extends React.Component {
  /**
   *Creates an instance of Pagination.
   * @param {*} props
   * @memberof Pagination
   */
  constructor(props) {
    super(props);
    this.state = {
      visiblePages: this.getVisiblePages(props.page, props.pages)
    };
  }

  /**
   * Method called when the component will receive props
   *
   * @param {*} nextProps
   * @memberof Pagination
   */
  componentWillReceiveProps(nextProps) {
    this.setState({
      visiblePages: this.getVisiblePages(nextProps.page, nextProps.pages)
    });
  }

  /**
   * Method that filter the total pages to show
   *
   * @memberof Pagination
   */
  filterPages = (visiblePages, totalPages) => {
    return visiblePages.filter(page => page <= totalPages);
  };

  /**
   * Method that change te current page to the selected page
   *
   * @param {number} value page to change
   * @returns
   * @memberof Pagination
   */
  changePage(value) {
    const { goToPage, page, pages } = this.props;
    const activePage = page + 1;

    if (value === activePage) {
      return;
    }

    const visiblePages = this.getVisiblePages(value, pages);

    this.setState({
      visiblePages: this.filterPages(visiblePages, pages)
    });

    goToPage(value);
  }

  /**
   * Method that determines how much button pages will be rendered
   *
   * @memberof Pagination
   */
  getVisiblePages = (page, total) => {
    if (total < 7) {
      console.log('ere 1 ');
      return this.filterPages([1, 2, 3, 4, 5, 6], total);
    } else if (page % 4 >= 0 && page > 3 && page + 2 < total) {
      console.log('ere 2');
      return [1, page - 1, page, page + 1, total];
    } else if (page % 4 >= 0 && page > 3 && page + 2 >= total) {
      console.log('ere 3');
      return [1, total - 3, total - 2, total - 1, total];
    } else {
      console.log('ere 4');
      return [1, 2, 3, 4, total];
    }
  };

  render() {
    const { upPage, downPage, page, pages } = this.props;
    const { visiblePages } = this.state;
    const activePage = page + 1;
    const canPrevious = page <= 0;
    const canNext = page + 1 >= pages;
    console.log(visiblePages);

    return (
      <div className="divPagination">
        {visiblePages.length !== 0 && visiblePages.length !== 1 && (
          <>
            <button
              type="button"
              className="buttonPagination"
              disabled={canPrevious}
              onClick={() => {
                downPage();
              }}
            >
              <img width="15px" height="15px" src={arrowLeft} />
            </button>
            <div className="numbersPagination fontPagination">
              {visiblePages.map((page, index, array) => {
                console.log(index, array);
                return (
                  <div key={page} className="flex">
                    {array[index - 1] + 2 < page ? (
                      <>
                        <div className="pageNumber-continue">...</div>
                        <div
                          className={
                            activePage === page
                              ? 'pageNumber-active'
                              : 'pageNumber-inactive'
                          }
                          onClick={() => {
                            this.changePage(page);
                          }}
                        >
                          {page}
                        </div>
                      </>
                    ) : (
                      <div
                        className={
                          activePage === page
                            ? 'pageNumber-active'
                            : 'pageNumber-inactive'
                        }
                        onClick={() => {
                          this.changePage(page);
                        }}
                      >
                        {page}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              className="buttonPagination"
              disabled={canNext}
              onClick={() => {
                upPage();
              }}
            >
              <img width="15px" height="15px" src={arrowRight} />
            </button>
          </>
        )}
      </div>
    );
  }
}
Pagination.propTypes = {
  pages: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  upPage: PropTypes.func.isRequired,
  goToPage: PropTypes.func.isRequired,
  downPage: PropTypes.func.isRequired
};
