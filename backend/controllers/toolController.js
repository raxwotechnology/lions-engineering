const Tool = require('../models/Tool');
const User = require('../models/User');
const Category = require('../models/Category');

// Helper to format tool and populate readable Category Name
const formatTool = async (t) => {
  let categoryName = 'General';
  if (t.category && typeof t.category === 'object' && t.category.name) {
    categoryName = t.category.name;
  } else if (t.category) {
    const catStr = String(t.category);
    if (catStr.match(/^[0-9a-fA-F]{24}$/)) {
      const catObj = await Category.findById(catStr).lean();
      categoryName = catObj ? catObj.name : 'General';
    } else {
      categoryName = catStr;
    }
  }
  return {
    ...t,
    id: t._id ? t._id.toString() : t.id,
    category: categoryName,
    pricePerDay: t.pricePerDay || t.dailyRate || 0,
    dailyRate: t.dailyRate || t.pricePerDay || 0
  };
};

// @desc Get all tools (with optional category filter)
// @route GET /api/tools
const getTools = async (req, res) => {
  try {
    const filter = {};

    // Filter by availability if requested
    if (req.query.isAvailable !== undefined) {
      filter.isAvailable = req.query.isAvailable === 'true';
    }

    // Search query by tool name
    if (req.query.search) {
      filter.name = new RegExp(req.query.search, 'i');
    }

    let tools = await Tool.find(filter)
      .populate('owner', 'name email phone role')
      .populate('category', 'name code icon')
      .sort({ createdAt: -1 })
      .lean();

    let formatted = await Promise.all(tools.map(formatTool));

    // Filter by category name if category query param exists
    if (req.query.category) {
      const catQuery = req.query.category.trim().toLowerCase();
      formatted = formatted.filter(t => t.category.toLowerCase() === catQuery);
    }

    res.status(200).json({
      success: true,
      count: formatted.length,
      tools: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single tool by ID
// @route GET /api/tools/:id
const getToolById = async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id)
      .populate('owner', 'name email phone role')
      .populate('category', 'name code icon')
      .lean();

    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }

    const formatted = await formatTool(tool);

    res.status(200).json({ success: true, tool: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create a new tool
// @route POST /api/tools
const createTool = async (req, res) => {
  try {
    const { name, category, description, pricePerDay, dailyRate, isAvailable, owner, imageUrl } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Please provide required fields: name, category' });
    }

    const finalPricePerDay = Number(pricePerDay || dailyRate || 0);

    let toolOwner = owner || (req.user ? req.user._id : null);
    if (!toolOwner) {
      const fallbackUser = await User.findOne();
      if (fallbackUser) toolOwner = fallbackUser._id;
    }

    // Auto-increment sequential tool code (TL-001, TL-002, TL-003...)
    let finalToolCode = req.body.toolCode;
    if (!finalToolCode || finalToolCode.length < 5) {
      const totalCount = await Tool.countDocuments();
      finalToolCode = `TL-${String(totalCount + 1).padStart(3, '0')}`;
    }

    const tool = await Tool.create({
      name,
      category,
      description: description || '',
      pricePerDay: finalPricePerDay,
      dailyRate: finalPricePerDay,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      owner: toolOwner,
      imageUrl: imageUrl || '',
      toolCode: finalToolCode
    });

    const populatedTool = await Tool.findById(tool._id)
      .populate('owner', 'name email phone role')
      .populate('category', 'name code icon')
      .lean();

    const formatted = await formatTool(populatedTool);

    res.status(201).json({
      success: true,
      message: 'Tool created successfully',
      tool: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update tool details
// @route PUT /api/tools/:id
const updateTool = async (req, res) => {
  try {
    let tool = await Tool.findById(req.params.id);

    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }

    if (req.user && req.user.role !== 'admin' && req.user.role !== 'Admin' && tool.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this tool' });
    }

    const updateData = { ...req.body };
    if (updateData.pricePerDay) {
      updateData.dailyRate = Number(updateData.pricePerDay);
    }

    const updatedTool = await Tool.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('owner', 'name email phone role')
      .populate('category', 'name code icon')
      .lean();

    const formatted = await formatTool(updatedTool);

    res.status(200).json({
      success: true,
      message: 'Tool details updated successfully',
      tool: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete tool
// @route DELETE /api/tools/:id
const deleteTool = async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);

    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }

    if (req.user && req.user.role !== 'admin' && req.user.role !== 'Admin' && tool.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this tool' });
    }

    await Tool.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Tool removed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTools, getToolById, createTool, updateTool, deleteTool };
