import React from 'react';
import flow from '../../images/flow.png';
import Bar from '../../components/Bar';
const dataAgent = [
    { uv: 100, pv: 20, name: "Metrics" },
    { uv: 55, pv: 45, name: "Events" },
    { uv: 40, pv: 160, name: "Logs" },
    { uv: 5, pv: 95, name: "Telemetry" }
];


/**
 * Class that render the Data component
 *
 * @export
 * @class Data
 * @extends {React.Component}
 */
export default class Data extends React.Component {
    /**
     * Creates an instance of Data.
     * @param {*} props
     * @memberof Data
     */
    constructor(props) {
        super(props);
    }

    selectInfo=()=>{

    }

    render() {
        return (
            <div className="mainData h100">
                <div className="mainData__infoAgentes">
                    <div className="infoData__boxData">
                        <span className="boxData--title">
                            Agents
                        </span>
                        <span className="boxData--quantity">
                            10
                        </span>
                    </div>
                    <div className="infoAgentes__namesAgents">
                        {Array.apply(0, Array(10)).map(function (x, i) {
                            return <div key={i} className="namesAgents__name">
                                Name Agent
                        </div>;
                        })}
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <img src={flow} width="80%" />
                </div>
                <div className="mainData__infoData">
                    <div className="infoData__boxSize">
                        <span className="boxData--quantity">
                            200 MB
                        </span>
                    </div>
                    <div>
                        {dataAgent.map((data, index) => {
                            const total = (data.uv * 100) / (data.uv + data.pv);
                            return (
                                <div key={index} className="w100" style={{ paddingBottom: '10px', paddingTop: '10px', width: '94%' }}>
                                    <Bar
                                        bgColor="#ECEEEE"
                                        bgcolorMain="#007E8A"
                                        title={data.name}
                                        quantityPercentage={total}
                                        quantity={data.uv}
                                        actionClick={this.selectInfo}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        );
    }
}
