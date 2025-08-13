const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

async function parseTimeTableDocument(filePath) {
  try {
    // Read the document
    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value;
    
    // Split text into lines and clean them
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const subjectMapping = {};
    let inSubjectTable = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect start of subject table
      if (line.toLowerCase().includes('subject table') || 
          (line.toLowerCase().includes('s.') && line.toLowerCase().includes('no') && 
           line.toLowerCase().includes('slot') && line.toLowerCase().includes('subject') && 
           line.toLowerCase().includes('code') && line.toLowerCase().includes('title') && 
           line.toLowerCase().includes('faculty'))) {
        inSubjectTable = true;
        continue;
      }
      
      // Skip header rows and empty lines
      if (!inSubjectTable || 
          line.toLowerCase().includes('s.') && line.toLowerCase().includes('no') ||
          line.toLowerCase().includes('slot') ||
          line.toLowerCase().includes('subject code') ||
          line.toLowerCase().includes('subject title') ||
          line.toLowerCase().includes('faculty name') ||
          line.match(/^\d+\s*$/) ||
          line.length < 10) {
        continue;
      }
      
      // Stop if we hit another section or table
      if (line.toLowerCase().includes('time table') && 
          !line.toLowerCase().includes('subject table')) {
        inSubjectTable = false;
        continue;
      }
      
      // Parse subject table rows
      if (inSubjectTable) {
        // Split by multiple spaces or tabs to separate columns
        const parts = line.split(/\s{2,}|\t+/).filter(part => part.trim().length > 0);
        
        if (parts.length >= 4) {
          // Find subject code (usually starts with numbers and contains letters)
          let subjectCodeIndex = -1;
          let subjectCode = '';
          
          for (let j = 0; j < parts.length; j++) {
            const part = parts[j].trim();
            // Subject code pattern: starts with digits, contains letters
            if (/^\d+[A-Z]+\d*[A-Z]*$/i.test(part)) {
              subjectCodeIndex = j;
              subjectCode = part;
              break;
            }
          }
          
          if (subjectCodeIndex !== -1 && subjectCodeIndex + 2 < parts.length) {
            // Subject title is usually after subject code
            let subjectTitle = parts[subjectCodeIndex + 1].trim();
            
            // Faculty is usually the last meaningful column
            let faculty = '';
            for (let k = subjectCodeIndex + 2; k < parts.length; k++) {
              const part = parts[k].trim();
              // Skip L, T, P, C columns (usually single digits or short)
              if (!/^[0-9]+$/.test(part) && part.length > 2) {
                if (faculty) {
                  faculty += ', ' + part;
                } else {
                  faculty = part;
                }
              }
            }
            
            if (subjectCode && subjectTitle && faculty) {
              // Clean up the data
              subjectTitle = subjectTitle.replace(/\s+/g, ' ').trim();
              faculty = faculty.replace(/\s+/g, ' ').trim();
              
              // Merge if duplicate subject code exists
              if (subjectMapping[subjectCode]) {
                // Merge faculty names if different
                const existingFaculty = subjectMapping[subjectCode].faculty;
                if (!existingFaculty.includes(faculty) && !faculty.includes(existingFaculty)) {
                  subjectMapping[subjectCode].faculty = existingFaculty + ', ' + faculty;
                }
              } else {
                subjectMapping[subjectCode] = {
                  subject: subjectTitle,
                  faculty: faculty
                };
              }
            }
          }
        }
      }
    }
    
    return subjectMapping;
    
  } catch (error) {
    console.error('Error parsing document:', error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: node parseTimeTable.js <path-to-docx-file>');
    process.exit(1);
  }
  
  const filePath = args[0];
  
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }
  
  try {
    const subjectMapping = await parseTimeTableDocument(filePath);
    
    // Write to JSON file
    const outputPath = 'subjectMapping.json';
    fs.writeFileSync(outputPath, JSON.stringify(subjectMapping, null, 2), 'utf8');
    
    console.log(`Successfully extracted ${Object.keys(subjectMapping).length} subjects`);
    console.log(`Output saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('Failed to parse timetable:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseTimeTableDocument };