import clsx from 'clsx'

function Card({ children, className }) {
  return (
    <article
      className={clsx(
        'rounded-lab border border-lab-border bg-lab-surface p-5 shadow-lab',
        className
      )}
    >
      {children}
    </article>
  )
}

export default Card
