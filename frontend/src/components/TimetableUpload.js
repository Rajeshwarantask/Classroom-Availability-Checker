import React, { useState, useRef } from 'react';
import axios from 'axios';
import './TimetableUpload.css';

const TimetableUpload = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    // Validate file type
    const allowedTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus({
        type: 'error',
        message: 'Please select a valid .doc or .docx file.'
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus({
        type: 'error',
        message: 'File size must be less than 10MB.'
      });
      return;
    }

    setSelectedFile(file);
    setUploadStatus(null);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadStatus(null);
    setUploadedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus({
        type: 'error',
        message: 'Please select a file to upload.'
      });
      return;
    }

    setUploading(true);
    setUploadStatus({
      type: 'info',
      message: 'Processing timetable document...'
    });

    try {
      const formData = new FormData();
      formData.append('timetableFile', selectedFile);

      const response = await axios.post('/api/timetable/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout
      });

      setUploadStatus({
        type: 'success',
        message: response.data.message
      });

      setUploadedData(response.data.data);
      
      // Clear the selected file after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Failed to upload timetable.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Upload timeout. Please try again with a smaller file.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setUploadStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="timetable-upload-container">
      <div className="upload-header">
        <h2>Upload Timetable Document</h2>
        <p>
          Upload a .doc or .docx file containing the class timetable. 
          The document should include class details, timetable grid, and subject-faculty mapping.
        </p>
      </div>

      <div className="upload-form">
        <div 
          className={`file-input-container ${dragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="file-input"
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileInputChange}
          />
          
          <div className="file-input-content">
            <div className="file-icon">📄</div>
            <div className="file-input-text">
              {selectedFile ? 'File Selected' : 'Click to select or drag & drop'}
            </div>
            <div className="file-input-subtext">
              Supported formats: .doc, .docx (Max size: 10MB)
            </div>
          </div>

          {selectedFile && (
            <div className="selected-file">
              <div className="selected-file-icon">📄</div>
              <div className="selected-file-info">
                <div className="selected-file-name">{selectedFile.name}</div>
                <div className="selected-file-size">{formatFileSize(selectedFile.size)}</div>
              </div>
              <button 
                className="remove-file-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                title="Remove file"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {uploadStatus && (
          <div className={`upload-status ${uploadStatus.type}`}>
            {uploadStatus.message}
          </div>
        )}

        <div className="upload-actions">
          <button 
            className="upload-btn"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading && <div className="loading-spinner"></div>}
            {uploading ? 'Processing...' : 'Upload Timetable'}
          </button>
          
          <button 
            className="cancel-btn"
            onClick={onBack}
            disabled={uploading}
          >
            Back
          </button>
        </div>
      </div>

      {uploadedData && (
        <div className="timetable-preview">
          <div className="preview-header">
            <div className="preview-title">Uploaded Timetable</div>
            <div className="preview-details">
              {uploadedData.year} - Section {uploadedData.section}
            </div>
          </div>
          
          <div className="faculty-list">
            <h4>Faculty Members ({uploadedData.faculty.length})</h4>
            {uploadedData.faculty.map((faculty, index) => (
              <div key={index} className="faculty-item">
                <div className="faculty-name">
                  {faculty.name} ({faculty.id})
                </div>
                <div className="faculty-subjects">
                  Subjects: {faculty.subjects.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableUpload;