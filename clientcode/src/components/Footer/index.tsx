import { DefaultFooter } from '@ant-design/pro-components';
import { useIntl } from 'umi';

const Footer: React.FC = () => {
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'app.copyright.produced',
    defaultMessage: '上海外国语大学语料库研究院出品',
  });
  const currentYear = new Date().getFullYear();
  return (
    <DefaultFooter
      copyright={`${currentYear}`}
      links={[
        // {
        //   key: 'iAligner',
        //   title: "DH Platform is developed by Prof. Hu's team in SISU",
        //   href: 'http://infadm.shisu.edu.cn/_s128/main.psp',
        //   blankTarget: true,
        // },
      ]}
    />
  );
};

export default Footer;
