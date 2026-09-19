import { TypeBadge } from "./StatusBadge";
import { CancelTransactionButton } from "./AdminDeleteControls";
import { fmtDateTime, fmtNum } from "../lib/format";
import { useAuth } from "../context/AuthContext";

export const TransactionTable = ({ rows, onCancelled }) => {
  const { isAdmin } = useAuth();
  return <div className="overflow-x-auto scrollbar-thin"><table className="tbl" data-testid="history-table">
    <thead><tr><th>Waktu</th><th>Jenis</th><th>Barang</th><th className="text-right">Sebelum</th><th className="text-right">Sesudah</th><th className="text-right">Perubahan</th><th>Keterangan</th><th>Petugas</th>{isAdmin && <th>Tindakan</th>}</tr></thead>
    <tbody>{rows.map((transaction) => <tr key={transaction.transaction_id} data-testid={`history-row-${transaction.transaction_id}`}>
      <td className="text-xs text-slate-500 whitespace-nowrap" data-testid={`history-time-${transaction.transaction_id}`}>{fmtDateTime(transaction.occurred_at)}</td>
      <td><TypeBadge type={transaction.type} />{transaction.cancelled && <div data-testid={`history-cancelled-${transaction.transaction_id}`} className="mt-1 text-xs font-semibold text-red-700">Dibatalkan</div>}</td>
      <td><div className="font-semibold text-brand-blue" data-testid={`history-item-${transaction.transaction_id}`}>{transaction.item_name}</div><div className="text-xs text-slate-500">{transaction.unit}</div></td>
      <td className="text-right num" data-testid={`history-before-${transaction.transaction_id}`}>{fmtNum(transaction.previous_quantity)}</td><td className="text-right num font-bold" data-testid={`history-after-${transaction.transaction_id}`}>{fmtNum(transaction.new_quantity)}</td><td className="text-right num" data-testid={`history-change-${transaction.transaction_id}`}>{transaction.change_quantity > 0 ? "+" : ""}{fmtNum(transaction.change_quantity)}</td>
      <td className="max-w-xs text-xs text-slate-600" data-testid={`history-description-${transaction.transaction_id}`}><div>{transaction.destination || transaction.source || transaction.reason}</div>{transaction.notes && <div className="mt-1 text-slate-500">{transaction.notes}</div>}{transaction.cancelled && <div className="mt-1 text-red-700">Alasan pembatalan: {transaction.cancellation_reason}</div>}</td>
      <td className="text-xs text-slate-500" data-testid={`history-actor-${transaction.transaction_id}`}>{transaction.user_name}</td>
      {isAdmin && <td>{transaction.type === "REVERSAL" ? <span data-testid={`history-audit-only-${transaction.transaction_id}`} className="whitespace-nowrap text-xs text-slate-500">Jejak audit</span> : <CancelTransactionButton transaction={transaction} onCancelled={onCancelled} />}</td>}
    </tr>)}</tbody>
  </table></div>;
};