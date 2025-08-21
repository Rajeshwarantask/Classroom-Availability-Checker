const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const TimetableParser = require('../utils/timetableParser');
const Timetable = require('../models/Timetable');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only .doc and .docx files
  const allowedTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .doc and .docx files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// POST /api/timetable/upload
router.post('/upload', upload.single('timetableFile'), async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded. Please select a .doc or .docx file.' 
      });
    }

    filePath = req.file.path;
    console.log('Processing file:', filePath);

    // Parse the uploaded document
    const parser = new TimetableParser();
    const timetableData = await parser.parseDocxFile(filePath);

    console.log('Parsed timetable data:', JSON.stringify(timetableData, null, 2));

    // Check if timetable already exists for this year and section
    const existingTimetable = await Timetable.findOne({
      year: timetableData.year,
      section: timetableData.section
    });

    let savedTimetable;
    
    if (existingTimetable) {
      // Update existing timetable
      existingTimetable.faculty = timetableData.faculty;
      existingTimetable.schedule = timetableData.schedule;
      existingTimetable.updatedAt = new Date();
      savedTimetable = await existingTimetable.save();
      
      console.log('Updated existing timetable for:', timetableData.year, timetableData.section);
    } else {
      // Create new timetable
      const newTimetable = new Timetable(timetableData);
      savedTimetable = await newTimetable.save();
      
      console.log('Created new timetable for:', timetableData.year, timetableData.section);
    }

    // Delete the uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Deleted uploaded file:', filePath);
    }

    res.status(200).json({
      message: existingTimetable ? 'Timetable updated successfully' : 'Timetable uploaded successfully',
      data: savedTimetable
    });

  } catch (error) {
    console.error('Error processing timetable upload:', error);

    // Clean up uploaded file in case of error
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log('Cleaned up file after error:', filePath);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    // Handle specific error types
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'A timetable for this year and section already exists. Use update instead.'
      });
    }

    if (error.message.includes('Failed to parse')) {
      return res.status(400).json({
        error: 'Invalid document format. Please ensure the document contains a proper timetable structure.'
      });
    }

    res.status(500).json({
      error: 'Failed to process timetable upload',
      details: error.message
    });
  }
});

// GET /api/timetable/list - Get all timetables
router.get('/list', async (req, res) => {
  try {
    const timetables = await Timetable.find({}, 'year section createdAt updatedAt')
      .sort({ year: 1, section: 1 });
    
    res.json(timetables);
  } catch (error) {
    console.error('Error fetching timetables:', error);
    res.status(500).json({ error: 'Failed to fetch timetables' });
  }
});

// GET /api/timetable/:year/:section - Get specific timetable
router.get('/:year/:section', async (req, res) => {
  try {
    const { year, section } = req.params;
    const timetable = await Timetable.findOne({ year, section });
    
    if (!timetable) {
      return res.status(404).json({ error: 'Timetable not found' });
    }
    
    res.json(timetable);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
});

// DELETE /api/timetable/:year/:section - Delete specific timetable
router.delete('/:year/:section', async (req, res) => {
  try {
    const { year, section } = req.params;
    const deletedTimetable = await Timetable.findOneAndDelete({ year, section });
    
    if (!deletedTimetable) {
      return res.status(404).json({ error: 'Timetable not found' });
    }
    
    res.json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    console.error('Error deleting timetable:', error);
    res.status(500).json({ error: 'Failed to delete timetable' });
  }
});

module.exports = router;