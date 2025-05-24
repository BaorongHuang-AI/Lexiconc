import {addRule, removeRule, rule, updateRule} from '@/services/ant-design-pro/api';
import {DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import {ActionType, ProCard, ProColumns, ProDescriptionsItemProps} from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import {Button, Checkbox, Col, ConfigProvider, Divider, Drawer, Input, message, Modal, Row, Space} from 'antd';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {FormattedMessage, useIntl, useParams} from 'umi';
import type {FormValueType} from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';
import FolderComponent from "@/pages/concordancer/components/folderComp";
import ConCordComp from "@/pages/concordancer/components/ConcordComp";
import SimpleConCordComp from "@/pages/concordancer/components/SimpleConcordComp";
import styles from './style.less';
import {Tabs} from 'antd';
import type {TabsProps} from 'antd';
import TabPane from "antd/es/tabs/TabPane";
import LexiBundleComp from "@/pages/concordancer/components/LexiBundleComp";
import DmComp from "@/pages/concordancer/components/DmComp";
import CorpusStatsComp from "@/pages/concordancer/components/CorpusStatsComp";
import SimpleCollocationComp from "@/pages/concordancer/components/CollocationConcordComp";
import request from "umi-request";
import enUS from "@/locales/en-US";
import LexiBundleAndDiscourseMarkerComp
  from "@/pages/concordancer/components/LexicialBundleAndDiscourseMarkerComponent";
import DiscourseMarkerHighlighter from "@/pages/concordancer/components/DiscourseMarkerHighlighter";
// const { ipcRenderer } = window.require('electron');

const Concordancer: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [corpusStats, setCorpusStats] = useState({
    files: 0,
    tokens: 0,
    types: 0,
    sents: 0,
    ttr: 0,
    sttr: 0
  });

  const { word } = useParams();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFileContent, setSelectedFileContent] = useState('');
  const [currentTab, setCurrentTab] = useState("1");

  const [loading, setLoading] = useState(false);
  const [fileData, setFileData] = useState<any>([]);
  const [fileIds, setFileIds] = useState<any>([]);
  const [successLoad, setSuccessLoad] = useState(false);
  const [polling, setPolling] = useState(true);
  const[markers, setMarkers] = useState([]);

  const [currentConcordWord, setCurrentConcordWord] = useState("");

  const getAllFiles = async (isFirst: boolean) => {
    console.log("get all files at start");
    setLoading(true);
    try {
      const filesResults = await request.get("http://localhost:9999/api/file/allFiles");
      if (filesResults.code == 200) {
        console.log(filesResults.data);
        setFileData(filesResults.data);
        if (isFirst) {
          checkAllFiles(filesResults.data);
        }
        let currentFileIds = [];
        filesResults.data.forEach(item => {
          currentFileIds.push(item.uuid);
        })
        corpusStats.files = currentFileIds.length;
        setCorpusStats({...corpusStats});
      }

      setLoading(false);
      setPolling(false);
    }catch (error){
      setLoading(false);
      // setSuccessLoad(false);
    }
  }
  useLayoutEffect(() => {
    let interval;

    if (polling) {
      // Poll every X milliseconds
      interval = setInterval(getAllFiles(true), 2000); // Change 3000 to your desired interval in milliseconds
    }

    if(word){
      setCurrentTab("4");
      setCurrentConcordWord(word);
    }

    return () => {
      // Clear the interval when the component unmounts or when polling stops
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [polling, word]);

  //
  //
  useEffect(() => {
    console.log("SUBSCRIBING");
    console.log(window.electron);
    window.electron.ipcRenderer.on('FILE_OPEN', (event, result, isFolder) => {
      console.log(event, result, isFolder);
      populateFiles(result, isFolder);
    }, []);
    // if (window.electron.ipcRenderer.rawListeners('FILE_OPEN').length === 0) {
    //   console.log("SUBSCRIBING")
    //
    // }
    console.log("loaded");
    // ipcRenderer.on('FILE_OPEN', (event, result) => {
    //   console.log(event, result);
    // });

    // window.electron.on('selected-file', (event, fileName) => {
    //   getAllFiles(true);
    // });
    //
    // window.electron.on('selected-folder', (event, fileName) => {
    //   getAllFiles(true);
    // });

    return () => {
      console.log("UNSUBSCRIBING")
      window.electron.ipcRenderer.removeListener('FILE_OPEN', () => {
      });
      // window.electron.ipcRenderer.removeAllListeners('selected-file');
      // window.electron.ipcRenderer.removeAllListeners('selected-folder');
    };
  }, []);

  const getAllMarkers = async() =>{
    const results =   await request.get("http://localhost:9999" + '/api/file/getAllDms');
    if(results.code == 200){
      setMarkers([...results.data]);
    }
  }

  const getSelectedFileContent = async(item) =>{
     const results =   await request.post("http://localhost:9999" + '/api/file/getFileContent', {
      data: item
    });
     if(results.code == 200){
       setSelectedFileContent(results.data);
     }
  }

  const showModal = (item) => {
    getAllMarkers();
    getSelectedFileContent(item);
    // setSelectedFileContent(fileContent);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };




  const obtainFileChange = async (data) => {
    console.log("changed file data", data);
    let filteredFileIds = [];

    data.forEach(item => {
      if (item.isChecked) {
        filteredFileIds.push(item.uuid);
      }
    });
    setFileIds([...filteredFileIds]);
  }

  const populateFiles = async (data, isFolder) => {
    let hide = message.loading("Indexing files");
    setLoading(true);
    let results = await request.post("http://localhost:9999" + '/api/file/uploadAndIndex', {
      data: {
        filePath: data[0],
        isFolder: isFolder
      }
    });
    if (results.code === 200) {
      console.log(results.data);
      // setFileData(results.data);
      let filesResults = await request.get("http://localhost:9999/api/file/allFiles");
      if (filesResults.code == 200) {
        console.log(filesResults.data);
        setFileData(filesResults.data);
        let resutlsFileIds = [];

        filesResults.data.forEach(item => {

          resutlsFileIds.push(item.uuid);
        });
        setFileIds([...resutlsFileIds]);
      }

    }
    hide();
    setLoading(false);

  }
  const onChangeAll = async (e) => {
    if (e.target.checked) {
      fileData.forEach(item => {
        item.isChecked = true;
      });
    } else {
      fileData.forEach(item => {
        item.isChecked = false;
      });
    }
    setFileData([...fileData]);
    obtainFileChange(fileData);
    // console.log("e", e);
  }

  function checkAllFiles(curFileData) {
    curFileData.forEach(item => {
      item.isChecked = true;
    });
    setFileData([...curFileData]);
    obtainFileChange(curFileData);
  }


  const onCheckFile = async (e, item) => {
    // console.log("file", e, item);
    let filteredFileData = [];
    fileData.forEach(innerItem => {
      if (innerItem.uuid == item.uuid) {
        // console.log(innerItem);
        innerItem.isChecked = e.target.checked;
      }
    });

    setFileData([...fileData]);
    obtainFileChange(fileData);
  }

  const deleteFileItem = async (item) => {
    console.log("delete ", item);
    const hide = message.loading("Remove the file from the corpus.");
    let filesResults = await request.post("http://localhost:9999/api/file/deleteFile",
      {
        data: item

      });
    hide();
    if (filesResults.code == 200) {
      getAllFiles(false);
      // console.log(filesResults.data);
      // setFileData(filesResults.data);
    }
  }

  const showDrawer = () => {
    setDrawerOpen(true);
  };

  const calculateStats = async () => {
    setLoading(true);
    let resutlsFileIds = [];


    fileData.forEach(item => {
      resutlsFileIds.push(item.uuid);
    });
    try {
      const corpusStatsResults = await request.post("http://localhost:9999/api/file/calCorpusStats", {
        data: {
          fileIds: resutlsFileIds
        }
      });
      setLoading(false);
      if(corpusStatsResults.code === 200){
        setCorpusStats({...corpusStatsResults.data})
      }
    } catch (error) {
      setLoading(false);
        message.error('Adding failed, please try again!');
      }
  };

  const onCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const moneyFormat = (num) => {
    return (Number(num).toFixed(0).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'))
  }

  const openFile = () => {
    window.electron.ipcRenderer.send('open-file-dialog');
  };

  const openFolder = () => {
    window.electron.ipcRenderer.send('open-folder-dialog');
  };




  const handleTabChange = (key) => {
    console.log(key);
    setCurrentTab(key);
  };


  return (
    // <PageContainer>
    <ConfigProvider locale={enUS}>
    <ProCard>
      <Row>
      <Col span={24} className={styles.rightPart}>
        <Tabs
          defaultActiveKey="1"
          activeKey={currentTab}
          onTabClick={handleTabChange}
          type="card"
          size="middle"
        >
          <TabPane tab="Corpus Info" key="1">
      <ProDescriptions title={""} loading={loading}>
        <ProDescriptions.Item valueType="option">
          <Space>
          {/*<Button key="primary" type="primary" onClick={() => showDrawer()}>*/}
          {/*  Corpus Files Settings*/}
          {/*</Button>*/}
          <Button key="primary" type="primary" onClick={() => calculateStats()}>
            Calculate Stats
          </Button>
          </Space>
        </ProDescriptions.Item>
        <ProDescriptions.Item label="Total files">
          {corpusStats.files}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="Total sents">
          {moneyFormat(corpusStats.sents)}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="Total tokens">
          {moneyFormat(corpusStats.tokens)}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="Total types">
          {moneyFormat(corpusStats.types)}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="TTR">
          {corpusStats.ttr.toFixed(2)}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="STTR">
          {corpusStats.sttr.toFixed(2)}
        </ProDescriptions.Item>
      </ProDescriptions>
      <Divider>Corpus Files</Divider>
            <div>
              <Button type="primary" onClick={openFile} className={styles.bottonMargin}>Open File</Button>
              <Button type="primary" onClick={openFolder} className={styles.bottonMargin}>Open Folder</Button>
              <Checkbox onChange={onChangeAll} className={styles.bottonMargin}>All Files</Checkbox>
            </div>
            <div>
              {fileData && fileData.length > 0 && fileData.map(item => {
                return (<div>
                    <Checkbox onChange={(e) => onCheckFile(e, item)}
                              key={item.uuid}
                              checked={item.isChecked}>{item.file_name}</Checkbox>
                    <a onClick={e => deleteFileItem(item)}><span> <DeleteOutlined/></span></a>

                  </div>
                );
              })}
            </div>
      <Row>
      </Row>
          </TabPane>

          <TabPane tab="Lexical Bundles & Discourse Markers" key="2">
            <LexiBundleAndDiscourseMarkerComp props={null}></LexiBundleAndDiscourseMarkerComp>
          </TabPane>
            <TabPane tab="Word Frequency" key="3">
              <CorpusStatsComp fileIds={fileIds}/>
            </TabPane>
            <TabPane tab="Concordancer" key="4">
              <SimpleConCordComp fileIds={fileIds} currentWord={currentConcordWord}/>
            </TabPane>
            {/*<TabPane tab="Collocations" key="3">*/}
            {/*  /!*<LexiBundleComp fileIds={fileData}/>*!/*/}
            {/*  <SimpleCollocationComp fileIds={fileIds}/>*/}
            {/*</TabPane>*/}
            <TabPane tab="Lexical Bundles" key="5">
              <LexiBundleComp fileIds={fileIds}/>
            </TabPane>
            <TabPane tab="Discourse Markers" key="6">
              <DmComp fileIds={fileIds}/>
            </TabPane>
          </Tabs>

        </Col>
      </Row>
      <Drawer
        title="Corpus Files"
        placement={'left'}
        closable={false}
        size={'large'}
        onClose={onCloseDrawer}
        open={drawerOpen}
        key={'left'}
      >
        {/*<h3>Use File ->Open to import corpus files</h3>*/}
        <Divider></Divider>
        <div>
          <Checkbox onChange={onChangeAll} className={styles.bottonMargin}>All Files</Checkbox>
        </div>
        <div>
          {fileData && fileData.length > 0 && fileData.map(item => {
            return (<div>
                <Checkbox onChange={(e) => onCheckFile(e, item)}
                          key={item.uuid}
                          checked={item.isChecked}>
                  {/*{item.file_name}*/}
                  <Button type="link" onClick={() => showModal(item.uuid)}>
                    {item.file_name}
                  </Button>
                </Checkbox>
                <a onClick={e => deleteFileItem(item)}><span> <DeleteOutlined/></span></a>

              </div>
            );
          })}
        </div>
      </Drawer>

      <Modal
        title="File Content"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <DiscourseMarkerHighlighter text={selectedFileContent} markers={markers} />
      </Modal>
    </ProCard>
    </ConfigProvider>
    // </PageContainer>
  );
};

export default Concordancer;
