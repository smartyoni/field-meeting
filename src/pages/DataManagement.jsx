import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { openDB } from 'idb';

const DB_NAME = 'FieldMeetingDB';
const STORE_NAME = 'buildings';

async function initDB() {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('address', 'address', { unique: false });
        store.createIndex('name', 'name', { unique: false });
      }
    },
  });
  return db;
}

function DataManagement() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files.length) {
      setFile(e.target.files[0]);
      setMessage('');
    }
  };

  const handleImport = async () => {
    if (!file) {
      setMessage('CSV 파일을 선택해주세요.');
      return;
    }

    setMessage('데이터를 가져오는 중...');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data;
        if (data.length === 0) {
          setMessage('CSV 파일에 데이터가 없거나 형식이 잘못되었습니다.');
          return;
        }

        try {
          const db = await initDB();
          const tx = db.transaction(STORE_NAME, 'readwrite');
          await tx.objectStore(STORE_NAME).clear(); // 기존 데이터 삭제
          for (const record of data) {
            await tx.objectStore(STORE_NAME).add(record);
          }
          await tx.done;
          setMessage(`${data.length}개의 건물 데이터가 성공적으로 저장되었습니다.`);
        } catch (error) {
          console.error('DB 저장 실패:', error);
          setMessage('데이터 저장 중 오류가 발생했습니다.');
        }
      },
      error: (error) => {
        console.error('CSV 파싱 실패:', error);
        setMessage('CSV 파일을 읽는 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center p-4 border-b border-gray-100">
        <button onClick={() => navigate('/')} className="text-accent font-semibold">←</button>
        <h1 className="text-xl font-semibold text-text mx-auto">데이터 관리</h1>
      </div>

      <div className="p-4 space-y-6">
        <div className="p-4 bg-secondary rounded-lg">
          <h2 className="font-medium text-text mb-2">건물 데이터베이스 가져오기</h2>
          <p className="text-sm text-muted mb-4">
            기존에 사용하던 건물 데이터를 CSV 파일로 한번에 가져올 수 있습니다. 파일은 `건물명`, `주소` 등의 헤더를 포함해야 합니다.
          </p>
          
          <input 
            type="file" 
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-blue-700"
          />

          <button 
            onClick={handleImport}
            className="w-full bg-accent text-white py-2 rounded-lg font-medium mt-4 disabled:bg-gray-400"
            disabled={!file}
          >
            가져오기
          </button>

          {message && <p className="text-sm text-center mt-4 text-muted">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default DataManagement;
