// ecowatt-frontend/src/main.jsx

// 1. **IMPORTAÇÃO NECESSÁRIA:** Importe o cliente ReactDOM para a nova API do React
import ReactDOM from 'react-dom/client'; // <--- CORREÇÃO CRÍTICA
import React from 'react'; // <--- Certificar-se que 'React' está importado, se necessário
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx'; // Certifique-se de que todos os seus imports estão corretos
import MainLayout from './components/MainLayout.jsx'; 
import Calendar from './pages/Calendar.jsx'; 
import Devices from './pages/Devices.jsx';
import Reports from './pages/Reports.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Rota 1: Página de Login (Acesso Público) */}
        <Route path="/" element={<Login />} /> 
        <Route path="/login" element={<Login />} /> 
        
        {/* Rota 2: Rotas Protegidas (Requerem MainLayout) */}
        <Route element={<MainLayout />}>
             {/* Componente que renderizará o conteúdo do MainLayout */}
            
            {/* Páginas do Menu: */}
            <Route path="/dashboard" element={<Dashboard />} /> 
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/reports" element={<Reports />} />

        </Route>

        {/* Rotas de Erro ou Not Found viriam aqui */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);