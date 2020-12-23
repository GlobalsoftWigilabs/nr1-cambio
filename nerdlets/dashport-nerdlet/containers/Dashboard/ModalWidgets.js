import React from 'react';

import ArrowDown from '../../components/ArrowsTable/ArrowDown';
import ArrowTop from '../../components/ArrowsTable/ArrowTop';
import ReactTable from 'react-table-v6';
import Pagination from '../../components/Pagination/Pagination';
import { Modal } from 'react-bootstrap';
import closeIcon from '../../images/close.svg';
import { qregExr } from '../../dd2nr/transpiler/regexr';

export default class ModalWidgets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            // Pagination
            pagePag: 0,
            pages: 0,
            totalRows: 6,
            page: 1,
            ////////////
            sortColumn: {
                column: '',
                order: ''
            },
            hidden: false,
            action: '',
            data: []
        };
    }

    componentDidMount() {
        const {
            infoAditional
        } = this.props;
        const data = [];
        for (const iterator of infoAditional.widgets) {
            data.push(
                {
                    title: iterator.definition.title ? iterator.definition.title : '________',
                    query: this.returnQuery(iterator.definition),
                    type: iterator.definition.type,
                    queryParameters: this.returnParams(iterator.definition),
                    source: this.returnParams(iterator.definition)
                }
            )
        }
        this.setState({ data });
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
        this.setState({ searchTermDashboards: term });
    }

    _onClose = () => {
        let actualValue = this.state.hidden;
        this.setState({ hidden: !actualValue });
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
        this.filterData(sortColumn);
        this.setState({
            sortColumn: {
                column: column,
                order: order
            }
        });
    }

    filterData = (sortColumn) => {
        const { data } = this.state;
        const filterData = this.sortData(data, sortColumn);
        this.setState({ data: filterData });
    }

    sortData = (finalList, { order, column }) => {
        let valueOne = 1;
        let valueTwo = -1;
        if (order === 'descent') {
            valueOne = -1;
            valueTwo = 1;
        }
        switch (column) {
            case 'title':
                const sortTitle = finalList.sort(function (a, b) {
                    if (a.title > b.title) {
                        return valueOne;
                    }
                    if (a.title < b.title) {
                        return valueTwo;
                    }
                    return 0;
                });
                return sortTitle;
            case 'query':
                const sortQuery = finalList.sort(function (a, b) {
                    if (a.query > b.query) {
                        return valueOne;
                    }
                    if (a.query < b.query) {
                        return valueTwo;
                    }
                    return 0;
                });
                return sortQuery;
            case 'type':
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
            case 'queryParameters':
                const sortQueryParamaters = finalList.sort(function (a, b) {
                    if (a.queryParameters > b.queryParameters) {
                        return valueOne;
                    }
                    if (a.queryParameters < b.queryParameters) {
                        return valueTwo;
                    }
                    return 0;
                });
                return sortQueryParamaters;
            case 'source':
                const sortSource = finalList.sort(function (a, b) {
                    if (a.source > b.source) {
                        return valueOne;
                    }
                    if (a.source < b.source) {
                        return valueTwo;
                    }
                    return 0;
                });
                return sortSource;
            default:
                return finalList;
        }
    }

    returnQuery = (definition) => {
        let query = "";
        try {
            if (definition.requests) {
                if (definition.requests instanceof Array) {
                    for (const iterator of definition.requests) {
                        query += ` ${iterator.q} `;
                    }
                } else if (definition.requests.fill) {
                    query += `${definition.requests.fill.q}`;
                } else if (definition.requests.fill && definition.requests.size) {
                    query += `${definition.requests.fill.q}  ${definition.requests.size.q}`;
                } else if (definition.requests.size) {
                    query += ` ${definition.requests.size.q} `;
                }
            } else if (definition.query) {
                query += ` ${definition.query} `;
            }
        } catch (err) {
            if (query === '')
                query = '________';
            return query;
        }
        if (query === '')
            query = '________';
        return query;
    }

    returnParams = (widget) => {
        let query = this.returnQuery(widget);
        const variables = qregExr(query);
        if (variables) {
            if (variables[4]) {
                return variables[4];
            } else {
                return '________';
            }
        } else {
            return '________';
        }
    }

    calcTable = (finalList) => {
        let { totalRows } = this.state;
        const aux = finalList.length % totalRows;
        let totalPages = 0;
        if (aux === 0) {
            totalPages = finalList.length / totalRows;
        } else {
            totalPages = Math.trunc(finalList.length / totalRows) + 1;
        }
        this.setState({ pages: totalPages, pagePag: 0 });
    }

    render() {
        const {
            infoAditional, hidden, _onClose
        } = this.props;
        const { pagePag, totalRows, pages, loading, sortColumn, data } = this.state;
        return (
            <div className="h100">
                <Modal
                    show={hidden}
                    bsSize="large"
                    dialogClassName="w90"
                    onHide={() => _onClose}
                    aria-labelledby="contained-modal-title-vcenter"
                >
                    <Modal.Body>
                        <Modal.Header>
                            <div className=" modalWidgets__closeIcon">
                                <div className="infoAditional--title">{`${infoAditional.name} - Widgets ( ${infoAditional.widgets.length} )`}</div>
                                <div className="flex">
                                    <div style={{ marginRight: "20px" }}>
                                        <Pagination
                                            page={pagePag}
                                            pages={pages}
                                            upPage={this.upPage}
                                            goToPage={this.changePage}
                                            downPage={this.downPage}
                                        />
                                    </div>
                                    <img
                                        onClick={() => { _onClose() }}
                                        className="pointer"
                                        style={{
                                            width: '26px',
                                            height: '26px'
                                        }}
                                        src={closeIcon}
                                    />
                                </div>
                            </div>
                        </Modal.Header>
                        <div>
                            {loading ? (
                                <Spinner type={Spinner.TYPE.DOT} />
                            ) : (
                                    <div className="modal__infoAditional tableContent__table">
                                        <div
                                            style={{ //conditional width: '3000px'
                                                height: "500px"
                                            }}>
                                            <ReactTable
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
                                                                    gridTemplate: '1fr/20% 20% 10% 25% 25% '
                                                                }
                                                            };
                                                        } else {
                                                            return {
                                                                style: {
                                                                    borderBottom: 'none',
                                                                    display: 'grid',
                                                                    gridTemplate: '1fr/ 20% 20% 10% 25% 25%'
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
                                                            gridTemplate: '1fr/ 20% 20% 10% 25% 25%'
                                                        }
                                                    };
                                                }}
                                                columns={[
                                                    {
                                                        Header: () => (
                                                            <div className="table__headerSticky">
                                                                <div className="pointer flex flexCenterHorizontal" style={{ marginLeft: "5px" }} onClick={() => { this.setSortColumn('title') }}>
                                                                    TITLE
                                                                    <div className="flexColumn table__sort">
                                                                        <ArrowTop color={sortColumn.column === 'title' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                        <ArrowDown color={sortColumn.column === 'title' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ),
                                                        headerClassName: 'stycky w100I',
                                                        className: ' stycky table__cellSticky h100 w100I',
                                                        accessor: 'title',
                                                        sortable: false,
                                                        Cell: props => {
                                                            let txtName = '________';
                                                            if (props.value.title) {
                                                                txtName = props.value.title;
                                                                if (txtName.length > 300) {
                                                                    txtName = `${txtName.substring(0, 301)}...`;
                                                                }
                                                            }
                                                            return (
                                                                <div
                                                                    className="h100 flex flexCenterVertical"
                                                                    style={{
                                                                        background: props.index % 2 ? "#F7F7F8" : "white"
                                                                    }}>
                                                                    <span style={{ marginLeft: "5px" }}>
                                                                        {txtName}
                                                                    </span>
                                                                </div>
                                                            )
                                                        }
                                                    },
                                                    {
                                                        Header: () => (
                                                            <div className="table__headerAlignRight">
                                                                <div className="pointer flex " onClick={() => { this.setSortColumn('query') }}>
                                                                    QUERY
                                                                    <div className="flexColumn table__sort">
                                                                        <ArrowTop color={sortColumn.column === 'query' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                        <ArrowDown color={sortColumn.column === 'query' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ),
                                                        headerClassName: 'w100I',
                                                        accessor: 'query',
                                                        className: 'table__cell flex  flexCenterVertical h100 w100I',
                                                        sortable: false,
                                                         Cell: props => <div className="h100 flex flexCenterVertical ">
                                                            {props.value}
                                                        </div>
                                                    },
                                                    {
                                                        Header: () => (
                                                            <div className="table__header">
                                                                <div className="pointer flex " onClick={() => { this.setSortColumn('type') }}>
                                                                    TYPE
                                                                    <div className="flexColumn table__sort">
                                                                        <ArrowTop color={sortColumn.column === 'type' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                        <ArrowDown color={sortColumn.column === 'type' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ),
                                                        headerClassName: 'w100I',
                                                        accessor: 'type',
                                                        className: 'table__cell flex  flexCenterVertical flexCenterHorizontal  h100 w100I',
                                                        sortable: false,
                                                        Cell: props => <div className="h100 flex flexCenterVertical ">
                                                            {props.value}
                                                        </div>
                                                    },
                                                    {
                                                        Header: () => (
                                                            <div className="table__headerAlignRight">
                                                                <div className="pointer flex" onClick={() => { this.setSortColumn('queryParameters') }}>
                                                                    QUERY PARAMETERS
                                                                    <div className="flexColumn table__sort">
                                                                        <ArrowTop color={sortColumn.column === 'queryParameters' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                        <ArrowDown color={sortColumn.column === 'queryParameters' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ),
                                                        headerClassName: 'w100I',
                                                        accessor: 'queryParameters',
                                                        className: 'table__cell flex flexCenterVertical h100 w100I',
                                                        sortable: false,
                                                        Cell: props => <div className="h100 flex flexCenterVertical">
                                                            {props.value}
                                                        </div>
                                                    },
                                                    {
                                                        Header: () => (
                                                            <div className="table__headerAlignRight">
                                                                <div className="pointer flex" onClick={() => { this.setSortColumn('source') }}>
                                                                    SOURCE OF DATA
                                                                    <div className="flexColumn table__sort">
                                                                        <ArrowTop color={sortColumn.column === 'source' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                        <ArrowDown color={sortColumn.column === 'source' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ),
                                                        headerClassName: 'w100I',
                                                        accessor: 'source',
                                                        className: 'table__cell flex flexCenterVertical h100 w100I',
                                                        sortable: false,
                                                        Cell: props => <div className="h100 flex flexCenterVertical">
                                                            {props.value}
                                                        </div>
                                                    }
                                                ]}
                                            />
                                        </div>
                                    </div>
                                )}
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}