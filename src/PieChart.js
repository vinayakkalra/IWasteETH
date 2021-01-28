import React from 'react';
import {PieChart} from 'react-minimal-pie-chart'

export default class PieChartComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            redValue : this.props.redValue,
            blueValue : this.props.blueValue
        };
    }
    comma(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    render() {
        return (
            <div>
                <PieChart
                data={[
                  { title: 'One', value:this.state.redValue, color: '#346099' },
                  { title: 'Two', value:this.state.blueValue, color: '#C13C37' },
                ]}
                label={({ dataEntry }) => 'US$ '+ this.comma(dataEntry.value.toFixed(0))}
                labelStyle={{
                  fontSize: '7px',
                  fontFamily: 'Roboto',
                  fill: '#fff',
                }}
                startAngle={-90}
                lengthAngle={360}
                />
            </div>
            
        );
    }
  
}

// export default PieChartComponent;
