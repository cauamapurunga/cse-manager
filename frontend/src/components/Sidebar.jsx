import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from '../assets/cse.png'; // ajuste o path conforme sua estrutura

export default function Sidebar({ onLogout, mobileClose }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const links = [
    ['Dashboard', '/home', 'bar-chart-line'],
    ['Clientes', '/clientes', 'people'],
    ['Agenda', '/agenda', 'calendar-event'],
    ['Orçamentos', '/orcamentos', 'file-earmark-text'], // <-- novo item
    ['Configurações', '/settings', 'gear']
  ];

  const handleClick = (evt, to) => {
    evt.preventDefault();
    navigate(to);
  };

  const handleLogoutClick = (evt) => {
    evt.preventDefault();
    navigate('/login', { replace: true });
    localStorage.removeItem('token');
  };

  return (
    <div className="d-flex flex-column h-100 p-3 bg-sidebar text-white">
      {/* Exibe logo apenas no desktop (quando mobileClose é false) */}
      {!mobileClose && (
        <div className="sidebar-logo mb-4 text-center">
          <img
            src={logo}
            alt="CSE Manager"
            style={{ maxWidth: '150px', width: '100%' }}
          />
        </div>
      )}

      <ul className="nav nav-pills flex-column mb-auto">
        {links.map(([label, to, icon]) => (
          <li className="nav-item mb-2" key={to}>
            <a
              href={to}
              className={`nav-link d-flex align-items-center ${pathname === to ? 'active bg-primary' : 'text-white'}`}
              onClick={(e) => handleClick(e, to)}
              {...(mobileClose ? { 'data-bs-dismiss': 'offcanvas' } : {})}
            >
              <i className={`bi bi-${icon} me-2`} />
              {label}
            </a>
          </li>
        ))}
      </ul>

      <button
        className="btn btn-outline-danger mt-auto d-flex align-items-center justify-content-center"
        onClick={handleLogoutClick}
        {...(mobileClose ? { 'data-bs-dismiss': 'offcanvas' } : {})}
      >
        <i className="bi bi-box-arrow-right me-2" /> Sair
      </button>
    </div>
  );
}
