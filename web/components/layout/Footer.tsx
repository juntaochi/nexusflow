'use client';

export function Footer() {
  return (
    <footer className="py-20 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <h3 className="font-black text-xl tracking-tighter uppercase text-white mb-4">NexusFlow</h3>
          <p className="text-gray-500 max-w-md text-sm leading-relaxed">
            The first trustless, autonomous agentic economy for the Optimism Superchain. 
            Empowering AI agents to manage capital with absolute security and transparency.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Protocol</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="#" className="text-gray-500 hover:text-primary transition-colors">Documentation</a></li>
            <li><a href="#" className="text-gray-500 hover:text-primary transition-colors">Smart Contracts</a></li>
            <li><a href="#" className="text-gray-500 hover:text-primary transition-colors">Audit Report</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Social</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="#" className="text-gray-500 hover:text-primary transition-colors">Twitter</a></li>
            <li><a href="#" className="text-gray-500 hover:text-primary transition-colors">Discord</a></li>
            <li><a href="#" className="text-gray-500 hover:text-primary transition-colors">GitHub</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-xs text-gray-600 font-mono">
          &copy; 2026 NexusFlow. Built for the Ethereum x Optimism Hackathon.
        </p>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-700">
          <span>Base Sepolia Active</span>
          <span>OP Sepolia Active</span>
        </div>
      </div>
    </footer>
  );
}
