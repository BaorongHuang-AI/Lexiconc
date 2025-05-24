/* @ts-expect-error */
import {
  ProCard,
  ProForm, ProFormDigit,
  ProFormGroup,
  ProFormInstance,
  ProFormList,
  ProFormRadio,
  ProFormSelect, ProFormSwitch,
  ProFormText,
  ProList,
  QueryFilter
} from '@ant-design/pro-components';
import {Button, Col, Divider, message, Row, Space, Switch, Table, Tag, Tree, Upload, UploadProps} from 'antd';
import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import type {DataNode, TreeProps} from 'antd/es/tree';
import {CheckOutlined, CloseCircleOutlined, CloseOutlined, SmileOutlined, UploadOutlined} from "@ant-design/icons";

declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    // extends React's HTMLAttributes
    directory?: string;
    webkitdirectory?: string;
  }
}
import request from "umi-request";
import {history} from 'umi';
import styles from './style.less';
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import ConcordLine from "@/pages/concordancer/components/ConcordLine";
import ConcordDisplayComponent from "@/pages/concordancer/components/ConcordDisplayComp";

const POSData = [
  {value: 'ADJ', label: 'adjective'},
  {value: 'ADP', label: 'adposition'},
  {value: 'ADV', label: 'adverb'},
  {value: 'AUX', label: 'auxiliary'},
  {value: 'CONJ', label: 'conjunction'},
  {value: 'CCONJ', label: 'coordinating'},
  {value: 'DET', label: 'determiner'},
  {value: 'INTJ', label: 'interjection'},
  {value: 'NOUN', label: 'noun'},
  {value: 'NUM', label: 'numeral'},
  {value: 'PART', label: 'particle'},
  {value: 'PRON', label: 'pronoun'},
  {value: 'PROPN', label: 'proper'},
  {value: 'PUNCT', label: 'punctuation'},
  {value: 'SCONJ', label: 'subordinating'},
  {value: 'SYM', label: 'symbol'},
  {value: 'VERB', label: 'verb'},
  {value: 'X', label: 'other'},
  {value: 'SPACE', label: 'space'},

];

const SimpleConCordComp: React.FC<{props:any}> = (props) => {



  const actionRef = useRef<any>();
  const formRef = useRef<ProFormInstance>();

  const [conData, setConData] = useState<any[]>([]);

  const [isHidden, setHidden] = useState(false);

  const [windowSize, setWindowSize] = useState(6);


  const searchConcord = async () => {

    const values = formRef.current?.getFieldsValue();

    console.log("formvalue", values);
    if (!values.term||values.term.length == 0) {
      message.warning("Please input a term for search!");
      return;
    }
    if (props.fileIds.length == 0) {
      message.warning("Please select at least one file!");
      return;
    }
    const hide = message.loading('Searching...', 10000);
    let queryString = generateCQLString(values);
    setWindowSize(values.windowSize);
    let results = await request.post("http://localhost:9999" + '/search', {
      data: {
        query: queryString,
        leftCount: values.windowSize,
        rightCount:  values.windowSize,
        fileIds: props.fileIds
      }
    });
    hide();


    console.log("results", results.data);
    if (results.code === 200) {
      setConData([...results.data.results]);
    }
  }


  const pageSearchConcord = async () => {

    const values = formRef.current?.getFieldsValue();

    console.log("formvalue", values);
    if (!values.term||values.term.length == 0) {
      message.warning("Please input a term for search!");
      return;
    }
    if (props.fileIds.length == 0) {
      return;
    }
    const hide = message.loading('Searching...', 10000);
    let queryString = generateCQLString(values);
    setWindowSize(values.windowSize);
    let results = await request.post("http://localhost:9999" + '/search', {
      data: {
        query: queryString,
        leftCount: values.windowSize,
        rightCount:  values.windowSize,
        fileIds: props.fileIds
      }
    });
    hide();


    console.log("results", results.data);
    if (results.code === 200) {
      setConData([...results.data.results]);
    }
  }



  useLayoutEffect(() =>{
    console.log(props.currentWord);
    if(props.currentWord && props.currentWord.length > 0){
      formRef.current?.setFieldValue("term", props.currentWord);
      pageSearchConcord();
    }
  }, [props.currentWord, props.fileIds])




  function generateCQLString(values: any) {
    let qString = '';
    let entries = values.term.split(" ")
    if (entries.length > 1) {
      entries.forEach(item => {
        qString = qString + ' "' + item + '"'
      })
      console.log(qString);
      return qString;
    }
    if (values.form == "full" || values.form == undefined) {
      qString = '[word="' + values.term
    } else {
      qString = '[lemma="' + values.term
    }

    if (values.pos != undefined && values.pos.length > 0) {
      qString = qString + '" & pos="' + values.pos + '"]'
    } else {
      qString = qString + '"]'
    }
    console.log(qString);
    return qString;


  }



  return (
    <ProCard>

      <QueryFilter
        formRef={formRef}
        span={4}
        submitter={false}
        onFinish={async (e) => console.log(e)}
      >

        <ProFormText name="term" label="Term" placeholder={"please enter term to search"} width="sm" required={true}/>
        <ProFormSelect name="pos" label="POS" options={POSData} placeholder={"please select part of speech"} width="sm"/>
        <ProFormSelect
          name="form"
          fieldProps={{defaultValue: "full"}}
          label="Form"
          options={[
            {
              label: 'Full',
              value: 'full',
            },
            {
              label: 'Lemma',
              value: 'lemma',
            },
          ]}
          width="sm"
        />
        <ProFormDigit name="windowSize" label="Window" initialValue={6}
                      fieldProps={{defaultValue:6, max:10, min:4}}
                      width="sm"
        ></ProFormDigit>

        <Button type={"primary"} onClick={searchConcord}>Search</Button>

      </QueryFilter>
      <Divider>Results: Total {conData?.length} hits</Divider>

      {conData?.length > 0 &&
        <ConcordDisplayComponent conData={conData} windowSize={windowSize}></ConcordDisplayComponent> }
      {/*<table>*/}
      {/*  <thead>*/}
      {/*  <tr className={styles.headerRow}>*/}
      {/*    /!*<Col span={6} ><span className={styles.tableHeader}>File name </span></Col>*!/*/}
      {/*    <th className={styles.keyWords}>File Name</th>*/}
      {/*    <th className={styles.leftContext}>Left context</th>*/}
      {/*    <th className={styles.keyWords}>Key words</th>*/}
      {/*    <th className={styles.leftContext}>Right context</th>*/}
      {/*  </tr>*/}
      {/*  </thead>*/}
      {/*  <tbody>*/}
      {/*  {conData?.length>0 && conData.map(outItem => {*/}
      {/*    return (*/}
      {/*      <tr>*/}
      {/*        <td className={styles.fileNameAlign}> {outItem.fileName}</td>*/}
      {/*        <td className={styles.rightAlign}>*/}
      {/*  <span className={styles.wrapText}>*/}
      {/*    {outItem.left && outItem.left.map(item => {*/}
      {/*      return (*/}
      {/*        <span className={styles.rightMargin}>*/}
      {/*          /!*{item.lemma}*!/*/}
      {/*          <span className={styles.rightMargin}>{item.word}</span>*/}
      {/*          <span hidden={isHidden == undefined ? true : !isHidden} className={styles.posStyle}>{item.pos}</span>*/}
      {/*        </span>*/}
      {/*      )*/}
      {/*    })}*/}
      {/*    /!*<ConcordLine props={{concordData:concordData.left, isPos: false}}> </ConcordLine>*!/*/}

      {/*  </span>*/}
      {/*        </td>*/}
      {/*        <td className={styles.centerAlign}>*/}
      {/*           <span className={styles.wrapText}>*/}
      {/*    {outItem.keyword && outItem.keyword.map(item => {*/}
      {/*      return (*/}
      {/*        <span className={styles.rightMargin}>*/}
      {/*          /!*{item.lemma}*!/*/}
      {/*          <span className={styles.rightMargin}>{item.word}</span>*/}
      {/*          <span hidden={isHidden == undefined ? true : !isHidden} className={styles.posStyle}>{item.pos}</span>*/}
      {/*        </span>*/}
      {/*      )*/}
      {/*    })}*/}
      {/*           </span>*/}
      {/*        </td>*/}
      {/*        <td className={styles.leftAlign}>*/}
      {/*           <span className={styles.wrapText}>*/}
      {/*    {outItem.right && outItem.right.map(item => {*/}
      {/*      return (*/}
      {/*        <span className={styles.rightMargin}>*/}
      {/*          /!*{item.lemma}*!/*/}
      {/*          <span className={styles.rightMargin}>{item.word}</span>*/}
      {/*          <span hidden={isHidden == undefined ? true : !isHidden} className={styles.posStyle}>{item.pos}</span>*/}
      {/*        </span>*/}
      {/*      )*/}
      {/*    })}*/}
      {/*           </span>*/}

      {/*        </td>*/}
      {/*      </tr>*/}
      {/*    )*/}
      {/*  })}*/}
      {/*  </tbody>*/}

      {/*</table>*/}

      {conData?.length == 0 && <h3>No results</h3>}

    </ProCard>
  );
}

export default SimpleConCordComp;
