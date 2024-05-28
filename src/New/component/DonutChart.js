import React from 'react';
import ReactApexChart from 'react-apexcharts';

const defaultColorLogic = (percentage) => {
  if (percentage > 70) {
    return '#23D020';
  } else if (percentage > 50) {
    return '#FFDD00';
  } else {
    return '#FF6347';
  }
};

const DonutChart = ({
  fillPercentage = 30,
  Value = 20,
  label = 'Oral Health Score',
  width = '350px',
  colorLogic = defaultColorLogic
}) => {
  const filledColor = colorLogic(fillPercentage);
  const seriesData = [fillPercentage, 100 - fillPercentage];


  const options = {
    chart: {
      type: 'donut',
      offsetY: -20,
    },
    labels: [label, ''],
    plotOptions: {
      pie: {
        startAngle: -180,
        endAngle: 180,
        donut: {
          size: '85%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '8px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 100,
              color: undefined,
              offsetY: 30,
              formatter: function (fillPercentage) {
                return fillPercentage;
              },
            },
            value: {
              show: true,
              fontSize: '36px',
              label: label,
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 500,
              color: '#4D3280',

              offsetY: -20,
              formatter: function () {
                return `${Value}`;
              },
            },
            total: {
              show: true,
              showAlways: false,
              label: label,
              fontSize: '12px',
              fontWeight: 400,
              color: '#979797',
              formatter: function () {
                return `${Value}`;
              },
            },
          },
        },
      },
    },
    colors: [filledColor, '#DFDAFF'],
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: false,
    },
    stroke: {
      colors: ['#fff'],
    },
  };

  return (
    <div id={`chart-${label.replace(/\s+/g, '-')}`}>
        <ReactApexChart options={options} series={seriesData} type="donut" width={width} />
      </div>
  );
};

export default DonutChart;