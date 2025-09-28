import express, { Response } from 'express';
import Joi from 'joi';
import Note from '../models/Note';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const createNoteSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  content: Joi.string().min(1).max(10000).required(),
  tags: Joi.array().items(Joi.string().max(30)).default([]),
  backgroundColor: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default('#ffffff')
});

const updateNoteSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  content: Joi.string().min(1).max(10000),
  tags: Joi.array().items(Joi.string().max(30)),
  backgroundColor: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  isPinned: Joi.boolean()
}).min(1);

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/notes
// @desc    Get all notes for authenticated user
// @access  Private
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, tag, sortBy = 'createdAt', order = 'desc', page = 1, limit = 20 } = req.query;
    
    const userId = req.user._id;
    const skip = (Number(page) - 1) * Number(limit);
    
    // Build query
    let query: any = { userId };
    
    // Add search functionality
    if (search) {
      query.$text = { $search: search as string };
    }
    
    // Add tag filter
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    // Build sort object
    const sortOrder = order === 'desc' ? -1 : 1;
    let sortObj: any = {};
    
    if (sortBy === 'title') {
      sortObj.title = sortOrder;
    } else if (sortBy === 'updatedAt') {
      sortObj.updatedAt = sortOrder;
    } else {
      sortObj.createdAt = sortOrder;
    }
    
    // Always sort pinned notes first
    sortObj = { isPinned: -1, ...sortObj };
    
    const [notes, total] = await Promise.all([
      Note.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .select('-__v'),
      Note.countDocuments(query)
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        notes,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notes'
    });
  }
});

// @route   GET /api/notes/:id
// @desc    Get a specific note
// @access  Private
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const note = await Note.findOne({ _id: id, userId }).select('-__v');
    
    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: { note }
    });
  } catch (error: any) {
    console.error('Get note error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid note ID'
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching note'
    });
  }
});

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = createNoteSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message
      });
      return;
    }
    
    const userId = req.user._id;
    const noteData = { ...value, userId };
    
    const note = new Note(noteData);
    await note.save();
    
    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: { note }
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating note'
    });
  }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
// @access  Private
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error, value } = updateNoteSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message
      });
      return;
    }
    
    const { id } = req.params;
    const userId = req.user._id;
    
    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { ...value, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: { note }
    });
  } catch (error: any) {
    console.error('Update note error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid note ID'
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating note'
    });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const note = await Note.findOneAndDelete({ _id: id, userId });
    
    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete note error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid note ID'
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting note'
    });
  }
});

// @route   PATCH /api/notes/:id/pin
// @desc    Toggle pin status of a note
// @access  Private
router.patch('/:id/pin', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const note = await Note.findOne({ _id: id, userId });
    
    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found'
      });
      return;
    }
    
    note.isPinned = !note.isPinned;
    await note.save();
    
    res.status(200).json({
      success: true,
      message: `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`,
      data: { note }
    });
  } catch (error: any) {
    console.error('Toggle pin error:', error);
    if (error.name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid note ID'
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Server error while toggling pin status'
    });
  }
});

// @route   GET /api/notes/stats/summary
// @desc    Get notes statistics for user
// @access  Private
router.get('/stats/summary', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    
    const [totalNotes, pinnedNotes, tagsAggregation] = await Promise.all([
      Note.countDocuments({ userId }),
      Note.countDocuments({ userId, isPinned: true }),
      Note.aggregate([
        { $match: { userId } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);
    
    const topTags = tagsAggregation.map(item => ({
      tag: item._id,
      count: item.count
    }));
    
    res.status(200).json({
      success: true,
      data: {
        totalNotes,
        pinnedNotes,
        topTags
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

export default router;