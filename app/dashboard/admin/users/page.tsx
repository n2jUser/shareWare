'use client'
import { useState, useEffect } from 'react'
import { Search, UserCheck, UserX, RefreshCw } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { User } from '@/types'
import { formatDate, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)
  const [actionId, setActionId] = useState<number | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await adminApi.listUsers({ page, page_size: 20 })
      setUsers(Array.isArray(data) ? data : [])
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [page]) // eslint-disable-line

  const toggleUser = async (user: User) => {
    setActionId(user.id)
    try {
      if (user.is_active) {
        const { data } = await adminApi.deactivateUser(user.id)
        setUsers(users.map(u => u.id === user.id ? data : u))
        toast.success(`${user.first_name} désactivé`)
      } else {
        const { data } = await adminApi.activateUser(user.id)
        setUsers(users.map(u => u.id === user.id ? data : u))
        toast.success(`${user.first_name} activé`)
      }
    } catch { toast.error('Erreur') }
    finally { setActionId(null) }
  }

  const filteredUsers = users.filter(u => {
    const matchSearch = !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'active' ? u.is_active : !u.is_active)
    return matchSearch && matchFilter
  })

  const roleColors: Record<string, string> = {
    admin: 'badge-accent',
    seller: 'badge-blue',
    buyer: 'badge-gray',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label mb-1">Administration</p>
          <h1 className="font-display text-3xl text-ink-900">Utilisateurs</h1>
        </div>
        <button onClick={fetchUsers} className="btn-outline">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="input-base pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                filter === f
                  ? 'bg-ink-900 text-white border-ink-900'
                  : 'bg-white text-ink-600 border-surface-200 hover:border-ink-400'
              )}
            >
              {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : 'Inactifs'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: users.length },
          { label: 'Actifs', value: users.filter(u => u.is_active).length },
          { label: 'Inactifs', value: users.filter(u => !u.is_active).length },
        ].map(stat => (
          <div key={stat.label} className="card p-4 text-center">
            <p className="font-display text-2xl text-ink-900">{stat.value}</p>
            <p className="text-xs text-ink-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ink-400">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-ink-400 uppercase tracking-wide">Utilisateur</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-ink-400 uppercase tracking-wide">Rôle</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-ink-400 uppercase tracking-wide">Statut</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-ink-400 uppercase tracking-wide">Inscrit le</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-ink-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-ink-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-ink-600">{u.first_name[0]}{u.last_name[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink-900">{u.first_name} {u.last_name}</p>
                          <p className="text-xs text-ink-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${roleColors[u.role] || 'badge-gray'}`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-400'}`} />
                        <span className={`text-sm ${u.is_active ? 'text-green-700' : 'text-red-600'}`}>
                          {u.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-400">{formatDate(u.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleUser(u)}
                        disabled={actionId === u.id || u.role === 'admin'}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed',
                          u.is_active
                            ? 'text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300'
                            : 'text-green-600 hover:bg-green-50 border border-green-200 hover:border-green-300'
                        )}
                      >
                        {actionId === u.id ? (
                          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : u.is_active ? (
                          <><UserX className="w-3.5 h-3.5" />Désactiver</>
                        ) : (
                          <><UserCheck className="w-3.5 h-3.5" />Activer</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}