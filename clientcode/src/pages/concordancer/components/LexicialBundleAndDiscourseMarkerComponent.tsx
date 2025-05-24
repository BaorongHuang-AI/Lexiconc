import React, {useRef, useState} from "react";
import {Button, Col, Input, message, Row, Space, Tabs} from "antd";
import LexiImportComp from "@/pages/concordancer/components/LexiImportComp";
import styles from './style.less';
import DmImportComp from "@/pages/concordancer/components/DmImportComp";

const LexiBundleAndDiscourseMarkerComp: React.FC<{props: any}> = (props) => {




  return (
    <Row>
      <Col span={12}>
        <DmImportComp props={props} ></DmImportComp>
      </Col>
      <Col span={12} className={styles.lexiImport}>
        <LexiImportComp props={props} ></LexiImportComp>
      </Col>

    </Row>

  );
}

export default  LexiBundleAndDiscourseMarkerComp;
