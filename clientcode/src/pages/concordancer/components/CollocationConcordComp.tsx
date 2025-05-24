/* @ts-expect-error */

import {
  Button,
  Col,
  Divider,
  message,
  Row,
  Space,
  Switch,
  Table,
  Tag,
  Tree,
  Upload,
  UploadProps,
} from 'antd';
import React, { useRef, useState } from 'react';
import * as echarts from 'echarts';

import request from 'umi-request';
import styles from './style.less';
import ProCard from '@ant-design/pro-card';
import {
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  QueryFilter,
} from '@ant-design/pro-form';

const POSData = [
  { value: 'ADJ', label: 'adjective' },
  { value: 'ADP', label: 'adposition' },
  { value: 'ADV', label: 'adverb' },
  { value: 'AUX', label: 'auxiliary' },
  { value: 'CONJ', label: 'conjunction' },
  { value: 'CCONJ', label: 'coordinating' },
  { value: 'DET', label: 'determiner' },
  { value: 'INTJ', label: 'interjection' },
  { value: 'NOUN', label: 'noun' },
  { value: 'NUM', label: 'numeral' },
  { value: 'PART', label: 'particle' },
  { value: 'PRON', label: 'pronoun' },
  { value: 'PROPN', label: 'proper' },
  { value: 'PUNCT', label: 'punctuation' },
  { value: 'SCONJ', label: 'subordinating' },
  { value: 'SYM', label: 'symbol' },
  { value: 'VERB', label: 'verb' },
  { value: 'X', label: 'other' },
  { value: 'SPACE', label: 'space' },
];



const SimpleCollocationComp = (props) => {

  const formRef = useRef<any>(null);

  const [conData, setConData] = useState<any[]>([]);

  const [isHidden, setHidden] = useState<boolean>(false);

  const [graph, setGraph] = useState<any>( {
    "nodes": [
      {
        "id": "0",
        "name": "Myriel",
        "symbolSize": 19.12381,
        // "x": -266.82776,
        // "y": 299.6904,
        "value": 28.685715,
        "category": 0
      },
      {
        "id": "1",
        "name": "Napoleon",
        "symbolSize": 2.6666666666666665,
        // "x": -418.08344,
        // "y": 446.8853,
        "value": 4,
        "category": 0
      },
      {
        "id": "2",
        "name": "MlleBaptistine",
        "symbolSize": 6.323809333333333,
        // "x": -212.76357,
        // "y": 245.29176,
        "value": 9.485714,
        "category": 1
      },
    ],
    "links": [
      {
        "source": "1",
        "target": "0"
      },
      {
        "source": "2",
        "target": "0"
      }],
    "categories": [
      {
        "name": "A"
      },
      {
        "name": "B"
      },
      {
        "name": "C"
      },
      {
        "name": "D"
      },
      {
        "name": "E"
      },
      {
        "name": "F"
      },
      {
        "name": "G"
      },
      {
        "name": "H"
      },
      {
        "name": "I"
      }
    ]
  });

  const [option, setOption] = useState<any>({
    tooltip: {},
    legend: [
      {
        data: graph.categories.map(function (a: { name: string }) {
          return a.name;
        })
      }
    ],
    series: [
      {
        name: 'Collocations',
        type: 'graph',
        layout: 'force',
        data: graph.nodes,
        links: graph.links,
        categories: graph.categories,
        roam: true,
        label: {
          show: true,
          position: 'right',
          formatter: '{b}'
        },
        force: { // 节点排斥力设置
          repulsion: 200,
          gravity: 0.01,
          edgeLength: 200
        },
        labelLayout: {
          hideOverlap: true
        },
        scaleLimit: {
          min: 0.4,
          max: 2
        },
        lineStyle: {
          color: 'source',
          curveness: 0.3
        }
      }
    ]
  });

  function generateCQLString(values) {
    let qString = '';
    let entries = values.term.split(' ');
    if (entries.length > 1) {
      entries.forEach((item) => {
        qString = qString + ' "' + item + '"';
      });
      console.log(qString);
      return qString;
    }
    if (values.form == 'full' || values.form == undefined) {
      qString = '[word="' + values.term;
    } else {
      qString = '[lemma="' + values.term;
    }

    if (values.pos != undefined && values.pos.length > 0) {
      qString = qString + '" & pos="' + values.pos + '"]';
    } else {
      qString = qString + '"]';
    }
    console.log(qString);
    return qString;
  }

  const searchCollocation = async () => {
    const values = formRef.current?.getFieldsValue();

    console.log('formvalue', values);
    if (!values.nodeWord || values.nodeWord.length == 0) {
      message.warning('Please input a node word!');
      return;
    }
    if (props.fileIds.length == 0) {
      message.warning('Please select at least one file!');
      return;
    }
    const hide = message.loading('Searching...', 10000);
    values.fileIds = props.fileIds;
    let results = await request.post('http://localhost:15001' + '/searchCollocation', {
      data: values,
    });
    hide();

    console.log('results', results.data);
    if (results.code === 200) {
      let colloResults = [];
      results.data.forEach((item) => {
        colloResults.push({
          collocation: item[0],
          MI: item[1].MI,
          cooccur: item[1].cooccur,
          total: item[1].total,
        });
      });
      const nodes = [{
        "id": 0,
        "name": values.nodeWord,
        "symbolSize": 20,
        "value": 0,
        "category": 1
        }
      ]
      const links = [];
      for(let index =0;index<colloResults.length;index++){
        if(index > 9){
          break;
        }
        let curNode = {
          "id": index + 1,
          "name": colloResults[index].collocation,
          "symbolSize": colloResults[index].cooccur,
          // "x": -266.82776,
          // "y": 299.6904,
          "value": colloResults[index].MI,
          "category": 0
        }
        let curLink = {
          "source": 0,
          "target": index + 1,
        }
        nodes.push(curNode);
        links.push(curLink);
      }

      console.log("links", links);
      console.log("nodes", nodes);

      console.log(colloResults);
      setConData([...colloResults]);

      setGraph({
        "nodes": [...nodes],
        "links": [...links],
        "categories": [
          {
            "name": "A"
          },
          {
            "name": "B"
          },
          {
            "name": "C"
          },
          {
            "name": "D"
          },
          {
            "name": "E"
          },
          {
            "name": "F"
          },
          {
            "name": "G"
          },
          {
            "name": "H"
          },
          {
            "name": "I"
          }
          ]
      });

      setOption( { tooltip: {},
      legend: [
        {
          data: graph.categories.map(function (a: { name: string }) {
            return a.name;
          })
        }
      ],
        series: [
        {
          name: 'Collocations',
          type: 'graph',
          layout: 'force',
          data: [...nodes],
          links: [...links],
          categories: graph.categories,
          roam: true,
          label: {
            show: true,
            position: 'right',
            formatter: '{b}'
          },
          force: { // 节点排斥力设置
            repulsion: 200,
            gravity: 0.01,
            edgeLength: 200
          },
          labelLayout: {
            hideOverlap: true
          },
          scaleLimit: {
            min: 0.4,
            max: 2
          },
          lineStyle: {
            color: 'source',
            curveness: 0.3
          }
        }
      ]
    });
    }
  };

  const onShowPosTag = async (e) => {
    console.log(e);
    setHidden(e);
  };

  return (
    <ProCard>
      <QueryFilter formRef={formRef} submitter={false} onFinish={async (e) => console.log(e)}>
        <ProFormText name="nodeWord" label="Node Word" placeholder={'please enter node word'} />
        <ProFormDigit name="leftCount" label="Left Window" initialValue={10} />
        <ProFormDigit name="rightCount" label="Right Window" initialValue={10} />
        <ProFormDigit name="limit" label="MI Cutoff" initialValue={0} />
        <Button type={'primary'} onClick={searchCollocation}>
          Search
        </Button>
      </QueryFilter>
      <Row>
        <Col span={20}>
      <Divider>Results: Total {conData?.length} collocations</Divider>
      {conData?.length > 0 && (
        <div className={styles.tablePart}>
          <table>
            <thead>
              <tr className={styles.headerRow}>
                {/*<Col span={6} ><span className={styles.tableHeader}>File name </span></Col>*/}
                <th className={styles.keyWords}>Collocation</th>
                <th className={styles.leftContext}>MI</th>
                <th className={styles.keyWords}>Cooccurance</th>
                <th className={styles.leftContext}>Total Occurance</th>
              </tr>
            </thead>
            <tbody>
              {conData?.length > 0 &&
                conData.map((outItem) => {
                  return (
                    <tr>
                      <td className={styles.fileNameAlign}> {outItem.collocation}</td>
                      <td className={styles.rightAlign}>
                        <span className={styles.wrapText}>
                          <span className={styles.rightMargin}>
                            {/*{item.lemma}*/}
                            <span className={styles.rightMargin}>{outItem.MI}</span>
                          </span>
                          {/*<ConcordLine props={{concordData:concordData.left, isPos: false}}> </ConcordLine>*/}
                        </span>
                      </td>
                      <td className={styles.centerAlign}>
                        <span className={styles.wrapText}>
                          <span className={styles.centerAlign}>
                            {/*{item.lemma}*/}
                            <span className={styles.centerAlign}>{outItem.cooccur}</span>
                          </span>
                        </span>
                      </td>
                      <td className={styles.centerAlign}>
                        <span className={styles.wrapText}>
                          <span className={styles.centerAlign}>
                            {/*{item.lemma}*/}
                            <span className={styles.centerAlign}>{outItem.total}</span>
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
      {conData?.length == 0 && <h3>No results</h3>}
        </Col>
        <Col span={1}></Col>
      </Row>
    </ProCard>
  );
};

export default SimpleCollocationComp;
