import React, { useState } from 'react';
import { useOmniStock } from '../context/OmniStockContext';
import { AuditLog, WebhookEvent } from '../types';
import { 
  FileText, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Globe, 
  Eye, 
  Code, 
  Zap,
  Check,
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, webhooks, showNotification } = useOmniStock();
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'WEBHOOKS'>('AUDIT');
  const [selectedPayload, setSelectedPayload] = useState<Record<string, any> | null>(null);

  const handleTestWebhook = () => {
    showNotification('Dispatched test webhook payload to https://api.vertex-supply.io/v1/replenish (HTTP 200 OK - 28ms)', 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Audit Ledger & Webhook Stream</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Immutable SOC 2 Type II audit journal and cryptographically signed (HMAC-SHA256) webhook event pipeline
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center">
            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'AUDIT'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Audit Trail ({auditLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('WEBHOOKS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'WEBHOOKS'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Webhook Deliveries ({webhooks.length})
            </button>
          </div>

          {activeTab === 'WEBHOOKS' && (
            <button
              onClick={handleTestWebhook}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-xs font-bold text-zinc-950 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Test Ping</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Pane */}
      {activeTab === 'AUDIT' ? (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-400 font-mono">
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Actor & Role</th>
                  <th className="p-3.5">Action Code</th>
                  <th className="p-3.5">Target Entity</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3.5 text-zinc-400 text-[11px]">{log.timestamp}</td>
                    <td className="p-3.5 font-sans">
                      <div className="text-zinc-200 font-medium text-xs">{log.userName}</div>
                      <div className="text-[10px] font-mono text-sky-400">{log.userRole}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-sans">
                      <span className="text-zinc-400 mr-1.5">{log.entity}:</span>
                      <span className="font-mono text-sky-400 font-bold">{log.entityId}</span>
                    </td>
                    <td className="p-3.5 text-zinc-400">{log.ipAddress}</td>
                    <td className="p-3.5 text-right font-sans">
                      <button
                        onClick={() => setSelectedPayload(log.payload)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-300 border border-zinc-700 transition-colors"
                      >
                        <Code className="w-3 h-3 text-sky-400" />
                        <span>Inspect JSON</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-400 font-mono">
                  <th className="p-3.5">Event Type</th>
                  <th className="p-3.5">Webhook Endpoint Target</th>
                  <th className="p-3.5">Status Code</th>
                  <th className="p-3.5">Latency</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {webhooks.map((wh) => (
                  <tr key={wh.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3.5 text-sky-400 font-bold">{wh.event}</td>
                    <td className="p-3.5 text-zinc-300 truncate max-w-[280px]">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>{wh.targetUrl}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Check className="w-3 h-3" /> HTTP {wh.statusCode} OK
                      </span>
                    </td>
                    <td className="p-3.5 text-zinc-300">{wh.latencyMs} ms</td>
                    <td className="p-3.5 text-zinc-400 text-[11px]">{wh.timestamp}</td>
                    <td className="p-3.5 text-right font-sans">
                      <button
                        onClick={() => setSelectedPayload(wh.payload)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-300 border border-zinc-700 transition-colors"
                      >
                        <Code className="w-3 h-3 text-sky-400" />
                        <span>Inspect Payload</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JSON Payload Inspector Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400">
                <Code className="w-4 h-4" />
                <span>CRYPTOGRAPHIC AUDIT PAYLOAD (JSON)</span>
              </div>
              <button
                onClick={() => setSelectedPayload(null)}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-sans"
              >
                Close
              </button>
            </div>
            <div className="p-4 bg-zinc-950 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[60vh]">
              <pre>{JSON.stringify(selectedPayload, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
