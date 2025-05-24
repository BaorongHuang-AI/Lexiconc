/* @ts-expect-error */
import {ProCard, ProForm, ProFormGroup, ProFormList, ProFormRadio, ProFormText, ProList} from '@ant-design/pro-components';
import {Button, Col, message, Row, Space, Tag, Tree, Upload, UploadProps} from 'antd';
import React, {useRef} from "react";
import type { DataNode, TreeProps } from 'antd/es/tree';
import {CloseCircleOutlined, SmileOutlined, UploadOutlined} from "@ant-design/icons";
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    // extends React's HTMLAttributes
    directory?: string;
    webkitdirectory?: string;
  }
}
import styles from './style.less';
const treeData: DataNode[] = [
  {
    title: 'aaaaa',
    key: '11111',
    children: [
      {
        title: 'bbbb',
        key: '22222',
      }
    ],
  },
];

const ConCordComp: React.FC = () =>
{
  const actionRef = useRef<any>();

  return (
    <ProCard>
      <ProForm
        layout={"vertical"}
        submitter={false}
        onFinish={async (e) => console.log(e)}
      >
      <ProFormList
        label=""
        name="conditions"
        initialValue={[
          {
            term: '',
            pos:'',
            lemma: 'full',
            combination: 'and',
            position: 'na'
          },
        ]}
        copyIconProps={false}
        deleteIconProps={{
          Icon: CloseCircleOutlined,
          tooltipText: 'Delete this condition',
        }}
        creatorButtonProps={false}
        actionRef={actionRef}
      >
        {(f, index, action) => {
          console.log(f, index, action);
          return (
        <ProFormGroup key={'group'+index}>
          <ProFormRadio.Group
            name="combination"
            label="Combination"
            options={[
              {
                label: 'And',
                value: 'and',
              },
              {
                label: 'Or',
                value: 'or',
              },
              {
                label: 'Not',
                value: 'not',
              },
            ]}
            disabled={index == 0}
          />
          <ProFormText name="term" label="Term" />
          <ProFormText name="pos" label="Part of Speech" />
          {/*<ProFormRadio.Group*/}
          {/*  name="lemma"*/}
          {/*  label="Lemma or Full"*/}
          {/*  options={[*/}
          {/*    {*/}
          {/*      label: 'Lemma',*/}
          {/*      value: 'lemma',*/}
          {/*    },*/}
          {/*    {*/}
          {/*      label: 'Full',*/}
          {/*      value: 'full',*/}
          {/*    },*/}
          {/*  ]}*/}
          {/*/>*/}

          {/*<ProFormRadio.Group*/}
          {/*  name="position"*/}
          {/*  label="Position"*/}
          {/*  options={[*/}
          {/*    {*/}
          {/*      label: 'Immediately after',*/}
          {/*      value: 'after',*/}
          {/*    },*/}
          {/*    {*/}
          {/*      label: 'Immediately before',*/}
          {/*      value: 'before',*/}
          {/*    },*/}
          {/*    {*/}
          {/*      label: 'N/A',*/}
          {/*      value: 'na',*/}
          {/*    },*/}
          {/*  ]}*/}
          {/*/>*/}
        </ProFormGroup>
            )}}
      </ProFormList>
      </ProForm>
      <Space
        style={{
          marginBlockEnd: 24,
        }}
      >
        <Button
          type="primary"
          onClick={() => {
            const list = actionRef.current?.getList();
            actionRef.current?.add({
              term: '',
              pos:'',
              lemma: 'full',
              combination: 'and',
            });
          }}
        >
          Add condition
        </Button>

      </Space>

      <Row className={styles.headerRow}>
        <Col span={6} ><span className={styles.tableHeader}>File name </span></Col>
        <Col span={8} className={styles.tableHeader}>Left context</Col>
        <Col span={2} className={styles.tableHeader}>Key words</Col>
        <Col span={8} className={styles.tableHeader}>Right context</Col>
      </Row>
      <Row>
        <Col span={6}>file name</Col>
        <Col span={8}>left part</Col>
        <Col span={2}>key word</Col>
        <Col span={8}>right part</Col>
      </Row>
    </ProCard>
  );
}

export default ConCordComp;
