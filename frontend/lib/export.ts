type Lead = { name: string; email: string; status: string; source: string; createdAt: string };

export function exportLeadsCsv(leads: Lead[]) {
  const headers = ['Name', 'Email', 'Status', 'Source', 'Created'];
  const rows = leads.map((l) => [
    l.name, l.email, l.status, l.source,
    new Date(l.createdAt).toLocaleDateString(),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leads.csv';
  a.click();
  URL.revokeObjectURL(url);
}
