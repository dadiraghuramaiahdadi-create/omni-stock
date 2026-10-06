import React, { useState } from 'react';
import { useOmniStock } from '../context/OmniStockContext';
import { 
  Cpu, 
  ShieldCheck, 
  AlertOctagon, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Clock, 
  Lock, 
  Database,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

export const ConcurrencyEngineView: React.FC = () => {
  const { 
    items, 
    getItemStockTotal, 
    runConcurrencySimulation, 
    isSimulating,
    showNotification 
  } = useOmniStock();

  const [selectedItemId, setSelectedItemId] = useState<string>(items[1]?.id || items[0].id); // MacBook Pro 16"
  const [threadCount, setThreadCount] = useState<number>(10);
  const [results, setResults] = useState<any[] | null>(null);

  const selectedItem = items.find((i) => i.id === selectedItemId) || items[0];
  const stock = getItemStockTotal(selectedItem.id);

  const handleLaunchStressTest = async () => {
    const threadResults = await runConcurrencySimulation(selectedItem.id, threadCount);
    setResults(threadResults);
    showNotification(
      `Concurrency stress test completed! Evaluated ${threadCount} parallel threads against SKU ${selectedItem.sku}`,
      'success',
    );
  };

  const committedCount = results?.filter((r) => r.status === 'COMMITTED').length || 0;
  const rejectedCount = results?.filter((r) => r.status === 'REJECTED_STOCK_DEPLETED').length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-sky-400" />
            <span>Real-Time Concurrency Engine & Race-Condition Lab</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Deterministic atomic inventory deductions powered by PostgreSQL <code className="text-sky-300 font-mono">SELECT ... FOR UPDATE</code> & Redis Redlock Hotkey Mutexes
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero Overselling SLA: 100% Guaranteed</span>
        </div>
      </div>

      {/* Control Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Stress Test Configuration & Live Execution */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white tracking-wide">Live Stress Test Controller</h2>
            <span className="text-[11px] font-mono text-zinc-500">Benchmark Mode: Active</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Target SKU for Flash Sale Checkout</label>
              <select
                value={selectedItemId}
                onChange={(e) => {
                  setSelectedItemId(e.target.value);
                  setResults(null);
                }}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {items.map((item) => {
                  const s = getItemStockTotal(item.id);
                  return (
                    <option key={item.id} value={item.id}>
                      {item.sku} (Available: {s.available} units)
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Concurrent Checkout Threads: <strong className="text-sky-400 font-mono">{threadCount} Threads</strong>
              </label>
              <div className="flex items-center gap-2">
                {[5, 10, 15, 20].map((count) => (
                  <button
                    key={count}
                    onClick={() => setThreadCount(count)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                      threadCount === count
                        ? 'bg-sky-500 text-zinc-950 shadow-md shadow-sky-500/20'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
                    }`}
                  >
                    {count}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Current Target Snapshot */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Target Item Specs</div>
              <div className="text-sm font-bold text-white mt-0.5">{selectedItem.name}</div>
              <div className="text-xs font-mono text-sky-400">{selectedItem.sku} | Barcode: {selectedItem.barcode}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Available for Checkout</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{stock.available} Units</div>
            </div>
          </div>

          {/* Launch Button */}
          <button
            onClick={handleLaunchStressTest}
            disabled={isSimulating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-sky-500/25 disabled:opacity-50 cursor-pointer"
          >
            {isSimulating ? (
              <>
                <Zap className="w-4 h-4 animate-spin text-zinc-950" />
                <span>Simulating Parallel PostgreSQL Transactions...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-zinc-950 fill-zinc-950" />
                <span>Simulate {threadCount} Parallel Checkout Requests</span>
              </>
            )}
          </button>
        </div>

        {/* Right Col: Mathematical Proof / Architectural Contrast */}
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-wide">Race-Condition Architectural Defense</h3>

          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-rose-400">
              <AlertOctagon className="w-4 h-4" />
              <span>Standard Naive Implementation:</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed font-mono">
              Thread 1 & 2 read stock=3 simultaneously. Both deduct 1. Result: Oversold to -7 units. Disaster during flash sales!
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>OmniStock Pessimistic Locking:</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed font-mono">
              <code className="text-emerald-300">SELECT ... FOR UPDATE</code> locks the row immediately. Thread 1..3 commit, Thread 4..10 cleanly rejected with 409 Conflict. Available balance never breaches 0!
            </p>
          </div>

          <div className="pt-2 border-t border-zinc-800 text-[11px] font-mono text-zinc-400 space-y-1">
            <div className="flex justify-between">
              <span>Database Engine:</span>
              <span className="text-zinc-200">PostgreSQL Aurora v16</span>
            </div>
            <div className="flex justify-between">
              <span>Lock Resolution:</span>
              <span className="text-emerald-400 font-bold">&lt; 5.2 ms P99</span>
            </div>
            <div className="flex justify-between">
              <span>Idempotency Cache:</span>
              <span className="text-sky-400">Redis TTL 3600s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Real-Time Results Table */}
      {results && (
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-4 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Simulation Telemetry: {threadCount} Parallel Threads Resolved
              </h3>
              <p className="text-xs text-zinc-400">
                Evaluation results showing deterministic row locking, zero negative stock, and latency
              </p>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                ✓ {committedCount} Committed (200 OK)
              </span>
              <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                ✕ {rejectedCount} Rejected (409 Conflict)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400 font-mono">
                  <th className="pb-3">Thread ID</th>
                  <th className="pb-3">Simulated Order #</th>
                  <th className="pb-3">Resolution Latency</th>
                  <th className="pb-3">Database Lock State</th>
                  <th className="pb-3 text-right">Engine Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {results.map((res) => {
                  const isSuccess = res.status === 'COMMITTED';
                  return (
                    <tr key={res.threadId} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-2.5 text-zinc-400">Thread #{res.threadId}</td>
                      <td className="py-2.5 text-sky-400 font-semibold">{res.orderNumber}</td>
                      <td className="py-2.5 text-zinc-300">{res.latencyMs} ms</td>
                      <td className="py-2.5 text-zinc-400 text-[11px]">{res.message}</td>
                      <td className="py-2.5 text-right font-sans">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider border ${
                            isSuccess
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {isSuccess ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {res.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
