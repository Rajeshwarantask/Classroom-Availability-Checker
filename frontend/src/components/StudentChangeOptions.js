import React, { useState } from "react";
import TimetableEditor from './TimetableEditor';

const StudentChangeOptions = () => {
  const [mode, setMode] = useState(null);
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [commitMsg, setCommitMsg] = useState("");
  const [showEditor, setShowEditor] = useState(false);

  const handleProceed = () => {
    if (year && section) setShowEditor(true);
  };

    if (showEditor) {
    return (
      <TimetableEditor
        year={year}
        section={section}
        mode={mode}
        commitMsg={commitMsg}
      />
    );
  }

  return (
    <div>
      <h2>Student Changes</h2>
      <div>
        <button onClick={() => setMode("view")}>View</button>
        <button onClick={() => setMode("update")}>Update</button>
        <button onClick={() => setMode("delete")}>Delete</button>
      </div>
      {mode && (
        <div>
          <input
            placeholder="Year (e.g., 1 Year)"
            value={year}
            onChange={e => setYear(e.target.value)}
          />
          <input
            placeholder="Section (e.g., A)"
            value={section}
            onChange={e => setSection(e.target.value)}
          />
          <input
            placeholder="Commit message (optional)"
            value={commitMsg}
            onChange={e => setCommitMsg(e.target.value)}
          />
          <button onClick={handleProceed}>Proceed</button>
        </div>
      )}
    </div>
  );
};

export default StudentChangeOptions;