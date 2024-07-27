import './Handshakes.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import xImg from '../assets/x.png';
import minImg from '../assets/min.png';
import maxImg from '../assets/max.png';
import copy from '../assets/copy.png';

const { REACT_APP_BACKEND_URL } = process.env;

const ITEMS_PER_PAGE = 7;

function HandshakeList() {
  const [handshakes, setHandshakes] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copySuccess, setCopySuccess] = useState('');
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handshake_url = REACT_APP_BACKEND_URL + '/handshake/browser';
  const key_url = REACT_APP_BACKEND_URL + '/auth/api_key';
  const handshakeExportUrl = REACT_APP_BACKEND_URL + '/handshake';

  useEffect(() => {
    const fetchHandshakes = async () => {
      try {
        const response = await axios.get(handshake_url, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setHandshakes(response.data.reverse());
      } catch (error) {
        console.error('Error fetching handshakes:', error);
      }
    };

    const fetchApiKey = async () => {
      try {
        const response = await axios.get(key_url, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setApiKey(response.data.api_key);
      } catch (error) {
        console.error('Error fetching API key:', error);
      }
    };

    fetchApiKey();
    fetchHandshakes();

    const interval = setInterval(() => {
      fetchHandshakes();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusClassName = (status) => {
    switch (status) {
      case 'Awaiting':
        return 'status-awaiting';
      case 'In progress':
        return 'status-in-progress';
      case 'Cracked':
        return 'status-cracked';
      case 'Exhausted':
        return 'status-exhausted';
      case 'Failed':
        return 'status-failed';
      default:
        return '';
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(apiKey)
      .then(() => {
        setCopySuccess('API key copied to clipboard!');
        setTimeout(() => setCopySuccess(''), 2500);
      })
      .catch((error) => {
        console.error('Failed to copy API key:', error);
        setCopySuccess('Failed to copy API key');
      });
  };

  const exportHandshakes = async () => {
    try {
      const response = await axios.get(handshakeExportUrl, {
        headers: { api_key: apiKey },
        responseType: 'text',
      });

      const blob = new Blob([response.data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cracked.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting handshakes:', error);
    }
  };

  const filteredHandshakes = handshakes.filter(handshake => 
    handshake.ssid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      handleUpload(selectedFile);
    }
  };

  const handleUpload = async (file) => {
    if (!file) {
      setUploadMessage('Please select a file to upload.');
      setTimeout(() => setUploadMessage(''), 2500);
      return;
    }

    const formData = new FormData();
    formData.append('pcap', file);

    try {
      const response = await axios.post(handshakeExportUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          api_key: apiKey,
        },
      });

      setUploadMessage('File uploaded successfully!');
      setTimeout(() => setUploadMessage(''), 2500);
      setFile(null);

      const updatedHandshakes = await axios.get(handshake_url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setHandshakes(updatedHandshakes.data.reverse());
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadMessage('Error uploading file');
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
    if (droppedFile) {
      handleUpload(droppedFile);
    }
  };

  return (
    <>
      <div className="handshake-background">
        <div className="window-handshake shadow-handshake shadowPlus4-handshake">
          <div className="window-header">
            <p className="title-handshake">Handshake List</p>
            <div className="middle"></div>
            <div className="buttons">
              <img src={minImg} alt="minimize" className="button" />
              <img src={maxImg} alt="maximize" className="button" />
              <img
                src={xImg}
                alt="close"
                className="button exit"
                onClick={() => (window.location.href = '/')}
              />
            </div>
          </div>
          <div className="window-body-handshake">
            <div className="table">
            <div className="table-head">
            <table border={1}>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>SSID</th>
                  <th>Password</th>
                </tr>
              </thead>
              </table>
              </div>
            <div className="table-container">
              <table border={1}>
              <tbody>
                {filteredHandshakes.map((handshake) => (
                  <tr key={handshake._id} className={getStatusClassName(handshake.status)}>
                    <td>{handshake.status}</td>
                    <td>{handshake.ssid}</td>
                    <td>{handshake.password}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            </div>
            <div className="under-table">
              <button onClick={exportHandshakes} className="export-button">
                Export Handshakes
              </button>
              <input
              type="text"
              placeholder="Search by SSID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            </div>
          </div>
        </div>
        <div className="other">
          <div className="upload">
            <p>Upload PCAP File</p>
            <div
              className={`drop-area ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" className="upload-label">
                Drag & Drop or Click to Upload
              </label>
            </div>
            {uploadMessage && <p className="upload-message">{uploadMessage}</p>}
          </div>
          <div className="api">
            <div className="key">
            <p className="api-key">
              Your API key is: <strong className='key-text'>{apiKey}</strong>
        <img src={copy} onClick={copyToClipboard} className="copy-button" />
      </p>
      </div>
      <div>
      <p>API url: {handshakeExportUrl}</p>
              {copySuccess && <p className="copy-success">{copySuccess}</p>}
              </div>
      </div>
      </div>
      </div>
    </>
  );
}
export default HandshakeList;
