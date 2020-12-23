/* eslint-disable react/no-deprecated */
import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table-v6';
import { Spinner } from 'nr1';
import {
    readNerdStorage,
    readNerdStorageOnlyCollection,
    writeNerdStorage,
    recoveDataDashboards
} from '../../services/NerdStorage/api';
import iconDownload from '../../images/download.svg';
import ArrowDown from '../../components/ArrowsTable/ArrowDown';
import ArrowTop from '../../components/ArrowsTable/ArrowTop';
import Modal from '../../components/Modal';

import { Tooltip } from 'nr1';
import { sendLogsSlack } from '../../services/Wigilabs/api';
import Select from 'react-select';
import SearchInput, { createFilter } from 'react-search-input';
import { BsSearch } from 'react-icons/bs';
import Pagination from '../../components/Pagination/Pagination';
import Bar from '../../components/Bar';
import JSZip from 'jszip';
import jsoncsv from 'json-2-csv';
import { saveAs } from 'file-saver';
/**
 * Constants of colours
 */
const blueColor = '#007E8A';
const textGray = '#767B7F';
const grayColor = '#ADADAD';
const greyNoneColor = '#ECEEEE';


const KEYS_TO_FILTERS = ['name', 'created', 'modified']

/**
 * Class that render the Dashboard Component
 *
 * @export
 * @class Dashboard
 * @extends {React.Component}
 */
export default class Dashboard extends React.Component {
    /**
     * Creates an instance of Dashboard.
     *
     * @param {*} props
     * @memberof Dashboard
     */
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

    /**
     * Method called when the component was mounted
     *
     * @memberof Dashboard
     */
    componentWillMount() {
        this.setState({ loading: true });
        this.loadDashboards();
    }

    customStyles = {
        option: provided => ({
            ...provided,
            fontSize: 13
        }),
        control: styles => ({
            ...styles,
            backgroundColor: 'white',
            textTransform: 'capitalize',
            fontSize: '12px',
            lineHeight: '16px',
            fontFamily: 'Open Sans'
        }),
        singleValue: (provided, state) => {
            const opacity = state.isDisabled ? 0.5 : 1;
            const transition = 'opacity 300ms';
            return { ...provided, opacity, transition };
        },
        menuList: provided => ({
            ...provided,
            textTransform: 'capitalize'
        }),
        menu: provided => ({
            ...provided,
            textTransform: 'capitalize'
        }),
        container: provided => ({
            ...provided,
            width: "100%"
        })
    };

    /**
     * Method that reads the Dashboards collection on NerdStorage
     *
     * @returns Dashboards array
     * @memberof Dashboard
     */
    async loadNerdData() {
        const error = [];
        let nerdDashboards = [];
        const { accountId } = this.props;
        // Recuperar la lista de dashboards
        try {
            const list = [];
            const sizeList = await readNerdStorageOnlyCollection(
                accountId,
                'dashboards',
                this.reportLogFetch
            );
            for (let i = 0; i < sizeList.length - 1; i++) {
                const page = await readNerdStorage(
                    accountId,
                    'dashboards',
                    `dashboards-${i}`,
                    this.reportLogFetch
                );
                if (page) {
                    for (const iterator of page) {
                        list.push(iterator);
                    }
                }
            }
            const dashboardObj = await readNerdStorage(
                accountId,
                'dashboards',
                `dashboards-obj`,
                this.reportLogFetch
            );
            if (dashboardObj.status === "EMPTY") {
                this.setState({ emptyData: true });
            }
            nerdDashboards = list;
        } catch (err) {
            error.push(err);
        }

        return nerdDashboards;
    }


    pagesOfData = list => {
        const limit = 1000000;
        let page = [];
        const book = [];
        let pageTemporal = [];
        for (const key in list) {
            if (list[key]) {
                pageTemporal = [...page];
                if (page) {
                    pageTemporal.push(list[key]);
                    if (JSON.stringify(pageTemporal).length >= limit) {
                        if (page.length !== 0) {
                            book.push(page);
                        }
                        page = [];
                        page.push(list[key]);
                    } else {
                        page = pageTemporal;
                        pageTemporal = [];
                    }
                    if (parseInt(key) === parseInt(list.length - 1)) {
                        book.push(page);
                    }
                }
            }
        }
        return book;
    };


    /**
     * Method that change the wantMigrate property for a Dashboard
     *
     * @param {number} id Dashboard id to modify
     * @memberof Dashboard
     */
    changeCheck = async (id) => {
        this.setState({ savingAllChecks: true, allChecked: false });
        const { dashboards, all, favorite, favoriteDashboards, mostVisited, complex, listChecked, searchTermDashboards, sortColumn } = this.state;
        for (const item of dashboards) {
            if (item.id === id) {
                item.select = !item.select
            }
        }
        this.setState({ savingAllChecks: false, dashboards });
        this.loadData(all, favorite, dashboards, favoriteDashboards, mostVisited, complex, listChecked, searchTermDashboards, sortColumn);
    }

    reportLogFetch = async response => {
        console.log('error ', response);
        const { logs } = this.state;
        const arrayLogs = logs;
        arrayLogs.push({
            message: response.message,
            event: response.event,
            type: response.type,
            date: response.date
        });
        this.setState({ logs: arrayLogs });
    };

    async sendLogs(accountId) {
        const { logs } = this.state;
        if (logs.length !== 0) {
            await sendLogsSlack(logs, accountId);
            this.setState({ logs: [] });
        }
    }

    /**
     * Method that receives the dashboards from NerdStorage and saves it on state
     *
     * @memberof Dashboard
     */
    async loadDashboards() {
        const { searchTermDashboards, sortColumn } = this.state;
        const dataDashboards = await this.loadNerdData();
        //average widgets
        let quantityTotal = 0;
        for (const dd of dataDashboards) {
            quantityTotal += dd.widgets.length;
        }
        this.setState({
            dashboards: dataDashboards,
            loading: false,
            savingAllChecks: false,
            average: Math.round(quantityTotal / dataDashboards.length)
        });
        this.loadData(dataDashboards, searchTermDashboards, sortColumn);
    }

    /**
     * Method that change the wantMigrate property for all the Dashboards
     *
     * @memberof Dashboard
     */
    async selectAllDash() {
        this.setState({ savingAllChecks: true });
        const { all, allChecked, dashboards, favorite, favoriteDashboards, mostVisited, complex, listChecked, searchTermDashboards, sortColumn } = this.state;
        if (allChecked) {
            for (const item of dashboards) {
                item.select = false;
            }
            this.setState({ allChecked: false });
            this.loadData(all, favorite, dashboards, favoriteDashboards, mostVisited, complex, listChecked, searchTermDashboards, sortColumn);
        } else {
            let allChecked = true;
            for (const item of dashboards) {
                if (!item.select) {
                    item.select = true;
                }
            }
            for (const iterator of dashboards) {
                if (!iterator.select) {
                    allChecked = false;
                }
            }
            this.setState({ allChecked: allChecked });
            this.loadData(all, favorite, dashboards, favoriteDashboards, mostVisited, complex, listChecked, searchTermDashboards, sortColumn);
        }
        this.setState({ savingAllChecks: false });
    }


    /**
     * Method that mutate a Dashboard document
     *
     * @param {Object} item Dashboard to mutate
     * @memberof Dashboard
     */
    async saveDashboard(item) {
        const { accountId } = this.props;
        await writeNerdStorage(
            accountId,
            'ddDashboards',
            item.id,
            item,
            this.reportLogFetch
        );
        this.sendLogs();
    }

    /**
     * Method that change the selected category filter
     * @param {*} value
     * @memberof Dashboard
     */
    changeSelected(value) {
        let { dashboards, favoriteDashboards, mostVisited, complex, listChecked, searchTermDashboards, sortColumn } = this.state;
        switch (value) {
            case 1:
                this.setState({
                    all: true,
                    favorite: false,
                    visited: false,
                    selectedTag: { value: "All", label: "All" }
                });
                this.loadData(true, false, dashboards, favoriteDashboards, mostVisited, complex, listChecked, searchTermDashboards, sortColumn);
                break;
            case 2:
                this.setState({
                    all: false,
                    favorite: true,
                    visited: false,
                    selectedTag: { value: "Favorites", label: "Favorites" }
                });
                this.loadData(false, true, dashboards, favoriteDashboards, mostVisited, complex, listChecked, searchTermDashboards, sortColumn);
                break;
            case 3:
                this.setState({
                    all: false,
                    favorite: false,
                    visited: true,
                    selectedTag: { value: "MostVisited", label: "Most visited" }
                });
                this.loadData(false, false, dashboards, favoriteDashboards, mostVisited, complex, listChecked, searchTermDashboards, sortColumn);
                break;
            default:
                break;
        }
    }

    /**
     * Method that filter the dashboards according to complexity filter
     *
     * @param {*} list
     * @returns
     * @memberof Dashboard
     */
    filterComplexDashboard(list, complex, listChecked) {
        if (complex !== '') {
            complex = complex === "low" ? "nerdlet" : complex;
            const finalList = [];
            if (listChecked.id !== 0) {
                const filterCheck = [];
                for (const dashboard of listChecked.dashboards) {
                    filterCheck.push(list.find(obj => obj.id === dashboard.id));
                }
                list = filterCheck;
            }
            for (const item of list) {
                if (item.complexity === complex) {
                    finalList.push(item);
                }
            }
            return finalList;
        } else if (listChecked.id !== 0) {
            const dataFilter = [];
            for (const dashboard of listChecked.dashboards) {
                const searchList = list.find(obj => obj.id === dashboard.id);
                if (searchList) {
                    dataFilter.push(searchList);
                }
            }
            return dataFilter;
        } else {
            return list;
        }
    }

    /**
     * Method that populates the complexity graphics from a selected category filter
     *
     * @returns
     * @memberof Dashboard
     */
    setComplexData() {
        const {
            all,
            favorite,
            dashboards,
            favoriteDashboards,
            mostVisited
        } = this.state;
        let nerdlet = 0;
        let high = 0;
        let medium = 0;
        let total = 0;
        let array = [];
        if (all) {
            total = dashboards.length;
            array = dashboards;
        } else if (favorite) {
            total = favoriteDashboards.length;
            array = favoriteDashboards;
        } else {
            total = mostVisited.length;
            array = mostVisited;
        }
        for (const item of array) {
            switch (item.complexity) {
                case 'nerdlet':
                    nerdlet += 1;
                    break;
                case 'high':
                    high += 1;
                    break;
                case 'medium':
                    medium += 1;
                    break;
                default:
                    break;
            }
        }
        const complexData = [
            [
                {
                    name: 'Low',
                    uv: nerdlet,
                    pv: total - nerdlet
                }
            ],
            [
                {
                    name: 'Medium',
                    uv: medium,
                    pv: total - medium
                }
            ],
            [
                {
                    name: 'High',
                    uv: high,
                    pv: total - high
                }
            ]
        ];
        return complexData;
    }


    handleChangeListPopUp = (value) => {
        this.setState({ valueListPopUp: value });
    }

    checkList = (listSelected) => {
        const { all, favorite, dashboards, favoriteDashboards, mostVisited, complex, searchTermDashboards, sortColumn } = this.state;
        if (listSelected.id === 0) {
            this.loadData(all, favorite, dashboards, favoriteDashboards, mostVisited, complex, { id: 0 }, searchTermDashboards, sortColumn);
            this.setState({ listChecked: listSelected });
        } else {
            this.setState({ listChecked: listSelected });
            this.loadData(all, favorite, dashboards, favoriteDashboards, mostVisited, complex, listSelected, searchTermDashboards, sortColumn);
        }
    }

    /**
  * method that changes the table to the next page
  *
  * @memberof Migration
  */
    upPage = () => {
        const { pagePag } = this.state;
        this.setState({ pagePag: pagePag + 1 });
    };

    /**
     * Method that change the table to the selected page
     *
     * @memberof Migration
     * @param {number} pagePag Destination page
     */
    changePage = pagePag => {
        this.setState({ pagePag: pagePag - 1 });
    };

    /**
     * Method that changes the table to the previous page
     *
     * @memberof Migration
     */
    downPage = () => {
        const { pagePag } = this.state;
        this.setState({ pagePag: pagePag - 1 });
    };

    /**
     * method that calculates the total number of pages to show
     *
     * @memberof Migration
     */
    calcTable = (finalList) => {
        let { totalRows, pagePag } = this.state;
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
    }

    loadData = (dashboards, searchTerm, sortColumn) => {
        let finalList = dashboards;
        if (searchTerm !== '') {
            finalList = finalList.filter(createFilter(searchTerm, KEYS_TO_FILTERS));
        }
        finalList = this.sortData(finalList, sortColumn);
        this.calcTable(finalList);
        this.setState({ finalList: finalList });
    }

    searchUpdated = (term) => {
        const { listChecked, all, favorite, dashboards, favoriteDashboards, mostVisited, complex, sortColumn } = this.state;
        this.loadData(all, favorite, dashboards, favoriteDashboards, mostVisited, complex, listChecked, term, sortColumn);
        this.setState({ searchTermDashboards: term });
    }

    setSortColumn = (column) => {
        const { listChecked, all, favorite, dashboards, favoriteDashboards, mostVisited, complex, sortColumn, searchTermDashboards } = this.state;
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

        this.loadData(all, favorite, dashboards, favoriteDashboards, mostVisited, complex, listChecked, searchTermDashboards, { column: column, order: order });
        this.setState({
            sortColumn: {
                column: column,
                order: order
            }
        });
    }

    sortData = (finalList, { order, column }) => {
        let valueOne = 1;
        let valueTwo = -1;
        if (order === 'descent') {
            valueOne = -1;
            valueTwo = 1;
        }
        switch (column) {
            case 'name':
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
            case 'autor':
                const sortAutor = finalList.sort(function (a, b) {
                    if (a.autor > b.autor) {
                        return valueOne;
                    }
                    if (a.autor < b.autor) {
                        return valueTwo;
                    }
                    return 0;
                });
                return sortAutor;
            case 'modified':
                const sortModified = finalList.sort(
                    function (a, b) {
                        const date1 = new Date(a.modified);
                        const date2 = new Date(b.modified);
                        if (date1 > date2) return valueOne;
                        if (date1 < date2) return valueTwo;
                        return 0;
                    }
                );
                return sortModified;
            case 'widgets':
                const sortWidgets = finalList.sort(function (a, b) {
                    if (a.widgets > b.widgets) {
                        return valueOne;
                    }
                    if (a.widgets < b.widgets) {
                        return valueTwo;
                    }
                    return 0;
                });
                return sortWidgets;
            default:
                return finalList;
        }
    }

    saveAction = async (action) => {
        this._onClose();
        this.setState({ action: action });
    }

    saveCheckDownload = (value) => {
        this.setState({ selectFormat: value });
    }

    returnActionPopUp = (action) => {
        const { listPopUp, valueListPopUp, checksDownload, selectFormat } = this.state;
        switch (action) {
            case 'saveFavorite':
                return (
                    <div className="modal__content">
                        <div className="content__title">They will be added to your favorites list</div>
                        <div className="content__buttons">
                            <div className="buttons__buttonCancel pointer" onClick={() => this._onClose()}>Cancel</div>
                            <div className="buttons__buttonConfirm pointer" onClick={() => this.confirmAction('saveFavorite')}>Confirm</div>
                        </div>
                    </div>
                )
            case 'saveList':
                return (
                    <div className="modal__contentAddList">
                        <div className="content__title">Add it to the list you select.</div>
                        <div className="contentAddList__listButton">
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <div style={{ width: "150px" }}>
                                    <Select
                                        classNamePrefix="react-select"
                                        styles={this.customStyles}
                                        isSearchable={false}
                                        options={listPopUp}
                                        onChange={this.handleChangeListPopUp}
                                        value={valueListPopUp}
                                        placeholder="All list"
                                    />
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <div className="listButton__buttonAdd pointer" onClick={() => this.confirmAction('saveList')}>Add</div>
                            </div>
                        </div>
                    </div>
                );
            case 'deleteList':
                return (
                    <div className="modal__content">
                        <div className="content__title">Are you sure to delete from your list.?</div>
                        <div className="content__buttons">
                            <div className="buttons__buttonCancel pointer" onClick={() => this._onClose()}>Cancel</div>
                            <div className="buttons__buttonConfirm pointer" onClick={() => this.confirmAction('deleteList')}>Confirm</div>
                        </div>
                    </div>
                );
            case 'downloadInfo':
                return (
                    <div className="modal__contentDowload">
                        <div className="content__title">Choose the type of download format.</div>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <div style={{ width: "150px" }}>
                                <Select
                                    classNamePrefix="react-select"
                                    styles={this.customStyles}
                                    isSearchable={false}
                                    options={checksDownload}
                                    onChange={this.saveCheckDownload}
                                    value={selectFormat}
                                    placeholder="All list"
                                />
                            </div>
                        </div>
                        <div className="content__buttons">
                            <div className="buttons__buttonCancel pointer" onClick={() => this._onClose()}>Cancel</div>
                            <div className="buttons__buttonConfirm pointer"
                                onClick={() => this.downloadData()}
                            >Download</div>
                        </div>
                    </div>
                );
        }
    }

    downloadData = async () => {
        const { selectFormat, finalList } = this.state;
        const { accountId } = this.props;
        const date = new Date();
        const zip = new JSZip();
        const data = await recoveDataDashboards(accountId);
        let dataFitrada = [];
        for (const iterator of finalList) {
            dataFitrada.push(data.find(dd => dd.id === iterator.id));
        }
        if (selectFormat.value === "JSON") {
            zip.file(`Dashboards.json`, JSON.stringify(dataFitrada, null, 2));
            zip.generateAsync({ type: 'blob' }).then(function (content) {
                // see FileSaver.js
                saveAs(content, `Datadog ${date.getDate()}-${(date.getMonth() + 1)}-${date.getFullYear()}.zip`);
            });
        } else if (selectFormat.value === "CSV") {
            jsoncsv.json2csv(dataFitrada, (err, csv) => {
                if (err) {
                    throw err;
                }
                zip.file(`Dashboards.csv`, csv);
                zip.generateAsync({ type: 'blob' }).then(function (content) {
                    // see FileSaver.js
                    saveAs(content, `Datadog ${date.getDate()}-${(date.getMonth() + 1)}-${date.getFullYear()}.zip`);
                });
            });
        }
        this.setState({ selectFormat: { value: "CSV", label: "CSV" } });
        this._onClose();
    }

    confirmAction = async (action) => {
        this._onClose();
        this.setState({ savingAllChecks: true });
        let { dashboards } = this.state;
        const { accountId } = this.props;
        switch (action) {
            case 'saveFavorite':
                for (const iterator of dashboards) {
                    if (iterator.select && !iterator.favorite) {
                        iterator.isFavorite = true;
                        iterator.select = false;
                    }
                }
                const pagesDashboardsSave = this.pagesOfData(dashboards);
                for (const keyDashboard in pagesDashboardsSave) {
                    if (pagesDashboardsSave[keyDashboard]) {
                        await writeNerdStorage(
                            accountId,
                            `dashboards`,
                            `dashboards-${keyDashboard}`,
                            pagesDashboardsSave[keyDashboard],
                            this.reportLogFetch
                        );
                    }
                }
                this.loadDashboards();
                break;
            case 'saveList':
                const { valueListPopUp } = this.state;
                let modifiedList = false;
                let selectDashboards = [];
                for (const iterator of dashboards) {
                    if (iterator.select) {
                        selectDashboards.push(iterator);
                    }
                }
                for (const selectDashboard of selectDashboards) {
                    const exist = valueListPopUp.dashboards.find(actualDashboard => actualDashboard.id === selectDashboard.id);
                    if (!exist) {
                        valueListPopUp.dashboards.push(selectDashboard);
                        modifiedList = true;
                    }
                }
                if (modifiedList) {
                    const dashBoardObj = await readNerdStorage(
                        accountId,
                        'dashboards',
                        `dashboards-obj`,
                        this.reportLogFetch
                    );
                    for (const ddObj of dashBoardObj.listCategorized) {
                        if (valueListPopUp.id === ddObj.id) {
                            ddObj.dashboards = valueListPopUp.dashboards
                        }
                    }
                    await writeNerdStorage(
                        accountId,
                        'dashboards',
                        `dashboards-obj`,
                        dashBoardObj,
                        this.reportLogFetch
                    );
                    this.loadDashboards();
                }
                break;
            case 'deleteList':
                selectDashboards = [];
                let finalDashoards = dashboards;
                //filter select
                for (const iterator of dashboards) {
                    if (iterator.select) {
                        selectDashboards.push(iterator);
                    }
                }
                for (const selectDD of selectDashboards) {
                    finalDashoards = finalDashoards.filter(dd => dd.id !== selectDD.id);
                }
                const pagesDashboards = this.pagesOfData(finalDashoards);
                if (pagesDashboards.length === 0) {
                    await writeNerdStorage(
                        accountId,
                        'dashboards',
                        `dashboards-0`,
                        [],
                        this.reportLogFetch
                    );
                    const dashBoardObj = await readNerdStorage(
                        accountId,
                        'dashboards',
                        `dashboards-obj`,
                        this.reportLogFetch
                    );
                    dashBoardObj.listCategorized = [];
                    await writeNerdStorage(
                        accountId,
                        'dashboards',
                        `dashboards-obj`,
                        dashBoardObj,
                        this.reportLogFetch
                    );
                    this.setState({ allChecked: false });
                } else {
                    for (const keyDashboard in pagesDashboards) {
                        if (pagesDashboards[keyDashboard]) {
                            await writeNerdStorage(
                                accountId,
                                'dashboards',
                                `dashboards-${keyDashboard}`,
                                pagesDashboards[keyDashboard],
                                this.reportLogFetch
                            );
                        }
                    }
                }
                this.loadDashboards();
                break;
        }
        this.setState({ savingAllChecks: false });
    }

    _onClose = () => {
        let actualValue = this.state.hidden;
        this.setState({ hidden: !actualValue });
    }

    someSelect = (list) => {
        for (const iterator of list) {
            if (iterator.select) {
                return true;
            }
        }
        return false;
    }

    dateToYMD(date) {
        var d = date.getDate();
        var m = date.getMonth() + 1; //Month from 0 to 11
        var y = date.getFullYear();
        return `${(m <= 9 ? '0' + m : m)}/${(d <= 9 ? '0' + d : d)}/${y}`;
    }

    render() {
        const {
            loading,
            all,
            favorite,
            visited,
            dashboards,
            favoriteDashboards,
            mostVisited,
            complex,
            allChecked,
            savingAllChecks,
            availableFilters,
            selectedTag,
            listChecked,
            pagePag,
            pages,
            totalRows,
            finalList,
            textTag,
            hidden,
            sortColumn,
            avaliableList,
            action,
            emptyData,
            average
        } = this.state;
        let { handleChangeMenu } = this.props;
        const complexData = this.setComplexData();
        const someSelect = this.someSelect(finalList);
        return (
            <div className="h100">
                {loading ? (
                    <Spinner type={Spinner.TYPE.DOT} />
                ) : (
                        <div className="mainDashboard">
                            <div className="mainDashboard__filtersOptions">
                                <div className="filterOptions__boxDashboards">
                                    <span
                                        className="boxDashboards--title"
                                        style={{
                                            color: all ? blueColor : textGray
                                        }}>
                                        All
                                    </span>
                                    <div onClick={() => this.changeSelected(1)} className="pointer">
                                        <span
                                            className="boxDashboards--quantity"
                                            style={{
                                                color: all ? blueColor : grayColor
                                            }}>
                                            {dashboards.length}
                                        </span>
                                    </div>
                                </div>
                                <div className="filterOptions__boxDashboards">
                                    <span
                                        className="boxDashboards--title"
                                        style={{
                                            color: favorite ? blueColor : textGray
                                        }}>
                                        Average Number of Widgets
                                    </span>
                                    <div>
                                        <span
                                            className="boxDashboards--quantity"
                                            style={{
                                                color: favorite ? blueColor : grayColor
                                            }}>
                                            {average}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mainDashboard__tableContent">
                                <div className="tableContent__options">
                                    <div className="options__searchDashboards">
                                        <div className="options__divSearch">
                                            <BsSearch size="10px" color={"#767B7F"} />
                                            <SearchInput
                                                className="options--searchInputDashboards"
                                                onChange={this.searchUpdated}
                                            />
                                        </div>
                                    </div>
                                    <div className={finalList.length === 0 ? 'pointerBlock flex flexCenterVertical' : 'pointer flex flexCenterVertical'}
                                        onClick={() => {
                                            if (finalList.length !== 0)
                                                this.saveAction('downloadInfo')
                                        }}
                                    >
                                        <img src={iconDownload} style={{ marginLeft: "20px" }} height="18px" />
                                    </div>
                                    {finalList.length !== 0 &&
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
                                            data={finalList}
                                            defaultPageSize={totalRows}
                                            getTrProps={(state, rowInfo) => {
                                                console.log(state, rowInfo)
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
                                                        console.log(props)
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
                                                            <div className="pointer flex flexCenterHorizontal" onClick={() => { this.setSortColumn('name') }}>
                                                                AUTHOR
                                                                    <div className="flexColumn table__sort">
                                                                    <ArrowTop color={sortColumn.column === 'name' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                    <ArrowDown color={sortColumn.column === 'name' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                    headerClassName: 'w100I',
                                                    accessor: 'autor',
                                                    className: 'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
                                                    sortable: false,
                                                    Cell: props => <div className="h100 flex flexCenterVertical flexCenterHorizontal">
                                                        {props.value !== '' ? props.value : '________'}
                                                    </div>
                                                },
                                                {
                                                    Header: () => (
                                                        <div className="table__header">
                                                            <div className="pointer flex flexCenterHorizontal" onClick={() => { this.setSortColumn('name') }}>
                                                                CREATION DATE
                                                                    <div className="flexColumn table__sort">
                                                                    <ArrowTop color={sortColumn.column === 'name' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                    <ArrowDown color={sortColumn.column === 'name' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                    headerClassName: 'w100I',
                                                    accessor: 'creation',
                                                    className: 'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
                                                    sortable: false,
                                                    Cell: props => <div className="h100 flex flexCenterVertical flexCenterHorizontal">
                                                        {this.dateToYMD(new Date(props.value))}
                                                    </div>
                                                },
                                                {
                                                    Header: () => (
                                                        <div className="table__header">
                                                            <div className="pointer flex flexCenterHorizontal" onClick={() => { this.setSortColumn('name') }}>
                                                                MOD DATE
                                                                    <div className="flexColumn table__sort">
                                                                    <ArrowTop color={sortColumn.column === 'name' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                    <ArrowDown color={sortColumn.column === 'name' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                    headerClassName: 'w100I',
                                                    accessor: 'modified',
                                                    className: 'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
                                                    sortable: false,
                                                    Cell: props => <div className="h100 flex flexCenterVertical flexCenterHorizontal">{this.dateToYMD(new Date(props.value))}</div>
                                                },
                                                {
                                                    Header: () => (
                                                        <div className="table__header">
                                                            <div className="pointer flex flexCenterHorizontal" onClick={() => { this.setSortColumn('name') }}>
                                                                POPULARITY
                                                                    <div className="flexColumn table__sort">
                                                                    <ArrowTop color={sortColumn.column === 'name' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                    <ArrowDown color={sortColumn.column === 'name' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                    headerClassName: 'w100I',
                                                    accessor: 'popularity',
                                                    className: 'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
                                                    sortable: false,
                                                    Cell: props => <div className="h100 flex flexCenterVertical flexCenterHorizontal">
                                                        {props.value ? props.value : 0}
                                                    </div>
                                                },
                                                {
                                                    Header: () => (
                                                        <div className="table__header">
                                                            <div className="pointer flex flexCenterHorizontal" onClick={() => { this.setSortColumn('name') }}>
                                                                WIDGETS
                                                                    <div className="flexColumn table__sort">
                                                                    <ArrowTop color={sortColumn.column === 'name' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                    <ArrowDown color={sortColumn.column === 'name' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                    headerClassName: 'w100I',
                                                    accessor: 'widgets',
                                                    className: 'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
                                                    sortable: false,
                                                    Cell: props => <div className="h100 flex flexCenterVertical flexCenterHorizontal">{props.value.length}</div>
                                                },
                                                {
                                                    Header: () => (
                                                        <div className="table__header">
                                                            <div className="pointer flex flexCenterHorizontal" onClick={() => { this.setSortColumn('name') }}>
                                                                DESCRIPTION
                                                                    <div className="flexColumn table__sort">
                                                                    <ArrowTop color={sortColumn.column === 'name' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                    <ArrowDown color={sortColumn.column === 'name' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                    headerClassName: 'w100I',
                                                    accessor: 'description',
                                                    className: 'table__cellLongText table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
                                                    sortable: false,
                                                    Cell: props => {
                                                        let txtDescription = '________';
                                                        if (props.value) {
                                                            txtDescription = props.value;
                                                            if (txtDescription.length > 300) {
                                                                txtDescription = `${txtDescription.substring(0, 301)}...`;
                                                            }
                                                        }
                                                        return (<div className="h100 flex flexCenterVertical flexCenterHorizontal">
                                                            {txtDescription}
                                                        </div>)
                                                    }
                                                },
                                                {
                                                    Header: () => (
                                                        <div className="table__header">
                                                            <div className="pointer flex flexCenterHorizontal" onClick={() => { this.setSortColumn('name') }}>
                                                                LAYOUT TYPE
                                                                    <div className="flexColumn table__sort">
                                                                    <ArrowTop color={sortColumn.column === 'name' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                    <ArrowDown color={sortColumn.column === 'name' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                    headerClassName: 'w100I',
                                                    accessor: 'layoutType',
                                                    className: 'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
                                                    sortable: false,
                                                    Cell: props => <div className="h100 flex flexCenterVertical flexCenterHorizontal">{props.value}</div>
                                                },
                                                {
                                                    Header: () => (
                                                        <div className="table__header">
                                                            <div className="pointer flex flexCenterHorizontal" onClick={() => { this.setSortColumn('name') }}>
                                                                URL
                                                                    <div className="flexColumn table__sort">
                                                                    <ArrowTop color={sortColumn.column === 'name' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                    <ArrowDown color={sortColumn.column === 'name' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                    headerClassName: 'w100I',
                                                    accessor: 'url',
                                                    className: 'table__cell flex flexCenterVertical h100 w100I',
                                                    sortable: false,
                                                    Cell: props => <div className="h100 flex flexCenterVertical flexCenterHorizontal">{props.value}</div>
                                                },
                                                {
                                                    Header: () => (
                                                        <div className="table__header">
                                                            <div className="pointer flex flexCenterHorizontal" onClick={() => { this.setSortColumn('name') }}>
                                                                DASHBOARD LIST
                                                                    <div className="flexColumn table__sort">
                                                                    <ArrowTop color={sortColumn.column === 'name' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                                                    <ArrowDown color={sortColumn.column === 'name' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                    headerClassName: 'w100I',
                                                    accessor: 'dashboardList',
                                                    className: 'table__cell flex flexCenterVertical h100 w100I',
                                                    sortable: false,
                                                    Cell: props => {
                                                        let dashboardsList = '';
                                                        if (props.value.length === 0) {
                                                            dashboardsList = '________';
                                                        }
                                                        for (const iterator of props.value) {
                                                            dashboardsList += ` ${iterator} `;
                                                        }
                                                        return (
                                                            <div>
                                                                {dashboardsList}
                                                            </div>
                                                        )
                                                    }
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

Dashboard.propTypes = {
    accountId: PropTypes.number.isRequired
};