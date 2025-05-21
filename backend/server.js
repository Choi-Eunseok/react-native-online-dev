const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
app.use(cors());
app.use(express.json());

const MOBILE_APP_PATH = path.join(__dirname, '..', 'MobileApp');

// 파일 트리 읽기 함수
async function readFileTree(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const result = await Promise.all(entries.map(async entry => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      return {
        name: entry.name,
        type: 'folder',
        children: await readFileTree(fullPath)
      };
    } else {
      return {
        name: entry.name,
        type: 'file'
      };
    }
  }));
  return result;
}

// 파일 트리 API
app.get('/api/file-tree', async (req, res) => {
  try {
    const tree = await readFileTree(MOBILE_APP_PATH);
    res.json({ name: 'MobileApp', type: 'folder', children: tree });
  } catch (error) {
    console.error('Error reading file tree:', error);
    res.status(500).json({ error: 'Failed to read file tree' });
  }
});

// 파일 읽기 API
app.get('/api/files/:filename', async (req, res) => {
  try {
    const filePath = path.join(MOBILE_APP_PATH, req.params.filename);
    const content = await fs.readFile(filePath, 'utf8');
    res.send(content);
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// 파일 쓰기 API
app.put('/api/files/:filename', async (req, res) => {
  try {
    const filePath = path.join(MOBILE_APP_PATH, req.params.filename);
    await fs.writeFile(filePath, req.body.content, 'utf8');
    res.json({ success: true });
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).json({ error: 'Failed to write file' });
  }
});

// 파일 생성 API
app.post('/api/files', async (req, res) => {
  try {
    const { name, content = '' } = req.body;
    const filePath = path.join(MOBILE_APP_PATH, name);
    await fs.writeFile(filePath, content, 'utf8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create file' });
  }
});

// 파일 삭제 API
app.delete('/api/files/:filename', async (req, res) => {
  try {
    const filePath = path.join(MOBILE_APP_PATH, req.params.filename);
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend API server is running on port ${PORT}`);
}); 