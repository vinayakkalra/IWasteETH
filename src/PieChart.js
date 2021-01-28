import React from 'react';
import {PieChart} from 'react-minimal-pie-chart'

export default class PieChartComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            redValue : this.props.redValue,
            blueValue : this.props.blueValue,
            hovered : undefined,
            data : [
                { title: 'One', value:this.props.blueValue, color: '#346099' },
                { title: 'Two', value:this.props.redValue, color: '#C13C37' },
            ],
            selected: 0
        };
    }
    comma(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    render() {
        
        const lineWidth = 60;

        const data = this.state.data.map((entry, i) => {
            if (this.state.hovered === i) {
              return {
                ...entry,
                color: 'grey',
              };
            }
            return entry;
        });

        return (
            <div>
                <PieChart
                data={data}
                label={({ dataEntry }) => 'US$ '+ this.comma(dataEntry.value.toFixed(2))}
                labelStyle={{
                    fontSize: '7px',
                    fontFamily: 'Roboto',
                    fill: '#000',
                    opacity: 0.9,
                    pointerEvents: 'none',
                }}
                radius={PieChart.defaultProps.radius - 6}
                lineWidth={60}
                segmentsStyle={{ transition: 'stroke .3s', cursor: 'pointer' }}
                segmentsShift={(index) => (index === this.state.selected ? 6 : 1)}
                animate
                labelPosition={100 - lineWidth / 2}
                onClick={(_, index) => {
                    this.setState({selected : index === this.state.selected ? undefined : index});
                }}
                onMouseOver={(_, index) => {
                    this.setState({hovered : index});
                }}
                onMouseOut={() => {
                    this.setState({hovered : undefined});
                }}
                startAngle={-90}
                lengthAngle={360}
                
                />
            </div>
            
        );
    }
  
}

// export default PieChartComponent;
