import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import './LeadChart.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const LeadChart = () => {
    const [chartData, setChartData] = useState({ labels: [], data: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChartData();
    }, []);

    const fetchChartData = async () => {
        try {
            const response = await api.get('/leads/chart-data');
            if (response.data.success) {
                setChartData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching chart data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Generate random colors for bars
    const generateColors = (count) => {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const r = Math.floor(Math.random() * 200) + 55;
            const g = Math.floor(Math.random() * 200) + 55;
            const b = Math.floor(Math.random() * 200) + 55;
            colors.push(`rgba(${r}, ${g}, ${b}, 0.8)`);
        }
        return colors;
    };

    const barColors = generateColors(chartData.data.length);

    const data = {
        labels: chartData.labels,
        datasets: [
            {
                label: 'Lead Converted to Customer',
                data: chartData.data,
                backgroundColor: barColors,
                borderColor: barColors.map(c => c.replace('0.8', '1')),
                borderWidth: 2
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            },
            x: {
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                    font: {
                        size: 10
                    }
                }
            }
        }
    };

    return (
        <section className="section">
            <div className="section-header">
                <h1>Lead Convert Customer Chart</h1>
                <div className="section-header-breadcrumb">
                    <div className="card-header-action">
                        <Link to="/leads" className="btn btn-primary form-btn float-right-mobile">
                            Lead List
                        </Link>
                    </div>
                </div>
            </div>
            <div className="section-body">
                <div className="card">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-12 col-lg-12 col-md-12 col-sm-12">
                                <h6 className="contract-summary-heading mb-5">Lead Convert Customer</h6>
                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="chart-container">
                                        <Bar data={data} options={options} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LeadChart;
