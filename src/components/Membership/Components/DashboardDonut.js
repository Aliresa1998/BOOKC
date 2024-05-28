import React from 'react';
import Chart from 'react-apexcharts';

const MembershipChart = () => {
  const chartOptions = {
    chart: {
      type: 'donut',
    },
    labels: ['Membership Plan', 'Membership Plan', 'Membership Plan', 'Membership Plan'],
    legend: {
      show: false, // Hide the legend if you wish
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + "%";
        }
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '85%', // Adjust donut size as needed
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '22px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 600,
              color: undefined,
              offsetY: -10
            },
            value: {
              show: false,
              fontSize: '16px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 400,
              color: undefined,
              offsetY: 16,
            //   formatter: function (val) {
            //     return val + "";
            //   }
            },
            total: {
              show: true,
              showAlways: false,
              label: 'Membership Plans',
              fontSize: '18px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 600,
              color: '#979797',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => {
                  return a + b;
                }, 0) +  '\nMembership\nPlans'}
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    colors: ['#4D3280', '#9176DC', '#C9C1F1', '#EEEDFA'],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const series = [50,24,14,12]; // The series value is 24%

  return (
    <div>
      <Chart options={chartOptions} series={series} type="donut" height={335} />
    </div>
  );
};

export default MembershipChart;