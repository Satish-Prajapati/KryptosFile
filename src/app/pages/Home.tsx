import React, { useState } from "react";
import { open } from '@tauri-apps/api/dialog';
import { readBinaryFile, writeBinaryFile, exists } from "@tauri-apps/api/fs"
import AES from '../utils/encryption.util'

const Home = () => {
  const [filePath, setFilePath] = useState<string>('')
  const [encryptionKey, setEncryptionKey] = useState<string>('')

  const handleFileSelection = async () => {
    const selectedFilePath = await open({
      multiple: false,
    })
    if (selectedFilePath) {
      setFilePath(selectedFilePath as string)
    }
  }

  const secureFilePath = async (path: string) => {
    var count = 0;
    while (await exists(path))
      path = `${path.split(".")[0]} (${count++}).${path.split(".").slice(1).join(".")}`;
    return path;
  }

  const handleFileEncryption = async () => {
    if(!filePath) return 
    // await message('No file selected');
    if(!encryptionKey) return 
    // await message('No encryptionKey provided');

    try {
      const fileContent = await readBinaryFile(filePath)
      const encryptedBytes = await AES.encrypt(fileContent, encryptionKey);
      const destinationPath = filePath + ".rcktncrypt";
      await writeBinaryFile(await secureFilePath(destinationPath), encryptedBytes)
      console.log(`Successfully encrypted file ${destinationPath.slice(destinationPath.lastIndexOf("\\") + 1)}`)
    } catch (error) {
      console.error(error);
    }
  }

  const handleFileDecryption = async () => {
    if(!filePath) return 
    // await message('No file selected');
    if(!encryptionKey) return 
    // await message('No encryptionKey provided');

    try {
      const fileContent = await readBinaryFile(filePath)
      const decryptedBytes = await AES.decrypt(fileContent, encryptionKey)
      const destinationPath = filePath.split(".").slice(0, -1).join(".");

      await writeBinaryFile(await secureFilePath(destinationPath), decryptedBytes)
      console.log(`Successfully decrypted file ${destinationPath.slice(destinationPath.lastIndexOf("\\") + 1)}`)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="home-view">
      <div className="app-name">KryptosFile</div>
      <div className="tag-line">Fortress for your files.</div>
      <div className="file-upload-block">
        <button className="d-block file-upload-btn" onClick={handleFileSelection}>
          {/* <FileIcon className={'file-icon'} /> */}
          Select File
        </button>
      </div>
      <div className="input-block">
        <input className="d-block encryption-key-input" type='password' name='encryption-key' placeholder="Encryption Key" onChange={(e) => setEncryptionKey(e.target.value)}/>
      </div>
      <div className="btn-block">
        <button className="encrypt-btn" onClick={handleFileEncryption}>Encrypt</button>
        <button className="decrypt-btn" onClick={handleFileDecryption}>Decrypt</button>
      </div>
    </div>
  )
}

export default Home