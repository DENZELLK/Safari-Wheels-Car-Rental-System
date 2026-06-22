import React, { useState, useEffect } from 'react';
import { analyticsAPI, adminAPI } from '../../services/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Note: You'll need to install these packages:
// npm install recharts xlsx jspdf jspdf-autotable

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState('month');
  const [chartType, setChartType] = useState('revenue');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [bookingsData, setBookingsData] = useState([]);
  const [popularCars, setPopularCars] = useState([]);
  const [popularLocations, setPopularLocations] = useState([]);
  const [carTypeDistribution, setCarTypeDistribution] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);

  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  // Fetch all analytics data
  useEffect(() => {
    fetchAllAnalytics();
  }, [dateRange]);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        summaryRes,
        revenueRes,
        bookingsRes,
        popularCarsRes,
        popularLocationsRes,
        carTypesRes,
        userGrowthRes
      ] = await Promise.all([
        analyticsAPI.getDashboardSummary(),
        analyticsAPI.getRevenue(dateRange),
        analyticsAPI.getBookings(dateRange),
        analyticsAPI.getPopularCars(5),
        analyticsAPI.getPopularLocations(5),
        analyticsAPI.getCarTypeDistribution(),
        analyticsAPI.getUserGrowth(dateRange)
      ]);

      setDashboardSummary(summaryRes.data);
      setRevenueData(revenueRes.data);
      setBookingsData(bookingsRes.data);
      setPopularCars(popularCarsRes.data);
      setPopularLocations(popularLocationsRes.data);
      setCarTypeDistribution(carTypesRes.data);
      setUserGrowth(userGrowthRes.data);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'R 0';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return '0';
    return new Intl.NumberFormat('en-ZA').format(value);
  };

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Summary sheet
      const summaryData = [
        ['Metric', 'Value'],
        ['Total Revenue', formatCurrency(dashboardSummary?.totalRevenue)],
        ['Monthly Revenue', formatCurrency(dashboardSummary?.monthlyRevenue)],
        ['Revenue Growth', `${dashboardSummary?.revenueGrowth?.toFixed(1) || 0}%`],
        ['Total Bookings', formatNumber(dashboardSummary?.totalBookings)],
        ['Monthly Bookings', formatNumber(dashboardSummary?.monthlyBookings)],
        ['Bookings Growth', `${dashboardSummary?.bookingsGrowth?.toFixed(1) || 0}%`],
        ['Active Users', formatNumber(dashboardSummary?.activeUsers)],
        ['Total Users', formatNumber(dashboardSummary?.totalUsers)],
        ['Total Cars', formatNumber(dashboardSummary?.totalCars)],
        ['Pending Approvals', formatNumber(dashboardSummary?.pendingApprovals)],
        ['Unread Messages', formatNumber(dashboardSummary?.unreadMessages)]
      ];
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

      // Revenue sheet
      if (revenueData.length > 0) {
        const revenueWs = XLSX.utils.json_to_sheet(revenueData);
        XLSX.utils.book_append_sheet(wb, revenueWs, 'Revenue Data');
      }

      // Bookings sheet
      if (bookingsData.length > 0) {
        const bookingsWs = XLSX.utils.json_to_sheet(bookingsData);
        XLSX.utils.book_append_sheet(wb, bookingsWs, 'Bookings Data');
      }

      // Popular Cars sheet
      if (popularCars.length > 0) {
        const carsWs = XLSX.utils.json_to_sheet(popularCars);
        XLSX.utils.book_append_sheet(wb, carsWs, 'Popular Cars');
      }

      // Popular Locations sheet
      if (popularLocations.length > 0) {
        const locationsWs = XLSX.utils.json_to_sheet(popularLocations);
        XLSX.utils.book_append_sheet(wb, locationsWs, 'Popular Locations');
      }

      // Car Types sheet
      if (carTypeDistribution.length > 0) {
        const typesWs = XLSX.utils.json_to_sheet(carTypeDistribution);
        XLSX.utils.book_append_sheet(wb, typesWs, 'Car Types');
      }

      // Save file
      const fileName = `SafariWheels_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel. Please try again.');
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(245, 158, 11); // Amber color
      doc.text('Safari Wheels Analytics Report', pageWidth / 2, 20, { align: 'center' });
      
      // Date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleString('en-ZA')}`, pageWidth / 2, 30, { align: 'center' });
      
      // Summary section
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Key Metrics', 14, 45);
      
      const summaryRows = [
        ['Metric', 'Value', 'Growth'],
        ['Total Revenue', formatCurrency(dashboardSummary?.totalRevenue), `${dashboardSummary?.revenueGrowth?.toFixed(1) || 0}%`],
        ['Monthly Revenue', formatCurrency(dashboardSummary?.monthlyRevenue), '-'],
        ['Total Bookings', formatNumber(dashboardSummary?.totalBookings), `${dashboardSummary?.bookingsGrowth?.toFixed(1) || 0}%`],
        ['Monthly Bookings', formatNumber(dashboardSummary?.monthlyBookings), '-'],
        ['Active Users', formatNumber(dashboardSummary?.activeUsers), '-'],
        ['Total Users', formatNumber(dashboardSummary?.totalUsers), '-'],
        ['Total Cars', formatNumber(dashboardSummary?.totalCars), '-'],
        ['Pending Approvals', formatNumber(dashboardSummary?.pendingApprovals), '-'],
        ['Unread Messages', formatNumber(dashboardSummary?.unreadMessages), '-']
      ];
      
      doc.autoTable({
        startY: 50,
        head: [summaryRows[0]],
        body: summaryRows.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] },
        styles: { fontSize: 9 }
      });

      // Popular Cars
      let finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text('Popular Cars', 14, finalY);
      
      const carRows = popularCars.map(car => [
        `${car.make} ${car.model}`,
        car.bookings,
        formatCurrency(car.revenue)
      ]);
      
      doc.autoTable({
        startY: finalY + 5,
        head: [['Car', 'Bookings', 'Revenue']],
        body: carRows,
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] },
        styles: { fontSize: 9 }
      });

      // Popular Locations
      finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text('Popular Locations', 14, finalY);
      
      const locationRows = popularLocations.map(loc => [
        loc.location,
        loc.bookings
      ]);
      
      doc.autoTable({
        startY: finalY + 5,
        head: [['Location', 'Bookings']],
        body: locationRows,
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] },
        styles: { fontSize: 9 }
      });

      // Car Type Distribution
      finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text('Car Type Distribution', 14, finalY);
      
      const typeRows = carTypeDistribution.map(type => [
        type.name,
        type.value
      ]);
      
      doc.autoTable({
        startY: finalY + 5,
        head: [['Car Type', 'Count']],
        body: typeRows,
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] },
        styles: { fontSize: 9 }
      });

      // Save PDF
      const fileName = `SafariWheels_Analytics_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export to PDF. Please try again.');
    }
  };

  // Print Report
  const printReport = () => {
    try {
      // Create a printable version
      const printWindow = window.open('', '_blank');
      
      const styles = `
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #f59e0b; text-align: center; }
          h2 { color: #333; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background-color: #f59e0b; color: white; padding: 10px; text-align: left; }
          td { padding: 8px; border-bottom: 1px solid #ddd; }
          .metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
          .metric-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
          .metric-value { font-size: 24px; font-weight: bold; color: #f59e0b; }
          .metric-label { color: #666; font-size: 14px; }
          .growth-positive { color: #10b981; }
          .growth-negative { color: #ef4444; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      `;

      const summaryCards = `
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-value">${formatCurrency(dashboardSummary?.totalRevenue)}</div>
            <div class="metric-label">Total Revenue</div>
            <div class="${dashboardSummary?.revenueGrowth >= 0 ? 'growth-positive' : 'growth-negative'}">
              ${dashboardSummary?.revenueGrowth?.toFixed(1)}% from last month
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${formatNumber(dashboardSummary?.totalBookings)}</div>
            <div class="metric-label">Total Bookings</div>
            <div class="${dashboardSummary?.bookingsGrowth >= 0 ? 'growth-positive' : 'growth-negative'}">
              ${dashboardSummary?.bookingsGrowth?.toFixed(1)}% from last month
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${formatNumber(dashboardSummary?.activeUsers)}</div>
            <div class="metric-label">Active Users</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${formatNumber(dashboardSummary?.totalCars)}</div>
            <div class="metric-label">Total Cars</div>
          </div>
        </div>
      `;

      const popularCarsTable = `
        <h2>Popular Cars</h2>
        <table>
          <thead>
            <tr>
              <th>Car</th>
              <th>Bookings</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${popularCars.map(car => `
              <tr>
                <td>${car.make} ${car.model}</td>
                <td>${car.bookings}</td>
                <td>${formatCurrency(car.revenue)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      const popularLocationsTable = `
        <h2>Popular Locations</h2>
        <table>
          <thead>
            <tr>
              <th>Location</th>
              <th>Bookings</th>
            </tr>
          </thead>
          <tbody>
            ${popularLocations.map(loc => `
              <tr>
                <td>${loc.location}</td>
                <td>${loc.bookings}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      const carTypesTable = `
        <h2>Car Type Distribution</h2>
        <table>
          <thead>
            <tr>
              <th>Car Type</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            ${carTypeDistribution.map(type => `
              <tr>
                <td>${type.name}</td>
                <td>${type.value}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      printWindow.document.write(`
        <html>
          <head>
            <title>Safari Wheels Analytics Report</title>
            ${styles}
          </head>
          <body>
            <h1>Safari Wheels Analytics Report</h1>
            <p style="text-align: center; color: #666;">
              Generated: ${new Date().toLocaleString('en-ZA')}
            </p>
            ${summaryCards}
            ${popularCarsTable}
            ${popularLocationsTable}
            ${carTypesTable}
            <div class="no-print" style="text-align: center; margin-top: 30px;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #f59e0b; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Print Report
              </button>
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
      
    } catch (error) {
      console.error('Error printing report:', error);
      alert('Failed to prepare print view. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
        </div>
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button
          onClick={fetchAllAnalytics}
          className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Prepare chart data
  const chartData = revenueData.map((item, index) => ({
    name: item.name,
    revenue: item.revenue,
    bookings: bookingsData[index]?.bookings || 0
  }));

  return (
    <div className="space-y-6">
      {/* Header with date range selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Analytics Dashboard</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setDateRange('week')}
            className={`px-3 py-1 rounded-md text-sm ${
              dateRange === 'week'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-3 py-1 rounded-md text-sm ${
              dateRange === 'month'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setDateRange('year')}
            className={`px-3 py-1 rounded-md text-sm ${
              dateRange === 'year'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(dashboardSummary?.totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <i className="fas fa-chart-line text-green-600 text-xl"></i>
            </div>
          </div>
          <p className={`text-sm mt-2 ${
            dashboardSummary?.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <i className={`fas fa-arrow-${dashboardSummary?.revenueGrowth >= 0 ? 'up' : 'down'} mr-1`}></i>
            {Math.abs(dashboardSummary?.revenueGrowth || 0).toFixed(1)}% from last month
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(dashboardSummary?.totalBookings)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <i className="fas fa-calendar-check text-blue-600 text-xl"></i>
            </div>
          </div>
          <p className={`text-sm mt-2 ${
            dashboardSummary?.bookingsGrowth >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <i className={`fas fa-arrow-${dashboardSummary?.bookingsGrowth >= 0 ? 'up' : 'down'} mr-1`}></i>
            {Math.abs(dashboardSummary?.bookingsGrowth || 0).toFixed(1)}% from last month
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(dashboardSummary?.activeUsers)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <i className="fas fa-users text-purple-600 text-xl"></i>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Out of {formatNumber(dashboardSummary?.totalUsers)} total users
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(dashboardSummary?.pendingApprovals)}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <i className="fas fa-clock text-amber-600 text-xl"></i>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {formatNumber(dashboardSummary?.unreadMessages)} unread messages
          </p>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setChartType('revenue')}
            className={`px-4 py-2 rounded-md ${
              chartType === 'revenue'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Revenue Trend
          </button>
          <button
            onClick={() => setChartType('bookings')}
            className={`px-4 py-2 rounded-md ${
              chartType === 'bookings'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Bookings Trend
          </button>
          <button
            onClick={() => setChartType('comparison')}
            className={`px-4 py-2 rounded-md ${
              chartType === 'comparison'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Revenue vs Bookings
          </button>
        </div>

        {/* Main Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'revenue' ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            ) : chartType === 'bookings' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" fill="#f59e0b" />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value, name) => 
                  name === 'revenue' ? formatCurrency(value) : value
                } />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#f59e0b" name="Revenue" />
                <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#3b82f6" name="Bookings" />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Car Type Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4">Car Type Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={carTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {carTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Locations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4">Popular Locations</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularLocations} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="location" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Export Reports</h4>
        <div className="flex space-x-4">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
          >
            <i className="fas fa-file-excel mr-2"></i>
            Export as Excel
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center"
          >
            <i className="fas fa-file-pdf mr-2"></i>
            Export as PDF
          </button>
          <button
            onClick={printReport}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
          >
            <i className="fas fa-print mr-2"></i>
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;