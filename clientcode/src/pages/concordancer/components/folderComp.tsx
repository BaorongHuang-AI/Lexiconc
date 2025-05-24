/* @ts-expect-error */
import {ProCard, ProList} from '@ant-design/pro-components';
import {Button, Checkbox, Divider, message, Row, Space, Tag, Tree, Upload, UploadProps} from 'antd';
import React, {useRef, useState} from "react";
import type { DataNode, TreeProps } from 'antd/es/tree';
import {UploadOutlined} from "@ant-design/icons";
import styles from './style.less';
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    // extends React's HTMLAttributes
    directory?: string;
    webkitdirectory?: string;
  }
}


const FolderComponent: React.FC<{props:any}> = (fileData, setFileData, onFileDataChange) =>
{
  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
  };

  // const [fileData, setFileData] = useState<any[]>([]);

  const onCheck: TreeProps['onCheck'] = (checkedKeys, info) => {
    console.log('onCheck', checkedKeys, info);
  };


  const [fileTree, setFileTree] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<DataNode[]>([
    {
      title: 'All Files',
      key: '11111',
      children: [

      ],
    },
  ]);

  const props: UploadProps = {
    name: 'file',
    directory: false,
    showUploadList: false,
    accept:".txt",
    multiple:true,
    action: 'http://localhost:15001/api/v1/file/uploadAndParserText',
    headers: {
      authorization: 'authorization-text',
    },
    beforeUpload: (file) => {
        message.info("processing the file");
        // setLoading(true);
    },
    onChange(info) {
      // message.loading("processing the file");
      if (info.file.status === 'done') {
        message.success("the file is processed");
        console.log("info", info);
        // setLoading(false);
        // fileTree?.push({
        //   id: info.file.response.data.uuid,
        //   title: info.file.name,
        //   isChecked: true
        // });
        // let fileTree = [...fileData];
        fileData.push({
          id: info.file.response.data.uuid,
          title: info.file.name,
          isChecked: true
        })
        setFileData([...fileData]);
        // console.log("file data", fileData);
        onFileDataChange(fileData);
        // setFileTree([...fileTree]);
        // treeData[0].children=fileTree;
        // setTreeData([...treeData]);
        // console.log(" tree data", treeData);
        // message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file open failed.`);
      }
    },
  };

  const onChangeAll = async(e) =>{
    if(e.target.checked){
      fileData.forEach(item =>{
        item.isChecked = true;
      });
    }else{
      fileData.forEach(item =>{
        item.isChecked = false;
      });
    }
    setFileData([...fileData]);
    onFileDataChange(fileData);
    // console.log("e", e);
  }


  const onCheckFile = async(e, item) =>{
    // console.log("file", e, item);
    let filteredFileData = [];
    fileData.forEach(innerItem =>{
      if(innerItem.id == item.id){
        // console.log(innerItem);
        innerItem.isChecked = e.target.checked;
      }
    });

    setFileData([...fileData]);
    onFileDataChange(fileData);
  }



  return (
    <ProCard loading={loading}>
        {/*<Upload {...props}>*/}
        {/*  <Button icon={<UploadOutlined />}>Open files</Button>*/}
        {/*</Upload>*/}
      <h3>Use File->Open to import corpus files</h3>
      <Divider></Divider>
      <div>
      <Checkbox onChange={onChangeAll} className={styles.bottonMargin}>All Files</Checkbox>
      </div>
      <div>
        {fileData && fileData.length >0 && fileData.map(item =>{
          return (<div>
          <Checkbox onChange={(e) => onCheckFile(e, item)} checked={item.isChecked}>{item.file_name}</Checkbox>
            </div>
          );
        })}
      </div>
      {/*<Tree*/}
      {/*  checkable*/}
      {/*  onSelect={onSelect}*/}
      {/*  onCheck={onCheck}*/}
      {/*  treeData={treeData}*/}
      {/*/>*/}
    </ProCard>
  );
}

export default FolderComponent;
