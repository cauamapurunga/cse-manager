import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login    from './pages/Login';
import Register from './pages/Register';
import AppLayout from './layouts/AppLayout';
import Home      from './pages/Home';
import Clients   from './pages/Clients';
import Agenda    from './pages/Agenda';
import Settings  from './pages/Settings';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute  from './components/PublicRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<PublicRoute><Login/></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register/></PublicRoute>} />

        <Route element={<PrivateRoute><AppLayout/></PrivateRoute>}>
          <Route path="/home"     element={<Home/>} />
          <Route path="/clientes" element={<Clients/>} />
          <Route path="/agenda"   element={<Agenda/>} />
          <Route path="/settings" element={<Settings/>} />
          <Route path="/"          element={<Navigate to="/home" replace/>} />
          <Route path="*"          element={<Navigate to="/home" replace/>} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace/>} />
      </Routes>
    </BrowserRouter>
  );
}