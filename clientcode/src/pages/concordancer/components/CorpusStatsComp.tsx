import React, {useEffect, useRef, useState} from "react";
// const { ipcRenderer } = window.require('electron');

// import * as echarts from 'echarts';
// import 'echarts-wordcloud'

// echarts.registerTheme('my_theme', {
//   backgroundColor: '#f4cccc'
// });
// echarts.registerTheme('another_theme', {
//   backgroundColor: '#eee'
// });

import {
  ProCard, ProColumns, ProFormDigit,
  ProFormInstance,
  ProFormRadio,
  ProFormSelect,
  ProFormText, ProTable,
  QueryFilter
} from "@ant-design/pro-components";
import {Button, Col, ConfigProvider, Divider, Image, message, Modal, Row, Space, Switch} from "antd";
import { render } from 'react-dom';
import WordCloud from 'react-d3-cloud';
import { scaleOrdinal } from 'd3-scale';
import request from "umi-request";
import {now} from "moment";
import enUS from "@/locales/en-US";

const data = [
  { text: 'Hey', value: 1000 },
  { text: 'lol', value: 200 },
  { text: 'first impression', value: 800 },
  { text: 'very cool', value: 10000 },
  { text: 'duck', value: 10 },
];
// const schemeCategory10ScaleOrdinal = scaleOrdinal(schemeCategory10);

const CorpusStatsComp: React.FC<{props:any}> = (props) => {
  const actionRef = useRef<any>();
  const formRef = useRef<ProFormInstance>();

  const [freqData, setFreqData] = useState<any[]>([]);
  const [filteredFreqData, setFilteredFreqData] = useState<any[]>([]);
  const [freqLoading, setFreqLoading] = useState(false);
  const[imageURL, setImageURL] = useState("");
  const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };
  const handleCancel = () => {
    setOpen(false);
  };



  const columns: ProColumns<any>[] = [
    {
      title: "Word",
      dataIndex: 'Word',
      fixed: 'left',
      width: 300,
    },
    {
      title: "Frequency",
      dataIndex: 'Frequency',
    },
  ];

  const showWordCloud = async() =>{
    const hide = message.loading('Get word cloud...', );
    setFreqLoading(true);
    // let values = formRef.current?.getFieldsValue();
    // let isExclude = 0;
    // if(values.isStopWords!=undefined){
    //   isExclude=values.isStopWords?1:0;
    // }
    // console.log("values", values);
    let results = await request.post("http://localhost:9999" + '/api/corpus/getWordCloud', {
      data: {
        wordCount: 100,
        fileIds:  props.fileIds
      }
    });
    hide();
    setFreqLoading(false);
    if(results.code === 200) {
      setImageURL("data:image/jpeg;base64,"+ results.data);
      showModal();
    }else{
      //有单词不在语料库里面，分别展示

    }
  }



  const filterWords = async ( ) =>{
        let values = formRef.current?.getFieldsValue();
        console.log(values);
    // const hide = message.loading('Calculating...');
    setFreqLoading(true);
    const ids = [];
      props.fileIds.forEach(item =>{
        ids.push(item)
      });
        let results = await request.post("http://localhost:9999" + '/api/file/searchWordFreq', {
          data: {
            minFreq: values.minFreq,
            term: values.word == undefined?'':values.word,
            fileIds: ids
          }
        });
    // hide();
    setFreqLoading(false);
        if(results.code === 200) {
          console.log(results.data);
          setFreqData([...results.data]);
          setFilteredFreqData([...results.data]);
          // populateWordCloud([...results.data]);
        }


      // else {
      //   let values = formRef.current?.getFieldsValue();
      //   console.log("form values", values);
      //   if (values.word != undefined && values.word?.length > 0) {
      //     const filteredResults = freqData.filter(item => item.Word === values.word);
      //     setFilteredFreqData([...filteredResults]);
      //     if (values.rank != undefined && values.rank > 0) {
      //       let results = filteredFreqData.slice(0, values.rank)
      //       setFilteredFreqData([...results]);
      //     }
      //   } else if (values.rank != undefined && values.rank > 0) {
      //     let results = freqData.slice(0, values.rank)
      //     setFilteredFreqData([...results]);
      //   } else {
      //     console.log(freqData);
      //     setFilteredFreqData([...freqData]);
      //   }
      // }


        // console.log(filteredFreqData);
  }
  const renderTotal = (total, range) => {
    return `${range[0]}-${range[1]} of ${total} items`;
  };


  return (
    <ProCard>
      <QueryFilter
        formRef={formRef}
        submitter={false}
        onFinish={async (e) => console.log(e)}
      >
        <ProFormText name="word" label="Term" placeholder={"please enter term to filter"}/>
        <ProFormDigit name="minFreq"
                      initialValue={20}
                      label="Min Freq"
                      placeholder={"please select set minimum frequency to filter the results"} />
        <Space>
        <Button type={"primary"} onClick={filterWords}>Search</Button>
        <Button type={"primary"} onClick={showWordCloud}>Word Cloud</Button>
        </Space>
      </QueryFilter>
      <Row>
        <Col span={20}>
          <ConfigProvider locale={enUS}>
          <ProTable
            pagination={{
              showQuickJumper: true,
              pageSize: 10,
              showTotal: renderTotal,
            }}
            loading={freqLoading}
            columns={columns}
            rowKey="Word"
            search={false}
            dataSource={filteredFreqData}
            rowSelection={false}
            toolBarRender={false}
          />
          </ConfigProvider>
        </Col>
        <Col span={1}></Col>
      </Row>
      <Modal title="WordCloud" open={open} footer={null} onCancel={handleCancel}>
        <>
        <Image src={imageURL}/>
        </>
      </Modal>

    </ProCard>
  );

}

export default CorpusStatsComp;
