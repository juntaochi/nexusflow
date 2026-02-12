'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  CheckCircle,
  Wallet,
  Activity,
  Copy,
  ExternalLink,
  Globe,
  Code,
  Mail,
  Cpu,
  Tag,
  FileText,
  Star,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';

interface Service {
  name: string;
  endpoint: string;
  version?: string;
}

interface AgentMetadata {
  name: string;
  description?: string;
  image?: string;
  services?: Service[];
  capabilities?: string[];
  tags?: string[];
  supportedTrust?: string[];
}

interface AgentDetailCardProps {
  agentId: bigint | number;
  profile: {
    name: string;
    metadataURI: string;
    controller: string;
    validated?: boolean;
  };
  reputation: number;
  isTrusted?: boolean;
  feedbackCount?: number;
  validationCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

function CopyButton({ text, className = '' }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${className}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <CheckCircle className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-gray-400" />
      )}
    </button>
  );
}

function AddressDisplay({ address, explorerUrl }: { address: string; explorerUrl?: string }) {
  const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="flex items-center gap-2">
      <code className="text-xs text-gray-300 font-mono bg-black/30 px-2 py-1 rounded">
        {truncated}
      </code>
      <CopyButton text={address} />
      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
        </a>
      )}
    </div>
  );
}

function StatBadge({
  icon: Icon,
  label,
  value,
  suffix,
  color = 'primary',
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
  color?: 'primary' | 'green' | 'yellow' | 'purple';
}) {
  const colorClasses: Record<string, string> = {
    primary: 'text-primary',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
      <Icon className={`w-4 h-4 ${colorClasses[color]}`} />
      <span className="text-xs text-gray-400">{label}:</span>
      <span className={`text-sm font-bold ${colorClasses[color]}`}>{value}</span>
      {suffix && <span className="text-xs text-gray-500">{suffix}</span>}
    </div>
  );
}

function ServiceIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();
  if (lower.includes('web')) return <Globe className="w-4 h-4" />;
  if (lower.includes('mcp')) return <Cpu className="w-4 h-4" />;
  if (lower.includes('email')) return <Mail className="w-4 h-4" />;
  if (lower.includes('a2a') || lower.includes('oasf')) return <Code className="w-4 h-4" />;
  return <Globe className="w-4 h-4" />;
}

type TabType = 'overview' | 'trust' | 'reputation' | 'validations' | 'metadata';

export function AgentDetailCard({
  agentId,
  profile,
  reputation,
  isTrusted,
  feedbackCount = 0,
  validationCount = 0,
  createdAt,
  updatedAt,
}: AgentDetailCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [metadata, setMetadata] = useState<AgentMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  const explorerBaseUrl = 'https://sepolia.basescan.org/address/';

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!profile.metadataURI || !profile.metadataURI.startsWith('http')) return;
      setIsLoadingMetadata(true);
      try {
        const res = await fetch(profile.metadataURI);
        if (res.ok) {
          const data = await res.json();
          setMetadata(data);
        }
      } catch (err) {
        console.error('Failed to fetch metadata:', err);
      } finally {
        setIsLoadingMetadata(false);
      }
    };
    fetchMetadata();
  }, [profile.metadataURI]);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'trust', label: 'Trust' },
    { id: 'reputation', label: 'Reputation' },
    { id: 'validations', label: 'Validations' },
    { id: 'metadata', label: 'Metadata' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Avatar */}
        <div className="relative shrink-0">
          {metadata?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={metadata.image}
              alt={profile.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-2 border-white/10"
            />
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center text-4xl md:text-5xl font-bold text-white border-2 border-white/10">
              {profile.name[0]}
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-black border border-white/20">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{profile.name}</h1>
            {profile.validated && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-xs font-medium text-green-400">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>

          {metadata?.description && (
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">{metadata.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-4">
            <span className="px-2 py-1 rounded bg-primary/10 border border-primary/20 text-primary font-medium">
              Base Sepolia
            </span>
            <span className="text-gray-600">(ID: 84532)</span>
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-300 font-mono">
              Agent #{agentId.toString()}
            </span>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-3">
            <StatBadge icon={Star} label="Reputation" value={reputation} suffix="/100" color="primary" />
            <StatBadge icon={MessageSquare} label="Feedback" value={feedbackCount} color="green" />
            <StatBadge icon={ShieldCheck} label="Validations" value={validationCount} color="purple" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-white/10">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Identity Registry */}
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Identity Registry
                    </h3>
                    <a
                      href={`${explorerBaseUrl}${process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      View Contract <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Owner Address</p>
                      <AddressDisplay
                        address={profile.controller}
                        explorerUrl={`${explorerBaseUrl}${profile.controller}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Agent Wallet */}
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-primary" />
                      Agent Wallet
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                      EIP-712 Verified
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    This is the verified autonomous wallet for this agent, signed with EIP-712.
                  </p>
                  <AddressDisplay
                    address={profile.controller}
                    explorerUrl={`${explorerBaseUrl}${profile.controller}`}
                  />
                </div>

                {/* Agent Endpoints */}
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      Agent Endpoints
                    </h3>
                    <span className="text-xs text-gray-400">
                      {metadata?.services?.length || 0} configured
                    </span>
                  </div>

                  {isLoadingMetadata ? (
                    <div className="h-20 rounded-lg bg-white/5 animate-pulse" />
                  ) : metadata?.services && metadata.services.length > 0 ? (
                    <div className="space-y-2">
                      {metadata.services.map((service, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <ServiceIcon name={service.name} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white uppercase">
                                  {service.name}
                                </span>
                                {service.version && (
                                  <span className="text-[10px] text-gray-500">{service.version}</span>
                                )}
                              </div>
                              <code className="text-[10px] text-gray-500 font-mono truncate block max-w-[300px]">
                                {service.endpoint}
                              </code>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <CopyButton text={service.endpoint} />
                            <a
                              href={service.endpoint}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      <Globe className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No endpoints configured
                    </div>
                  )}
                </div>

                {/* Capabilities */}
                {metadata?.capabilities && metadata.capabilities.length > 0 && (
                  <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-primary" />
                        Capabilities
                      </h3>
                      <span className="text-xs text-gray-400">{metadata.capabilities.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {metadata.capabilities.map((cap, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary"
                        >
                          <ChevronRight className="w-3 h-3" />
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary" />
                      Tags
                    </h3>
                    <span className="text-xs text-gray-400">{metadata?.tags?.length || 0}</span>
                  </div>
                  {metadata?.tags && metadata.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {metadata.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No tags assigned</p>
                  )}
                </div>

                {/* Description */}
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-primary" />
                    Description
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {metadata?.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Agent ID</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-mono text-white">#{agentId.toString()}</span>
                        <CopyButton text={agentId.toString()} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Agent URI</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono text-gray-400 truncate max-w-[120px]">
                          {profile.metadataURI ? profile.metadataURI.slice(0, 20) + '...' : 'N/A'}
                        </span>
                        {profile.metadataURI && <CopyButton text={profile.metadataURI} />}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Activity className="w-3 h-3" />
                        Status
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          profile.validated ? 'text-green-400' : 'text-yellow-400'
                        }`}
                      >
                        {profile.validated ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    {createdAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Created</span>
                        <span className="text-xs text-gray-400">
                          {createdAt.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                    {updatedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Last Updated</span>
                        <span className="text-xs text-gray-400">
                          {updatedAt.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* On-Chain Metadata */}
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-4">On-Chain Metadata</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-gray-500 block mb-1">Agent Registry</span>
                      <div className="flex items-center gap-1">
                        <code className="text-gray-400 font-mono truncate">
                          eip155:84532:0x8004...
                        </code>
                        <CopyButton text={process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS || ''} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Active</span>
                      <span className="text-green-400">true</span>
                    </div>
                    {metadata?.supportedTrust && metadata.supportedTrust.length > 0 && (
                      <div>
                        <span className="text-gray-500 block mb-2">Supported Trust</span>
                        <div className="flex flex-wrap gap-1">
                          {metadata.supportedTrust.map((trust, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px]"
                            >
                              {trust}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trust' && (
            <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-primary/30" />
              <h3 className="text-lg font-bold text-white mb-2">Trust Information</h3>
              <p className="text-sm text-gray-400">
                {isTrusted
                  ? 'This agent has been verified and is trusted by the network.'
                  : 'Trust verification pending. Complete validation to establish trust.'}
              </p>
            </div>
          )}

          {activeTab === 'reputation' && (
            <div className="p-8 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">{reputation}</div>
                  <div className="text-sm text-gray-400">Overall Score</div>
                  <div className="text-xs text-gray-500">Based on {feedbackCount} feedbacks</div>
                </div>
                <div className="h-20 w-px bg-white/10" />
                <div className="text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                      reputation >= 80
                        ? 'bg-green-500/20 text-green-400'
                        : reputation >= 50
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    <Star className="w-4 h-4" />
                    {reputation >= 80 ? 'Excellent' : reputation >= 50 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'validations' && (
            <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
              <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-bold text-white mb-2">
                {validationCount > 0 ? `${validationCount} Validations` : 'No Validations Yet'}
              </h3>
              <p className="text-sm text-gray-400">
                {validationCount > 0
                  ? 'This agent has been validated by network validators.'
                  : 'No validations recorded for this agent.'}
              </p>
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-bold text-white mb-4">Raw Metadata</h3>
              {isLoadingMetadata ? (
                <div className="h-40 rounded-lg bg-white/5 animate-pulse" />
              ) : metadata ? (
                <pre className="text-xs text-gray-400 font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Could not load metadata</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
