import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';
import { FaFile, FaCode, FaJs, FaFileCode, FaMarkdown } from 'react-icons/fa';
import './MainPage.css';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
`;

const LeftPanel = styled.div`
  width: 66%;
  background: #1e1e1e;
  display: flex;
  flex-direction: column;
  padding: 20px;
  color: #fff;
`;

const RightPanel = styled.div`
  width: 34%;
  background: black;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EditorContainer = styled.div`
  flex: 1;
  display: flex;
  margin-top: 20px;
  background: #1e1e1e;
  border-radius: 4px;
  overflow: auto;
`;

const TabsContainer = styled.div`
  display: flex;
  align-items: center;
  background: #23272e;
  border-bottom: 1px solid #333;
  height: 36px;
  overflow-x: auto;
  white-space: nowrap;
`;

const Tab = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0 16px 0 8px;
  height: 100%;
  cursor: pointer;
  background: ${({ active }) => (active ? '#1e1e1e' : 'transparent')};
  color: ${({ active }) => (active ? '#fff' : '#bbb')};
  border-right: 1px solid #333;
  position: relative;
  &:hover {
    background: #252526;
  }
`;

const TabIcon = styled.span`
  margin-right: 6px;
`;

const TabClose = styled.span`
  margin-left: 8px;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    color: #ff6666;
  }
`;

function MainPage() {
  const backendPort = process.env.REACT_APP_BACKEND_PORT || 4000;
  const iframeRef = useRef(null);
  const [resolution, setResolution] = useState({ width: 480, height: 800 });
  const [scale, setScale] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [openTabs, setOpenTabs] = useState([]);
  const [draggedTab, setDraggedTab] = useState(null);

  useEffect(() => {
    fetch('/vnc_resolution.txt')
      .then(res => res.text())
      .then(text => {
        const match = text.match(/([0-9]+)x([0-9]+)/);
        if (match) {
          setResolution({ width: Number(match[1]), height: Number(match[2]) });
        }
      });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const containerWidth = window.innerWidth * 0.34;
      const containerHeight = window.innerHeight;

      const scaleX = containerWidth / resolution.width;
      const scaleY = containerHeight / resolution.height;
      const newScale = Math.min(scaleX, scaleY);

      setScale(newScale * 0.6);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [resolution]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (iframeRef.current) {
        iframeRef.current.contentWindow.postMessage(
          { type: 'ADB_KEY', key: e.key },
          window.location.origin
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!selectedFile) return;
    const fetchContent = async () => {
      try {
        const response = await fetch(`http://localhost:${backendPort}/api/files/${selectedFile.name}`);
        if (!response.ok) throw new Error('Failed to read file');
        const content = await response.text();
        setFileContent(content);
      } catch (error) {
        setFileContent(`// Error reading file: ${error.message}`);
      }
    };
    fetchContent();
  }, [selectedFile]);

  const getFileIcon = (file) => {
    if (!file) return <FaFile />;
    const ext = (file.icon || file.name.split('.').pop().toLowerCase());
    switch (ext) {
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

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setOpenTabs((prev) => {
      if (prev.find((tab) => tab.name === file.name)) return prev;
      return [...prev, { ...file, dirty: false }];
    });
    try {
      const response = await fetch(`http://localhost:${backendPort}/api/files/${file.name}`);
      if (!response.ok) throw new Error('Failed to read file');
      const content = await response.text();
      setFileContent(content);
    } catch (error) {
      console.error('Error reading file:', error);
      setFileContent(`// Error reading file: ${error.message}`);
    }
  };

  const handleFileChange = (newContent) => {
    setFileContent(newContent);
    if (!selectedFile) return;
    setOpenTabs((prev) => prev.map(tab =>
      tab.name === selectedFile.name ? { ...tab, dirty: true } : tab
    ));
  };

  const handleTabClick = async (file) => {
    setSelectedFile(file);
    try {
      const response = await fetch(`http://localhost:${backendPort}/api/files/${file.name}`);
      if (!response.ok) throw new Error('Failed to read file');
      const content = await response.text();
      setFileContent(content);
    } catch (error) {
      setFileContent(`// Error reading file: ${error.message}`);
    }
  };

  const handleTabClose = (file, e) => {
    e.stopPropagation();
    setOpenTabs((prev) => prev.filter((tab) => tab.name !== file.name));
    if (selectedFile && selectedFile.name === file.name) {
      setTimeout(() => {
        setSelectedFile((prevTabs) => {
          const remain = openTabs.filter((tab) => tab.name !== file.name);
          return remain.length > 0 ? remain[remain.length - 1] : null;
        });
      }, 0);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleTabDragStart = (tab) => {
    setDraggedTab(tab);
  };
  const handleTabDragOver = (e) => {
    e.preventDefault();
  };
  const handleTabDrop = (targetTab) => {
    if (!draggedTab || draggedTab.name === targetTab.name) return;
    const oldIndex = openTabs.findIndex((t) => t.name === draggedTab.name);
    const newIndex = openTabs.findIndex((t) => t.name === targetTab.name);
    if (oldIndex === -1 || newIndex === -1) return;
    const newTabs = [...openTabs];
    newTabs.splice(oldIndex, 1);
    newTabs.splice(newIndex, 0, draggedTab);
    setOpenTabs(newTabs);
    setDraggedTab(null);
  };

  // 저장 단축키(Control+S/Command+S) 핸들러
  useEffect(() => {
    const handleSave = async (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!selectedFile) return;
        // 저장
        try {
          const response = await fetch(`http://localhost:${backendPort}/api/files/${selectedFile.name}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: fileContent }),
          });
          if (!response.ok) throw new Error('Failed to write file');
          setOpenTabs((prev) => prev.map(tab =>
            tab.name === selectedFile.name ? { ...tab, dirty: false } : tab
          ));
        } catch (error) {
          // 저장 실패 시 처리
        }
      }
    };
    window.addEventListener('keydown', handleSave);
    return () => window.removeEventListener('keydown', handleSave);
  }, [selectedFile, fileContent]);

  return (
    <Container>
      <LeftPanel>
        <EditorContainer>
          <FileExplorer onFileSelect={handleFileSelect} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <TabsContainer>
              {openTabs.map((tab) => (
                <Tab
                  key={tab.name}
                  active={selectedFile && tab.name === selectedFile.name}
                  onClick={() => handleTabClick(tab)}
                  draggable
                  onDragStart={() => handleTabDragStart(tab)}
                  onDragOver={handleTabDragOver}
                  onDrop={() => handleTabDrop(tab)}
                >
                  <TabIcon>{getFileIcon(tab)}</TabIcon>
                  {tab.name}
                  {tab.dirty && (
                    <span style={{
                      color: '#fff',
                      marginLeft: 4,
                      fontSize: 12,
                      verticalAlign: 'middle',
                      lineHeight: 1,
                      display: 'inline-block'
                    }}>●</span>
                  )}
                  <TabClose onClick={(e) => handleTabClose(tab, e)} title="Close">×</TabClose>
                </Tab>
              ))}
            </TabsContainer>
            {selectedFile && (
              <CodeEditor
                file={selectedFile}
                content={fileContent}
                onChange={handleFileChange}
              />
            )}
          </div>
        </EditorContainer>
      </LeftPanel>

      <RightPanel>
        <div style={{
          width: resolution.width * scale / 0.67,
          height: resolution.height * scale / 0.625,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}>
          <iframe
            id="vnc-iframe"
            ref={iframeRef}
            src="/vnc"
            style={{
              border: "none",
              width: resolution.width / 0.66,
              height: resolution.height / 0.62,
            }}
          />
        </div>
      </RightPanel>
    </Container>
  );
}

export default MainPage;
