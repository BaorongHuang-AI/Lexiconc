import React, {useRef, useState} from "react";
import {Button, Col, Input, message, Row, Space, Tabs} from "antd";
import LexiImportComp from "@/pages/concordancer/components/LexiImportComp";
import styles from './style.less';
import {ActionType, ProCard, ProColumns, ProTable} from "@ant-design/pro-components";
import request from "umi-request";
import TabPane from "antd/es/tabs/TabPane";
import RcResizeObserver from 'rc-resize-observer';
import ExportJsonExcel from "js-export-excel";

import enUS from 'antd/lib/locale-provider/en_US';
import LocaleProvider from "antd/lib/locale-provider";
import LexiPresentComp from "@/pages/concordancer/components/LexPresentComp";
import {Link, useHistory} from "umi";
// const { ipcRenderer } = require('electron');

const LexiBundleComp: React.FC<{props: any}> = (props) => {
  const history = useHistory();
  const [isCaculated, setCalculated] = useState<boolean>(false);
  const [isResults, setResults] = useState<boolean>(false);
  const [filteredProjectWord, setFilteredProjectWord] = useState<string>("");
  const [filteredProjectFileWord, setFilteredProjectFileWord] = useState<string>("");

  const[bundleResultsData, setBundleResultsData] = useState<any>([]);
  const[bundleDiversityResultsData, setBundleDiversityResultsData] = useState<any>([]);
  const [responsive, setResponsive] = useState(false);
  const actionFrequencyRef = useRef<ActionType>();
  const actionDiversityRef = useRef<ActionType>();
  const [filteredFreqs, setFilteredFreqs] = useState<any>([]);
  const [filteredDiver, setFilteredDiver] = useState<any>([]);

  const columns: ProColumns<any>[] = [
    {
      title: "Lexical Bundles",
      dataIndex: 'lexicalBundles',
      fixed: 'left',
      width: 300,
      render: (text, record) => {
        // Assuming 'record' has an attribute that you'd use for navigation
        return <a onClick={ () => history.push(`/concord/${record.lexicalBundles}`)} >{record.lexicalBundles}</a>;
      },
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
        if( (item.lexicalBundles!==null && item.lexicalBundles.indexOf(filteredValue)) > -1
        ){
          results.push(item);
        }
      });
      setFilteredFreqs([...results]);
    }
    actionFrequencyRef.current?.reloadAndRest?.();
  };

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

  const exportResults= async() =>{
      const option = {};//定义一个容器，存储Excel文件信息
      const dataTable = [];//定义一个容器，存储Excel表格每行数据
      option.fileName = 'Bundle results'
      option.datas = [
        {
          sheetData: bundleResultsData,
          sheetName: 'Lexical bundle frequency',
          sheetHeader: ['Bundle name', 'Frequency', 'Diversity'],
        },
        {
          sheetData: bundleDiversityResultsData,
          sheetName: 'Lexical bundle diversity',
          sheetHeader: ['File name', 'Frequency', 'Diversity'],
        }
      ];
      //生成Excel文件对象
      const toExcel = new ExportJsonExcel(option);
      //下载到本地
      toExcel.saveExcel();
    // window.electron.ipcRenderer.send('show-dialog', { message: 'File saved successfully!' });
  }

  const calculateStats = async() =>{
    if (props.fileIds.length == 0) {
      message.warning("Please select at least one file!");
      return;
    }
    const hide = message.loading('Calculating...', 10000);
    setResults(false);
    setCalculated(true);
    let calculatedFileIds = [];
    props.fileIds.forEach(item =>{
      if(item.uuid !==undefined){
        calculatedFileIds.push(item.uuid);
      }else{
        calculatedFileIds.push(item);
      }
    })
    let results = await request.post("http://localhost:9999" + '/calBundleDiversity', {
      data: {
        query: '',
        leftCount: 10,
        rightCount: 10,
        fileIds: calculatedFileIds
      }
    });
    hide();
    setCalculated(false);
    console.log("lb results", results);
    if(results.code == 200) {
      let bundleResults = results.data.bundleFreq;
      let diversityResults = results.data.bundleDiversity;
      console.log("bundleResults", bundleResults);
      setBundleResultsData([...JSON.parse(bundleResults)]);
      setFilteredFreqs([...JSON.parse(bundleResults)]);
      setBundleDiversityResultsData([...JSON.parse(diversityResults)]);
      setFilteredDiver([...JSON.parse(diversityResults)]);
      setResults(true);
    }
  }

  const renderTotal = (total, range) => {
    return `${range[0]}-${range[1]} of ${total} items`;
  };

  return (
    <Row>
      <LocaleProvider locale={enUS}>
      <Col span={19}>

          <RcResizeObserver
            key="resize-observer"
            onResize={(offset) => {
              setResponsive(offset.width < 596);
            }}
          >

            <ProCard
              title="Bundle Stats"
              extra={<Space><Button type={"primary"} onClick={calculateStats} loading={isCaculated}>Calculate Stats</Button>
                <Button type={"primary"} onClick={exportResults} disabled={!isResults}>Export results</Button></Space>}
              split={responsive ? 'horizontal' : 'vertical'}
              bordered
              headerBordered
            >
              <ProCard title="Bundle Frequency" colSpan="50%">
                <Input placeholder="Please input bundle name"
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
                  pagination={{
                    showQuickJumper: true,
                    pageSize: 10,
                    showTotal: renderTotal,
                  }}
                  columns={columns}
                  rowKey="bundle"
                  search={false}
                  dataSource={filteredFreqs}
                  actionRef={actionFrequencyRef}
                  rowSelection={false}
                  toolBarRender={false}
                  />
              </ProCard>
              <ProCard title="Bundle Diversity">
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
                  actionRef={actionDiversityRef}
                  rowKey="fileName"
                  toolBarRender={false}
                  search={false}
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
      <Col span={4} className={styles.lexiImport}>
       <LexiPresentComp props={props} ></LexiPresentComp>
      </Col>
      </LocaleProvider>
    </Row>


  );
}

export default  LexiBundleComp;
