'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Code, ArrowRight, AlertCircle, RefreshCw, Cpu, ShieldCheck } from 'lucide-react';

interface Service {
  name: string;
  endpoint: string;
  version?: string;
  category?: string;
  price?: string;
  verified?: boolean;
}

interface RegistrationData {
  name: string;
  description: string;
  image?: string;
  services: Service[];
  supportedTrust: string[];
}

interface ServiceDiscoveryProps {
  metadataURI: string;
}

export function ServiceDiscovery({ metadataURI }: ServiceDiscoveryProps) {
  const [data, setData] = useState<RegistrationData | null>(null);
  const [discoveredServices, setDiscoveredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = async () => {
    if (!metadataURI || !metadataURI.startsWith('http')) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(metadataURI);
      if (!response.ok) throw new Error('Failed to fetch metadata');
      const json = await response.json();
      setData(json);
    } catch (err) {
      console.error("Metadata fetch error:", err);
      setError('Could not load registration file.');
    } finally {
      setLoading(false);
    }
  };

  const discoverViaAgent = async () => {
    setIsDiscovering(true);
    try {
      const response = await fetch('/api/agent/paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: "Discover all available premium services and strategies in the network" }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const dataMatch = line.match(/^data: (.*)$/m);
          if (dataMatch) {
            try {
              const dataObj = JSON.parse(dataMatch[1]);
              if (line.includes('event: tool')) {
                const toolResult = JSON.parse(dataObj.message);
                
                const newServices: Service[] = [];
                
                if (toolResult.services) {
                    toolResult.services.forEach((s: any) => newServices.push({
                        name: s.name,
                        endpoint: s.url || s.endpoint,
                        version: s.version || "1.0",
                        category: "API Service",
                        verified: true
                    }));
                }
                
                if (toolResult.strategies) {
                    toolResult.strategies.forEach((s: any) => newServices.push({
                        name: s.name,
                        endpoint: s.endpoint,
                        category: s.category,
                        price: s.priceUSDC + " NUSD",
                        verified: s.verified || false
                    }));
                }

                if (newServices.length > 0) {
                    setDiscoveredServices(prev => [...prev, ...newServices]);
                }
              }
            } catch (err) {}
          }
        }
      }
    } catch (error) {
      console.error("Agent discovery failed:", error);
    } finally {
      setIsDiscovering(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, [metadataURI]);

  if (!metadataURI) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Nexus Swarm Discovery
        </h3>
        <button 
            onClick={discoverViaAgent}
            disabled={isDiscovering}
            className="text-[10px] px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          {isDiscovering ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Cpu className="w-3 h-3" />}
          {isDiscovering ? 'Scanning Swarm...' : 'AI Active Scan'}
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
            {discoveredServices.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                >
                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 px-1">
                        Live Discovered by AI:
                    </div>
                    {discoveredServices.map((service, i) => (
                    <motion.div 
                        key={`discovered-${i}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group p-4 rounded-xl bg-primary/5 border border-primary/20 hover:border-primary/40 transition-colors flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                            <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="font-black text-white text-sm uppercase tracking-tight">{service.name}</div>
                            <div className="text-[10px] text-primary/60 font-mono">{service.endpoint}</div>
                        </div>
                        </div>
                        <div className="flex items-center gap-3">
                        {service.verified && (
                            <div className="flex items-center gap-1 text-[8px] font-black text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                <ShieldCheck className="w-2.5 h-2.5" /> Verified
                            </div>
                        )}
                        {service.price && (
                            <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                            {service.price}
                            </span>
                        )}
                        <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                        </div>
                    </motion.div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>

        {data && (
            <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 px-1">
                    On-Chain Identity Manifest:
                </div>
                {data.services?.map((service, i) => (
                <div key={`static-${i}`} className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Code className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="font-semibold text-white text-sm">{service.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{service.endpoint}</div>
                    </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                </div>
                ))}
            </div>
        )}
      </div>

      {loading && (
        <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {!loading && !data && discoveredServices.length === 0 && (
         <div className="p-12 text-center border border-dashed border-white/10 rounded-3xl">
            <Globe className="w-8 h-8 text-gray-700 mx-auto mb-4 opacity-20" />
            <p className="text-xs text-gray-600 font-medium">Use AI Active Scan to discover services in the swarm.</p>
         </div>
      )}
    </div>
  );
}

