import { Router } from 'express';
import { Lead } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

export const leadsRoutes = Router();

leadsRoutes.use(authMiddleware);

function buildFilter(query: Record<string, string>) {
  const { status, source, search } = query;
  const filter: Record<string, any> = {};
  if (status) filter.status = status;
  if (source) filter.source = source;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  return filter;
}

leadsRoutes.get('/export', requireAdmin, async (req, res) => {
  const filter = buildFilter(req.query as Record<string, string>);
  const leads = await Lead.find(filter).sort({ createdAt: -1 });
  res.json({ leads });
});

leadsRoutes.get('/', async (req, res) => {
  const { sort, page = '1' } = req.query as Record<string, string>;
  const limit = 10;
  const skip = (parseInt(page) - 1) * limit;
  const filter = buildFilter(req.query as Record<string, string>);
  const sortOrder = sort === 'oldest' ? 1 : -1;

  const [leads, total] = await Promise.all([
    Lead.find(filter).sort({ createdAt: sortOrder }).skip(skip).limit(limit),
    Lead.countDocuments(filter),
  ]);

  res.json({
    leads,
    pagination: {
      page: parseInt(page),
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

leadsRoutes.get('/:id', async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) { res.status(404).json({ message: 'Lead not found' }); return; }
  res.json(lead);
});

leadsRoutes.post('/', requireAdmin, async (req, res) => {
  const { name, email, status, source } = req.body;
  if (!name || !email) { res.status(400).json({ message: 'Name and email are required' }); return; }
  const lead = await Lead.create({ name, email, status, source });
  res.status(201).json(lead);
});

leadsRoutes.put('/:id', requireAdmin, async (req, res) => {
  const { name, email, status, source } = req.body;
  const lead = await Lead.findByIdAndUpdate(req.params.id, { name, email, status, source }, { new: true });
  if (!lead) { res.status(404).json({ message: 'Lead not found' }); return; }
  res.json(lead);
});

leadsRoutes.delete('/:id', requireAdmin, async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) { res.status(404).json({ message: 'Lead not found' }); return; }
  res.json({ message: 'Lead deleted' });
});
