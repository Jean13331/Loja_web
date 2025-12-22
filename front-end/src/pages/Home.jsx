import { Link } from 'react-router-dom'
import authService from '../services/authService'

const Home = () => {
  const isAuthenticated = authService.isAuthenticated()
  const user = authService.getCurrentUser()

  return (
    <div className="home">
      <h1>Bem-vindo à Loja Web</h1>
      <p>Front-end React em funcionamento!</p>
      
      {isAuthenticated && user ? (
        <div className="home-user-info">
          <p>Olá, {user.nome}!</p>
          <button onClick={() => {
            authService.logout()
            window.location.href = '/login'
          }}>
            Sair
          </button>
        </div>
      ) : (
        <div className="home-actions">
          <Link to="/login" className="btn-link">Entrar</Link>
          <Link to="/cadastro" className="btn-link btn-outline">Cadastrar</Link>
        </div>
      )}
    </div>
  )
}

export default Home

