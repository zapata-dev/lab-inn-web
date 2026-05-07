import clsx from 'clsx'
import { Search } from 'lucide-react'

function SearchBar({ value, onChange, placeholder = 'Buscar...', className }) {
  return (
    <label
      className={clsx(
        'flex w-full items-center gap-2 rounded-lab border border-lab-border bg-white px-3 py-2 shadow-sm focus-within:border-lab-primary focus-within:ring-2 focus-within:ring-lab-primary/20',
        className
      )}
    >
      <Search className="size-4 text-lab-muted" aria-hidden="true" />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border-0 bg-transparent text-sm text-lab-text outline-none placeholder:text-slate-400"
      />
    </label>
  )
}

export default SearchBar
