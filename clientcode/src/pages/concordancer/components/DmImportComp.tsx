import React, {useLayoutEffect, useState} from "react";
import {Button, Divider, message, Space, Upload, UploadProps} from "antd";
import {DownloadOutlined, UploadOutlined} from "@ant-design/icons";
import {ProCard, ProColumns, ProTable} from "@ant-design/pro-components";
import ExportJsonExcel from "js-export-excel"
import request from "umi-request";


const DmImportComp: React.FC<{props:any}> = (props) => {
  const renderTotal = (total, range) => {
    return `${range[0]}-${range[1]} of ${total} items`;
  };
  const [bundleData, setBundleData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const upLoadprops: UploadProps = {
    name: 'file',
    directory: false,
    showUploadList: false,
    accept:".xlsx",
    multiple:false,
    action: 'http://localhost:9999/api/file/uploadAndParseDmExcel',
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
            marker_name: item[0],
            category: item[1],
            sub_category: item[2]
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
      title: "Discoure Marker",
      dataIndex: 'marker_name',
      fixed: 'left',
      width: 300,
    },
    {
      title: "Category",
      dataIndex: 'category',
    },
    {
      title: "Sub-category",
      dataIndex: 'sub_category',
    },
    ];

  const downloadTemplate = async() =>{
    const option = {};//定义一个容器，存储Excel文件信息
    const dataTable = [];//定义一个容器，存储Excel表格每行数据
    option.fileName = 'Discourse marker template'
    option.datas = [
      {
        sheetData: dataTable,
        sheetName: 'Discourse marker template',
        sheetHeader: ['Marker name', 'Category', 'Sub-category'],
      }
    ];
    //生成Excel文件对象
    const toExcel = new ExportJsonExcel(option);
    //下载到本地
    toExcel.saveExcel();
  }

  const getAllMarkers = async() =>{
    const results =   await request.get("http://localhost:9999" + '/api/file/getAllDms');
    if(results.code == 200){
      setBundleData([...results.data]);
    }
  }

  useLayoutEffect(()=>{
    getAllMarkers();
  }, [])



  return(
    <>
      <ProCard title='Marker list'>
        <Space>
      <Upload {...upLoadprops}>
        <Button icon={<UploadOutlined />}>Open</Button>
      </Upload>
        <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>Template</Button>
        </Space>
        <Divider></Divider>
      <ProTable
        pagination={{
          showQuickJumper: true,
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
      </ProCard>

    </>
  )
}

export default  DmImportComp;
