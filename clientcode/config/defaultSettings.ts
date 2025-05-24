import { Settings as LayoutSettings } from '@ant-design/pro-components';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  // 拂晓蓝
  navTheme: 'dark',
  headerHeight: 48,
  layout: 'top',
  contentWidth: 'Fluid',
  fixedHeader: false,
  headerRender: false,
  menuRender: false,
  footerRender: false,
  fixSiderbar: false,
  primaryColor: '#1890ff',
  splitMenus: false,
  logo: '/logo2.svg',
  title: 'LexiConc',
};

export default Settings;
