import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaFolder, FaFolderOpen, FaFile, FaCode, FaJs, FaFileCode, FaMarkdown, FaTrash, FaPlus } from 'react-icons/fa';

const FileExplorerContainer = styled.div`
  width: 250px;
  background-color: #1e1e1e;
  color: #fff;
  padding: 10px;
  overflow-y: auto;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 5px;
  cursor: pointer;
  position: relative;
  background: ${({ selected }) => (selected ? '#094771' : 'none')};
  color: ${({ selected }) => (selected ? '#fff' : 'inherit')};
  &:hover {
    background-color: ${({ selected }) => (selected ? '#094771' : '#2d2d2d')};
  }
`;

const FileName = styled.span`
  margin-left: 5px;
`;

const ContextMenu = styled.ul`
  position: fixed;
  top: ${props => props.y}px;
  left: ${props => props.x}px;
  background: #252526;
  color: #fff;
  border: 1px solid #444;
  border-radius: 4px;
  list-style: none;
  padding: 4px 0;
  margin: 0;
  z-index: 1000;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
`;
const ContextMenuItem = styled.li`
  padding: 6px 16px;
  cursor: pointer;
  &:hover {
    background: #444;
  }
`;

const FileExplorer = ({ onFileSelect }) => {
  const backendPort = process.env.REACT_APP_BACKEND_PORT || 4000;
  const [files, setFiles] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [contextMenu, setContextMenu] = useState(null); // {x, y, target, type}
  const [selectedItem, setSelectedItem] = useState(null);
  const menuRef = useRef();

  const fetchFileTree = () => {
    fetch(`http://localhost:${backendPort}/api/file-tree`)
      .then(res => res.json())
      .then(data => {
        setFiles(data);
        setExpandedFolders(new Set([data.name]));
      });
  };

  useEffect(() => {
    fetchFileTree();
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (contextMenu && menuRef.current && !menuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [contextMenu]);

  const handleContextMenu = (e, item) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      target: item,
      type: item.type
    });
  };

  const handleCreateFile = async (folder) => {
    const name = prompt('생성할 파일명을 입력하세요 (예: newFile.tsx)');
    if (!name) return;
    let filePath = name;
    if (folder && folder.type === 'folder') {
      filePath = folder.name + '/' + name;
    }
    await fetch(`http://localhost:${backendPort}/api/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: filePath, content: '' })
    });
    setContextMenu(null);
    fetchFileTree();
  };

  const handleDeleteFile = async (file) => {
    if (!window.confirm(`${file.name} 파일을 삭제할까요?`)) return;
    await fetch(`http://localhost:${backendPort}/api/files/${file.name}`, { method: 'DELETE' });
    setContextMenu(null);
    fetchFileTree();
  };

  const toggleFolder = (folderId) => {
    const newExpandedFolders = new Set(expandedFolders);
    if (newExpandedFolders.has(folderId)) {
      newExpandedFolders.delete(folderId);
    } else {
      newExpandedFolders.add(folderId);
    }
    setExpandedFolders(newExpandedFolders);
  };

  const getFileIcon = (file) => {
    if (file.type === 'folder') {
      return expandedFolders.has(file.id || file.name) ? <FaFolderOpen /> : <FaFolder />;
    }
    switch ((file.icon || file.name.split('.').pop().toLowerCase())) {
      case 'tsx':
      case 'ts':
        return <FaCode />;
      case 'js':
        return <FaJs />;
      case 'json':
        return <FaFileCode />;
      case 'md':
        return <FaMarkdown />;
      default:
        return <FaFile />;
    }
  };

  const handleSelect = (item) => {
    setSelectedItem(item.name);
    if (item.type === 'file') {
      onFileSelect(item);
    }
  };

  const renderFileTree = (item, level = 0) => {
    if (!item) return null;
    if (item.type === 'folder') {
      const folderId = item.id || item.name;
      return (
        <div key={folderId} style={{ marginLeft: `${level * 20}px` }}>
          <FileItem
            onClick={() => { toggleFolder(folderId); handleSelect(item); }}
            onContextMenu={e => handleContextMenu(e, item)}
            selected={selectedItem === item.name}
          >
            {getFileIcon(item)}
            <FileName>{item.name}</FileName>
          </FileItem>
          {expandedFolders.has(folderId) && item.children && item.children.map(child => renderFileTree(child, level + 1))}
        </div>
      );
    } else {
      return (
        <div key={item.name} style={{ marginLeft: `${level * 20}px`, display: 'flex', alignItems: 'center' }}>
          <FileItem
            onClick={() => handleSelect(item)}
            onContextMenu={e => handleContextMenu(e, item)}
            style={{ flex: 1 }}
            selected={selectedItem === item.name}
          >
            {getFileIcon(item)}
            <FileName>{item.name}</FileName>
          </FileItem>
        </div>
      );
    }
  };

  return (
    <FileExplorerContainer>
      {files ? renderFileTree(files) : <div>Loading...</div>}
      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} ref={menuRef}>
          {contextMenu.type === 'folder' && (
            <ContextMenuItem onClick={() => handleCreateFile(contextMenu.target)}>
              <FaPlus style={{ marginRight: 6 }} /> 새 파일
            </ContextMenuItem>
          )}
          <ContextMenuItem onClick={() => handleDeleteFile(contextMenu.target)}>
            <FaTrash style={{ marginRight: 6 }} /> 삭제
          </ContextMenuItem>
        </ContextMenu>
      )}
    </FileExplorerContainer>
  );
};

export default FileExplorer; 