'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem} from '@/components/ui/dropdown-menu';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useDebounce } from '@/hooks/useDebounce';
import { getRole } from '@/lib/auth';
import { exportLeadsCsv } from '@/lib/export';

type Lead = {
  _id: string;
  name: string;
  email: string;
  status: string;
  source: string;
  createdAt: string;
};

type LeadForm = { 
  name: string; 
  email: string; 
  status: string; 
  source: string 
};
type Pagination = { 
  page: number; 
  limit: number; 
  total: number; 
  totalPages: number 
};

const STATUS_OPTIONS = ['New', 'Contacted', 'Qualified', 'Lost'];
const SOURCE_OPTIONS = ['Website', 'Instagram', 'Referral'];

const STATUS_COLORS: Record<string, string> = {
  New: 'bg-blue-100 text-blue-700',
  Contacted: 'bg-yellow-100 text-yellow-700',
  Qualified: 'bg-green-100 text-green-700',
  Lost: 'bg-red-100 text-red-700',
};

export default function LeadsPage() {
  const router = useRouter();
  const role = getRole();
  const isAdmin = role === 'admin';

  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState('latest');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [serverError, setServerError] = useState('');

  const debouncedSearch = useDebounce(searchInput, 400);

  const { register,handleSubmit,reset,formState: { errors, isSubmitting }} = useForm<LeadForm>({ defaultValues: { status: 'New', source: 'Website' } });

  const fetchLeads = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), sort });
    if (status) params.append('status', status);
    if (source) params.append('source', source);
    if (debouncedSearch) params.append('search', debouncedSearch);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leads?${params}`, {
      credentials: 'include',
    });
    if (res.status === 401) { router.push('/login'); return; }
    const data = await res.json();
    setLeads(data.leads);
    setPagination(data.pagination);
  }, [page, status, source, debouncedSearch, sort, router]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads, router]);

  // Reset to page 1 when debounced search changes
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  function openCreate() {
    reset({ name: '', email: '', status: 'New', source: 'Website' });
    setServerError('');
    setSelected(null);
    setModal('create');
  }

  function openEdit(lead: Lead) {
    reset({ name: lead.name, email: lead.email, status: lead.status, source: lead.source });
    setServerError('');
    setSelected(lead);
    setModal('edit');
  }

  function closeModal() { setModal(null); setSelected(null); }

  async function onSave(data: LeadForm) {
    setServerError('');
    const url = modal === 'edit' ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leads/${selected!._id}` : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leads`;
    const res = await fetch(url, {
      method: modal === 'edit' ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    if (!res.ok) {
      const json = await res.json();
      setServerError(json.message || 'Error saving lead');
      return;
    }
    closeModal();
    fetchLeads();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this lead?')) return;
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leads/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    fetchLeads();
  }

  async function handleExport() {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (source) params.append('source', source);
    if (debouncedSearch) params.append('search', debouncedSearch);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leads/export?${params}`, {
      credentials: 'include',
    });
    if (!res.ok) return;
    const data = await res.json();
    exportLeadsCsv(data.leads);
  }

  function handleLogout() {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).then(() => router.push('/login'));
  }
  function resetPage() { setPage(1); }

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-black">
      <div className="max-w-6xl mx-auto p-6">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold dark:text-white">GiG Flow</h1>
          <div className="flex gap-2">
            {isAdmin && <Button className="bg-black text-white dark:bg-white dark:text-black"onClick={openCreate}>Add Lead</Button>}
            {isAdmin && (
              <Button className="bg-black text-white dark:bg-white dark:text-black"onClick={handleExport}>Export CSV</Button>
            )}
            <ThemeToggle />
            <Button variant="outline" className="bg-black text-white dark:bg-white dark:text-black"onClick={handleLogout}>Logout</Button>
          </div>
        </div>

        <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-center shadow-sm">
          <Input
            placeholder="Search name or email"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-52  dark:bg-white dark:text-black"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className=" dark:bg-white dark:text-black">{status || 'All Statuses'}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => { setStatus(''); resetPage(); }}>All Statuses</DropdownMenuItem>
              {STATUS_OPTIONS.map((s) => (
                <DropdownMenuItem key={s} onSelect={() => { setStatus(s); resetPage(); }}>{s}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className=" dark:bg-white dark:text-black">{source || 'All Sources'}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => { setSource(''); resetPage(); }}>All Sources</DropdownMenuItem>
              {SOURCE_OPTIONS.map((s) => (
                <DropdownMenuItem key={s} onSelect={() => { setSource(s); resetPage(); }}>{s}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className=" dark:bg-white dark:text-black">{sort === 'oldest' ? 'Oldest' : 'Latest'}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => { setSort('latest'); resetPage(); }}>Latest</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { setSort('oldest'); resetPage(); }}>Oldest</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {(status || source || searchInput) && (
            <Button variant="ghost" size="sm" onClick={() => { setStatus(''); setSource(''); setSearchInput(''); resetPage(); }}>
              Clear
            </Button>
          )}
        </div>

        <div className="bg-card  border border-border  rounded-xl overflow-hidden shadow-sm">
          <Table className='dark:bg-black'>
            <TableHeader >
              <TableRow className='dark:text-white'>
                <TableHead className='dark:text-white' >Name</TableHead>
                <TableHead className='dark:text-white'>Email</TableHead>
                <TableHead className='dark:text-white'>Status</TableHead>
                <TableHead className='dark:text-white'>Source</TableHead>
                <TableHead className='dark:text-white'>Created</TableHead>
                {isAdmin && <TableHead className='dark:text-white'>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center text-muted-foreground py-10 dark:text-white">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : leads.map((lead) => (
                <TableRow key={lead._id}>
                  <TableCell className="font-medium dark:text-white">{lead.name}</TableCell>
                  <TableCell className="text-muted-foreground dark:text-white">{lead.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status] ?? ''}`}>
                      {lead.status}
                    </span>
                  </TableCell>
                  <TableCell className="dark:text-white">{lead.source}</TableCell>
                  <TableCell className="text-muted-foreground dark:text-white">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="bg-black text-white dark:bg-white dark:text-black" onClick={() => openEdit(lead)}>Edit</Button>
                        <Button size="sm" variant="destructive" className="bg-black text-white dark:bg-white dark:text-black" onClick={() => handleDelete(lead._id)}>Delete</Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {pagination.totalPages > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              {pagination.total === 0
                ? 'No results'
                : `Showing ${(page - 1) * 10 + 1}–${Math.min(page * 10, pagination.total)} of ${pagination.total}`}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="bg-black text-white dark:bg-white dark:text-black" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground dark:text-gray-400">Page {page} of {pagination.totalPages}</span>
              <Button variant="outline" size="sm" className="bg-black text-white dark:bg-white dark:text-black" onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card dark:bg-zinc-900 text-card-foreground dark:text-white border border-border dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">{modal === 'create' ? 'Add Lead' : 'Edit Lead'}</h2>
            <form onSubmit={handleSubmit(onSave)} className="space-y-3">
              <div>
                <Input
                  placeholder="Name"
                  className=" text-white dark:bg-white dark:text-black"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  className=" text-white dark:bg-white dark:text-black"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <select
                  {...register('status', { required: true })}
                  className="w-full border border-border dark:border-zinc-700  rounded-lg px-3 py-1.5 text-sm bg-card dark:bg-white text-card-foreground dark:text-black"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <select
                  {...register('source', { required: true })}
                  className="w-full border border-border dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm bg-card dark:bg-white text-card-foreground dark:text-black"
                >
                  {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {serverError && <p className="text-destructive text-sm">{serverError}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-black text-white dark:bg-white dark:text-black">
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
                <Button type="button" variant="outline" onClick={closeModal} className="flex-1 bg-black text-white dark:bg-white dark:text-black">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
