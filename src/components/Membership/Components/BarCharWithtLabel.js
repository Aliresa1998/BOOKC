// import React from 'react';
// import Chart from 'react-apexcharts';

// const BarChart = () => {
//   const options = {
//     chart: {
//       id: 'bar-chart'
//     },
//     xaxis: {
//       categories: ['Scaling', 'Root Planing', 'Fluoride Gel', 'Scaling']
//     },
//     title: {
//       text: 'Most Common Preventive Treatments',
//       align: 'center'
//     },
//     plotOptions: {
//       bar: {
//         borderRadius: 4,
//         horizontal: false,
//       }
//     }
//   };

//   const series = [{
//     name: 'Number of Treatments',
//     data:[8, 3, 5, 8] // Replace these values with your actual data
//   }];

//   return (
//     <div className="bar-chart">
//       <Chart options={options} series={series} type="bar" width="380" />
//     </div>
//   );
// };

// export default BarChart;


import React from 'react';
import ReactApexChart from 'react-apexcharts';
const BarChart = ({chartdata, categories, rotate}) => {
 
  const options = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: {
        show: false
      },
      foreColor: '#8C8C8C'
    },
    grid: {
      yaxis: {
        lines: {
          show: false
        }
      },
      // padding: {
      //   right: 30
      // }
    },
    axisTicks: {
      show: false,

    },
    axisBorder: {
      show: false,
    },
    xaxis: {
      categories: categories,
      labels: {
        show: true,
        rotate: rotate,
        rotateAlways: true,
        offsetX: 5,
        offsetY: 15,
      },
      axisBorder: {
        show: false
      },
    },
    // title: {
    //   text: 'Most Common Preventive Treatments',
    //   align: 'center'
    // },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadiusApplication: 'around',
        borderRadiusWhenStacked: 'last',
        columnWidth: 10,
        borderRadius: 4,

      }
    },
    colors: ['#6B43B5'],
    dataLabels: {
      enabled: false,
    },

    stroke: {
      width: 0
    },

    yaxis: {
      show: true
    },
    fill: {
      opacity: 1
    },
    legend: {
      show: false,
      floating: false,
      position: 'top',
      labels: {
        colors: ['#040404', '#8C8C8C']
      },
      markers: {
        width: 12,
        height: 12,
        radius: 12
      }
    }
  };

  return (
    <div id="chart">
      <ReactApexChart options={options} series={chartdata} type="bar" height={300} />
    </div>
  );
};

export default BarChart;