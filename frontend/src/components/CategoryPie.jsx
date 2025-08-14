import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { CATEGORY_COLORS, categories } from '../utils/colors.js';

export default function CategoryPie({ data }) {
  const merged = categories.map(c => {
    const found = data.find(d => d.category === c);
    return { name: c, value: found ? found.totalInr : 0 };
  });

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie dataKey="value" data={merged} cx="50%" cy="50%" outerRadius={100} label>
            {merged.map((entry) => (
              <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
