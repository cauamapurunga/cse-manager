import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function AppLayout() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="container-fluid p-0">
      {/* mobile: botão que abre offcanvas */}
      {isMobile && (
        <>
          <nav className="navbar navbar-dark bg-sidebar d-md-none">
            <div className="container-fluid">
              <button
                className="btn btn-outline-light"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasSidebar"
              >
                <i className="bi bi-list"></i>
              </button>
              <span className="navbar-brand">CSE Manager</span>
            </div>
          </nav>

          <div
            className="offcanvas offcanvas-start bg-sidebar text-white"
            id="offcanvasSidebar"
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title">Menu</h5>
              <button
                className="btn-close btn-close-white"
                data-bs-dismiss="offcanvas"
              />
            </div>
            <div className="offcanvas-body p-0">
              <Sidebar onLogout={handleLogout} />
            </div>
          </div>
        </>
      )}

      <div className="row g-0 min-vh-100">
        {/* desktop: sidebar fixa */}
        <aside className="col-md-2 d-none d-md-block bg-sidebar p-3">
          <Sidebar onLogout={handleLogout} />
        </aside>

        {/* conteúdo principal */}
        <main className="col-12 col-md-10 bg-main text-white p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
