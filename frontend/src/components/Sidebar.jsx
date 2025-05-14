import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ onLogout }) {
  const linkClass = ({ isActive }) =>
    `nav-link text-white ${isActive ? 'active' : ''}`;

  return (
    <div className="d-flex flex-column h-100">
      <h5 className="text-white mb-4">CSE Manager</h5>
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <NavLink to="/home" end className={linkClass}>
            <i className="bi bi-bar-chart-line me-2"></i> Dashboard
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/clientes" className={linkClass}>
            <i className="bi bi-people me-2"></i> Clientes
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/agenda" className={linkClass}>
            <i className="bi bi-calendar-event me-2"></i> Agenda
          </NavLink>
        </li>
        <li className="nav-item mb-3">
          <NavLink to="/settings" className={linkClass}>
            <i className="bi bi-gear me-2"></i> Configurações
          </NavLink>
        </li>
      </ul>
      <button
        className="btn btn-outline-danger mt-auto"
        onClick={onLogout}
      >
        <i className="bi bi-box-arrow-right me-1"></i> Sair
      </button>
    </div>
  );
}