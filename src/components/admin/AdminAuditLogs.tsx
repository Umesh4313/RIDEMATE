import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  RefreshCw, 
  Clock, 
  User, 
  FileText, 
  AlertCircle,
  Tag,
  ArrowRight
} from 'lucide-react';
import { AuditLogItem } from '../../types';
import { adminService } from '../../services/adminService';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAuditLogs(actionFilter === 'ALL' ? '' : actionFilter);
      setLogs(data || []);
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [actionFilter]);

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase().trim();
    return !q ||
      log.actor?.toLowerCase().includes(q) ||
      log.action?.toLowerCase().includes(q) ||
      log.description?.toLowerCase().includes(q) ||
      log.targetId?.toLowerCase().includes(q) ||
      log.targetType?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Administrative Governance & System Traceability</span>
          </div>
          <h1 className="text-2xl font-black text-white font-serif">Audit Logs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-proof event stream recorded in MongoDB tracking all GST edits, booking transitions, cancellations, refunds, and fleet adjustments.
          </p>
        </div>

        <button
          onClick={loadAuditLogs}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Reload Audit Stream</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by actor (ganesh@ridemate.io), action, record ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-bold focus:border-blue-500 focus:outline-hidden"
          >
            <option value="ALL">All Event Types</option>
            <option value="TAX_RATE_UPDATED">GST & Tax Updates</option>
            <option value="POLICY_UPDATED">Policy Changes</option>
            <option value="BOOKING_STATUS_CHANGED">Booking Status Changes</option>
            <option value="REFUND_PROCESSED">Refund Operations</option>
            <option value="FLEET_QUANTITY_UPDATED">Fleet Adjustments</option>
            <option value="MAINTENANCE_TOGGLED">Maintenance Changes</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Stream Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Administrator / Actor</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Affected Record</th>
                <th className="py-3 px-4">Delta (Prev → New)</th>
                <th className="py-3 px-4">Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No matching audit log entries found in MongoDB.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Just now'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{item.actor || 'system'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {item.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="font-semibold">{item.targetType}</div>
                      {item.targetId && (
                        <div className="font-mono text-[10px] text-slate-500">{item.targetId}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.previousValue || item.newValue ? (
                        <div className="flex items-center gap-1.5 text-[11px] font-mono">
                          <span className="text-slate-400 line-through">{item.previousValue || 'N/A'}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="text-emerald-400 font-bold">{item.newValue || 'Updated'}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Recorded</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={item.description}>
                      {item.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
