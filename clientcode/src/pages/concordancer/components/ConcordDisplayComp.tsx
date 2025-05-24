import React, {useEffect, useState} from 'react';
import {Button, Divider, Radio, Space, Switch} from 'antd';
import styles from './concordstyle.less'; // Adjust the import path as needed

type Item = {
  fileName: string;
  left: Array<{ word: string; pos: string }>;
  keyword: Array<{ word: string }>;
  right: Array<{ word: string; pos: string }>;
};

type ConcordComponentProps = {
  conData: Item[];
  isHidden?: boolean;
  windowSize: number;
};

const ConcordDisplayComponent: React.FC<ConcordComponentProps> = ({ conData , windowSize}) => {
  const [isHidden, setHidden] = useState(false);
  const [sortedData, setSortedData] = useState<Item[]>(conData);
  const [highlight, setHighlight] = useState<{ left: boolean; right: boolean }>({ left: false, right: false });
  const [highlightIndex, setHighlightIndex] = useState<{ direction: 'L' | 'R'; index: number } | null>(null);

  // const sortAndHighlight = (direction: 'left' | 'right') => {
  //   const sorted = [...conData].sort((a, b) => {
  //     const wordA = direction === 'left' ? a.left[0]?.word : a.right[0]?.word;
  //     const wordB = direction === 'left' ? b.left[0]?.word : b.right[0]?.word;
  //     return wordA.localeCompare(wordB);
  //   });
  //
  //   setSortedData(sorted);
  //
  // };
  const sortData = (direction: 'L' | 'R', offset: number) => {
    const sorted = [...conData].sort((a, b) => {
      const index = direction === 'L' ? windowSize - offset : offset - 1;
      const wordA = direction === 'L' ? a.left[index]?.word : a.right[index]?.word;
      const wordB = direction === 'L' ? b.left[index]?.word : b.right[index]?.word;
      return wordA ? wordA.localeCompare(wordB) : 1;
    });

    setSortedData(sorted);
    if(direction === 'L'){
      setHighlightIndex({direction, index: windowSize - offset});
    }else {
      setHighlightIndex({direction, index: offset - 1});
    }
  };

  const isHighlight = (itemIndex: number, wordIndex: number, direction: 'L' | 'R') => {
    return highlightIndex && highlightIndex.direction === direction && wordIndex === highlightIndex.index;
  };

  const onShowPosTag = async(e) =>{
    console.log(e);
    setHidden(e);
  }

  useEffect(() => {
    // Update sortedData whenever conData changes
    setSortedData(conData);
  }, [conData]);

  return (
    <div>
      <Space>
        <Radio.Group onChange={(e) => {
          const [direction, index] = e.target.value.split('');
          sortData(direction as 'L' | 'R', parseInt(index));
        }}>
          {['L1', 'L2', 'L3', 'L4', 'L5', 'R1', 'R2', 'R3', 'R4', 'R5'].map(option => (
            <Radio.Button key={option} value={option}>{option}</Radio.Button>
          ))}
        </Radio.Group>
        <Switch
          style={{
            marginBlockEnd: 16,
          }}
          checked={isHidden}
          checkedChildren="Hide PoS"
          unCheckedChildren="Show PoS"
          onChange={setHidden}
        />
      </Space>
      <Divider></Divider>

      <div className={styles.tablePart}>
      <table>
        <thead>
        <tr className={styles.headerRow}>
          <th className={styles.keyWords}>File Name</th>
          <th className={styles.leftContext}>Left context</th>
          <th className={styles.keyWords}>Key words</th>
          <th className={styles.leftContext}>Right context</th>
        </tr>
        </thead>
        <tbody>
        {sortedData.map((outItem, itemIndex) => (
          <tr key={itemIndex}>
            <td className={`${styles.fileNameAlign} ${styles.wrapText}`}>{outItem.fileName}</td>
            <td className={`${styles.rightAlign} ${styles.wrapText}`}>
              {outItem.left.map((item, wordIndex) => (
                <span key={wordIndex} className={`${styles.rightMargin} ${isHighlight(itemIndex, wordIndex, 'L') ? styles.highlight : ''}`}>
                    <span className={styles.rightMargin}>{item.word}</span>
                    <span hidden={isHidden === undefined ? true : !isHidden} className={styles.posStyle}>{item.pos}</span>
                  </span>
              ))}
            </td>
            <td className={`${styles.centerAlign} ${styles.wrapText} ${styles.highlightKeywords}`}>
              {outItem.keyword.map((item, idx) => (
                <span key={idx} className={styles.rightMargin}>{item.word}</span>
              ))}
            </td>
            <td className={`${styles.leftAlign} ${styles.wrapText}`}>
                {outItem.right.map((item, wordIndex) => (
                    <span key={wordIndex} className={`${styles.rightMargin} ${isHighlight(itemIndex, wordIndex, 'R') ? styles.highlight : ''}`}>            <span className={styles.rightMargin}>{item.word}</span>
                    <span hidden={isHidden === undefined ? true : !isHidden} className={styles.posStyle}>{item.pos}</span>
                  </span>
              ))}
            </td>
          </tr>
        ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default ConcordDisplayComponent;
