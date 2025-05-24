import React from "react";
import {UpdateFormProps} from "@/pages/concordancer/components/UpdateForm";


const ConcordLine: React.FC<{concordData:any, isPos:any}> = (props) => {
  const lineData = props.concordData;
  const isPosHidden = props.isPos;
  return (
    <span>
      {lineData && lineData.map(item =>{
        console.log('item', item);
        return (
          <>
            {item.lemma}
          <span>{item.word}</span>
         <span hidden={isPosHidden}>{item.pos}</span>
          </>
        )
      })}
    </span>

  );
}

export default ConcordLine;
