import React from 'react';
import { Spinner } from 'nr1';
import SearchInput, { createFilter } from 'react-search-input';
import { BsSearch } from 'react-icons/bs';
import iconDownload from '../../images/download.svg';
import ArrowDown from '../../components/ArrowsTable/ArrowDown';
import ArrowTop from '../../components/ArrowsTable/ArrowTop';
import Modal from '../../components/Modal';
import ReactTable from 'react-table-v6';
import Pagination from '../../components/Pagination/Pagination';

const greenColor = '#007E8A';
const textGray = '#767B7F';
const grayColor = '#ADADAD';

const DATA = [
    { name: "pepe", age: 26, job: "farmer" },
    { name: "pepe 2", age: 26, job: "farmer" },
    { name: "pepe 3", age: 26, job: "farmer" },
    { name: "pepe 4", age: 26, job: "farmer" },
    { name: "pepe 5", age: 26, job: "farmer" }
]

export default class Sample extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            allChecked: false,
            all: true,
            favorite: false,
            visited: false,
            complex: '',
            dashboards: [],
            average: 0,
            categorizedList: [],
            avaliableList: [],
            mostVisited: [],
            favoriteDashboards: [],
            savingAllChecks: false,
            logs: [],
            selectedTag: "all",
            availableFilters: [
                { value: 'All', label: 'All' },
                { value: 'Favorites', label: 'Favorites' },
                { value: 'MostVisited', label: 'Most visited' }
            ],
            listChecked: {
                value: 'All',
                label: 'All list',
                id: 0,
                dashboards: []
            },
            listPopUp: [],
            valueListPopUp: {},
            // Pagination
            pagePag: 0,
            pages: 0,
            totalRows: 6,
            page: 1,
            ////////////
            finalList: [],
            textTag: '',
            searchTermDashboards: '',
            sortColumn: {
                column: '',
                order: ''
            },
            hidden: false,
            action: '',
            checksDownload: [
                { value: "CSV", label: "CSV" },
                { value: "JSON", label: "JSON" }
            ],
            selectFormat: { value: "CSV", label: "CSV" },
            emptyData: false
        };
    }

    upPage = () => {
        const { pagePag } = this.state;
        this.setState({ pagePag: pagePag + 1 });
    };

    changePage = pagePag => {
        this.setState({ pagePag: pagePag - 1 });
    };

    downPage = () => {
        const { pagePag } = this.state;
        this.setState({ pagePag: pagePag - 1 });
    };

    searchUpdated = (term) => {
        this.setState({ searchTermDashboards: term });
    }

    _onClose = () => {
        let actualValue = this.state.hidden;
        this.setState({ hidden: !actualValue });
    }

    returnActionPopUp = (action) => {
        return (
            <div>CONTENT POPUP BASED ON ACTION</div>
        )
    }

    confirmAction = async (action) => {
        this._onClose();
        //DO ACTION WHEN CLICK CONFIRM BUTTON
    }

    setSortColumn = (column) => {
        const { sortColumn } = this.state;
        let order = "";
        if (sortColumn.column === column) {
            if (sortColumn.order === '') {
                order = "ascendant";
            } else if (sortColumn.order === 'ascendant') {
                order = "descent";
            } else {
                order = '';
            }
        } else if (sortColumn.column === '' || sortColumn.column !== column) {
            order = 'ascendant';
        }
        if (sortColumn.column === column && sortColumn.order === 'descent') {
            column = '';
        }
        this.setState({
            sortColumn: {
                column: column,
                order: order
            }
        });
    }

    render() {
        const {
            loading,
            savingAllChecks,
            pagePag,
            pages,
            totalRows,
            hidden,
            sortColumn,
            action
        } = this.state;
        return (
            <div className="h100">
                {loading ? (
                    <Spinner type={Spinner.TYPE.DOT} />
                ) : (
                        <div className="mainContent">
                            <div className="mainContent__information">
                                <div className="information__box">
                                    <span
                                        className="box--title"
                                        style={{
                                            color: greenColor
                                        }}>
                                        One box
                                    </span>
                                    <div onClick={() => alert('Action')} className="pointer">
                                        <span
                                            className="box--quantity"
                                            style={{
                                                color: greenColor
                                            }}>
                                            45
                                        </span>
                                    </div>
                                </div>
                                <div className="information__box">
                                    <span
                                        className="box--title"
                                        style={{
                                            color: textGray
                                        }}>
                                        One box
                                    </span>
                                    <div>
                                        <span
                                            className="box--quantity"
                                            style={{
                                                color: grayColor
                                            }}>
                                            58
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mainContent__tableContent">
                                <div className="tableContent__filter">
                                    <div className="filters__search">
                                        <div className="search__content">
                                            <BsSearch size="10px" color={"#767B7F"} />
                                            <SearchInput
                                                className="filters--searchInput"
                                                onChange={this.searchUpdated}
                                            />
                                        </div>
                                    </div>
                                    <div className={DATA.length === 0 ? 'pointerBlock flex flexCenterVertical' : 'pointer flex flexCenterVertical'}
                                        onClick={() => {
                                            if (DATA.length !== 0)
                                                alert('download data...')
                                        }}
                                    >
                                        <img src={iconDownload} style={{ marginLeft: "20px" }} height="18px" />
                                    </div>
                                    {DATA.length !== 0 &&
                                        <Pagination
                                            page={pagePag}
                                            pages={pages}
                                            upPage={this.upPage}
                                            goToPage={this.changePage}
                                            downPage={this.downPage}
                                        />}
                                </div>
                                <div className="tableContent__table">
                                    <div style={{ width: '3000px' }} className="h100">
                                        <ReactTable
                                            loading={savingAllChecks}
                                            loadingText={'Processing...'}
                                            page={pagePag}
                                            showPagination={false}
                                            resizable={false}
                                            data={DATA}
                                            defaultPageSize={totalRows}
                                            getTrProps={(state, rowInfo) => {
                                                {
                                                    if (rowInfo) {
                                                        return {
                                                            style: {
                                                                background: rowInfo.index % 2 ? '#F7F7F8' : 'white',
                                                                borderBottom: 'none',
                                                                display: 'grid',
                                                                gridTemplate: '1fr/ 15% repeat(5,5%) 20% 5% 20% 15%'
                                                            }
                                                        };
                                                    } else {
                                                        return {
                                                            style: {
                                                                borderBottom: 'none',
                                                                display: 'grid',
                                                                gridTemplate: '1fr/ 15% repeat(5,5%) 20% 5% 20% 15%'
                                                            }
                                                        };
                                                    }
                                                }
                                            }
                                            }
                                            getTrGroupProps={() => {
                                                return {
                                                    style: {
                                                        borderBottom: 'none'
                                                    }
                                                };
                                            }}
                                            getNoDataProps={() => {
                                                return {
                                                    style: {
                                                        marginTop: '60px'
                                                    }
                                                };
                                            }}
                                            getTheadTrProps={() => {
                                                return {
                                                    style: {
                                                        background: '#F7F7F8',
                                                        color: '#333333',
                                                        fontWeight: 'bold',
                                                        display: 'grid',
                                                        gridTemplate: '1fr/ 15% repeat(5,5%) 20% 5% 20% 15%'
                                                    }
                                                };
                                            }}
                                            columns={[
                                                {
                                                    Header: () => (
                                                        <div className="table__headerSticky">
                                                            <div className="pointer flex flexCenterHorizontal" onClick={() => { this.setSortColumn('name') }}>
                                                                NAME
                                                                    <div className="flexColumn table__sort">
                                                                    <ArrowTop color={sortColumn.column === 'name' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                    <ArrowDown color={sortColumn.column === 'name' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                    headerClassName: 'stycky w100I',
                                                    className: ' stycky table__cellSticky h100 w100I',
                                                    // Header: "Creation",
                                                    accessor: 'name',
                                                    sortable: false,
                                                    Cell: props => {
                                                        return (
                                                            <div
                                                                className="h100 flex flexCenterVertical"
                                                                style={{
                                                                    marginLeft: "5px",
                                                                    background: props.index % 2 ? "#F7F7F8" : "white"
                                                                }}>
                                                                {props.value}
                                                            </div>
                                                        )
                                                    }
                                                },
                                                {
                                                    Header: () => (
                                                        <div className="table__header">
                                                            <div className="pointer flex flexCenterHorizontal" onClick={() => { this.setSortColumn('age') }}>
                                                                AGE
                                                                    <div className="flexColumn table__sort">
                                                                    <ArrowTop color={sortColumn.column === 'age' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                    <ArrowDown color={sortColumn.column === 'age' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                    headerClassName: 'w100I',
                                                    accessor: 'age',
                                                    className: 'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
                                                    sortable: false,
                                                    Cell: props => <div className="h100 flex flexCenterVertical flexCenterHorizontal">
                                                        {props.value}
                                                    </div>
                                                },
                                                {
                                                    Header: () => (
                                                        <div className="table__header">
                                                            <div className="pointer flex flexCenterHorizontal" onClick={() => { this.setSortColumn('job') }}>
                                                                JOB
                                                                    <div className="flexColumn table__sort">
                                                                    <ArrowTop color={sortColumn.column === 'job' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                    <ArrowDown color={sortColumn.column === 'job' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                    headerClassName: 'w100I',
                                                    accessor: 'job',
                                                    className: 'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
                                                    sortable: false,
                                                    Cell: props => <div className="h100 flex flexCenterVertical flexCenterHorizontal">
                                                        {props.value}
                                                    </div>
                                                }
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                <Modal
                    hidden={hidden}
                    _onClose={this._onClose}
                    confirmAction={this.confirmAction}
                >
                    {this.returnActionPopUp(action)}
                </Modal>
            </div>
        );
    }
}