import { useAuth } from '../../context/AuthContext'
import useToast from '../../hooks/useToast'

function UserSwitcher() {
  const { user, users, switchUser } = useAuth()
  const toast = useToast()

  const handleChange = (event) => {
    const nextUserId = event.target.value
    if (nextUserId === user?.id) {
      return
    }

    const switched = switchUser(nextUserId)
    if (switched) {
      toast.simulated('Perfil demo cambiado sin recargar')
    }
  }

  return (
    <label className="flex items-center gap-2 rounded-lg border border-lab-border bg-white px-2.5 py-1.5 text-xs">
      <span className="font-semibold text-lab-muted">Perfil demo</span>
      <select
        value={user?.id || ''}
        onChange={handleChange}
        className="max-w-40 border-0 bg-transparent text-xs font-medium text-lab-text outline-none"
      >
        {users.map((demoUser) => (
          <option key={demoUser.id} value={demoUser.id}>
            {demoUser.name}
          </option>
        ))}
      </select>
    </label>
  )
}

export default UserSwitcher
