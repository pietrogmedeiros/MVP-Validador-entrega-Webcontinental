import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Validator from './components/Validator'
import Backoffice from './components/Backoffice'
import webLogo from './assets/web.png'
import animacao from './assets/animacao.svg'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-bg">
      <div id="loading-popup" className="loading-popup hidden">
        <div className="loading-content">
          <div className="loading-animation">
            <img src={animacao} alt="Carregando..." className="loading-svg" />
          </div>
          <p className="loading-text">Validando nota fiscal...</p>
        </div>
      </div>

      <div className="container">
        <header>
          <div className="header-logo">
            <img src={webLogo} alt="Web Continental Logo" className="company-logo" />
          </div>
          <h1 className="main-title">Validador de Entrega</h1>
          <p className="subtitle">Registre sua entrega de forma rápida e segura</p>
        </header>

        <main>{children}</main>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Validator />
          </Layout>
        }
      />
      <Route
        path="/backoffice"
        element={
          <Layout>
            <Backoffice />
          </Layout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
