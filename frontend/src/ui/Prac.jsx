import { useState, useMemo } from 'react';

const allEmployees = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  name: `Employee ${i}`,
  role: i % 2 === 0 ? 'Developer' : 'Designer',
}));

export default function EmployeeList() {
  const [filter, setFilter] = useState('');
  const [counter, setCounter] = useState(0); // Unrelated state

  // The expensive calculation is memoized.
  // It only re-runs if `filter` changes.
  const filteredEmployees = useMemo(() => {
    console.log('Filtering employees...');
    if (!filter) return allEmployees;
    return allEmployees.filter(emp => emp.role.toLowerCase().includes(filter.toLowerCase()));
  }, [filter]); // Dependency array

  return (
    <div>
      <input
        type="text"
        placeholder="Filter by role..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />
      <button onClick={() => setCounter(c => c + 1)}>
        Re-render (Counter: {counter})
      </button>
      <ul>
        {filteredEmployees.map(emp => (
          <li key={emp.id}>{emp.name} - {emp.role}</li>
        ))}
      </ul>
    </div>
  );
}