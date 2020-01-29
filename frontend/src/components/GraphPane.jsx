import React from 'react';
import PropTypes from 'prop-types';
import { SensorValueType } from '../propy-types';
import { Charts, ChartContainer, ChartRow, YAxis, LineChart, styler } from 'react-timeseries-charts';
import { TimeSeries } from 'pondjs';

const convertDateTimeToTimestamp = (datetime) => {
  return new Date(datetime).getTime();
}

const GraphPane = ({ values }) => {
  values.sort((value1, value2) => value1.timestamp < value2.timestamp ? -1 : 1);

  const minimumTemperature = Math.min(...values.map(({ value }) => value));
  const maximumTemperature = Math.max(...values.map(({ value }) => value));

  const data = {
    name: 'temperature',
    columns: ['time', 'temperature'],
    points: values.map(({ timestamp, value }) => { return [ convertDateTimeToTimestamp(timestamp),  value ]; })
  };

  const timeseries = new TimeSeries(data);
  const chartStyle = styler([{ key: 'temperature', color: 'rgb(115, 130, 255)', width: 2 }]);

  return (
    <ChartContainer
      utc={ true }
      timeRange={ timeseries.timerange() }
      showGridPosition='over'
      width={ 800 } >
      <ChartRow height={ 300 } >
        <YAxis 
            id='temperature' 
            label='Temperature (°C)' 
            labelOffset={ -5 } 
            min={ minimumTemperature - 5 } 
            max={ maximumTemperature + 5 } 
            width='80' 
            type='linear' 
            format=',.1f' />
        <Charts>
            <LineChart
                axis='temperature'
                series={ timeseries }
                columns={ ['temperature'] }
                style={ chartStyle } />
        </Charts>
      </ChartRow>
    </ChartContainer>
  );
};

GraphPane.propTypes = {
  values: PropTypes.arrayOf(SensorValueType).isRequired
};

export default GraphPane;