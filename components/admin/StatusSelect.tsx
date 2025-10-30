'use client';

interface StatusSelectProps {
  currentStatus: string;
  onChange: (newStatus: string) => void;
  disabled?: boolean;
}

export default function StatusSelect({ currentStatus, onChange, disabled }: StatusSelectProps) {
  const statuses = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'completed', label: 'Completada' },
    { value: 'cancelled', label: 'Cancelada' },
  ];

  return (
    <select
      value={currentStatus}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    >
      {statuses.map((status) => (
        <option key={status.value} value={status.value}>
          {status.label}
        </option>
      ))}
    </select>
  );
}