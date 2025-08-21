const mammoth = require('mammoth');

class TimetableParser {
  constructor() {
    this.nonAcademicEntries = [
      'library', 'project', 'open hour', 'club activities', 
      'lunch', 'break', 'free', 'nil', '', ' '
    ];
  }

  async parseDocxFile(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return this.parseTimetable(result.value);
    } catch (error) {
      throw new Error(`Failed to parse DOCX file: ${error.message}`);
    }
  }

  parseTimetable(rawText) {
    console.log("Raw text from document:", rawText.substring(0, 500));
    
    const lines = rawText.split('\n').map(line => line.trim()).filter(line => line);
    
    // Extract year and section from header
    const { year, section, roomNo } = this.extractClassDetails(lines);
    
    // Extract subject mapping table
    const subjectMapping = this.extractSubjectMapping(lines);
    
    // Create faculty structure with unique IDs
    const faculty = this.createFacultyStructure(subjectMapping);
    
    // Parse timetable grid and create schedule
    const schedule = this.parseScheduleGrid(lines, subjectMapping, faculty, roomNo);
    
    return {
      year,
      section,
      faculty,
      schedule
    };
  }

  extractClassDetails(lines) {
    let year = "Unknown Year";
    let section = "Unknown Section";
    let roomNo = "Unknown Room";

    // Look for patterns in the first few lines
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].toLowerCase();
      
      // Extract year (look for patterns like "3 year", "iii year", "third year")
      const yearMatch = line.match(/(\d+)\s*year|([ivx]+)\s*year|(first|second|third|fourth)\s*year/i);
      if (yearMatch) {
        if (yearMatch[1]) year = `${yearMatch[1]} Year`;
        else if (yearMatch[2]) {
          const romanToNum = { 'i': '1', 'ii': '2', 'iii': '3', 'iv': '4' };
          year = `${romanToNum[yearMatch[2].toLowerCase()] || yearMatch[2]} Year`;
        } else if (yearMatch[3]) {
          const wordToNum = { 'first': '1', 'second': '2', 'third': '3', 'fourth': '4' };
          year = `${wordToNum[yearMatch[3].toLowerCase()]} Year`;
        }
      }

      // Extract section (look for "section a", "sec a", etc.)
      const sectionMatch = line.match(/section\s*([a-z])|sec\s*([a-z])/i);
      if (sectionMatch) {
        section = (sectionMatch[1] || sectionMatch[2]).toUpperCase();
      }

      // Extract room number
      const roomMatch = line.match(/room\s*no[:\s]*([a-z0-9\s]+)/i);
      if (roomMatch) {
        roomNo = roomMatch[1].trim();
      }
    }

    return { year, section, roomNo };
  }

  extractSubjectMapping(lines) {
    const subjectMapping = {};
    let inMappingSection = false;
    
    // Look for the mapping table (usually at the bottom)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect start of mapping section
      if (line.toLowerCase().includes('subject') && line.toLowerCase().includes('faculty')) {
        inMappingSection = true;
        continue;
      }
      
      if (inMappingSection) {
        // Parse mapping entries like "21CSC301T | Data Structures | Dr. Smith"
        const mappingMatch = line.match(/([A-Z0-9]+[A-Z])\s*[|\-\t]\s*([^|\-\t]+)\s*[|\-\t]\s*(.+)/);
        if (mappingMatch) {
          const [, subjectCode, subjectTitle, facultyName] = mappingMatch;
          subjectMapping[subjectCode.trim()] = {
            title: subjectTitle.trim(),
            faculty: facultyName.trim()
          };
        }
      }
    }

    // If no mapping found, try to extract from timetable grid context
    if (Object.keys(subjectMapping).length === 0) {
      console.log("No mapping table found, attempting to extract from context");
      // This is a fallback - in real scenarios, you'd need the mapping table
      return this.extractMappingFromGrid(lines);
    }

    return subjectMapping;
  }

  extractMappingFromGrid(lines) {
    // Fallback method - create basic mapping from subject codes found in grid
    const subjectMapping = {};
    const subjectCodes = new Set();
    
    // Extract all subject codes from the grid
    for (const line of lines) {
      const codes = line.match(/[A-Z0-9]{6,}[A-Z]/g);
      if (codes) {
        codes.forEach(code => subjectCodes.add(code));
      }
    }
    
    // Create basic mapping (you'd need to enhance this based on your document format)
    Array.from(subjectCodes).forEach((code, index) => {
      subjectMapping[code] = {
        title: `Subject ${code}`,
        faculty: `Faculty ${index + 1}`
      };
    });
    
    return subjectMapping;
  }

  createFacultyStructure(subjectMapping) {
    const facultyMap = new Map();
    let facultyIdCounter = 1;

    // Group subjects by faculty
    Object.values(subjectMapping).forEach(({ title, faculty }) => {
      if (!facultyMap.has(faculty)) {
        facultyMap.set(faculty, {
          id: `F${String(facultyIdCounter).padStart(3, '0')}`,
          name: faculty,
          subjects: []
        });
        facultyIdCounter++;
      }
      
      const facultyData = facultyMap.get(faculty);
      if (!facultyData.subjects.includes(title)) {
        facultyData.subjects.push(title);
      }
    });

    return Array.from(facultyMap.values());
  }

  parseScheduleGrid(lines, subjectMapping, faculty, roomNo) {
    const schedule = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const facultyMap = new Map();
    
    // Create reverse mapping for faculty lookup
    faculty.forEach(f => {
      f.subjects.forEach(subject => {
        facultyMap.set(subject, f.id);
      });
    });

    // Initialize empty periods for each day
    days.forEach(day => {
      for (let period = 1; period <= 8; period++) {
        schedule[day].push({
          period,
          occupied: false
        });
      }
    });

    // Parse the timetable grid
    let currentDayIndex = -1;
    
    for (const line of lines) {
      // Check if this line contains a day name
      const dayMatch = days.find(day => line.toLowerCase().includes(day.toLowerCase()));
      if (dayMatch) {
        currentDayIndex = days.indexOf(dayMatch);
        continue;
      }

      // If we're in a valid day context, parse periods
      if (currentDayIndex >= 0) {
        const currentDay = days[currentDayIndex];
        this.parsePeriodLine(line, schedule[currentDay], subjectMapping, facultyMap, roomNo);
      }
    }

    return schedule;
  }

  parsePeriodLine(line, daySchedule, subjectMapping, facultyMap, roomNo) {
    // Split line into potential period entries
    const entries = line.split(/[\t|]+/).map(entry => entry.trim()).filter(entry => entry);
    
    entries.forEach((entry, index) => {
      if (index < daySchedule.length) {
        const period = daySchedule[index];
        
        // Check if entry is a subject code
        const subjectCode = Object.keys(subjectMapping).find(code => 
          entry.includes(code)
        );
        
        if (subjectCode && subjectMapping[subjectCode]) {
          const subjectData = subjectMapping[subjectCode];
          const facultyId = facultyMap.get(subjectData.title);
          
          period.occupied = true;
          period.facultyId = facultyId;
          period.room = roomNo;
          period.subject = subjectData.title;
        } else if (this.isNonAcademicEntry(entry)) {
          period.occupied = false;
        }
      }
    });
  }

  isNonAcademicEntry(entry) {
    const lowerEntry = entry.toLowerCase().trim();
    return this.nonAcademicEntries.some(nonAcademic => 
      lowerEntry.includes(nonAcademic)
    );
  }
}

module.exports = TimetableParser;