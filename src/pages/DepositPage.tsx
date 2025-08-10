import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { ArrowLeft, Copy, Check, Wallet } from 'lucide-react';

interface DepositPageProps {
  onLogout: () => void;
}

const DepositPage: React.FC<DepositPageProps> = ({ onLogout }) => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedOption, setSelectedOption] = useState('bitcoin');
  const navigate = useNavigate();
  
  const handleCopyAddress = () => {
    let address = '';
    switch(selectedOption) {
      case 'bitcoin':
        address = '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2';
        break;
      case 'ethereum':
        address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
        break;
      case 'usdt':
        address = 'TJsKqt5qRuCZXrbjHdKjjKNxAtocTMGgwT';
        break;
    }
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <Sidebar onLogout={onLogout} />
      
      {/* Main Content */}
      <div className="ml-0 lg:ml-64 min-h-screen">
        {/* Header */}
        <TopBar 
          onLogout={onLogout} 
          toggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)} 
        />
        
        {/* Deposit Content */}
        <div className="p-6 space-y-8">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-slate-300 hover:text-white mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </button>

          <div className="bg-gradient-to-r from-yellow-400/10 to-amber-500/10 border border-yellow-400/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                  Deposit Funds
                </h1>
                <p className="text-slate-400 mt-1">Add funds to your investment wallet</p>
              </div>
              <div className="p-4 rounded-xl bg-yellow-400/20 border border-yellow-400/30">
                <Wallet size={28} className="text-yellow-400" />
              </div>
            </div>
          </div>
          
          {/* Deposit Options */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Select Payment Method</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button 
                className={`p-4 rounded-lg flex items-center justify-center ${
                  selectedOption === 'bitcoin' 
                    ? 'bg-yellow-400/20 border border-yellow-400/30' 
                    : 'bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50'
                }`}
                onClick={() => setSelectedOption('bitcoin')}
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-2">₿</span>
                  <span className="font-medium">Bitcoin</span>
                </div>
              </button>
              
              <button 
                className={`p-4 rounded-lg flex items-center justify-center ${
                  selectedOption === 'ethereum' 
                    ? 'bg-yellow-400/20 border border-yellow-400/30' 
                    : 'bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50'
                }`}
                onClick={() => setSelectedOption('ethereum')}
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-2">Ξ</span>
                  <span className="font-medium">Ethereum</span>
                </div>
              </button>
              
              <button 
                className={`p-4 rounded-lg flex items-center justify-center ${
                  selectedOption === 'usdt' 
                    ? 'bg-yellow-400/20 border border-yellow-400/30' 
                    : 'bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50'
                }`}
                onClick={() => setSelectedOption('usdt')}
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-2">₮</span>
                  <span className="font-medium">USDT</span>
                </div>
              </button>
            </div>
            
            {/* Deposit Instructions */}
            <div className="bg-slate-700/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {selectedOption === 'bitcoin' && 'Bitcoin (BTC) Deposit'}
                {selectedOption === 'ethereum' && 'Ethereum (ETH) Deposit'}
                {selectedOption === 'usdt' && 'USDT (Tether) Deposit'}
              </h3>
              
              <p className="text-slate-300 mb-4">Send your deposit to the following address:</p>
              
              <div className="bg-slate-800 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-yellow-400 overflow-x-auto whitespace-nowrap">
                    {selectedOption === 'bitcoin' && '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2'}
                    {selectedOption === 'ethereum' && '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'}
                    {selectedOption === 'usdt' && 'TJsKqt5qRuCZXrbjHdKjjKNxAtocTMGgwT'}
                  </div>
                  <button 
                    className="ml-3 p-2 rounded-lg bg-yellow-400 text-slate-900 hover:bg-yellow-300 transition-colors"
                    onClick={handleCopyAddress}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-4">
                <h4 className="font-medium text-amber-400 mb-2">Important Notes:</h4>
                <ul className="list-disc list-inside text-slate-300 space-y-2">
                  <li>Send only {selectedOption.toUpperCase()} to this deposit address</li>
                  <li>Minimum deposit amount: 0.001 {selectedOption === 'bitcoin' ? 'BTC' : selectedOption === 'ethereum' ? 'ETH' : 'USDT'}</li>
                  <li>Deposits are typically credited after 3 network confirmations</li>
                  <li>Contact support if your deposit doesn't appear after 24 hours</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositPage;