import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = ({ token }) => {
  const [metrics, setMetrics] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [topPros, setTopPros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const metricsRes = await axios.get('/api/analytics/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const revenueRes = await axios.get('/api/analytics/revenue?days=30', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const prosRes = await axios.get('/api/analytics/top-professionals?limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMetrics(metricsRes.data.metrics);
      setRevenue(revenueRes.data.data);
      setTopPros(prosRes.data.data);
    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="analytics-loading">Carregando gráficos...</div>;
  }

  return (
    <div className="analytics-dashboard">
      <h2>📊 Dashboard de Análise</h2>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>👥 Usuários</h3>
          <div className="metric-value">{metrics?.total_users || 0}</div>
        </div>

        <div className="metric-card">
          <h3>📅 Agendamentos</h3>
          <div className="metric-value">{metrics?.total_bookings || 0}</div>
        </div>

        <div className="metric-card">
          <h3>💰 Receita</h3>
          <div className="metric-value">R$ {parseFloat(metrics?.total_revenue || 0).toFixed(2)}</div>
        </div>

        <div className="metric-card">
          <h3>⭐ Avaliação</h3>
          <div className="metric-value">{parseFloat(metrics?.avg_rating || 0).toFixed(1)}</div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h3>Receita Últimos 30 Dias</h3>
          <div className="chart">
            {revenue.length > 0 ? (
              <table className="revenue-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Receita</th>
                    <th>Agendamentos</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.slice(0, 10).map((day) => (
                    <tr key={day.date}>
                      <td>{new Date(day.date).toLocaleDateString('pt-BR')}</td>
                      <td>R$ {parseFloat(day.revenue).toFixed(2)}</td>
                      <td>{day.bookings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Sem dados disponíveis</p>
            )}
          </div>
        </div>

        <div className="chart-container">
          <h3>Top 5 Profissionais</h3>
          <div className="professionals-list">
            {topPros.map((pro, idx) => (
              <div key={pro.id} className="pro-item">
                <span className="pro-rank">#{idx + 1}</span>
                <div className="pro-info">
                  <strong>{pro.name}</strong>
                  <small>{pro.total_bookings} agendamentos</small>
                </div>
                <div className="pro-earnings">R$ {parseFloat(pro.total_earned || 0).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
