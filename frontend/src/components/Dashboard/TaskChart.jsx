import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function TaskChart({ tasks = [] }) {
  // 1. Process Status Data
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const pendingCount = tasks.filter(t => t.status !== 'Completed').length;
  
  const statusData = [
    { name: 'Completed', value: completedCount },
    { name: 'Pending', value: pendingCount }
  ];
  
  const STATUS_COLORS = ['#10b981', '#f59e0b']; // Emerald and Amber

  // 2. Process Priority Data
  const highCount = tasks.filter(t => t.priority === 'High').length;
  const mediumCount = tasks.filter(t => t.priority === 'Medium').length;
  const lowCount = tasks.filter(t => t.priority === 'Low').length;

  const priorityData = [
    { name: 'High', value: highCount },
    { name: 'Medium', value: mediumCount },
    { name: 'Low', value: lowCount }
  ];

  const PRIORITY_COLORS = ['#ef4444', '#3b82f6', '#10b981']; // Red, Blue, Emerald

  const hasTasks = tasks.length > 0;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 animate-in">
      {/* Status Chart Card */}
      <div className="card p-6 flex flex-col items-center justify-between shadow-md rounded-xl bg-(--surface) min-h-[360px]">
        <div className="w-full text-left">
          <h2 className="text-lg font-semibold text-main">Task Status</h2>
          <p className="text-xs text-muted">Completion breakdown of your current tasks</p>
        </div>
        
        {hasTasks ? (
          <div className="w-full h-[220px] flex items-center justify-center relative mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text inside Doughnut */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-main">
                {tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0}%
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted font-medium">Done</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-muted">
            No tasks available to show statistics
          </div>
        )}
      </div>

      {/* Priority Chart Card */}
      <div className="card p-6 flex flex-col items-center justify-between shadow-md rounded-xl bg-(--surface) min-h-[360px]">
        <div className="w-full text-left">
          <h2 className="text-lg font-semibold text-main">Task Priorities</h2>
          <p className="text-xs text-muted">Priority distribution of your tasks</p>
        </div>
        
        {hasTasks && (highCount > 0 || mediumCount > 0 || lowCount > 0) ? (
          <div className="w-full h-[220px] flex items-center justify-center mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.filter(d => d.value > 0).map((entry, index) => {
                    const colorIndex = priorityData.findIndex(d => d.name === entry.name);
                    return <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[colorIndex]} />;
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-muted">
            No tasks available to show priorities
          </div>
        )}
      </div>
    </div>
  );
}
