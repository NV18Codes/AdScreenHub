import React from 'react';
import { useOrders } from '../hooks/useOrders';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserDisplayName } from '../utils/userUtils';
import styles from '../styles/DashboardOverview.module.css';

export default function DashboardOverview() {
  const { orders } = useOrders();
  const { user } = useAuth();
  const displayName = getUserDisplayName(user);

  // Calculate stats from ALL orders - exclude cancelled orders from total spent
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'Pending Approval').length;
  const activeOrders = orders.filter(order => order.status === 'In Display').length;
  const completedOrders = orders.filter(order => order.status === 'Completed Display' || order.status === 'Completed').length;
  // Calculate total spent from PAID orders only
  const paidStatuses = ['Pending Approval', 'In Display', 'Completed', 'Design Revise'];
  const totalSpent = orders
    .filter(order => paidStatuses.includes(order.status))
    .reduce((sum, order) => sum + (order.totalAmount || order.total_cost || order.final_amount || 0), 0);


  // Get recent orders (last 3)
  const recentOrders = orders.slice(0, 3);

  return (
    <div className={styles.overview}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Dashboard Overview</h1>
          <p>Hi, {displayName}! Here's your advertising summary.</p>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>Total Orders</h3>
              <p className={styles.statNumber}>{totalOrders}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>Pending Approval</h3>
              <p className={styles.statNumber}>{pendingOrders}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>Active Campaigns</h3>
              <p className={styles.statNumber}>{activeOrders}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>Total Spent</h3>
              <p className={styles.statNumber}>₹{totalSpent.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <h2>Quick Actions</h2>
          <div className={styles.actionButtons}>
            <Link to="/book-ad" className={styles.actionBtn}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Book New Ad</span>
            </Link>
            <Link to="/my-orders" className={styles.actionBtn}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>View Orders</span>
            </Link>
            <Link to="/profile" className={styles.actionBtn}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className={styles.recentOrders}>
          <div className={styles.sectionHeader}>
            <h2>Recent Orders</h2>
            <Link to="/my-orders" className={styles.viewAll}>View All</Link>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className={styles.ordersList}>
              {recentOrders.map((order) => (
                <div key={order.id} className={styles.orderItem}>
                  <div className={styles.orderInfo}>
                    <h4>Order #{order.id}</h4>
                    <p className={styles.orderDate}>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                    <p className={styles.orderAmount}>₹{order.totalAmount}</p>
                  </div>
                  <div className={styles.orderStatus}>
                    <span className={`${styles.status} ${styles[`status${order.status.replace(/\s+/g, '')}`]}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3>No orders yet</h3>
              <p>Start your advertising journey by booking your first ad!</p>
              <Link to="/my-orders" className={styles.btnPrimary}>
                Book Your First Ad
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
