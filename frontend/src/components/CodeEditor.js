import React from 'react';
import styled from 'styled-components';
import Editor from '@monaco-editor/react';

const EditorContainer = styled.div`
  flex: 1;
  height: 100%;
  background-color: #1e1e1e;
  display: flex;
  flex-direction: column;
`;

const EditorHeader = styled.div`
  padding: 10px;
  background-color: #252526;
  color: #fff;
  border-bottom: 1px solid #3c3c3c;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CodeEditor = ({ file, content, onChange }) => {
  const getLanguage = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      default:
        return 'plaintext';
    }
  };

  const handleEditorChange = (value) => {
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <EditorContainer>
      <Editor
        height="100%"
        language={getLanguage(file?.name || '')}
        value={content}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          renderWhitespace: 'selection',
          tabSize: 2,
        }}
        onMount={(editor, monaco) => {
          monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
          });
        }}
      />
    </EditorContainer>
  );
};

export default CodeEditor; 