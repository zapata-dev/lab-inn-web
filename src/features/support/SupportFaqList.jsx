import { useMemo, useState } from 'react'
import { Card, EmptyState, FilterBar, SearchBar } from '../../components/common'

function SupportFaqList({ faqs }) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const categories = useMemo(() => [...new Set(faqs.map((f) => f.category))].sort(), [faqs])

  const filtered = faqs.filter((faq) => {
    if (categoryFilter && faq.category !== categoryFilter) return false
    if (search) {
      const hay = `${faq.question} ${faq.answer}`.toLowerCase()
      if (!hay.includes(search.toLowerCase().trim())) return false
    }
    return true
  })

  const handleSearch = (e) => { setSearch(e.target.value); setExpandedId(null) }
  const handleCategory = (e) => { setCategoryFilter(e.target.value); setExpandedId(null) }
  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id))

  return (
    <section className="space-y-4">
      <FilterBar title="Base de conocimiento">
        <SearchBar
          value={search}
          onChange={handleSearch}
          placeholder="Buscar pregunta o respuesta..."
          className="w-full max-w-xs"
        />
        <select
          value={categoryFilter}
          onChange={handleCategory}
          className="rounded-lab border border-lab-border bg-white px-3 py-2 text-sm text-lab-text"
        >
          <option value="">Todas las categorias</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <span className="self-center text-xs text-lab-muted">{filtered.length} respuesta{filtered.length !== 1 ? 's' : ''}</span>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState title="Sin resultados" description="No hay entradas que coincidan con la busqueda." />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="divide-y divide-lab-border">
            {filtered.map((faq) => {
              const isExpanded = expandedId === faq.id
              return (
                <div key={faq.id}>
                  <button
                    type="button"
                    onClick={() => toggleExpand(faq.id)}
                    className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50"
                  >
                    <div className="space-y-0.5">
                      <p className="font-medium text-lab-text">{faq.question}</p>
                      <p className="text-xs text-lab-muted">{faq.category.charAt(0).toUpperCase() + faq.category.slice(1)}</p>
                    </div>
                    <span className="mt-0.5 shrink-0 text-xs text-lab-muted">{isExpanded ? '▲' : '▼'}</span>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-lab-border bg-slate-50 px-4 py-3">
                      <p className="text-sm text-lab-text">{faq.answer}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </section>
  )
}

export default SupportFaqList
