type Props = {
  status: 'Pending Approval' | 'Approved'
}

function StatusBadge({ status }: Props) {
  const isPending = status === 'Pending Approval'

  return (
    <span
      className={
        isPending
          ? 'inline-flex items-center rounded-full bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200/60 px-4 py-2 text-xs font-bold shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md'
          : 'inline-flex items-center rounded-full bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200/60 px-4 py-2 text-xs font-bold shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md'
      }
    >
      <div className={
        isPending
          ? 'w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse'
          : 'w-2 h-2 bg-green-500 rounded-full mr-2'
      }></div>
      {status}
    </span>
  )
}

export default StatusBadge
