import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, FileText, Settings2, X, Activity } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [scans, setScans] = useState([]);
  const [token, setToken] = useState(null);
  const [selectedScan, setSelectedScan] = useState(null);
  const [strictness, setStrictness] = useState(() => localStorage.getItem('vg_strictness') || 'Medium');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Derive thresholds from Strictness setting
  const getThreshold = () => {
    switch (strictness) {
      case 'High': return 25; // 25+ is red
      case 'Medium': return 50; // 50+ is red
      case 'Low': return 75; // 75+ is red
      default: return 50;
    }
  };

  useEffect(() => {
    localStorage.setItem('vg_strictness', strictness);
  }, [strictness]);

  useEffect(() => {
    const initialize = async () => {
      try {
        // 1. Get a dummy token for testing since we don't have a real auth flow yet
        const loginRes = await axios.post(`${API_BASE}/login`, { username: 'test_user' });
        const authToken = loginRes.data.token;
        setToken(authToken);

        // 2. Fetch history
        const scansRes = await axios.get(`${API_BASE}/scans`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setScans(scansRes.data);
      } catch (err) {
        console.error('Failed to init dashboard:', err);
        setError('Could not connect to the VarnGuard server. Ensure localhost:5000 is running.');
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const isHighRisk = (score) => score >= getThreshold();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full text-left font-sans text-gray-800">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10 w-full px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 text-white p-2 rounded-lg shadow-inner">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 m-0 leading-none">VarnGuard</h1>
            <p className="text-sm text-gray-500 font-medium tracking-wide mt-1">Security Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors shadow-sm cursor-pointer relative overflow-hidden">
          <Settings2 size={18} className="text-gray-500 z-10" />
          <div className="flex flex-col z-10">
            <label htmlFor="strictness-select" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 pointer-events-none">Alert Strictness</label>
            <select 
              id="strictness-select"
              value={strictness}
              onChange={(e) => setStrictness(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-gray-800 focus:outline-none focus:ring-0 p-0 pr-4 cursor-pointer appearance-none"
            >
              <option value="Low">Low (Tolerant)</option>
              <option value="Medium">Medium</option>
              <option value="High">High (Strict)</option>
            </select>
          </div>
          {/* Custom dropdown arrow */}
          <div className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Scan History</h2>
            <p className="text-gray-500 text-base max-w-2xl leading-relaxed">Review the privacy policies and terms you have encountered while browsing. Click any row to see a detailed AI analysis.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-full border border-gray-200 text-sm font-bold text-gray-600 flex items-center gap-2 shadow-sm">
            <Activity size={16} className="text-purple-500" /> {scans.length} Scans Found
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-8 shadow-sm animate-fade-in text-left">
            <div className="flex items-start">
              <ShieldAlert className="h-5 w-5 text-red-500 mr-3 mt-0.5 shrink-0" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80">
                <tr>
                  <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Website URL</th>
                  <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date Scanned</th>
                  <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Risk Score</th>
                  <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-5"><span className="sr-only">View</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                      <div className="animate-pulse flex flex-col items-center justify-center">
                        <div className="h-8 w-8 bg-purple-200 rounded-full mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-48 max-w-full"></div>
                      </div>
                    </td>
                  </tr>
                ) : scans.length === 0 && !error ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-gray-500">
                      <FileText className="mx-auto h-16 w-16 text-gray-300 mb-5" />
                      <p className="text-xl font-bold text-gray-800 mb-2">No scans recorded yet</p>
                      <p className="text-sm text-gray-500 max-w-sm mx-auto">Make sure the Vite server and your backend are running, and that you've visited a Terms & Conditions page with the extension active.</p>
                    </td>
                  </tr>
                ) : (
                  scans.map((scan) => {
                    const dangerous = isHighRisk(scan.riskScore);
                    return (
                      <tr 
                        key={scan._id} 
                        onClick={() => setSelectedScan(scan)}
                        className="hover:bg-gray-50/80 transition-all cursor-pointer group"
                      >
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-gray-900 truncate max-w-[280px]" title={scan.url}>
                          {scan.url}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 font-medium">
                          {new Date(scan.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-full text-xs font-extrabold tracking-wide ${dangerous ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {scan.riskScore}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm">
                          {dangerous ? (
                            <span className="flex items-center text-red-600 font-bold"><ShieldAlert size={16} className="mr-2 stroke-[2.5]" /> High Risk</span>
                          ) : (
                            <span className="flex items-center text-green-600 font-bold"><ShieldCheck size={16} className="mr-2 stroke-[2.5]" /> Safe Profile</span>
                          )}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-bold">
                          <span className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end">
                            View Details <span className="ml-1 leading-none">&rarr;</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Detail View */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-gray-900/60 transition-opacity backdrop-blur-sm" 
              aria-hidden="true"
              onClick={() => setSelectedScan(null)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal Panel */}
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full border border-gray-100 text-gray-800">
              <div className="bg-white px-8 pt-8 pb-8">
                
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl mt-1 ${isHighRisk(selectedScan.riskScore) ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {isHighRisk(selectedScan.riskScore) ? <ShieldAlert size={32} /> : <ShieldCheck size={32} />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-gray-900" id="modal-title">
                        AI Policy Analysis
                      </h3>
                      <a href={selectedScan.url} target="_blank" rel="noreferrer" className="text-sm text-purple-600 hover:text-purple-800 font-medium mt-1 truncate max-w-[400px] block hover:underline">
                        {selectedScan.url}
                      </a>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedScan(null)}
                    className="bg-gray-50 rounded-full p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <X size={20} className="stroke-[2.5]" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 border-t border-gray-100 pt-8">
                  
                  {/* Summary Bullets - takes up 2/3 space on desktop */}
                  <div className="md:col-span-2">
                    <h4 className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                      <FileText size={16} className="mr-2 text-gray-400" /> Key Takeaways
                    </h4>
                    <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-100 h-full">
                      <ul className="space-y-4 text-[15px] text-gray-700 font-medium">
                        {selectedScan.summary && selectedScan.summary.length > 0 ? (
                          selectedScan.summary.map((point, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="sticky top-1 h-1.5 w-1.5 rounded-full bg-purple-500 mt-2 mr-3 shrink-0"></span>
                              <span className="leading-relaxed">{point}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 italic flex items-center h-full justify-center">No summary points generated.</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Sidebar stats & clauses */}
                  <div className="flex flex-col gap-6">
                    {/* Score Card */}
                    <div className={`rounded-xl p-5 border ${isHighRisk(selectedScan.riskScore) ? 'bg-red-50/50 border-red-100' : 'bg-green-50/50 border-green-100'}`}>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 text-center">Threat Level</h4>
                      <div className={`text-4xl font-black text-center mb-1 ${isHighRisk(selectedScan.riskScore) ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedScan.riskScore}
                        <span className="text-sm font-bold text-gray-400">/100</span>
                      </div>
                      <div className={`text-xs font-bold text-center uppercase tracking-wide ${isHighRisk(selectedScan.riskScore) ? 'text-red-500' : 'text-green-500'}`}>
                        {isHighRisk(selectedScan.riskScore) ? 'Critical' : 'Standard'}
                      </div>
                    </div>

                    {/* Risky Clauses */}
                    {(selectedScan.riskyClause && selectedScan.riskyClause.length > 0) || (selectedScan.riskyClauses && selectedScan.riskyClauses.length > 0) ? (
                      <div>
                        <h4 className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                          <ShieldAlert size={14} className="mr-2 text-red-500" /> Flags Triggered
                        </h4>
                        <div className="flex flex-col gap-2">
                          {(selectedScan.riskyClause || selectedScan.riskyClauses).map((clause, idx) => (
                            <div key={idx} className="bg-white border border-red-200 px-3 py-2 rounded-lg text-[13px] font-bold text-red-700 shadow-sm flex items-center before:content-[''] before:w-1 before:h-full before:bg-red-500 before:mr-2 before:rounded-full before:absolute relative overflow-hidden pl-5">
                              {clause}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center text-sm font-medium text-gray-500">
                        No harmful keywords detected in this document.
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
