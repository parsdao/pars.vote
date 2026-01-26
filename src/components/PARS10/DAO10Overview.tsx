import React, { useState } from 'react';
import { 
  Shield, 
  Vault, 
  Scale, 
  Heart, 
  Palette, 
  BookOpen, 
  Settings, 
  MessageSquare, 
  TrendingUp, 
  Target 
} from 'lucide-react';

// DAO Type definitions
export enum DAOType {
  Security = 0,
  Treasury = 1,
  Governance = 2,
  Health = 3,
  Culture = 4,
  Research = 5,
  Infrastructure = 6,
  Consular = 7,
  Venture = 8,
  Impact = 9
}

// DAO Configuration
const DAO_CONFIG = [
  {
    type: DAOType.Security,
    name: 'امنیّت',
    nameEnglish: 'Security',
    icon: Shield,
    allocation: 8,
    monthlyBudget: '$8K',
    color: 'from-red-500 to-red-700',
    mandate: 'Coercion resistance, private governance, threshold custody, threat-mode operations',
    outputs: [
      'Quarterly security posture reports',
      'Incident logs (sanitized for privacy)',
      'Audit plans and results',
      'Security training materials'
    ]
  },
  {
    type: DAOType.Treasury,
    name: 'خزانه',
    nameEnglish: 'Treasury',
    icon: Vault,
    allocation: 12,
    monthlyBudget: '$12K',
    color: 'from-green-500 to-green-700',
    mandate: 'Vaults, accounting, audits, execution, receipts management',
    outputs: [
      'Budget vs actual reports (monthly)',
      'Receipts ledger (public)',
      'Monthly transparency disclosures',
      'Financial audit reports'
    ]
  },
  {
    type: DAOType.Governance,
    name: 'داد',
    nameEnglish: 'Governance',
    icon: Scale,
    allocation: 4,
    monthlyBudget: '$4K',
    color: 'from-purple-500 to-purple-700',
    mandate: 'Charter, rules, disputes, constraints, constitutional evolution',
    outputs: [
      'Constitutional amendments',
      'Governance procedures documentation',
      'Dispute resolution decisions',
      'Proposal standard updates'
    ]
  },
  {
    type: DAOType.Health,
    name: 'سلامت',
    nameEnglish: 'Health',
    icon: Heart,
    allocation: 20,
    monthlyBudget: '$20K',
    color: 'from-pink-500 to-pink-700',
    mandate: 'Humanitarian aid + health programs with privacy for beneficiaries',
    outputs: [
      'Verified delivery confirmations',
      'Impact scorecards (anonymized)',
      'Emergency response metrics',
      'Health program outcomes'
    ],
    isLargest: true
  },
  {
    type: DAOType.Culture,
    name: 'فرهنگ',
    nameEnglish: 'Culture',
    icon: Palette,
    allocation: 10,
    monthlyBudget: '$10K',
    color: 'from-indigo-500 to-indigo-700',
    mandate: 'Arts, heritage, creators, media, entertainment',
    outputs: [
      'Cultural programming metrics',
      'Reach and engagement analytics',
      'Content creation outputs',
      'Community growth metrics'
    ]
  },
  {
    type: DAOType.Research,
    name: 'دانش',
    nameEnglish: 'Research',
    icon: BookOpen,
    allocation: 8,
    monthlyBudget: '$8K',
    color: 'from-blue-500 to-blue-700',
    mandate: 'Scholarships, curriculum, research grants, think tank network',
    outputs: [
      'Research publications',
      'Fellowship awards and outcomes',
      'Educational curricula',
      'Policy draft papers'
    ]
  },
  {
    type: DAOType.Infrastructure,
    name: 'سازندگی',
    nameEnglish: 'Infrastructure',
    icon: Settings,
    allocation: 12,
    monthlyBudget: '$12K',
    color: 'from-gray-500 to-gray-700',
    mandate: 'Capacity building: logistics, civic rails, platforms, tooling',
    outputs: [
      'Capability mapping',
      'Delivered systems documentation',
      'Partner integration reports',
      'Infrastructure performance metrics'
    ]
  },
  {
    type: DAOType.Consular,
    name: 'پیام',
    nameEnglish: 'Consular',
    icon: MessageSquare,
    allocation: 10,
    monthlyBudget: '$10K',
    color: 'from-teal-500 to-teal-700',
    mandate: 'Partnerships (NGOs/corps/govs), MoUs, foreign relations, diaspora chapters',
    outputs: [
      'Partner directory (public)',
      'Treaty ledger',
      'PPP pipeline',
      'Diplomatic communications log'
    ]
  },
  {
    type: DAOType.Venture,
    name: 'وقف',
    nameEnglish: 'Venture',
    icon: TrendingUp,
    allocation: 6,
    monthlyBudget: '$6K',
    color: 'from-yellow-500 to-yellow-700',
    mandate: 'Endowment-style investing for sustainability + capacity',
    outputs: [
      'Quarterly portfolio reports',
      'Risk disclosures',
      'Returns-to-mission analysis',
      'Investment policy updates'
    ]
  },
  {
    type: DAOType.Impact,
    name: 'میزان',
    nameEnglish: 'Impact',
    icon: Target,
    allocation: 10,
    monthlyBudget: '$10K',
    color: 'from-orange-500 to-orange-700',
    mandate: 'Independent oversight, anti-corruption, ESG-grade reporting, operator scoring',
    outputs: [
      'Monthly "State of the DAO" reports',
      'Integrity ratings for all DAOs',
      'ESG compliance packages',
      'Corruption risk assessments'
    ]
  }
];

interface DAO10OverviewProps {
  className?: string;
}

export function DAO10Overview({ className = "" }: DAO10OverviewProps) {
  const [selectedDAO, setSelectedDAO] = useState<DAOType | null>(null);

  const selectedDAOConfig = selectedDAO !== null ? DAO_CONFIG[selectedDAO] : null;

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          PARS-10 DAO System
        </h1>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto">
          CYRUS NGO operates through 10 specialized DAOs, each with dedicated funding, 
          governance, and accountability. This structure ensures professional execution 
          across all mission areas while maintaining security and transparency.
        </p>
      </div>

      {/* Working Treasury Allocation Visual */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Working Treasury Allocation (24-month operational budget)
        </h2>
        
        {/* Allocation Chart */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {DAO_CONFIG.map((dao) => (
            <div
              key={dao.type}
              className={`
                relative cursor-pointer transition-all duration-200 
                ${selectedDAO === dao.type ? 'scale-105 z-10' : 'hover:scale-102'}
              `}
              onClick={() => setSelectedDAO(dao.type === selectedDAO ? null : dao.type)}
            >
              <div
                className={`
                  h-24 rounded-lg bg-gradient-to-br ${dao.color} 
                  flex flex-col items-center justify-center text-white p-2
                  ${dao.isLargest ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''}
                  shadow-lg hover:shadow-xl transition-shadow
                `}
                style={{ 
                  height: `${Math.max(60, dao.allocation * 4)}px` // Scale height with allocation
                }}
              >
                <dao.icon className="w-6 h-6 mb-1" />
                <div className="text-xs font-medium text-center">
                  {dao.nameEnglish}
                </div>
                <div className="text-lg font-bold">
                  {dao.allocation}%
                </div>
              </div>
              
              {/* Persian name label */}
              <div className="text-center mt-2 text-sm text-gray-600 font-medium">
                {dao.name}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded ring-2 ring-yellow-400 ring-opacity-50"></div>
            <span>Largest allocation (Health DAO - 20%)</span>
          </div>
          <div>
            <span className="font-medium">Total: $2.4M</span> over 24 months
          </div>
        </div>
      </div>

      {/* Selected DAO Details */}
      {selectedDAOConfig && (
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-gray-200">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${selectedDAOConfig.color}`}>
              <selectedDAOConfig.icon className="w-8 h-8 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedDAOConfig.nameEnglish} DAO
                </h3>
                <div className="text-2xl font-bold text-gray-600">
                  {selectedDAOConfig.name}
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedDAOConfig.allocation}% • {selectedDAOConfig.monthlyBudget}/month
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                {selectedDAOConfig.mandate}
              </p>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Key Outputs:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedDAOConfig.outputs.map((output, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600">{output}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Special note for Health DAO */}
              {selectedDAOConfig.type === DAOType.Health && (
                <div className="mt-4 p-4 bg-pink-50 border border-pink-200 rounded-lg">
                  <p className="text-pink-800 font-medium">
                    🌟 <strong>Legitimacy Engine:</strong> The Health DAO receives the largest allocation (20%) 
                    as it serves as CYRUS NGO's primary legitimacy driver through real-world humanitarian impact.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* System Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-lg">Security First</h3>
          </div>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Guardian oversight during bootstrap</li>
            <li>• Timelocked operations</li>
            <li>• Emergency pause capabilities</li>
            <li>• Multi-signature treasury vaults</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-lg">Transparent Funding</h3>
          </div>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Fixed allocation percentages</li>
            <li>• Monthly reporting requirements</li>
            <li>• Public receipts ledger</li>
            <li>• Independent oversight (Impact DAO)</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Scale className="w-6 h-6 text-purple-600" />
            <h3 className="font-semibold text-lg">Democratic Governance</h3>
          </div>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• vePARS voting power</li>
            <li>• Proposal-based decision making</li>
            <li>• Cross-DAO collaboration</li>
            <li>• Constitutional framework</li>
          </ul>
        </div>
      </div>

      {/* Endowment Information */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
          Endowment Fund (END)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">Structure</h3>
            <ul className="text-gray-700 space-y-2">
              <li>• <strong>Size:</strong> 50-80% of total treasury (~$6M)</li>
              <li>• <strong>Purpose:</strong> Long-term sustainability</li>
              <li>• <strong>Steward:</strong> Venture DAO</li>
              <li>• <strong>Governance:</strong> Strict withdrawal limits</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">Constraints</h3>
            <ul className="text-gray-700 space-y-2">
              <li>• Max 2-5% deployable per quarter</li>
              <li>• Risk bucket allocation limits</li>
              <li>• Mandatory conflict disclosures</li>
              <li>• Independent quarterly audits</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">Ready to Participate?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Join CYRUS NGO's governance system. Lock PARS+CYRUS to receive vePARS voting power 
          and help shape the future of Persian diaspora representation.
        </p>
        <div className="space-x-4">
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
            Create Paired Lock
          </button>
          <button className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
            View All Proposals
          </button>
        </div>
      </div>
    </div>
  );
}