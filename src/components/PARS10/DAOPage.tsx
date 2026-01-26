import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  DollarSign, 
  FileText, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Download
} from 'lucide-react';

export interface DAODetails {
  type: number;
  name: string;
  nameEnglish: string;
  mandate: string;
  allocation: number;
  vault: string;
  operator: string;
  active: boolean;
  monthlyBudget: string;
  totalSpent: string;
  lastReportTime: number;
  ipfsHash: string;
}

export interface Proposal {
  id: number;
  dao: number;
  proposalType: number;
  description: string;
  target: string;
  value: string;
  startTime: number;
  endTime: number;
  timelockEnd: number;
  executed: boolean;
  vetoed: boolean;
  forVotes: string;
  againstVotes: string;
}

interface DAOPageProps {
  daoType: number;
  dao?: DAODetails;
  proposals?: Proposal[];
  className?: string;
}

// Proposal type names
const PROPOSAL_TYPES = [
  { name: 'Standard', timelock: '48 hours', description: 'Regular operational proposals' },
  { name: 'Treasury', timelock: '72 hours', description: 'Financial and budget proposals' },
  { name: 'Constitutional', timelock: '7 days', description: 'Governance framework changes' },
  { name: 'Emergency', timelock: '6 hours', description: 'Security incidents (Security DAO only)' }
];

// Persian to English mapping for display
const DAO_NAMES = {
  'امنیّت': 'Security',
  'خزانه': 'Treasury', 
  'داد': 'Governance',
  'سلامت': 'Health',
  'فرهنگ': 'Culture',
  'دانش': 'Research',
  'سازندگی': 'Infrastructure',
  'پیام': 'Consular',
  'وقف': 'Venture',
  'میزان': 'Impact'
};

export function DAOPage({ daoType, dao, proposals = [], className = "" }: DAOPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'reports' | 'partners'>('overview');
  const [newProposal, setNewProposal] = useState({
    type: 0,
    description: '',
    target: '',
    value: '0',
    callData: ''
  });

  // Mock data if no real data provided
  const mockDAO = {
    type: daoType,
    name: Object.keys(DAO_NAMES)[daoType] || 'سلامت',
    nameEnglish: Object.values(DAO_NAMES)[daoType] || 'Health',
    mandate: 'Humanitarian aid + health programs with privacy for beneficiaries',
    allocation: 20,
    vault: '0x742d35Cc6d5F7B8d6A81a9c66DF8De3456789ABC',
    operator: '0x8ba1f109551bD432803012645Hac189451c9823F',
    active: true,
    monthlyBudget: '$20,000',
    totalSpent: '$45,000',
    lastReportTime: Date.now() - 86400000, // 1 day ago
    ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
  };

  const daoData = dao || mockDAO;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatValue = (value: string) => {
    return `${parseInt(value) / 1e6} CYRUS`;
  };

  const getProposalStatus = (proposal: Proposal) => {
    const now = Date.now() / 1000;
    if (proposal.vetoed) return { status: 'Vetoed', color: 'text-red-600' };
    if (proposal.executed) return { status: 'Executed', color: 'text-green-600' };
    if (now < proposal.startTime) return { status: 'Pending', color: 'text-yellow-600' };
    if (now < proposal.endTime) return { status: 'Voting', color: 'text-blue-600' };
    if (now < proposal.timelockEnd) return { status: 'Timelock', color: 'text-orange-600' };
    return { status: 'Ready to Execute', color: 'text-green-600' };
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {daoData.nameEnglish} DAO
              </h1>
              <div className="text-2xl text-gray-600 font-semibold">
                {daoData.name}
              </div>
              {daoData.active ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Active
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-gray-600 text-lg max-w-4xl">
              {daoData.mandate}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Treasury Allocation</div>
            <div className="text-3xl font-bold text-blue-600">
              {daoData.allocation}%
            </div>
            <div className="text-sm text-gray-600">
              {daoData.monthlyBudget}/month
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-500">Total Spent</div>
              <div className="text-2xl font-bold text-gray-900">{daoData.totalSpent}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-500">Active Proposals</div>
              <div className="text-2xl font-bold text-gray-900">
                {proposals.filter(p => !p.executed && !p.vetoed).length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-500">Last Report</div>
              <div className="text-lg font-semibold text-gray-900">
                {Math.floor((Date.now() - daoData.lastReportTime) / 86400000)} days ago
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-500">Burn Rate</div>
              <div className="text-lg font-semibold text-gray-900">
                {((parseInt(daoData.totalSpent.replace(/\$|,/g, '')) / 3) * 12 / 1000).toFixed(0)}K/year
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'proposals', label: 'Proposals' },
            { id: 'reports', label: 'Reports' },
            { id: 'partners', label: 'Partners' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Mandate & Execution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Mission & Mandate</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {daoData.mandate}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Budget Allocation:</span>
                  <span className="font-medium">{daoData.allocation}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly Budget:</span>
                  <span className="font-medium">{daoData.monthlyBudget}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Operator:</span>
                  <span className="font-mono text-xs">{daoData.operator}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Monthly Report Submitted</div>
                    <div className="text-xs text-gray-500">
                      {formatTime(daoData.lastReportTime / 1000)}
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">New Proposal Created</div>
                    <div className="text-xs text-gray-500">2 days ago</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Treasury Allocation Received</div>
                    <div className="text-xs text-gray-500">1 week ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vault Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Treasury Vault</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Vault Address</div>
                <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                  {daoData.vault}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Current Balance</div>
                <div className="text-lg font-semibold">
                  {(parseInt(daoData.monthlyBudget.replace(/\$|,/g, '')) * 2).toLocaleString()} CYRUS
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Spending Rate</div>
                <div className="text-lg font-semibold text-green-600">
                  {Math.round(Math.random() * 20 + 70)}% of budget
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'proposals' && (
        <div className="space-y-6">
          {/* Create New Proposal */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Proposal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposal Type
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={newProposal.type}
                  onChange={(e) => setNewProposal({...newProposal, type: parseInt(e.target.value)})}
                >
                  {PROPOSAL_TYPES.map((type, index) => (
                    <option key={index} value={index}>
                      {type.name} - {type.timelock}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value (CYRUS)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={newProposal.value}
                  onChange={(e) => setNewProposal({...newProposal, value: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={newProposal.description}
                onChange={(e) => setNewProposal({...newProposal, description: e.target.value})}
                placeholder="Describe your proposal..."
              />
            </div>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Create Proposal
            </button>
          </div>

          {/* Proposals List */}
          <div className="space-y-4">
            {proposals.length > 0 ? proposals.map(proposal => {
              const status = getProposalStatus(proposal);
              return (
                <div key={proposal.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-lg">Proposal #{proposal.id}</h4>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${status.color} bg-opacity-10`}>
                          {status.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {PROPOSAL_TYPES[proposal.proposalType]?.name}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">{proposal.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Value</div>
                          <div className="font-medium">{formatValue(proposal.value)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">For Votes</div>
                          <div className="font-medium text-green-600">{formatValue(proposal.forVotes)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Against Votes</div>
                          <div className="font-medium text-red-600">{formatValue(proposal.againstVotes)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Ends</div>
                          <div className="font-medium">{formatTime(proposal.endTime)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6 space-y-2">
                      {status.status === 'Voting' && (
                        <>
                          <button className="block w-full px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                            Vote For
                          </button>
                          <button className="block w-full px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                            Vote Against
                          </button>
                        </>
                      )}
                      {status.status === 'Ready to Execute' && (
                        <button className="block w-full px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                          Execute
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No proposals yet. Create the first one!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Reports</h3>
            
            {/* Latest Report */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">December 2024 Report</h4>
                  <p className="text-sm text-gray-500">
                    Submitted {formatTime(daoData.lastReportTime / 1000)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 flex items-center space-x-1">
                    <ExternalLink className="w-4 h-4" />
                    <span>View IPFS</span>
                  </button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Spending</div>
                  <div className="font-medium">$18,500 / $20,000</div>
                </div>
                <div>
                  <div className="text-gray-500">Initiatives</div>
                  <div className="font-medium">7 Active</div>
                </div>
                <div>
                  <div className="text-gray-500">Impact Score</div>
                  <div className="font-medium text-green-600">8.5/10</div>
                </div>
              </div>
            </div>

            {/* Historical Reports */}
            <div className="space-y-2">
              {['November 2024', 'October 2024', 'September 2024'].map((month, index) => (
                <div key={month} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span>{month}</span>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm">Download</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'partners' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Partnership Directory</h3>
            <p className="text-gray-600 mb-6">
              Active partnerships and collaborations managed by this DAO.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'International Red Cross', type: 'Humanitarian', status: 'Active' },
                { name: 'Doctors Without Borders', type: 'Medical', status: 'Active' },
                { name: 'UNHCR', type: 'Refugee Services', status: 'Pending' }
              ].map((partner, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{partner.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      partner.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {partner.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{partner.type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}