import React, {useRef, useState} from "react";
import {Button, Col, Input, message, Row, Space, Tabs} from "antd";
import styles from './style.less';
import {ActionType, ProCard, ProColumns, ProTable} from "@ant-design/pro-components";
import request from "umi-request";
import RcResizeObserver from 'rc-resize-observer';
import DmImportComp from "@/pages/concordancer/components/DmImportComp";
import ExportJsonExcel from "js-export-excel";
import DmPresentationComp from "@/pages/concordancer/components/DmPresentationComp";
import {Link} from "umi";
// const { ipcRenderer } = require('electron');

const DmComp: React.FC<{props: any}> = (props) => {

  const [isCaculated, setCalculated] = useState<boolean>(false);
  const [isResults, setResults] = useState<boolean>(false);
  const[bundleResultsData, setBundleResultsData] = useState<any>([]);
  const[bundleDiversityResultsData, setBundleDiversityResultsData] = useState<any>([]);


  const [filteredProjectWord, setFilteredProjectWord] = useState<string>("");
  const [filteredProjectFileWord, setFilteredProjectFileWord] = useState<string>("");
  const actionFrequencyRef = useRef<ActionType>();
  const actionDiversityRef = useRef<ActionType>();
  const [filteredFreqs, setFilteredFreqs] = useState<any>([]);
  const [filteredDiver, setFilteredDiver] = useState<any>([]);


  const [responsive, setResponsive] = useState(false);


  const columns: ProColumns<any>[] = [
    {
      title: "Discourse Marker",
      dataIndex: 'DiscourseMarker',
      fixed: 'left',
      width: 300,
      render: (text, record) => {
        // Assuming 'record' has an attribute that you'd use for navigation
        return <Link to={`/concord/${record.DiscourseMarker}`}>{record.DiscourseMarker}</Link>;
      },
    },
    {
      title: "Category",
      dataIndex: 'category',
    },
    {
      title: "Sub-category",
      dataIndex: 'subCategory',
    },
    {
      title: "Frequency",
      dataIndex: 'Frequency',
    },
    {
      title: "Diversity",
      dataIndex: 'Diversity',
    },
  ];

  const diversityColumns: ProColumns<any>[] = [
    {
      title: "File Name",
      dataIndex: 'fileName',
      fixed: 'left',
      width: 300,
    },
    {
      title: "Frequency",
      dataIndex: 'Frequency',
    },
    {
      title: "Diversity",
      dataIndex: 'Diversity',
    },
  ];

  const calculateStats = async() =>{
    if (props.fileIds.length == 0) {
      message.warning("Please select at least one file!");
      return;
    }
    const hide = message.loading('Calculating...', 10000);
    setCalculated(true);
    setResults(false);
    let calculatedFileIds = [];
    props.fileIds.forEach(item =>{
      if(item.uuid !==undefined){
        calculatedFileIds.push(item.uuid);
      }else{
        calculatedFileIds.push(item);
      }
    })
    let results = await request.post("http://localhost:9999" + '/calDmDiversity', {
      data: {
        query: '',
        leftCount: 10,
        rightCount: 10,
        fileIds: calculatedFileIds
      }
    });
    hide();
    setCalculated(false);

    // console.log("lb results", results);
    if(results.code == 200) {
      let bundleResults = results.data.dmFreq;
      let diversityResults = results.data.dmDiversity;
      console.log("markerResults", bundleResults);
      setBundleResultsData([...JSON.parse(bundleResults)])
      setBundleDiversityResultsData([...JSON.parse(diversityResults)]);
      setFilteredFreqs([...JSON.parse(bundleResults)]);
      setFilteredDiver([...JSON.parse(diversityResults)]);
      setResults(true);
    }
  }

  const filterProjectTableData = (word) => {
    let results = [];
    let filteredValue = word;
    // let status = filteredStatus;
    // console.log(filteredValue, status);
    if(filteredValue==undefined || filteredValue.length === 0){
      bundleResultsData.forEach(item =>{
        results.push(item);
      });
      setFilteredFreqs([...results]);
    }else{
      bundleResultsData.forEach(item =>{
        if( (item.discourseMarker!==null && item.discourseMarker.indexOf(filteredValue)) > -1
        ){
          results.push(item);
        }
      });
      setFilteredFreqs([...results]);
    }
    actionFrequencyRef.current?.reloadAndRest?.();
  };

  const exportResults= async() =>{
    const option = {};//定义一个容器，存储Excel文件信息
    const dataTable = [];//定义一个容器，存储Excel表格每行数据
    option.fileName = 'Discourse marker results'
    option.datas = [
      {
        sheetData: bundleResultsData,
        sheetName: 'Discourse marker frequency',
        sheetHeader: ['Discourse marker', 'Category', 'Sub-category', 'Frequency', 'Diversity'],
      },
      {
        sheetData: bundleDiversityResultsData,
        sheetName: 'Discourse marker diversity',
        sheetHeader: ['File name', 'Frequency', 'Diversity'],
      }
    ];
    //生成Excel文件对象
    const toExcel = new ExportJsonExcel(option);


    //下载到本地
    toExcel.saveExcel();
    // setTimeout(() => {
    //   window.electron.ipcRenderer.send('show-dialog', { message: 'File saved successfully!' });
    // }, 3000); // Delay in milliseconds (e.g., 1000ms = 1 second)


  }

  const filterProjectFileTableData = (word) => {
    let results = [];
    let filteredValue = word;
    // let status = filteredStatus;
    // console.log(filteredValue, status);
    if(filteredValue==undefined || filteredValue.length === 0){
      bundleDiversityResultsData.forEach(item =>{
        results.push(item);
      });
      setFilteredDiver([...results]);
    }else{
      bundleDiversityResultsData.forEach(item =>{
        if( (item.fileName!==null && item.fileName.indexOf(filteredValue)) > -1
        ){
          results.push(item);
        }
      });
      setFilteredDiver([...results]);
    }
    actionDiversityRef.current?.reloadAndRest?.();
  };
  const renderTotal = (total, range) => {
    return `${range[0]}-${range[1]} of ${total} items`;
  };

  return (
    <Row>
      <Col span={18}>

          <RcResizeObserver
            key="resize-observer"
            onResize={(offset) => {
              setResponsive(offset.width < 596);
            }}
          >
            <ProCard
              title="Marker Stats"
              extra={<Space><Button type={"primary"} onClick={calculateStats} loading={isCaculated}>Calculate Stats</Button>
                <Button type={"primary"} onClick={exportResults} disabled={!isResults}>Export results</Button></Space>}
              split={responsive ? 'horizontal' : 'vertical'}
              bordered
              headerBordered
            >
              <ProCard title="Marker Frequency" colSpan="60%">
                <Input placeholder="Please input marker name"
                       disabled={!isResults}
                       allowClear
                       onChange= { e =>{
                         setFilteredProjectWord(e.target.value);
                         filterProjectTableData(e.target.value);
                       }
                       }
                       value={filteredProjectWord}
                       style={{ marginBottom:10 }}/>
                <ProTable
                  columns={columns}
                  pagination={{
                    showQuickJumper: true,
                    pageSize: 10,
                    showTotal: renderTotal,
                  }}
                  rowKey="bundle"
                  toolBarRender={false}
                  search={false}
                  dataSource={filteredFreqs}
                  rowSelection={false}
                />
              </ProCard>
              <ProCard title="Marker Diversity">
                <Input placeholder="Please input file name"
                       disabled={!isResults}
                       allowClear
                       onChange= { e =>{
                         setFilteredProjectFileWord(e.target.value);
                         filterProjectFileTableData(e.target.value);
                       }
                       }
                       value={filteredProjectFileWord}
                       style={{ marginBottom:10 }}/>
                <ProTable
                  pagination={{
                    showQuickJumper: true,
                    pageSize: 10,
                    showTotal: renderTotal,
                  }}
                  columns={diversityColumns}
                  rowKey="fileName"
                  toolBarRender={false}
                  search={false}
                  actionRef={actionDiversityRef}
                  dataSource={filteredDiver}
                  rowSelection={false}
                />
              </ProCard>
            </ProCard>
          </RcResizeObserver>
          {/*<Tabs*/}
          {/*  tabPosition="bottom"*/}
          {/*  defaultActiveKey="1"*/}
          {/*  type="card"*/}
          {/*  size="middle"*/}
          {/*>*/}
          {/*  <TabPane tab="Bundle Frequency" key="1">*/}

          {/*  </TabPane>*/}
          {/*  <TabPane tab="Bundle Diversity" key="2">*/}
          {/*   */}
          {/*  </TabPane>*/}
          {/*</Tabs>*/}

      </Col>
      <Col span={6} className={styles.lexiImport}>
       <DmPresentationComp props={props} ></DmPresentationComp>
      </Col>

    </Row>

  );
}

export default  DmComp;
