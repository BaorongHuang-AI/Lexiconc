import React, { createContext, useContext, useState } from 'react';

import defaultLangDict from './lang-dict.json';

const DictContext = createContext([]);
export const useLangDict = () => useContext(DictContext);

const DictProvider = (children) => {
  const [langDict, setLangDict] = useState(defaultLangDict);

  useEffect(() => {
    (async () => {
      const res = await getDictList({
        dictName: 'UnityLang',
        fields: ['baseLang', 'desc'],
      });
      setLangDict(res.data);
    })();
  }, []);

  return <DictContext.Provider value={langDict}>{children}</DictContext.Provider>;
};

export default DictContext;
