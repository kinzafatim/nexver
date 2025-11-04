import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { PageHeader } from './components/PageHeader';

const coverageData = [ { name: 'Statement', coverage: 96 }, { name: 'Branch', coverage: 88 }, { name: 'Functional', coverage: 92 }, { name: 'Assert', coverage: 100 }, ];
const testStatusData = [{name: 'Pass', value: 1253}, {name: 'Fail', value: 12}, {name: 'Skipped', value: 5}];
const COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

const ReportTab: React.FC = () => {
    return (
        <div className="p-6 overflow-auto">
            <PageHeader title="Simulation Report">
                <button onClick={() => alert('Downloading report...')} className="px-4 py-2 text-sm font-semibold bg-secondary-200 dark:bg-secondary-700 rounded-lg hover:bg-secondary-300 dark:hover:bg-secondary-600 transition">Download Report</button>
                <button onClick={() => alert('Exporting project...')} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition">Export Project as .zip</button>
            </PageHeader>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-secondary-900 p-4 rounded-lg shadow">
                    <h3 className="font-semibold mb-4 text-secondary-700 dark:text-secondary-200">Coverage Metrics</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={coverageData}>
                            <XAxis dataKey="name" stroke="rgb(100 116 139)" />
                            <YAxis stroke="rgb(100 116 139)" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgb(20, 23, 59)', border: '1px solid rgb(74, 78, 143)' }} />
                            <Legend />
                            <Bar dataKey="coverage" fill="#363F9E" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-secondary-900 p-4 rounded-lg shadow">
                    <h3 className="font-semibold mb-4 text-secondary-700 dark:text-secondary-200">Test Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={testStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {testStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'rgb(20, 23, 59)', border: '1px solid rgb(74, 78, 143)' }}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ReportTab;