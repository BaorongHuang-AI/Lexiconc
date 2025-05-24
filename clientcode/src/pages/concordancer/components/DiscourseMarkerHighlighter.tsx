import React from 'react';
import {Typography, Tag, Row, Col} from 'antd';
const { Text } = Typography;

const DiscourseMarkerHighlighter = ({ text, markers }) => {
  const colorMap = {
    'Transitions': '#FFD700', // Gold
    'Frame markers': '#008000', // Green
    'Endophoric markers': '#1E90FF', // DodgerBlue
    'Evidentials': '#FF4500', // OrangeRed
    'Code glosses': '#6A5ACD', // SlateBlue
    'Hedges': '#DB7093', // PaleVioletRed
    'Boosters': '#FFA500', // Orange
    'Attitude markers': '#800080', // Purple
    'Engagement markers': '#20B2AA', // LightSeaGreen
    'Self-mentions': '#A52A2A', // Brown
  };

  const processText = () => {
    const words = text.split(' ');
    return words.map((word, index) => {
      const marker = markers.find(m => m.Phrase === word);
      const color = marker ? colorMap[marker.Category] || colorMap[marker.Class] : null;
      return color ? <Text key={index} style={{ color }}>{word} </Text> : <Text key={index}>{word} </Text>;
    });
  };

  return (
    <Row>
      <Col span={18} >{processText()}</Col>
      <Col span={6}>
        <p>Legend:</p>
        {Object.keys(colorMap).map(category => (
          <Tag color={colorMap[category]} key={category}>{category}</Tag>
        ))}
      </Col>
    </Row>
  );
};

export default DiscourseMarkerHighlighter;
