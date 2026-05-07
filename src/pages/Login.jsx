import { Navigate, useNavigate } from 'react-router-dom'
import { Badge, Card } from '../components/common'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { users, login, isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/inicio" replace />
  }

  const handleLogin = (userId) => {
    const success = login(userId)
    if (success) {
      navigate('/inicio', { replace: true })
    }
  }

  return (
    <main className="min-h-screen bg-lab-bg px-5 py-8 md:px-8">
      <section className="mx-auto w-full max-w-5xl space-y-6">
        <header className="space-y-2">
          <Badge variant="demo">Modo demo</Badge>
          <h1 className="text-3xl font-bold text-lab-text">LAB MVP</h1>
          <p className="text-sm text-lab-muted">Selecciona un perfil demo</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((demoUser) => (
            <Card key={demoUser.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="inline-flex size-10 items-center justify-center rounded-full bg-lab-primary/10 font-semibold text-lab-primary">
                  {demoUser.avatar}
                </div>
                <Badge variant="info">{demoUser.roleLabel}</Badge>
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-lab-text">{demoUser.name}</h2>
                <p className="text-sm text-lab-muted">{demoUser.position}</p>
                <p className="text-xs text-slate-500">{demoUser.branchName}</p>
              </div>

              <button
                type="button"
                onClick={() => handleLogin(demoUser.id)}
                className="w-full rounded-lg bg-lab-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Entrar como {demoUser.roleLabel}
              </button>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Login
