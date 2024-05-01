import React, { useState } from 'react';
import pdfToText from 'react-pdftotext';

const FileUploadStep = () => {
  const [images, setImages] = useState<string[]>([]);
  const [startResult, setStartResult] = useState(0);
  const [endResult, setEndResult] = useState(29); // Default end result for the range
  const [selectAll, setSelectAll] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const extractImageUrls = (text: string): string[] => {
    if (!text) {
      return [];
    }
    const matches = text.match(/(https?:\/\/[^\s]+)/g);

    if (!matches) {
      return [];
    }

    return matches.filter(url => /\.(jpg|jpeg|png|gif)$/i.test(url));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null || e.target.files === undefined) {
      return;
    }
    const selectedFile = e.target.files[0];
    pdfToText(selectedFile)
      .then((text: string) => setImages(extractImageUrls(text)))
      .catch((error: Error) => console.error("Failed to extract text from pdf"));
    setSelectAll(false); // Reset select all checkbox
    setSelectedImages([]); // Reset selected images array
  };

  const toggleCheckbox = (imageUrl: string) => {
    const selectedIndex = selectedImages.indexOf(imageUrl as never);
    if (selectedIndex === -1) {
      setSelectedImages([...selectedImages, imageUrl]);
    } else {
      const updatedSelectedImages = [...selectedImages];
      updatedSelectedImages.splice(selectedIndex, 1);
      setSelectedImages(updatedSelectedImages);
    }
  };

  const handleSelectAll = () => {
    if (!selectAll) {
      setSelectedImages(currentImages);
    } else {
      setSelectedImages([]);
    }
    setSelectAll(!selectAll);
  };

  const handleStartResultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartResult(parseInt(e.target.value));
    if (parseInt(e.target.value) > endResult) {
      setEndResult(parseInt(e.target.value));
    }
  };

  const handleEndResultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndResult(parseInt(e.target.value));
  };

  const download = async (imageUrl: string) => {
    const index = imageUrl.lastIndexOf("/") + 1;
    const filename = imageUrl.substring(index);
    const image = await fetch('/api/download/?imageUrl=' + imageUrl)
    const imageObj = URL.createObjectURL(await image.blob());

    // Trigger a download in the browser
    const link = document.createElement('a');
    link.href = imageObj;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const downloadSelectedImages = () => {
    selectedImages.forEach(async (imageUrl) => {
      await download(imageUrl);
    });
  };

  const indexOfLastImage = endResult - startResult + 1;
  const indexOfFirstImage = indexOfLastImage - (endResult - startResult + 1);
  const currentImages = images.slice(indexOfFirstImage, indexOfLastImage);

  return (
    <div>
      <p>indexOfLastImage: {indexOfLastImage}</p>
      <p>indexOfFirstImage: {indexOfFirstImage}</p>
      <p>endResult: {endResult}</p>
      <p>startResult: {startResult}</p>
      {
        images.length < 1 &&
        <h3 className={'m-5'}>Tip: change your download location in the browser settings so you can find the downloaded files easy.</h3>
      }
      {
        images.length < 1 &&
        <h2 className={'m-5'}>Upload a PDF File</h2>
      }
      {
        images.length < 1 &&
        <input className={'m-5 display-block'} type="file" onChange={handleFileChange} accept=".pdf" />
      }
      {
        images.length !== 0 &&
        <div>
          <label className={'m-5'} >From:</label>
          <input
            className={'m-5'}
            type="number"
            value={startResult}
            onChange={handleStartResultChange}
            min="0"
            max={endResult - 1}
          />
          <label className={'m-5'} >To:</label>
          <input
            className={'m-5'}
            type="number"
            value={endResult}
            onChange={handleEndResultChange}
            min={startResult + 1}
            max={images.length - 1}
          />
          <div className={'m-5'}>Total results: {images.length}</div>
        </div>
      }
      <button disabled={selectedImages.length < 1} className={'m-5 custom-border'} onClick={downloadSelectedImages}>
        Download Selected Images
      </button>
      {
        images.length !== 0 &&
        <div>
          <input
            className={'m-5'}
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
          />
          <label>Select All</label>
        </div>
      }
      {
        currentImages.map((imageUrl, index) => (
          <div key={index}>
            <input
              id={`${index}-image`}
              className={'m-5'}
              type="checkbox"
              checked={selectedImages.includes(imageUrl)}
              onChange={() => toggleCheckbox(imageUrl)}
            />
            <label htmlFor={`${index}-image`} className={'m-5'} >{imageUrl}</label>
          </div>
        ))
      }
    </div>
  );
};

export default FileUploadStep;
