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
import jsoncsv from 'json-2-csv';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const greenColor = '#007E8A';
const textGray = '#767B7F';
const grayColor = '#ADADAD';
const KEYS_TO_FILTERS = [
    'name',
    'type',
    'location',
    'status',
    'message'
];

const DATA = [
    { name: "pepe", age: 26, job: "farmer" },
    { name: "pepe 2", age: 26, job: "farmer" },
    { name: "pepe 3", age: 26, job: "farmer" },
    { name: "pepe 4", age: 26, job: "farmer" },
    { name: "pepe 5", age: 26, job: "farmer" }
]

export default class Synthetics extends React.Component {
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
            searchTermTest: '',
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
            emptyData: false,////
            data: [],
            dataRespaldo: []
        };
    }

    componentDidMount() {
        const { testList } = this.props;
        const data = [];
        for (const test of testList) {
            let loca = '';
            const limitData = test.locations.splice(0, 3);
            for (const location of limitData) {
                loca = ` ${loca} ${location} \n`;
            }
            test.location = loca;
            data.push(test);
        }
        this.setState({ data, dataRespaldo: data });
        this.calcTable(data);
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
        const { dataRespaldo, sortColumn } = this.state;
        this.loadData(dataRespaldo, term, sortColumn);
        this.setState({ searchTermTest: term });
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
        const { sortColumn, data, searchTermTest } = this.state;
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
        this.loadData(data, searchTermTest, {
            column: column,
            order: order
        })
        this.setState({
            sortColumn: {
                column: column,
                order: order
            }
        });
    }

    loadData = (test, searchTerm, sortColumn) => {
        let finalList = test;
        if (searchTerm !== '') {
            finalList = finalList.filter(createFilter(searchTerm, KEYS_TO_FILTERS));
        }
        finalList = this.sortData(finalList, sortColumn);
        this.calcTable(finalList);
        this.setState({ data: finalList });
    };

    sortData = (finalList, { order, column }) => {
        let valueOne = 1;
        let valueTwo = -1;
        if (order === 'descent') {
            valueOne = -1;
            valueTwo = 1;
        }
        switch (column) {
            case 'name':
                // eslint-disable-next-line no-case-declarations
                const sortName = finalList.sort(function (a, b) {
                    if (a.name > b.name) {
                        return valueOne;
                    }
                    if (a.name < b.name) {
                        return valueTwo;
                    }
                    return 0;
                });
                return sortName;
            case 'type':
                // eslint-disable-next-line no-case-declarations
                const sortType = finalList.sort(function (a, b) {
                    if (a.type > b.type) {
                        return valueOne;
                    }
                    if (a.type < b.type) {
                        return valueTwo;
                    }
                    return 0;
                });
                return sortType;
            case 'status':
                // eslint-disable-next-line no-case-declarations
                const sortStatus = finalList.sort(function (a, b) {
                    if (a.status > b.status) {
                        return valueOne;
                    }
                    if (a.status < b.status) {
                        return valueTwo;
                    }
                    return 0;
                });
                return sortStatus;
            case 'message':
                // eslint-disable-next-line no-case-declarations
                const sortMessage = finalList.sort(function (a, b) {
                    if (a.message > b.message) {
                        return valueOne;
                    }
                    if (a.message < b.message) {
                        return valueTwo;
                    }
                    return 0;
                });
                return sortMessage;
            case 'location':
                // eslint-disable-next-line no-case-declarations
                const sortLocation = finalList.sort(function (a, b) {
                    if (a.location > b.location) {
                        return valueOne;
                    }
                    if (a.location < b.location) {
                        return valueTwo;
                    }
                    return 0;
                });
                return sortLocation;
            default:
                return finalList;
        }
    };

    /**
   * method that calculates the total number of pages to show
   *
   * @memberof Migration
   */
    calcTable = finalList => {
        const { totalRows, pagePag } = this.state;
        const aux = finalList.length % totalRows;
        let totalPages = 0;
        if (aux === 0) {
            totalPages = finalList.length / totalRows;
        } else {
            totalPages = Math.trunc(finalList.length / totalRows) + 1;
        }

        let pageNext = 0;
        if (pagePag < totalPages - 1 || pagePag === totalPages - 1) {
            pageNext = pagePag;
        } else if (pagePag > totalPages - 1) {
            pageNext = totalPages <= 0 ? 0 : totalPages - 1;
        }
        this.setState({ pages: totalPages, pagePag: pageNext });
    };

    downloadData = async () => {
        const { testList } = this.props;
        const date = new Date();
        const zip = new JSZip();
        jsoncsv.json2csv(testList, (err, csv) => {
            if (err) {
                throw err;
            }
            zip.file(`Test .csv`, csv);
            zip.generateAsync({ type: 'blob' }).then(function (content) {
                // see FileSaver.js
                saveAs(
                    content,
                    `Test ${date.getDate()}-${date.getMonth() +
                    1}-${date.getFullYear()}.zip`
                );
            });
        });
    };

    render() {
        const {
            loading,
            savingAllChecks,
            pagePag,
            pages,
            totalRows,
            hidden,
            sortColumn,
            action,
            data
        } = this.state;
        const { testTotal } = this.props;
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
                                        Total tests
                                    </span>
                                    <div>
                                        <span
                                            className="box--quantity"
                                            style={{
                                                color: greenColor
                                            }}>
                                            {testTotal}
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
                                    <div className={data.length === 0 ? 'pointerBlock flex flexCenterVertical' : 'pointer flex flexCenterVertical'}
                                        onClick={() => {
                                            if (data.length !== 0)
                                                this.downloadData();
                                        }}
                                    >
                                        <img src={iconDownload} style={{ marginLeft: "20px" }} height="18px" />
                                    </div>
                                    {data.length !== 0 &&
                                        <Pagination
                                            page={pagePag}
                                            pages={pages}
                                            upPage={this.upPage}
                                            goToPage={this.changePage}
                                            downPage={this.downPage}
                                        />}
                                </div>
                                <div className="tableContent__table">
                                    <div className="h100">
                                        <ReactTable
                                            loading={savingAllChecks}
                                            loadingText={'Processing...'}
                                            page={pagePag}
                                            showPagination={false}
                                            resizable={false}
                                            data={data}
                                            defaultPageSize={totalRows}
                                            getTrProps={(state, rowInfo) => {
                                                {
                                                    if (rowInfo) {
                                                        return {
                                                            style: {
                                                                background: rowInfo.index % 2 ? '#F7F7F8' : 'white',
                                                                borderBottom: 'none',
                                                                display: 'grid',
                                                                gridTemplate: '1fr/ 40% 10% 10% 20% 20%'
                                                            }
                                                        };
                                                    } else {
                                                        return {
                                                            style: {
                                                                borderBottom: 'none',
                                                                display: 'grid',
                                                                gridTemplate: '1fr/40% 10% 10% 20% 20%'
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
                                                        gridTemplate: '1fr/ 40% 10% 10% 20% 20%'
                                                    }
                                                };
                                            }}
                                            columns={[
                                                {
                                                    Header: () => (
                                                        <div className="table__headerSticky">
                                                            <div className="pointer flex " style={{ marginLeft: "15px" }} onClick={() => { this.setSortColumn('name') }}>
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
                                                    accessor: 'name',
                                                    sortable: false,
                                                    Cell: props => {
                                                        return (
                                                            <div
                                                                className="h100 flex flexCenterVertical"
                                                                style={{
                                                                    background: props.index % 2 ? "#F7F7F8" : "white",
                                                                    color: "#0078BF"
                                                                }}>
                                                                <span style={{ marginLeft: "5px" }}>{props.value}</span>
                                                            </div>
                                                        )
                                                    }
                                                },
                                                {
                                                    Header: () => (
                                                        <div className="table__header">
                                                            <div className="pointer flex" onClick={() => { this.setSortColumn('type') }}>
                                                                TYPE
                                                        <div className="flexColumn table__sort ">
                                                                    <ArrowTop color={sortColumn.column === 'type' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                    <ArrowDown color={sortColumn.column === 'type' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                    headerClassName: 'w100I',
                                                    accessor: 'type',
                                                    className: 'table__cell flex flexCenterVertical h100 w100I',
                                                    sortable: false,
                                                    Cell: props => <div className="h100 flex flexCenterVertical">
                                                        {props.value ? props.value : 0}
                                                    </div>
                                                },

                                                {
                                                    Header: () => (
                                                        <div className="table__header">
                                                            <div className="pointer flex" onClick={() => { this.setSortColumn('location') }}>
                                                                LOCATION
                                                                    <div className="flexColumn table__sort">
                                                                    <ArrowTop color={sortColumn.column === 'location' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                    <ArrowDown color={sortColumn.column === 'location' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                    headerClassName: 'w100I',
                                                    accessor: 'location',
                                                    className: 'table__cell flex flexCenterVertical h100 w100I',
                                                    sortable: false,
                                                    Cell: props => <div className="h100 flex flexCenterVertical">
                                                        {props.value}
                                                    </div>
                                                },
                                                {
                                                    Header: () => (
                                                        <div className="table__header">
                                                            <div className="pointer flex" onClick={() => { this.setSortColumn('status') }}>
                                                                STATUS
                                                                    <div className="flexColumn table__sort">
                                                                    <ArrowTop color={sortColumn.column === 'status' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                    <ArrowDown color={sortColumn.column === 'status' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                    headerClassName: 'w100I',
                                                    accessor: 'status',
                                                    className: 'table__cell flex flexCenterVertical h100 w100I',
                                                    sortable: false,
                                                    Cell: props => <div className="h100 flex flexCenterVertical">
                                                        {props.value}
                                                    </div>
                                                },
                                                {
                                                    Header: () => (
                                                        <div className="table__header">
                                                            <div className="pointer flex" onClick={() => { this.setSortColumn('message') }}>
                                                                MESSAGE
                                                                    <div className="flexColumn table__sort">
                                                                    <ArrowTop color={sortColumn.column === 'message' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                    <ArrowDown color={sortColumn.column === 'message' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                    headerClassName: 'w100I',
                                                    accessor: 'message',
                                                    className: 'table__cell flex flexCenterVertical h100 w100I',
                                                    sortable: false,
                                                    Cell: props => <div className="h100 flex flexCenterVertical">
                                                        {props.value !== '' ? props.value : '___'}
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
