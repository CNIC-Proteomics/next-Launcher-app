/*
 * Workflow Services
 */


/*
 * Import libraries/constants
 */

import {
  BACKEND_URL, 
  // MAX_FILE_SIZE
} from '../constants';



/*
 * Define class
 */

export class datasetServices {


  // create a dataset instance
  static async create(data) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/datasets/0`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }


  // upload a single file
  static async up(id, format, parameter, file ) {
    // create form
    console.log("PAsa por __Upload");

    const formData = new FormData();
    formData.append('file', file);

    return formData;

    // try {
    //   // ${URL}/api/datasets/${ID}/${FORMAT}/${PARAMETER}/upload
    //   // 665ee947343d00bd066d7251 "directory-path" "re_files" "/mnt/tierra/nf-PTM-compass/tests/test1/inputs/re_files/JAL_Noa3_iT_ALL.txt"
    //   const response = await fetch(`${BACKEND_URL}/api/datasets/${id}/${format}/${parameter}/upload`, {
    //     method: 'POST',
    //     body: formData,
    //   });

    //   if (!response.ok) {
    //     throw new Error('Upload failed');
    //   }
    //   const result = await response.json();
    //   return result;

    // } catch (error) {
    //   console.error('Error uploading file:', error);
    //   throw error;
    // }
  }

  // upload multiple files
  static async upload(id, format, parameter, files) {
    console.log("PAsa por Upload");
    // console.log(files);
    // const uploadPromises = Array.from(files).map(file => this.up(id, format, parameter, file));
    // return await Promise.all(uploadPromises);
    const kk = Array.from(files).map(file => this.up(id, format, parameter, file));
    console.log(kk);
  }

};
  