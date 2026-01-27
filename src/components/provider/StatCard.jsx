import React from 'react';

const StatCard = ({ icon: Icon, number, label, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border-l-4" style={{ borderColor: color }}>
        <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-gray-900">{number}</div>
            <Icon className={`text-4xl`} style={{ color }} size={36} />
        </div>
        <div className="text-gray-500 mt-1 text-sm font-medium">{label}</div>
    </div>
);

export default StatCard;
