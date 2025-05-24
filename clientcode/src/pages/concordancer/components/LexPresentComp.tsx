import React, {useLayoutEffect, useState} from "react";
import {Button, Divider, message, Space, Upload, UploadProps} from "antd";
import {DownloadOutlined, UploadOutlined} from "@ant-design/icons";
import {ProCard, ProColumns, ProTable} from "@ant-design/pro-components";
import ExportJsonExcel from "js-export-excel"
import {PaginationPosition, PaginationProps} from "antd/lib/pagination/Pagination";
import {PaginationLocale} from "rc-pagination";

import enUS from 'antd/lib/locale-provider/en_US';
import LocaleProvider from "antd/lib/locale-provider";
import request from "umi-request"; // Import the locale file you need


const LexiPresentComp: React.FC<{props:any}> = (props) => {
  const [loading, setLoading] = useState(false);
  const [bundleData, setBundleData] = useState<any>([]);
  const upLoadprops: UploadProps = {
    name: 'file',
    directory: false,
    showUploadList: false,
    accept:".xlsx",
    multiple:false,
    action: 'http://localhost:9999/api/file/uploadAndParseBundleExcel',
    headers: {
      authorization: 'authorization-text',
    },
    beforeUpload: (file) => {
      message.info("processing the file");
      setLoading(true);
      // setLoading(true);
    },
    onChange(info) {
      // message.loading("processing the file");
      if (info.file.status === 'done') {
        message.success("the file is processed");
        let data = [];
        info.file.response.data.forEach(item =>{
          data.push({
            bundle: item
          })
        });
        setBundleData([...data]);
        setLoading(false);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file open failed.`);
      }
    },
  };

  const columns: ProColumns<any>[] = [
    {
      title: "Bundle",
      dataIndex: 'bundle_name',
      fixed: 'left',
      width: 300,
    },
  ];

  const downloadTemplate = async() =>{
    const option = {};//定义一个容器，存储Excel文件信息
    const dataTable = [];//定义一个容器，存储Excel表格每行数据
    option.fileName = 'Bundle template'
    option.datas = [
      {
        sheetData: dataTable,
        sheetName: 'Lexical bundle template',
        sheetHeader: ['Bundle name'],
      }
    ];
    //生成Excel文件对象
    const toExcel = new ExportJsonExcel(option);
    //下载到本地
    toExcel.saveExcel();
  }

  const pagination: PaginationProps = {

  };


  const getAllBundles = async() =>{
    const results =   await request.get("http://localhost:9999" + '/api/file/getAllLbs');
    if(results.code == 200){
      setBundleData([...results.data]);
    }
  }

  useLayoutEffect(()=>{
    getAllBundles();
  }, [])


  const renderTotal = (total, range) => {
    return ` ${total} items`;
  };

  return(
    <>
      <ProCard title='Bundle list'>
        <LocaleProvider locale={enUS}>
      <ProTable
          pagination={{
            showQuickJumper: false,
            pageSize: 10,
            showTotal: renderTotal,
          }}
          loading={loading}
          columns={columns}
          rowKey="id"
          toolBarRender={false}
          search={false}
          dataSource={bundleData}
          rowSelection={false}
        />
        </LocaleProvider>
      </ProCard>
    </>
  )
}

export default  LexiPresentComp;
